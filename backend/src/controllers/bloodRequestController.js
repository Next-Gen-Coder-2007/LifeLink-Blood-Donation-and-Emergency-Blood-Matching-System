import mongoose from 'mongoose';
import { BloodRequest } from '../models/BloodRequest.js';
import { Hospital } from '../models/Hospital.js';
import { Donor } from '../models/Donor.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_URGENCIES = ['normal', 'urgent', 'emergency'];
const VALID_STATUSES = ['searching', 'fulfilled', 'cancelled', 'completed'];

export const createBloodRequest = async (req, res, next) => {
  try {
    const { hospital_id, blood_group, units_required, urgency, patient_name, required_by } = req.body;

    if (!hospital_id || !mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    const group = blood_group ? blood_group.toUpperCase().trim() : '';
    if (!VALID_BLOOD_GROUPS.includes(group)) {
      throw new AppError('Invalid blood group', 400);
    }

    const units = Number(units_required);
    if (isNaN(units) || units <= 0) {
      throw new AppError('Units required must be greater than 0', 400);
    }

    const urg = (urgency || 'normal').toLowerCase().trim();
    if (!VALID_URGENCIES.includes(urg)) {
      throw new AppError('Urgency must be normal, urgent, or emergency', 400);
    }

    const newRequest = await BloodRequest.create({
      hospital_id,
      blood_group: group,
      units_required: units,
      urgency: urg,
      patient_name: patient_name || null,
      required_by: required_by || null,
      status: 'searching',
    });

    return res.status(200).json({
      id: newRequest._id.toString(),
      hospital_id: newRequest.hospital_id.toString(),
      blood_group: newRequest.blood_group,
      units_required: newRequest.units_required,
      urgency: newRequest.urgency,
      patient_name: newRequest.patient_name,
      required_by: newRequest.required_by,
      status: newRequest.status,
      created_at: newRequest.created_at ? new Date(newRequest.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalBloodRequests = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hospital_id)) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    const requests = await BloodRequest.find({ hospital_id }).sort({ created_at: -1 });

    const formatted = requests.map((r) => ({
      id: r._id.toString(),
      hospital_id: r.hospital_id.toString(),
      blood_group: r.blood_group,
      units_required: r.units_required,
      urgency: r.urgency,
      patient_name: r.patient_name || null,
      required_by: r.required_by || null,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getDonorBloodRequests = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donor_id)) {
      throw new AppError('Invalid donor ID', 400);
    }

    const donor = await Donor.findById(donor_id);
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    const donorBloodGroup = donor.blood_group;
    if (!donorBloodGroup) {
      throw new AppError('Donor blood group not found', 400);
    }

    const requests = await BloodRequest.find({ blood_group: donorBloodGroup })
      .populate('hospital_id')
      .sort({ created_at: -1 });

    const response = [];

    for (const reqItem of requests) {
      let hospital = reqItem.hospital_id;

      if (!hospital || !hospital.hospital_name) {
        if (mongoose.Types.ObjectId.isValid(reqItem.hospital_id)) {
          hospital = await Hospital.findById(reqItem.hospital_id);
        }
      }

      if (!hospital) continue;

      response.push({
        id: reqItem._id.toString(),
        hospital_id: hospital._id ? hospital._id.toString() : reqItem.hospital_id.toString(),
        hospital_name: hospital.hospital_name || '',
        hospital_phone: hospital.phone || '',
        emergency_contact: hospital.emergency_contact || '',
        hospital_address: hospital.address || '',
        hospital_latitude: hospital.latitude || 0,
        hospital_longitude: hospital.longitude || 0,
        blood_group: reqItem.blood_group,
        units_required: reqItem.units_required || 0,
        urgency: reqItem.urgency || 'normal',
        patient_name: reqItem.patient_name || null,
        required_by: reqItem.required_by || null,
        status: reqItem.status || 'searching',
        created_at: reqItem.created_at ? new Date(reqItem.created_at).toISOString() : '',
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getBloodRequestById = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      throw new AppError('Invalid request ID', 400);
    }

    const item = await BloodRequest.findById(request_id);
    if (!item) {
      throw new AppError('Blood request not found', 404);
    }

    return res.status(200).json({
      id: item._id.toString(),
      hospital_id: item.hospital_id.toString(),
      blood_group: item.blood_group,
      units_required: item.units_required,
      urgency: item.urgency,
      patient_name: item.patient_name || null,
      required_by: item.required_by || null,
      status: item.status,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      throw new AppError('Invalid request ID', 400);
    }

    const existing = await BloodRequest.findById(request_id);
    if (!existing) {
      throw new AppError('Blood request not found', 404);
    }

    const updates = {};
    const { blood_group, units_required, urgency, patient_name, required_by, status } = req.body;

    if (blood_group !== undefined) {
      const group = blood_group.toUpperCase().trim();
      if (!VALID_BLOOD_GROUPS.includes(group)) {
        throw new AppError('Invalid blood group', 400);
      }
      updates.blood_group = group;
    }

    if (units_required !== undefined) {
      const units = Number(units_required);
      if (isNaN(units) || units <= 0) {
        throw new AppError('Units required must be greater than 0', 400);
      }
      updates.units_required = units;
    }

    if (urgency !== undefined) {
      const urg = urgency.toLowerCase().trim();
      if (!VALID_URGENCIES.includes(urg)) {
        throw new AppError('Invalid urgency', 400);
      }
      updates.urgency = urg;
    }

    if (patient_name !== undefined) {
      updates.patient_name = patient_name;
    }

    if (required_by !== undefined) {
      updates.required_by = required_by;
    }

    if (status !== undefined) {
      const st = status.toLowerCase().trim();
      if (!VALID_STATUSES.includes(st)) {
        throw new AppError('Invalid request status', 400);
      }
      updates.status = st;
    }

    const updated = await BloodRequest.findByIdAndUpdate(request_id, { $set: updates }, { new: true });

    return res.status(200).json({
      id: updated._id.toString(),
      hospital_id: updated.hospital_id.toString(),
      blood_group: updated.blood_group,
      units_required: updated.units_required,
      urgency: updated.urgency,
      patient_name: updated.patient_name || null,
      required_by: updated.required_by || null,
      status: updated.status,
      created_at: updated.created_at ? new Date(updated.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBloodRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      throw new AppError('Invalid request ID', 400);
    }

    const result = await BloodRequest.deleteOne({ _id: request_id });

    if (result.deletedCount === 0) {
      throw new AppError('Blood request not found', 404);
    }

    return res.status(200).json({
      message: 'Blood request deleted successfully',
      id: request_id,
    });
  } catch (error) {
    next(error);
  }
};
