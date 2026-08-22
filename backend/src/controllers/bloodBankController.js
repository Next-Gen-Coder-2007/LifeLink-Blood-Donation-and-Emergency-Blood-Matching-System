import mongoose from 'mongoose';
import { Hospital } from '../models/Hospital.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getBloodBank = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(hospital_id)
      ? { $or: [{ hospital_id: new mongoose.Types.ObjectId(hospital_id) }, { hospital_id: String(hospital_id) }] }
      : { hospital_id: String(hospital_id) };

    const inventory = await BloodInventory.find(query).lean();

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

    const hospQuery = mongoose.Types.ObjectId.isValid(hospital_id)
      ? { $or: [{ _id: new mongoose.Types.ObjectId(hospital_id) }, { _id: String(hospital_id) }] }
      : { _id: String(hospital_id) };

    const hospital = await Hospital.findOne(hospQuery);
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
      { hospital_id: hospital._id, blood_group },
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
