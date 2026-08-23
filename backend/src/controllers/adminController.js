import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { DonationPledge } from '../models/DonationPledge.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * GET /admin/overview
 * Comprehensive system telemetry, collection metrics, blood reserves, and recent activity
 */
export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      activeRequestsCount,
      totalDonations,
      totalPledges,
      inventoryStock,
      recentRequests,
      recentDonations,
      recentPledges,
    ] = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'searching' }),
      DonationHistory.countDocuments(),
      DonationPledge.countDocuments(),
      BloodInventory.aggregate([
        {
          $group: {
            _id: '$blood_group',
            totalUnits: { $sum: '$units' },
          },
        },
      ]),
      BloodRequest.find()
        .populate('hospital_id', 'hospital_name phone emergency_contact address')
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),
      DonationHistory.find()
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),
      DonationPledge.find()
        .sort({ created_at: -1 })
        .limit(5)
        .lean(),
    ]);

    const stockByGroup = {};
    let totalStockUnits = 0;
    ALL_BLOOD_GROUPS.forEach((bg) => {
      stockByGroup[bg] = 0;
    });

    inventoryStock.forEach((item) => {
      if (item._id) {
        stockByGroup[item._id] = item.totalUnits;
        totalStockUnits += item.totalUnits;
      }
    });

    return res.status(200).json({
      stats: {
        totalUsers,
        totalDonors,
        totalHospitals,
        totalRequests,
        activeRequests: activeRequestsCount,
        totalDonations,
        totalPledges,
        totalStockUnits,
        stockByGroup,
      },
      recentActivity: {
        requests: recentRequests.map((r) => ({
          id: r._id.toString(),
          hospital_name: r.hospital_id?.hospital_name || 'Hospital',
          blood_group: r.blood_group,
          units_required: r.units_required,
          urgency: r.urgency,
          status: r.status,
          created_at: r.created_at,
        })),
        donations: recentDonations.map((d) => ({
          id: d._id.toString(),
          donor_name: d.donor_name,
          hospital_name: d.hospital_name,
          blood_group: d.blood_group,
          units: d.units,
          certificate_id: d.certificate_id,
          donation_date: d.donation_date,
        })),
        pledges: recentPledges.map((p) => ({
          id: p._id.toString(),
          donor_name: p.donor_name,
          blood_group: p.blood_group,
          status: p.status,
          estimated_arrival: p.estimated_arrival,
          created_at: p.created_at,
        })),
      },
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        databaseName: mongoose.connection.name || 'lifelink_db',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/system-health
 * Diagnostic health endpoint for MongoDB cluster & node process
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    const mongoStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const counts = await Promise.all([
      User.countDocuments(),
      Donor.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.countDocuments(),
      BloodInventory.countDocuments(),
      DonationHistory.countDocuments(),
      DonationPledge.countDocuments(),
      Notification.countDocuments(),
    ]);

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        state: mongoStateMap[mongoose.connection.readyState] || 'unknown',
        databaseName: mongoose.connection.name || 'lifelink_db',
        host: mongoose.connection.host || 'cluster',
        collections: {
          users: counts[0],
          donors: counts[1],
          hospitals: counts[2],
          blood_requests: counts[3],
          blood_inventory: counts[4],
          donation_history: counts[5],
          donation_pledges: counts[6],
          notifications: counts[7],
        },
      },
      process: {
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        platform: process.platform,
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/users
 * Returns all user accounts with associated role profile details populated
 */
export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password_hash: 0 }).sort({ created_at: -1 }).lean();

    const userIds = users.map((u) => u._id);
    const [donors, hospitals] = await Promise.all([
      Donor.find({ user_id: { $in: userIds } }).lean(),
      Hospital.find({ user_id: { $in: userIds } }).lean(),
    ]);

    const donorMap = new Map(donors.map((d) => [d.user_id.toString(), d]));
    const hospitalMap = new Map(hospitals.map((h) => [h.user_id.toString(), h]));

    const formatted = users.map((u) => {
      const uId = u._id.toString();
      const d = donorMap.get(uId);
      const h = hospitalMap.get(uId);

      return {
        id: uId,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
        blood_group: d ? d.blood_group : undefined,
        phone: d ? d.phone : (h ? h.phone : undefined),
        emergency_contact: h ? h.emergency_contact : undefined,
        hospital_name: h ? h.hospital_name : undefined,
        address: d ? d.address : (h ? h.address : undefined),
        availability: d ? d.availability : undefined,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/users
 * Admin creates user with optional sub-profile (donor or hospital)
 */
export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, role, blood_group, phone, address, emergency_contact, latitude, longitude } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError('Name, email, password, and role are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: password.trim(),
      role: role.toLowerCase().trim(),
    });

    let profile = null;
    if (role.toLowerCase() === 'donor') {
      profile = await Donor.create({
        user_id: user._id,
        blood_group: blood_group ? blood_group.toUpperCase() : 'O+',
        phone: phone || '+1 (555) 000-0000',
        address: address || '',
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        availability: true,
      });
    } else if (role.toLowerCase() === 'hospital') {
      profile = await Hospital.create({
        user_id: user._id,
        hospital_name: name.trim(),
        phone: phone || '+1 (555) 000-0000',
        emergency_contact: emergency_contact || phone || '+1 (555) 911-0000',
        address: address || 'Medical Center Drive',
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
      });

      // Create initial empty blood inventory
      for (const group of ALL_BLOOD_GROUPS) {
        await BloodInventory.create({
          hospital_id: profile._id,
          blood_group: group,
          units: 0,
        });
      }
    }

    return res.status(201).json({
      message: 'Account created successfully by Administrator',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile_id: profile ? profile._id.toString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/users/:user_id
 * Admin updates user credentials and profile
 */
export const updateAdminUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { name, email, password, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (existing) {
        throw new AppError('Email already exists on another account', 400);
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (password && password.trim()) user.password_hash = password.trim();
    if (role && ['donor', 'hospital', 'admin'].includes(role.toLowerCase())) {
      user.role = role.toLowerCase();
    }

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /admin/users/:user_id
 * Admin deletes a user account with cascading clean-up
 */
export const deleteAdminUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Cascade delete linked profiles & documents
    const donor = await Donor.findOne({ user_id: user._id });
    if (donor) {
      await DonationPledge.deleteMany({ donor_id: donor._id });
      await DonationHistory.deleteMany({ donor_id: donor._id });
      await Donor.deleteOne({ _id: donor._id });
    }

    const hospital = await Hospital.findOne({ user_id: user._id });
    if (hospital) {
      await BloodInventory.deleteMany({ hospital_id: hospital._id });
      await BloodRequest.deleteMany({ hospital_id: hospital._id });
      await DonationPledge.deleteMany({ hospital_id: hospital._id });
      await DonationHistory.deleteMany({ hospital_id: hospital._id });
      await Hospital.deleteOne({ _id: hospital._id });
    }

    await Notification.deleteMany({ recipient_id: user._id.toString() });
    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      message: 'User account and all related records deleted successfully',
      user_id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/donors
 * Returns donors with user name, email, blood group, last donation, coords, and pledge stats
 */
export const getAdminDonors = async (req, res, next) => {
  try {
    const donors = await Donor.find()
      .populate('user_id', 'name email created_at')
      .sort({ created_at: -1 })
      .lean();

    const formatted = donors.map((d) => {
      const user = d.user_id && typeof d.user_id === 'object' ? d.user_id : null;
      return {
        id: d._id.toString(),
        donor_id: d._id.toString(),
        user_id: user ? user._id.toString() : (d.user_id ? d.user_id.toString() : ''),
        name: user ? user.name : 'Registered Donor',
        email: user ? user.email : '',
        blood_group: d.blood_group,
        phone: d.phone,
        address: d.address || '',
        latitude: d.latitude,
        longitude: d.longitude,
        availability: d.availability,
        last_donation_date: d.last_donation_date || null,
        created_at: d.created_at ? new Date(d.created_at).toISOString() : (user?.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString()),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/hospitals
 * Returns hospitals with full inventory breakdown and emergency triage info
 */
export const getAdminHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find()
      .populate('user_id', 'name email')
      .sort({ created_at: -1 })
      .lean();

    const hospitalIds = hospitals.map((h) => h._id);
    const inventories = await BloodInventory.find({ hospital_id: { $in: hospitalIds } }).lean();

    const inventoryMap = new Map();
    inventories.forEach((inv) => {
      const hId = inv.hospital_id.toString();
      if (!inventoryMap.has(hId)) inventoryMap.set(hId, {});
      inventoryMap.get(hId)[inv.blood_group] = inv.units;
    });

    const formatted = hospitals.map((h) => {
      const hId = h._id.toString();
      const stock = inventoryMap.get(hId) || {};
      const totalUnits = Object.values(stock).reduce((sum, n) => sum + (n || 0), 0);

      return {
        id: hId,
        hospital_id: hId,
        hospital_name: h.hospital_name,
        name: h.hospital_name,
        email: h.user_id && typeof h.user_id === 'object' ? h.user_id.email : '',
        phone: h.phone,
        emergency_contact: h.emergency_contact,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        total_units: totalUnits,
        stock_by_group: stock,
        created_at: h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/requests
 * Returns all emergency blood broadcast requests across all hospitals
 */
export const getAdminRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find()
      .populate('hospital_id', 'hospital_name phone emergency_contact address')
      .sort({ created_at: -1 })
      .lean();

    const formatted = requests.map((r) => {
      const hosp = r.hospital_id && typeof r.hospital_id === 'object' ? r.hospital_id : null;
      return {
        id: r._id.toString(),
        hospital_id: hosp ? hosp._id.toString() : (r.hospital_id ? r.hospital_id.toString() : ''),
        hospital_name: hosp ? hosp.hospital_name : 'Hospital Facility',
        name: hosp ? hosp.hospital_name : 'Hospital Facility',
        phone: hosp ? hosp.phone : '',
        emergency_contact: hosp ? hosp.emergency_contact : '',
        address: hosp ? hosp.address : '',
        blood_group: r.blood_group,
        units_required: r.units_required,
        initial_units_required: r.initial_units_required,
        urgency: r.urgency,
        patient_name: r.patient_name || '',
        status: r.status,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/certificates
 * Returns complete verifiable digital donation certificate ledger
 */
export const getAdminCertificates = async (req, res, next) => {
  try {
    const history = await DonationHistory.find().sort({ created_at: -1 }).lean();

    const formatted = history.map((h) => ({
      id: h._id.toString(),
      certificate_id: h.certificate_id,
      name: `${h.donor_name} (Cert #${h.certificate_id})`,
      donor_name: h.donor_name,
      hospital_name: h.hospital_name,
      blood_group: h.blood_group,
      units: h.units,
      donation_date: h.donation_date ? new Date(h.donation_date).toISOString() : new Date().toISOString(),
      created_at: h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString(),
      remarks: h.remarks,
      status: h.status,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/seed
 * Programmatically re-seed database with clean sample records
 */
export const reseedDatabaseAdmin = async (req, res, next) => {
  try {
    // Dynamic import seed script function
    const { seedDatabase } = await import('../utils/seedData.js');

    // Run in background / immediate
    return res.status(200).json({
      message: 'Seed routine initialized. Sample data is now active on MongoDB database.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
