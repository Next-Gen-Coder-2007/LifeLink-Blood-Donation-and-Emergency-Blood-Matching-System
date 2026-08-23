import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Basic Master Admin Login Bypass
    const trimmedInput = (email || '').toLowerCase().trim();
    const isAdminBypass =
      (trimmedInput === 'admin' || trimmedInput === 'admin@lifelink.org' || trimmedInput === 'admin@admin.com') &&
      (password === 'admin' || password === 'admin123' || password === 'admin@123');

    if (isAdminBypass) {
      return res.status(200).json({
        message: 'Admin bypass authenticated successfully',
        user_id: 'admin_master_root_id',
        name: 'System Administrator',
        email: 'admin@lifelink.org',
        role: 'admin',
        profile_id: null,
        blood_group: null,
      });
    }

    const user = await User.findOne({ email: trimmedInput }).lean();

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = user.password_hash === password;

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    let profileId = null;
    let bloodGroup = null;

    if (user.role === 'donor') {
      const donor = await Donor.findOne({ user_id: user._id }).lean();
      if (donor) {
        profileId = donor._id.toString();
        bloodGroup = donor.blood_group;
      }
    } else if (user.role === 'hospital') {
      const hospital = await Hospital.findOne({ user_id: user._id }).lean();
      if (hospital) {
        profileId = hospital._id.toString();
      }
    }

    return res.status(200).json({
      message: 'Login successful',
      user_id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profile_id: profileId,
      blood_group: bloodGroup,
    });
  } catch (error) {
    next(error);
  }
};
