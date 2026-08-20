import mongoose from 'mongoose';
import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const createHospital = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { hospital_name, phone, emergency_contact, latitude, longitude, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'hospital') {
      throw new AppError('User role is not hospital', 400);
    }

    const existingHospital = await Hospital.findOne({ user_id });
    if (existingHospital) {
      throw new AppError('Hospital profile already exists', 400);
    }

    const existingPhone = await Hospital.findOne({ phone: phone?.trim() });
    if (existingPhone) {
      throw new AppError('Hospital phone already exists', 400);
    }

    const hospital = await Hospital.create({
      user_id,
      hospital_name: hospital_name?.trim(),
      phone: phone?.trim(),
      emergency_contact: emergency_contact?.trim(),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      address: address?.trim(),
    });

    return res.status(200).json({
      message: 'Hospital created successfully',
      hospital_id: hospital._id.toString(),
      user_id,
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find().sort({ created_at: -1 });

    const formatted = hospitals.map((h) => ({
      id: h._id.toString(),
      user_id: h.user_id ? h.user_id.toString() : '',
      hospital_name: h.hospital_name,
      phone: h.phone,
      emergency_contact: h.emergency_contact,
      latitude: h.latitude,
      longitude: h.longitude,
      address: h.address,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getHospitalById = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      id: hospital._id.toString(),
      user_id: hospital.user_id ? hospital.user_id.toString() : '',
      hospital_name: hospital.hospital_name,
      phone: hospital.phone,
      emergency_contact: hospital.emergency_contact,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      address: hospital.address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const updates = { ...req.body };
    const hospital = await Hospital.findByIdAndUpdate(hospital_id, updates, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      message: 'Hospital updated successfully',
      hospital: {
        id: hospital._id.toString(),
        user_id: hospital.user_id ? hospital.user_id.toString() : '',
        hospital_name: hospital.hospital_name,
        phone: hospital.phone,
        emergency_contact: hospital.emergency_contact,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        address: hospital.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    await BloodInventory.deleteMany({ hospital_id });
    await BloodRequest.deleteMany({ hospital_id });

    const result = await Hospital.deleteOne({ _id: hospital_id });

    if (result.deletedCount === 0) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      message: 'Hospital deleted successfully',
      hospital_id,
    });
  } catch (error) {
    next(error);
  }
};
