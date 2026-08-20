import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    hospital_name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    emergency_contact: {
      type: String,
      required: [true, 'Emergency contact is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      default: 0.0,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      default: 0.0,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

hospitalSchema.index({ latitude: 1, longitude: 1 });

hospitalSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.user_id = ret.user_id ? ret.user_id.toString() : '';
    delete ret._id;
    return ret;
  },
});

export const Hospital = mongoose.model('Hospital', hospitalSchema, 'hospitals');
