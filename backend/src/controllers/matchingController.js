import { Donor } from '../models/Donor.js';
import { BloodRequest } from '../models/BloodRequest.js';
import {
  RBC_RECIPIENT_TO_DONORS,
  RBC_DONOR_TO_RECIPIENTS,
  PLASMA_RECIPIENT_TO_DONORS,
  getCompatibleDonorGroups,
  getCompatibleRecipientGroups,
  calculateMatchScore,
} from '../utils/bloodMatchingEngine.js';
import {
  calculateHaversineDistance,
  calculateTravelTimeMinutes,
} from '../utils/distanceCalculatorEngine.js';

export const getCompatibleDonors = async (req, res, next) => {
  try {
    const {
      recipient_group,
      lat,
      lng,
      radius_km = 50,
      mode = 'all_compatible', // 'exact' | 'all_compatible' | 'universal'
      only_available = 'false',
      donation_interval = 'all', // 'all' | 'eligible_56' | 'eligible_90' | 'recent_56' | 'first_time'
    } = req.query;

    const rGroup = (recipient_group || '').toUpperCase().trim();
    if (!rGroup) {
      return res.status(400).json({ message: 'recipient_group query parameter is required (e.g. A+)' });
    }

    const hospitalLat = Number(lat) || 0;
    const hospitalLng = Number(lng) || 0;
    const maxRadius = Number(radius_km) || 50;
    const filterAvailable = only_available === 'true';

    // Determine target blood groups
    let targetGroups = [];
    if (mode === 'exact') {
      targetGroups = [rGroup];
    } else if (mode === 'universal') {
      targetGroups = ['O-'];
    } else {
      targetGroups = getCompatibleDonorGroups(rGroup, 'rbc');
    }

    // Query Donors
    const query = {
      blood_group: { $in: targetGroups },
    };
    if (filterAvailable) {
      query.availability = true;
    }

    const donors = await Donor.find(query).populate('user_id', 'name email').lean();

    const now = new Date();

    // Compute distance, ETA, match score, and days since last donation
    const enrichedDonors = donors.map((d) => {
      const donorLat = d.latitude || 0;
      const donorLng = d.longitude || 0;

      let distanceKm = null;
      let estimatedMins = null;

      if (hospitalLat !== 0 && hospitalLng !== 0 && donorLat !== 0 && donorLng !== 0) {
        distanceKm = calculateHaversineDistance(hospitalLat, hospitalLng, donorLat, donorLng);
        estimatedMins = calculateTravelTimeMinutes(distanceKm, 'emergency');
      }

      const matchEvaluation = calculateMatchScore(d.blood_group, rGroup);

      let daysSinceDonation = null;
      let lastDonationFormatted = 'First-Time Donor (Never Donated)';

      if (d.last_donation_date) {
        const lastDate = new Date(d.last_donation_date);
        if (!isNaN(lastDate.getTime())) {
          const diffTime = now.getTime() - lastDate.getTime();
          daysSinceDonation = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          lastDonationFormatted = `${daysSinceDonation} days ago (${d.last_donation_date})`;
        }
      }

      return {
        id: d._id.toString(),
        user_id: d.user_id?._id?.toString() || d.user_id?.toString() || '',
        donor_name: d.user_id?.name || 'Anonymous Donor',
        phone: d.phone,
        blood_group: d.blood_group,
        availability: Boolean(d.availability),
        latitude: donorLat,
        longitude: donorLng,
        last_donation_date: d.last_donation_date || null,
        days_since_last_donation: daysSinceDonation,
        last_donation_formatted: lastDonationFormatted,
        is_interval_eligible: daysSinceDonation === null || daysSinceDonation >= 56,
        distanceKm,
        estimatedMins,
        matchScore: matchEvaluation.score,
        matchTier: matchEvaluation.tier,
        matchLabel: matchEvaluation.label,
        matchDescription: matchEvaluation.description,
        isExactMatch: d.blood_group === rGroup,
      };
    });

    // Filter by radius if coordinates exist
    let filtered = enrichedDonors;
    if (hospitalLat !== 0 && hospitalLng !== 0 && maxRadius > 0) {
      filtered = filtered.filter((d) => d.distanceKm === null || d.distanceKm <= maxRadius);
    }

    // Filter by last donation interval
    if (donation_interval === 'eligible_56') {
      filtered = filtered.filter((d) => d.days_since_last_donation === null || d.days_since_last_donation >= 56);
    } else if (donation_interval === 'eligible_90') {
      filtered = filtered.filter((d) => d.days_since_last_donation === null || d.days_since_last_donation >= 90);
    } else if (donation_interval === 'recent_56') {
      filtered = filtered.filter((d) => d.days_since_last_donation !== null && d.days_since_last_donation < 56);
    } else if (donation_interval === 'first_time') {
      filtered = filtered.filter((d) => !d.last_donation_date);
    }

    // Sort by:
    // 1. Availability (available first)
    // 2. Match Score (100% exact first)
    // 3. Proximity distance (closest first)
    filtered.sort((a, b) => {
      if (a.availability !== b.availability) return a.availability ? -1 : 1;
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return 0;
    });

    return res.status(200).json({
      recipient_group: rGroup,
      mode,
      compatible_groups: targetGroups,
      donation_interval,
      total_found: filtered.length,
      donors: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchingRequestsForDonor = async (req, res, next) => {
  try {
    const { donor_group, lat, lng, radius_km = 50, mode = 'all_compatible' } = req.query;

    const dGroup = (donor_group || '').toUpperCase().trim();
    if (!dGroup) {
      return res.status(400).json({ message: 'donor_group query parameter is required (e.g. O-)' });
    }

    const donorLat = Number(lat) || 0;
    const donorLng = Number(lng) || 0;
    const maxRadius = Number(radius_km) || 50;

    // Get compatible recipient groups this donor can donate to
    const compatibleRecipientGroups =
      mode === 'exact' ? [dGroup] : getCompatibleRecipientGroups(dGroup);

    // Find searching requests for these groups
    const requests = await BloodRequest.find({
      blood_group: { $in: compatibleRecipientGroups },
      status: 'searching',
    })
      .populate('hospital_id')
      .lean();

    const enrichedRequests = requests.map((r) => {
      const hosp = r.hospital_id || {};
      const hospLat = hosp.latitude || 0;
      const hospLng = hosp.longitude || 0;

      let distanceKm = null;
      let estimatedMins = null;

      if (donorLat !== 0 && donorLng !== 0 && hospLat !== 0 && hospLng !== 0) {
        distanceKm = calculateHaversineDistance(donorLat, donorLng, hospLat, hospLng);
        estimatedMins = calculateTravelTimeMinutes(distanceKm, 'emergency');
      }

      const matchEvaluation = calculateMatchScore(dGroup, r.blood_group);

      return {
        id: r._id.toString(),
        hospital_id: hosp._id ? hosp._id.toString() : '',
        hospital_name: hosp.hospital_name || 'Medical Center',
        hospital_phone: hosp.phone || '',
        hospital_emergency: hosp.emergency_contact || '',
        hospital_address: hosp.address || '',
        hospital_latitude: hospLat,
        hospital_longitude: hospLng,
        blood_group: r.blood_group,
        units_required: r.units_required,
        urgency: r.urgency,
        patient_name: r.patient_name,
        created_at: r.created_at,
        distanceKm,
        estimatedMins,
        matchScore: matchEvaluation.score,
        matchTier: matchEvaluation.tier,
        matchLabel: matchEvaluation.label,
        isExactMatch: r.blood_group === dGroup,
      };
    });

    // Filter by radius
    let filtered = enrichedRequests;
    if (donorLat !== 0 && donorLng !== 0 && maxRadius > 0) {
      filtered = enrichedRequests.filter((r) => r.distanceKm === null || r.distanceKm <= maxRadius);
    }

    // Sort by Urgency priority then distance
    const urgencyWeight = { emergency: 3, urgent: 2, normal: 1 };
    filtered.sort((a, b) => {
      const uA = urgencyWeight[a.urgency] || 0;
      const uB = urgencyWeight[b.urgency] || 0;
      if (uB !== uA) return uB - uA;
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      return 0;
    });

    return res.status(200).json({
      donor_group: dGroup,
      mode,
      compatible_recipient_groups: compatibleRecipientGroups,
      total_found: filtered.length,
      requests: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompatibilityMatrix = (req, res) => {
  return res.status(200).json({
    red_blood_cells: {
      recipient_can_receive_from: RBC_RECIPIENT_TO_DONORS,
      donor_can_give_to: RBC_DONOR_TO_RECIPIENTS,
      universal_donor: 'O-',
      universal_recipient: 'AB+',
    },
    plasma: {
      recipient_can_receive_from: PLASMA_RECIPIENT_TO_DONORS,
      universal_donor: 'AB+',
      universal_recipient: 'O-',
    },
  });
};

export const evaluateCompatibility = (req, res) => {
  const { donor_group, recipient_group, lat1, lon1, lat2, lon2 } = req.body;

  if (!donor_group || !recipient_group) {
    return res.status(400).json({ message: 'Both donor_group and recipient_group are required.' });
  }

  const match = calculateMatchScore(donor_group, recipient_group);

  let distanceKm = null;
  let estimatedMins = null;

  if (lat1 !== undefined && lon1 !== undefined && lat2 !== undefined && lon2 !== undefined) {
    distanceKm = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    estimatedMins = calculateTravelTimeMinutes(distanceKm);
  }

  return res.status(200).json({
    donor_group: donor_group.toUpperCase(),
    recipient_group: recipient_group.toUpperCase(),
    ...match,
    distanceKm,
    estimatedMins,
  });
};
