import mongoose from 'mongoose';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const donorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: 0.0,
    },
    longitude: {
      type: Number,
      default: 0.0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    last_donation_date: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

donorSchema.index({ blood_group: 1, availability: 1 });

donorSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.user_id = ret.user_id ? ret.user_id.toString() : '';
    delete ret._id;
    return ret;
  },
});

export const Donor = mongoose.model('Donor', donorSchema, 'donors');
