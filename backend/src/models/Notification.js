import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: String,
      required: [true, 'Recipient ID is required'],
    },
    recipient_role: {
      type: String,
      enum: ['donor', 'hospital', 'admin', 'all'],
      required: [true, 'Recipient role is required'],
    },
    notification_type: {
      type: String,
      default: 'emergency_alert',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    blood_group: {
      type: String,
      default: null,
    },
    request_id: {
      type: String,
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

notificationSchema.index({ recipient_id: 1, is_read: 1 });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.created_at = ret.created_at ? new Date(ret.created_at).toISOString() : new Date().toISOString();
    delete ret._id;
    return ret;
  },
});

export const Notification = mongoose.model('Notification', notificationSchema, 'notifications');
