import { Router } from 'express';
import {
  register,
  verifyRegistrationOtp,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  deleteUser,
  createUser,
  updateUserByAdmin,
  resetPasswordByName,
  updateAttendance,
  recordSalaryPayment,
  toggleBlockUser,
  toggleMaintenanceAccess,
} from './auth.controller.js';
import { protect } from '../../middleware/auth.js';
import authorize from '../../middleware/rbac.js';
import validate from '../../middleware/validate.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
} from './auth.validator.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/verify-registration', authLimiter, verifyRegistrationOtp);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidator, validate, resetPassword);
router.post('/reset-by-name', resetPasswordByName);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidator, validate, changePassword);

// Admin routes
router.get('/users', protect, authorize('admin', 'manager'), getAllUsers);
router.post('/users', protect, authorize('admin', 'manager'), createUser);
router.put('/users/:id', protect, authorize('admin', 'manager'), updateUserByAdmin);
router.put('/users/:id/attendance', protect, authorize('admin', 'manager'), updateAttendance);
router.post('/users/:id/salary-payment', protect, authorize('admin', 'manager'), recordSalaryPayment);
router.put('/users/:id/block', protect, authorize('admin', 'manager'), toggleBlockUser);
router.put('/users/:id/maintenance-access', protect, authorize('admin'), toggleMaintenanceAccess);
router.delete('/users/:id', protect, authorize('admin', 'manager'), deleteUser);

export default router;
