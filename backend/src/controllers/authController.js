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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

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
