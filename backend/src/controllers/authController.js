import { User } from '../models/User.js';
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

    return res.status(200).json({
      message: 'Login successful',
      user_id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};
