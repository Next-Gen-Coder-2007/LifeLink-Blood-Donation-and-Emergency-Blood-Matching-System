import mongoose from 'mongoose';
import { Hospital } from '../models/Hospital.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getBloodBank = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    const inventory = await BloodInventory.find({ hospital_id });

    const inventoryMap = {};
    inventory.forEach((item) => {
      inventoryMap[item.blood_group] = item.units;
    });

    const response = ALL_BLOOD_GROUPS.map((group) => ({
      blood_group: group,
      units: inventoryMap[group] !== undefined ? inventoryMap[group] : 0,
    }));

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateBloodBank = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;
    let { blood_group, units } = req.body;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    if (!blood_group) {
      throw new AppError('Blood group is required', 400);
    }

    blood_group = blood_group.toUpperCase().trim();

    if (!ALL_BLOOD_GROUPS.includes(blood_group)) {
      throw new AppError('Invalid blood group', 400);
    }

    const unitCount = Number(units);
    if (isNaN(unitCount) || unitCount < 0) {
      throw new AppError('Units cannot be negative', 400);
    }

    await BloodInventory.findOneAndUpdate(
      { hospital_id, blood_group },
      {
        $set: {
          units: unitCount,
          updated_at: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Blood inventory updated successfully',
      blood_group,
      units: unitCount,
    });
  } catch (error) {
    next(error);
  }
};
