import mongoose from 'mongoose';
import { Donor } from '../models/Donor.js';
import { User } from '../models/User.js';
import { Hospital } from '../models/Hospital.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const createDonor = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { blood_group, phone, latitude, longitude, availability, last_donation_date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'donor') {
      throw new AppError('User role is not donor', 400);
    }

    const existingDonor = await Donor.findOne({ user_id });
    if (existingDonor) {
      throw new AppError('Donor profile already exists', 400);
    }

    const donor = await Donor.create({
      user_id,
      blood_group: blood_group ? blood_group.toUpperCase() : undefined,
      phone,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      availability: availability !== undefined ? Boolean(availability) : true,
      last_donation_date: last_donation_date || null,
    });

    return res.status(200).json({
      message: 'Donor created successfully',
      donor_id: donor._id.toString(),
      user_id,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonors = async (req, res, next) => {
  try {
    const donors = await Donor.find()
      .populate({
        path: 'user_id',
        select: 'name email',
      })
      .sort({ created_at: -1 })
      .lean();

    const formatted = donors.map((d) => {
      const userObj = d.user_id && typeof d.user_id === 'object' ? d.user_id : null;
      return {
        id: d._id.toString(),
        user_id: userObj ? userObj._id.toString() : (d.user_id ? d.user_id.toString() : ''),
        donor_name: userObj ? userObj.name : 'Registered Donor',
        email: userObj ? userObj.email : '',
        blood_group: d.blood_group,
        phone: d.phone,
        latitude: d.latitude,
        longitude: d.longitude,
        availability: d.availability,
        last_donation_date: d.last_donation_date || null,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getDonorByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(user_id)
      ? { user_id: new mongoose.Types.ObjectId(user_id) }
      : { user_id: String(user_id) };

    const donor = await Donor.findOne(query)
      .populate({ path: 'user_id', select: 'name email' })
      .lean();

    if (!donor) {
      throw new AppError('Donor profile not found', 404);
    }

    const userObj = donor.user_id && typeof donor.user_id === 'object' ? donor.user_id : null;

    return res.status(200).json({
      id: donor._id.toString(),
      user_id: userObj ? userObj._id.toString() : (donor.user_id ? donor.user_id.toString() : ''),
      donor_name: userObj ? userObj.name : 'Registered Donor',
      email: userObj ? userObj.email : '',
      blood_group: donor.blood_group,
      phone: donor.phone,
      latitude: donor.latitude,
      longitude: donor.longitude,
      availability: donor.availability,
      last_donation_date: donor.last_donation_date || null,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonorById = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Invalid donor ID', 400);
    }

    const donor = await Donor.findById(donor_id)
      .populate({ path: 'user_id', select: 'name email' })
      .lean();

    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    const userObj = donor.user_id && typeof donor.user_id === 'object' ? donor.user_id : null;

    return res.status(200).json({
      id: donor._id.toString(),
      user_id: userObj ? userObj._id.toString() : (donor.user_id ? donor.user_id.toString() : ''),
      donor_name: userObj ? userObj.name : 'Registered Donor',
      email: userObj ? userObj.email : '',
      blood_group: donor.blood_group,
      phone: donor.phone,
      latitude: donor.latitude,
      longitude: donor.longitude,
      availability: donor.availability,
      last_donation_date: donor.last_donation_date || null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDonor = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Invalid donor ID', 400);
    }

    const updates = { ...req.body };
    if (updates.blood_group) {
      updates.blood_group = updates.blood_group.toUpperCase();
    }

    const donor = await Donor.findByIdAndUpdate(donor_id, updates, {
      new: true,
      runValidators: true,
    });

    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    return res.status(200).json({
      message: 'Donor updated successfully',
      donor: {
        id: donor._id.toString(),
        user_id: donor.user_id ? donor.user_id.toString() : '',
        blood_group: donor.blood_group,
        phone: donor.phone,
        latitude: donor.latitude,
        longitude: donor.longitude,
        availability: donor.availability,
        last_donation_date: donor.last_donation_date || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDonor = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Invalid donor ID', 400);
    }

    const result = await Donor.deleteOne({ _id: donor_id });

    if (result.deletedCount === 0) {
      throw new AppError('Donor not found', 404);
    }

    return res.status(200).json({
      message: 'Donor deleted successfully',
      donor_id,
    });
  } catch (error) {
    next(error);
  }
};

export const sendDirectDonorRequest = async (req, res, next) => {
  try {
    const { donor_id } = req.params;
    const { hospital_id, message, units_needed = 1, urgency = 'emergency' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Invalid donor ID', 400);
    }

    const [donor, hospital] = await Promise.all([
      Donor.findById(donor_id),
      Hospital.findById(hospital_id),
    ]);

    if (!donor) throw new AppError('Donor not found', 404);
    if (!hospital) throw new AppError('Hospital not found', 404);

    const alertMessage =
      message ||
      `CLINICAL DIRECTIVE: ${hospital.hospital_name} is in critical need of your blood type (${donor.blood_group}). Please check your matching requests or contact the facility triage desk immediately at ${hospital.emergency_contact || hospital.phone}.`;

    const notification = await Notification.create({
      recipient_id: donor.user_id ? donor.user_id.toString() : donor._id.toString(),
      recipient_role: 'donor',
      notification_type: 'direct_urgent_request',
      title: `Emergency Clinical Directive from ${hospital.hospital_name}`,
      message: alertMessage,
      blood_group: donor.blood_group,
    });

    return res.status(200).json({
      message: `Emergency clinical directive dispatched to donor (${donor.blood_group})`,
      notification,
    });
  } catch (error) {
    next(error);
  }
};
