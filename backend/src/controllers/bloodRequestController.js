import mongoose from 'mongoose';
import { BloodRequest } from '../models/BloodRequest.js';
import { Hospital } from '../models/Hospital.js';
import { Donor } from '../models/Donor.js';
import { Notification } from '../models/Notification.js';
import { getCompatibleDonorGroups } from '../utils/bloodMatchingEngine.js';
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

    // Notify all medically compatible available donors
    try {
      const compatibleGroups = getCompatibleDonorGroups(group, 'rbc');
      const matchingDonors = await Donor.find({ blood_group: { $in: compatibleGroups }, availability: true }).lean();
      if (matchingDonors.length > 0) {
        const notifDocs = matchingDonors.map((d) => {
          const isExact = d.blood_group === group;
          return {
            recipient_id: d.user_id ? d.user_id.toString() : d._id.toString(),
            recipient_role: 'donor',
            notification_type: 'emergency_alert',
            title: isExact
              ? `Exact Blood Match: ${units} Unit(s) of ${group}`
              : `Compatible Blood Need: ${units} Unit(s) of ${group} (You: ${d.blood_group})`,
            message: `${hospital.hospital_name} has broadcasted an urgent requirement for ${group} blood. Your blood group (${d.blood_group}) is medically compatible. Please check details to pledge.`,
            blood_group: group,
            request_id: newRequest._id.toString(),
          };
        });
        await Notification.insertMany(notifDocs);
      }
    } catch {
      // Non-blocking notification dispatch
    }

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

export const getAllBloodRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find()
      .populate('hospital_id', 'hospital_name phone emergency_contact address latitude longitude')
      .sort({ created_at: -1 })
      .lean();

    const formatted = requests.map((r) => {
      const hosp = r.hospital_id || {};
      return {
        id: r._id.toString(),
        hospital_id: hosp._id ? hosp._id.toString() : (r.hospital_id ? String(r.hospital_id) : ''),
        hospital_name: hosp.hospital_name || 'Medical Center',
        hospital_phone: hosp.phone || '',
        emergency_contact: hosp.emergency_contact || '',
        hospital_address: hosp.address || '',
        hospital_latitude: hosp.latitude || 0,
        hospital_longitude: hosp.longitude || 0,
        blood_group: r.blood_group,
        units_required: r.units_required,
        urgency: r.urgency,
        patient_name: r.patient_name || null,
        required_by: r.required_by || null,
        status: r.status,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getHospitalBloodRequests = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(hospital_id)
      ? { $or: [{ hospital_id: new mongoose.Types.ObjectId(hospital_id) }, { hospital_id: String(hospital_id) }] }
      : { hospital_id: String(hospital_id) };

    const requests = await BloodRequest.find(query).sort({ created_at: -1 }).lean();

    const formatted = requests.map((r) => ({
      id: r._id.toString(),
      hospital_id: r.hospital_id ? r.hospital_id.toString() : '',
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

    const donor = await Donor.findById(donor_id).lean();
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    const donorBloodGroup = donor.blood_group;
    if (!donorBloodGroup) {
      throw new AppError('Donor blood group not found', 400);
    }

    // Find all recipient blood groups that this donor is medically compatible to donate to
    const compatibleRecipientGroups = getCompatibleRecipientGroups(donorBloodGroup);

    const requests = await BloodRequest.find({
      blood_group: { $in: compatibleRecipientGroups },
      status: 'searching',
    })
      .populate({
        path: 'hospital_id',
        select: 'hospital_name phone emergency_contact address latitude longitude',
      })
      .sort({ created_at: -1 })
      .lean();

    const formatted = requests.map((r) => {
      const hosp = r.hospital_id || {};
      return {
        id: r._id.toString(),
        hospital_id: hosp._id ? hosp._id.toString() : (r.hospital_id ? r.hospital_id.toString() : ''),
        hospital_name: hosp.hospital_name || 'Medical Center',
        hospital_phone: hosp.phone || '',
        emergency_contact: hosp.emergency_contact || '',
        hospital_address: hosp.address || '',
        hospital_latitude: hosp.latitude || 0,
        hospital_longitude: hosp.longitude || 0,
        blood_group: r.blood_group,
        units_required: r.units_required,
        urgency: r.urgency,
        patient_name: r.patient_name || null,
        required_by: r.required_by || null,
        status: r.status,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
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

    const r = await BloodRequest.findById(request_id).populate('hospital_id').lean();
    if (!r) {
      throw new AppError('Blood request not found', 404);
    }

    const hosp = r.hospital_id || {};
    return res.status(200).json({
      id: r._id.toString(),
      hospital_id: hosp._id ? hosp._id.toString() : (r.hospital_id ? r.hospital_id.toString() : ''),
      hospital_name: hosp.hospital_name || 'Medical Center',
      hospital_phone: hosp.phone || '',
      emergency_contact: hosp.emergency_contact || '',
      hospital_address: hosp.address || '',
      hospital_latitude: hosp.latitude || 0,
      hospital_longitude: hosp.longitude || 0,
      blood_group: r.blood_group,
      units_required: r.units_required,
      urgency: r.urgency,
      patient_name: r.patient_name || null,
      required_by: r.required_by || null,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;
    const { blood_group, units_required, urgency, patient_name, required_by, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      throw new AppError('Invalid request ID', 400);
    }

    const existingRequest = await BloodRequest.findById(request_id);
    if (!existingRequest) {
      throw new AppError('Blood request not found', 404);
    }

    // Terminal State Lock: If already fulfilled or completed, it CANNOT be changed back to searching or anything else
    if (existingRequest.status === 'fulfilled' || existingRequest.status === 'completed') {
      if (status && status !== existingRequest.status) {
        throw new AppError(
          `This blood request is already ${existingRequest.status} and locked. Fulfilled or completed requests cannot be reverted to searching or modified.`,
          400
        );
      }
    }

    const updates = {};
    if (blood_group) {
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

    if (urgency) {
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
      // If it was already fulfilled or completed, lock the status
      if (existingRequest.status === 'fulfilled' || existingRequest.status === 'completed') {
        updates.status = existingRequest.status;
      } else {
        updates.status = st;
      }
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
