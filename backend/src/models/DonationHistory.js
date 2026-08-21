import mongoose from 'mongoose';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_HISTORY_STATUSES = ['verified', 'completed'];

const donationHistorySchema = new mongoose.Schema(
  {
    donor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: [true, 'Donor ID is required'],
    },
    hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital ID is required'],
    },
    blood_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
    pledge_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationPledge',
      default: null,
    },
    blood_group: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: VALID_BLOOD_GROUPS,
      uppercase: true,
      trim: true,
    },
    units: {
      type: Number,
      required: [true, 'Units donated is required'],
      default: 1,
      min: 1,
    },
    donation_date: {
      type: Date,
      default: Date.now,
    },
    donor_name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    hospital_name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    hospital_address: {
      type: String,
      default: '',
      trim: true,
    },
    certificate_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: VALID_HISTORY_STATUSES,
      default: 'verified',
      lowercase: true,
    },
    remarks: {
      type: String,
      default: 'Routine clinical donation verified for emergency transfusion',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

donationHistorySchema.index({ donor_id: 1, donation_date: -1 });
donationHistorySchema.index({ hospital_id: 1 });

donationHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.donor_id = ret.donor_id ? ret.donor_id.toString() : '';
    ret.hospital_id = ret.hospital_id ? ret.hospital_id.toString() : '';
    ret.blood_request_id = ret.blood_request_id ? ret.blood_request_id.toString() : null;
    ret.pledge_id = ret.pledge_id ? ret.pledge_id.toString() : null;
    ret.donation_date = ret.donation_date ? new Date(ret.donation_date).toISOString() : new Date().toISOString();
    ret.created_at = ret.created_at ? new Date(ret.created_at).toISOString() : new Date().toISOString();
    delete ret._id;
    return ret;
  },
});

export const DonationHistory = mongoose.model('DonationHistory', donationHistorySchema, 'donation_history');
