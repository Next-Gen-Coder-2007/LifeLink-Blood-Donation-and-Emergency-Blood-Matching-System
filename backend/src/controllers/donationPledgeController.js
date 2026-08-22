import mongoose from 'mongoose';
import { DonationPledge } from '../models/DonationPledge.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { Hospital } from '../models/Hospital.js';
import { Donor } from '../models/Donor.js';
import { User } from '../models/User.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorMiddleware.js';

function generateCertificateId() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LL-${year}-${randomChars}`;
}

export const createPledge = async (req, res, next) => {
  try {
    const { request_id, donor_id, estimated_arrival, notes } = req.body;

    if (!request_id || !mongoose.Types.ObjectId.isValid(request_id)) {
      throw new AppError('Valid request ID is required', 400);
    }
    if (!donor_id || !mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Valid donor ID is required', 400);
    }

    const [bloodRequest, donor] = await Promise.all([
      BloodRequest.findById(request_id),
      Donor.findById(donor_id).populate('user_id'),
    ]);

    if (!bloodRequest) throw new AppError('Blood request not found', 404);
    if (!donor) throw new AppError('Donor not found', 404);

    const donorUser = donor.user_id;
    const donorName = donorUser ? donorUser.name : 'Volunteer Donor';
    const donorPhone = donor.phone || '';

    // Check if donor already has an active pledge for this request
    const existingPledge = await DonationPledge.findOne({
      request_id,
      donor_id,
      status: { $in: ['pledged', 'acknowledged'] },
    });

    if (existingPledge) {
      return res.status(200).json({
        message: 'Active pledge already registered for this request',
        pledge: existingPledge,
      });
    }

    const pledge = await DonationPledge.create({
      request_id,
      hospital_id: bloodRequest.hospital_id,
      donor_id,
      donor_user_id: donorUser ? donorUser._id : null,
      donor_name: donorName,
      donor_phone: donorPhone,
      blood_group: donor.blood_group,
      status: 'pledged',
      estimated_arrival: estimated_arrival || 'Within 2 hours',
      notes: notes || '',
    });

    // Notify Hospital of the incoming pledge
    const hospital = await Hospital.findById(bloodRequest.hospital_id);
    if (hospital && hospital.user_id) {
      await Notification.create({
        recipient_id: hospital.user_id.toString(),
        recipient_role: 'hospital',
        notification_type: 'pledge_received',
        title: `Donor Pledge for ${bloodRequest.blood_group} Blood`,
        message: `${donorName} (${donor.blood_group}) has pledged to donate for your ${bloodRequest.blood_group} request. Estimated arrival: ${pledge.estimated_arrival}. Contact: ${donorPhone}`,
        blood_group: donor.blood_group,
        request_id: request_id.toString(),
      });
    }

    return res.status(201).json({
      message: 'Donation pledge recorded successfully',
      pledge,
    });
  } catch (error) {
    next(error);
  }
};

export const getPledgesByRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      throw new AppError('Invalid request ID', 400);
    }

    const pledges = await DonationPledge.find({ request_id })
      .sort({ created_at: -1 })
      .lean();

    const formatted = pledges.map((p) => ({
      id: p._id.toString(),
      request_id: p.request_id ? p.request_id.toString() : '',
      hospital_id: p.hospital_id ? p.hospital_id.toString() : '',
      donor_id: p.donor_id ? p.donor_id.toString() : '',
      donor_user_id: p.donor_user_id ? p.donor_user_id.toString() : '',
      donor_name: p.donor_name,
      donor_phone: p.donor_phone,
      blood_group: p.blood_group,
      status: p.status,
      estimated_arrival: p.estimated_arrival,
      notes: p.notes,
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPledgesByHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(hospital_id)
      ? { $or: [{ hospital_id: new mongoose.Types.ObjectId(hospital_id) }, { hospital_id: String(hospital_id) }] }
      : { hospital_id: String(hospital_id) };

    const pledges = await DonationPledge.find(query)
      .sort({ created_at: -1 })
      .lean();

    const formatted = pledges.map((p) => ({
      id: p._id.toString(),
      request_id: p.request_id ? p.request_id.toString() : '',
      hospital_id: p.hospital_id ? p.hospital_id.toString() : '',
      donor_id: p.donor_id ? p.donor_id.toString() : '',
      donor_user_id: p.donor_user_id ? p.donor_user_id.toString() : '',
      donor_name: p.donor_name,
      donor_phone: p.donor_phone,
      blood_group: p.blood_group,
      status: p.status,
      estimated_arrival: p.estimated_arrival,
      notes: p.notes,
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPledgesByDonor = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Invalid donor ID', 400);
    }

    const pledges = await DonationPledge.find({ donor_id })
      .populate({
        path: 'hospital_id',
        select: 'hospital_name phone emergency_contact address latitude longitude',
      })
      .populate({
        path: 'request_id',
        select: 'blood_group units_required urgency status patient_name',
      })
      .sort({ created_at: -1 })
      .lean();

    const formatted = pledges.map((p) => {
      const hosp = p.hospital_id || {};
      const reqItem = p.request_id || {};
      return {
        id: p._id.toString(),
        request_id: reqItem._id ? reqItem._id.toString() : (p.request_id ? String(p.request_id) : ''),
        hospital_id: hosp._id ? hosp._id.toString() : (p.hospital_id ? String(p.hospital_id) : ''),
        hospital_name: hosp.hospital_name || 'Medical Center',
        hospital_phone: hosp.emergency_contact || hosp.phone || '',
        hospital_address: hosp.address || '',
        hospital_latitude: hosp.latitude || 0,
        hospital_longitude: hosp.longitude || 0,
        donor_id: p.donor_id ? p.donor_id.toString() : '',
        donor_name: p.donor_name,
        donor_phone: p.donor_phone,
        blood_group: p.blood_group,
        status: p.status,
        estimated_arrival: p.estimated_arrival,
        notes: p.notes,
        urgency: reqItem.urgency || 'normal',
        patient_name: reqItem.patient_name || null,
        created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updatePledgeStatus = async (req, res, next) => {
  try {
    const { pledge_id } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pledge_id)) {
      throw new AppError('Invalid pledge ID', 400);
    }

    const validStatuses = ['pledged', 'acknowledged', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      throw new AppError('Invalid status value', 400);
    }

    const updates = {};
    if (status) updates.status = status.toLowerCase();
    if (notes !== undefined) updates.notes = notes;

    const updated = await DonationPledge.findByIdAndUpdate(pledge_id, { $set: updates }, { new: true });
    if (!updated) {
      throw new AppError('Pledge not found', 404);
    }

    return res.status(200).json({
      message: `Pledge status updated to ${updated.status}`,
      pledge: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const completePledgeAndVerifyDonation = async (req, res, next) => {
  try {
    const { pledge_id } = req.params;
    const { units = 1, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pledge_id)) {
      throw new AppError('Invalid pledge ID', 400);
    }

    const unitsCount = Math.max(1, Number(units) || 1);

    const pledge = await DonationPledge.findById(pledge_id);
    if (!pledge) {
      throw new AppError('Pledge not found', 404);
    }

    const [hospital, donor, bloodRequest] = await Promise.all([
      Hospital.findById(pledge.hospital_id),
      Donor.findById(pledge.donor_id),
      BloodRequest.findById(pledge.request_id),
    ]);

    const donorUser = donor ? await User.findById(donor.user_id) : null;
    const donorName = donorUser ? donorUser.name : pledge.donor_name;
    const hospitalName = hospital ? hospital.hospital_name : 'Hospital Facility';
    const hospitalAddress = hospital ? hospital.address : '';

    // 1. Mark pledge completed
    pledge.status = 'completed';
    await pledge.save();

    // 2. Generate unique Certificate ID and create verified DonationHistory
    const certificateId = generateCertificateId();
    const historyEntry = await DonationHistory.create({
      donor_id: pledge.donor_id,
      hospital_id: pledge.hospital_id,
      blood_request_id: pledge.request_id,
      pledge_id: pledge._id,
      blood_group: pledge.blood_group,
      units: unitsCount,
      donation_date: new Date(),
      donor_name: donorName,
      hospital_name: hospitalName,
      hospital_address: hospitalAddress,
      certificate_id: certificateId,
      status: 'verified',
      remarks: remarks || `Emergency donation of ${unitsCount} unit(s) verified by ${hospitalName}.`,
    });

    // 3. Update Hospital Blood Bank inventory
    await BloodInventory.findOneAndUpdate(
      { hospital_id: pledge.hospital_id, blood_group: pledge.blood_group },
      { $inc: { units: unitsCount } },
      { upsert: true, new: true }
    );

    // 4. Update Blood Request status & units if satisfied from donation history
    if (bloodRequest) {
      if (!bloodRequest.initial_units_required) {
        bloodRequest.initial_units_required = Math.max(1, (bloodRequest.units_required || 0) + unitsCount);
      }

      // Aggregate all verified donation units for this specific request from DonationHistory
      const historyAgg = await DonationHistory.aggregate([
        {
          $match: {
            blood_request_id: bloodRequest._id,
            status: { $in: ['verified', 'completed'] },
          },
        },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$units' },
          },
        },
      ]);

      const totalUnitsDonated = (historyAgg[0]?.totalUnits || 0);
      const initialTarget = bloodRequest.initial_units_required;
      const remainingUnits = Math.max(0, initialTarget - totalUnitsDonated);

      bloodRequest.units_required = remainingUnits;

      if (remainingUnits === 0 || totalUnitsDonated >= initialTarget) {
        bloodRequest.status = 'fulfilled';
      }

      await bloodRequest.save();
    }

    // 5. Update Donor profile's last_donation_date to today
    if (donor) {
      donor.last_donation_date = new Date().toISOString().split('T')[0];
      await donor.save();
    }

    // 6. Send celebration & certificate Notification to Donor
    const donorRecipientId = donorUser ? donorUser._id.toString() : (donor ? donor.user_id.toString() : '');
    if (donorRecipientId) {
      await Notification.create({
        recipient_id: donorRecipientId,
        recipient_role: 'donor',
        notification_type: 'donation_verified',
        title: `Donation Verified! Certificate #${certificateId}`,
        message: `Thank you, ${donorName}! Your blood donation of ${unitsCount} unit(s) (${pledge.blood_group}) at ${hospitalName} has been verified. You saved up to ${unitsCount * 3} lives today! View your official certificate in Donation History.`,
        blood_group: pledge.blood_group,
        request_id: pledge.request_id.toString(),
      });
    }

    return res.status(200).json({
      message: 'Donation verified successfully! Blood inventory updated and digital certificate issued.',
      history: historyEntry,
      certificate_id: certificateId,
    });
  } catch (error) {
    next(error);
  }
};
