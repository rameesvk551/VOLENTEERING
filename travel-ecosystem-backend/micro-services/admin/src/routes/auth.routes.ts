import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

  const secret: Secret = process.env.JWT_SECRET ?? process.env.AUTH_JWT_SECRET ?? 'volenteering-shared-secret';
  const expiresIn: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
