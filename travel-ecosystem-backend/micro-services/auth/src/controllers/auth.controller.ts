import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/email.js';

// Generate JWT Token
const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' || role === 'super_admin' ? 'user' : role, // Prevent self-assignment of admin roles
      emailVerificationToken,
      emailVerificationExpires
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - Travel Ecosystem',
      html: `
        <h1>Welcome to Travel Ecosystem!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    });

    // Generate tokens
    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token and update last login
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage
        },
        token,
        refreshToken
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    ) as { id: string; type: string };

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id.toString(), user.email, user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const userId = (req as any).user?.id;

    if (userId && refreshToken) {
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset - Travel Ecosystem',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/auth/verify-email
// @desc    Verify email
// @access  Public
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profileImage: user.profileImage,
          phone: user.phone,
          bio: user.bio,
          location: user.location,
          preferences: user.preferences
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { name, phone, bio, location, profileImage, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (profileImage) user.profileImage = profileImage;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          phone: user.phone,
          bio: user.bio,
          location: user.location,
          preferences: user.preferences
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};
