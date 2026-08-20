import mongoose from 'mongoose';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodInventorySchema = new mongoose.Schema(
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
    units: {
      type: Number,
      required: [true, 'Units count is required'],
      min: [0, 'Units cannot be negative'],
      default: 0,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

bloodInventorySchema.index({ hospital_id: 1, blood_group: 1 }, { unique: true });

bloodInventorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.hospital_id = ret.hospital_id ? ret.hospital_id.toString() : '';
    ret.updated_at = ret.updated_at ? new Date(ret.updated_at).toISOString() : new Date().toISOString();
    delete ret._id;
    return ret;
  },
});

export const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema, 'blood_inventory');
