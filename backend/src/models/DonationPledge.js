import mongoose from 'mongoose';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_PLEDGE_STATUSES = ['pledged', 'acknowledged', 'completed', 'cancelled'];

const donationPledgeSchema = new mongoose.Schema(
  {
    request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: [true, 'Request ID is required'],
    },
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
    },
    donor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: [true, 'Donor ID is required'],
    },
    donor_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor User ID is required'],
    },
    donor_name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    donor_phone: {
      type: String,
      required: [true, 'Donor phone is required'],
      trim: true,
    },
    blood_group: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: VALID_BLOOD_GROUPS,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: VALID_PLEDGE_STATUSES,
      default: 'pledged',
      lowercase: true,
    },
    estimated_arrival: {
      type: String,
      default: 'Within 1 hour',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

donationPledgeSchema.index({ hospital_id: 1, status: 1 });
donationPledgeSchema.index({ request_id: 1, status: 1 });
donationPledgeSchema.index({ donor_id: 1, status: 1 });

donationPledgeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.request_id = ret.request_id ? ret.request_id.toString() : '';
    ret.hospital_id = ret.hospital_id ? ret.hospital_id.toString() : '';
    ret.donor_id = ret.donor_id ? ret.donor_id.toString() : '';
    ret.donor_user_id = ret.donor_user_id ? ret.donor_user_id.toString() : '';
    ret.created_at = ret.created_at ? new Date(ret.created_at).toISOString() : new Date().toISOString();
    delete ret._id;
    return ret;
  },
});

export const DonationPledge = mongoose.model('DonationPledge', donationPledgeSchema, 'donation_pledges');
