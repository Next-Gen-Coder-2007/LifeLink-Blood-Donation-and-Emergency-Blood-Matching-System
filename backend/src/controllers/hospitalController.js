import mongoose from 'mongoose';
import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
    const hospitals = await Hospital.find().sort({ created_at: -1 }).lean();

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

export const getPublicHospitalsMap = async (req, res, next) => {
  try {
    const [hospitals, inventories, activeRequests] = await Promise.all([
      Hospital.find().sort({ created_at: -1 }).lean(),
      BloodInventory.find().lean(),
      BloodRequest.find({ status: 'searching' }).lean(),
    ]);

    // Index inventory by hospital_id
    const inventoryMap = {};
    inventories.forEach((item) => {
      const hId = item.hospital_id ? item.hospital_id.toString() : '';
      if (!hId) return;
      if (!inventoryMap[hId]) inventoryMap[hId] = {};
      inventoryMap[hId][item.blood_group] = item.units;
    });

    // Index requests by hospital_id
    const requestMap = {};
    activeRequests.forEach((reqItem) => {
      const hId = reqItem.hospital_id ? reqItem.hospital_id.toString() : '';
      if (!hId) return;
      if (!requestMap[hId]) requestMap[hId] = [];
      requestMap[hId].push(reqItem.blood_group);
    });

    const response = hospitals.map((h) => {
      const hId = h._id.toString();
      const hospitalStock = inventoryMap[hId] || {};
      const stockByGroup = {};
      let totalUnits = 0;

      ALL_BLOOD_GROUPS.forEach((bg) => {
        const units = hospitalStock[bg] || 0;
        stockByGroup[bg] = units;
        totalUnits += units;
      });

      const neededGroups = requestMap[hId] || [];

      return {
        id: hId,
        hospital_name: h.hospital_name,
        phone: h.phone,
        emergency_contact: h.emergency_contact,
        latitude: h.latitude || 0,
        longitude: h.longitude || 0,
        address: h.address,
        total_units: totalUnits,
        stock_by_group: stockByGroup,
        searching_requests_count: neededGroups.length,
        needed_groups: neededGroups,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getHospitalByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(user_id)
      ? { user_id: new mongoose.Types.ObjectId(user_id) }
      : { user_id: String(user_id) };

    const hospital = await Hospital.findOne(query).lean();
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

export const getHospitalById = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const hospital = await Hospital.findById(hospital_id).lean();
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
