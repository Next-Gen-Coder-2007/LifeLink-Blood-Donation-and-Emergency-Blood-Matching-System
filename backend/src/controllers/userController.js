import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password_hash, password, role } = req.body;
    const pwd = password_hash || password;

    if (!name || !email || !pwd || !role) {
      throw new AppError('Name, email, password, and role are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: pwd,
      role: role.toLowerCase().trim(),
    });

    return res.status(200).json({
      message: 'User created successfully',
      user_id: user._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password_hash: 0 }).sort({ created_at: -1 }).lean();

    const formatted = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id, { password_hash: 0 }).lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { name, email, password, password_hash } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (existing) {
        throw new AppError('Email is already registered by another user', 400);
      }
      user.email = email.toLowerCase().trim();
    }

    if (name && name.trim()) {
      user.name = name.trim();
      if (user.role === 'hospital') {
        await Hospital.findOneAndUpdate({ user_id: user._id }, { hospital_name: name.trim() });
      }
    }

    const pwd = password_hash || password;
    if (pwd && pwd.trim()) {
      user.password_hash = pwd.trim();
    }

    await user.save();

    let profileId = null;
    let bloodGroup = null;

    if (user.role === 'donor') {
      const donor = await Donor.findOne({ user_id: user._id }).lean();
      if (donor) {
        profileId = donor._id.toString();
        bloodGroup = donor.blood_group;
      }
    } else if (user.role === 'hospital') {
      const hospital = await Hospital.findOne({ user_id: user._id }).lean();
      if (hospital) {
        profileId = hospital._id.toString();
      }
    }

    return res.status(200).json({
      message: 'User profile updated successfully',
      id: user._id.toString(),
      user_id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profile_id: profileId,
      blood_group: bloodGroup,
      user: {
        id: user._id.toString(),
        user_id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile_id: profileId,
        blood_group: bloodGroup,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const donorResult = await Donor.deleteOne({ user_id: user._id });

    const hospital = await Hospital.findOne({ user_id: user._id });
    let hospitalDeleted = false;

    if (hospital) {
      await BloodInventory.deleteMany({ hospital_id: hospital._id });
      await BloodRequest.deleteMany({ hospital_id: hospital._id });
      const hospitalResult = await Hospital.deleteOne({ _id: hospital._id });
      hospitalDeleted = hospitalResult.deletedCount > 0;
    }

    const userResult = await User.deleteOne({ _id: user._id });

    if (userResult.deletedCount === 0) {
      throw new AppError('Failed to delete user', 500);
    }

    return res.status(200).json({
      message: 'User and related profiles deleted successfully',
      user_id,
      donor_deleted: donorResult.deletedCount > 0,
      hospital_deleted: hospitalDeleted,
    });
  } catch (error) {
    next(error);
  }
};
