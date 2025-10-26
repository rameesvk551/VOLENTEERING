import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  getMe,
  updateProfile
} from '../controllers/auth.controller.js';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'host']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters')
];

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.get('/verify-email', verifyEmail);

// Protected routes
router.use(authMiddleware);
router.get('/me', getMe);
router.post('/logout', logout);
router.post('/change-password', changePasswordValidation, validate, changePassword);
router.put('/update-profile', updateProfileValidation, validate, updateProfile);

export default router;
