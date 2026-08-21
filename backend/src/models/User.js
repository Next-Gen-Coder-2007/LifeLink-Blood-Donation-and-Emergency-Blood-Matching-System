import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password_hash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['donor', 'hospital', 'admin'],
      required: [true, 'Role is required'],
      lowercase: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

userSchema.index({ created_at: -1 });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.created_at = ret.created_at ? new Date(ret.created_at).toISOString() : new Date().toISOString();
    delete ret._id;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema, 'users');
