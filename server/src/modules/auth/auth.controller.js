import authService from './auth.service.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import User from './auth.model.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const { user, message } = await authService.register({
    name,
    email,
    password,
    phone,
    role,
    ip: req.ip || req.connection.remoteAddress,
  });

  res.status(200).json({
    success: true,
    message: message || 'OTP sent to email. Please verify.',
    data: { user },
  });
});

/**
 * @desc    Verify Registration OTP
 * @route   POST /api/auth/verify-registration
 * @access  Public
 */
export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  console.log("verifyRegistrationOtp called with email:", email, "otp:", otp);
  const { user, accessToken, refreshToken } = await authService.verifyRegistration(email, otp);

  // Set cookies
  authService.setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Registration verified and successful! Welcome to Rasoi Junction.',
    data: { user, accessToken },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
    ip: req.ip || req.connection.remoteAddress,
  });

  // Set cookies
  authService.setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Login successful!',
    data: { user, accessToken },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  // Clear cookies
  res.cookie('accessToken', '', { maxAge: 0, httpOnly: true });
  res.cookie('refreshToken', '', { maxAge: 0, httpOnly: true });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public (with refresh token)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(token);

  // Set new cookies
  authService.setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({
    success: true,
    data: { accessToken },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: { user },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.changePassword(req.user._id, {
      currentPassword,
      newPassword,
    });

  // Set new cookies
  authService.setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.',
    data: { accessToken },
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const result = await authService.resetPassword(email, otp, password);

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc    Get all users (admin)
 * @route   GET /api/auth/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await authService.getAllUsers({ page, limit, role, search });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Delete a user (admin)
 * @route   DELETE /api/auth/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  if (req.user.role === 'manager' && targetUser.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Managers cannot delete administrators.' });
  }

  await authService.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully.',
  });
});

/**
 * @desc    Create a user (admin)
 * @route   POST /api/auth/users
 * @access  Admin
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, staffDetails, employeeId } = req.body;
  if (req.user.role === 'manager' && role === 'admin') {
    return res.status(403).json({ success: false, message: 'Managers cannot create administrators.' });
  }

  const user = await authService.createUser({ name, email, password, phone, role, staffDetails, employeeId });

  res.status(201).json({
    success: true,
    message: 'User created successfully.',
    data: { user },
  });
});

/**
 * @desc    Update a user (admin)
 * @route   PUT /api/auth/users/:id
 * @access  Admin
 */
export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  if (req.user.role === 'manager' && targetUser.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Managers cannot update administrators.' });
  }

  const { name, email, phone, role, password, staffDetails, employeeId } = req.body;
  const user = await authService.updateUserByAdmin(req.params.id, { name, email, phone, role, password, staffDetails, employeeId });

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    data: { user },
  });
});

/**
 * @desc    Toggle block status of a user (admin/manager)
 * @route   PUT /api/auth/users/:id/block
 * @access  Admin, Manager
 */
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Managers cannot block admins
  if (req.user.role === 'manager' && targetUser.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Managers cannot block administrators.' });
  }

  // Admin cannot block themselves
  if (req.user._id.toString() === targetUser._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot block yourself.' });
  }

  targetUser.isBlocked = !targetUser.isBlocked;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `User has been ${targetUser.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
    isBlocked: targetUser.isBlocked
  });
});

/**
 * @desc    Toggle maintenance access for a user
 * @route   PUT /api/auth/users/:id/maintenance-access
 * @access  Admin only
 */
export const toggleMaintenanceAccess = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  targetUser.hasMaintenanceAccess = !targetUser.hasMaintenanceAccess;
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `Maintenance access has been ${targetUser.hasMaintenanceAccess ? 'granted' : 'revoked'} for this user.`,
    hasMaintenanceAccess: targetUser.hasMaintenanceAccess
  });
});

/**
 * @desc    Reset password by validating name (custom)
 * @route   POST /api/auth/reset-by-name
 * @access  Public
 */
export const resetPasswordByName = asyncHandler(async (req, res) => {
  const { name, email, newPassword } = req.body;
  const result = await authService.resetPasswordByName({ name, email, newPassword });

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// @desc    Update staff attendance (Admin/Manager only)
// @route   PUT /api/auth/users/:id/attendance
// @access  Private/Admin/Manager
export const updateAttendance = asyncHandler(async (req, res) => {
  const { date, status } = req.body;
  const user = await User.findById(req.params.id);

  if (!user || user.role === 'customer') {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Ensure staffDetails exists
  if (!user.staffDetails) {
    user.staffDetails = {};
  }
  if (!user.staffDetails.attendance) {
    user.staffDetails.attendance = [];
  }

  const attendanceDate = new Date(date).toISOString().split('T')[0];
  const existingRecordIndex = user.staffDetails.attendance.findIndex(
    (a) => {
      try {
        if (!a.date) return false;
        return new Date(a.date).toISOString().split('T')[0] === attendanceDate;
      } catch (err) {
        return false;
      }
    }
  );

  if (existingRecordIndex !== -1) {
    user.staffDetails.attendance[existingRecordIndex].status = status;
  } else {
    user.staffDetails.attendance.push({ date, status });
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    attendance: user.staffDetails.attendance,
  });
});

// @desc    Record a monthly salary payment for staff/chef
// @route   POST /api/auth/users/:id/salary-payment
// @access  Private/Admin/Manager
export const recordSalaryPayment = asyncHandler(async (req, res) => {
  const { month, year, amount, paymentMethod } = req.body;
  const user = await User.findById(req.params.id);

  if (!user || user.role === 'customer') {
    res.status(404);
    throw new Error('Staff not found');
  }

  if (!user.staffDetails) user.staffDetails = {};
  if (!user.staffDetails.salaryPayments) user.staffDetails.salaryPayments = [];

  // Upsert: if payment for same month/year exists, update it
  const existingIdx = user.staffDetails.salaryPayments.findIndex(
    (p) => p.month === month && p.year === year
  );

  const paymentEntry = {
    month,
    year,
    amount,
    paymentMethod: paymentMethod || '',
    paidAt: new Date(),
  };

  if (existingIdx !== -1) {
    user.staffDetails.salaryPayments[existingIdx] = paymentEntry;
  } else {
    user.staffDetails.salaryPayments.push(paymentEntry);
  }

  // Also update the top-level salaryPaid and paymentMethod flags
  user.staffDetails.salaryPaid = true;
  user.staffDetails.paymentMethod = paymentMethod || '';

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Salary payment recorded successfully',
    salaryPayments: user.staffDetails.salaryPayments,
  });
});

