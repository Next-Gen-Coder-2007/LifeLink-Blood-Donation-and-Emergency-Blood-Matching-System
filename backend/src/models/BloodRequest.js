import mongoose from 'mongoose';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_URGENCIES = ['normal', 'urgent', 'emergency'];
const VALID_STATUSES = ['searching', 'fulfilled', 'cancelled', 'completed'];

const bloodRequestSchema = new mongoose.Schema(
  {
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
    },
    blood_group: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: {
        values: VALID_BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group',
      },
      uppercase: true,
      trim: true,
    },
    units_required: {
      type: Number,
      required: [true, 'Units required is required'],
      min: [1, 'Units required must be greater than 0'],
    },
    urgency: {
      type: String,
      enum: {
        values: VALID_URGENCIES,
        message: 'Urgency must be normal, urgent, or emergency',
      },
      default: 'normal',
      lowercase: true,
    },
    patient_name: {
      type: String,
      default: null,
      trim: true,
    },
    required_by: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: 'Invalid request status',
      },
      default: 'searching',
      lowercase: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

bloodRequestSchema.index({ hospital_id: 1, status: 1 });
bloodRequestSchema.index({ status: 1, blood_group: 1 });

bloodRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.hospital_id = ret.hospital_id ? ret.hospital_id.toString() : '';
    ret.created_at = ret.created_at ? new Date(ret.created_at).toISOString() : new Date().toISOString();
    delete ret._id;
    return ret;
  },
});

export const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema, 'blood_requests');
