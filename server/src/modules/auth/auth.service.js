import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './auth.model.js';
import Notification from '../notifications/notification.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import env from '../../config/env.js';
import sendEmail from '../../utils/sendEmail.js';

class AuthService {
  /**
   * Generate access and refresh tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRE,
    });

    const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRE,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Set tokens as HTTP-only cookies
   */
  setTokenCookies(res, accessToken, refreshToken) {
    const cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Register a new user (initial step, unverified)
   */
  async register({ name, email, password, phone, role, ip }) {
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new AppError('Please provide a valid email address.', 400);
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      throw new AppError('An account with this email already exists.', 400);
    }

    // Only allow customer role from public registration
    const allowedRole = ['customer'].includes(role) ? role : 'customer';

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      // Update unverified user
      user.name = name;
      user.password = password; // Will be hashed by pre-save hook
      user.phone = phone;
      user.role = allowedRole;
      user.registrationOtp = otp;
      user.registrationOtpExpire = otpExpire;
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: allowedRole,
        isVerified: false,
        registrationOtp: otp,
        registrationOtpExpire: otpExpire,
        lastIpAddress: ip,
      });
    }

    // Send OTP email
    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verify Your Email</h1>
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hi ${user.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Thank you for registering. Please use the following OTP to verify your email address:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border-left: 4px solid #f97316;">
          <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #ea580c;">${otp}</h2>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">This OTP is valid for 10 minutes.</p>
      </div>
    </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Registration OTP - Rasoi Junction',
        message: `Your registration OTP is ${otp}. It is valid for 10 minutes.`,
        html: htmlMessage,
      });
    } catch (err) {
      console.error('Error sending OTP email:', err);
    }

    return { user, message: 'OTP sent to email. Please verify.' };
  }

  /**
   * Verify Registration OTP
   */
  async verifyRegistration(email, otp) {
    if (!email) throw new AppError('Email is required.', 400);
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    if (user.isVerified) {
      throw new AppError('User is already verified.', 400);
    }

    if (user.registrationOtp !== otp) {
      throw new AppError('Invalid OTP.', 400);
    }

    if (user.registrationOtpExpire < Date.now()) {
      throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    user.isVerified = true;
    user.registrationOtp = undefined;
    user.registrationOtpExpire = undefined;

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    // Send Welcome Email
    try {
      const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f97316; padding: 30px; text-align: center;">
          <p style="color: #ffedd5; margin: 5px 0 0 0; font-size: 14px;">Where Tradition Meets Technology</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
          <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Welcome to our family, ${user.name}! 🎊</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">We are absolutely thrilled to have you here.</p>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your account has been successfully verified and created. Here are your details:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f97316;">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Name:</strong> ${user.name}</p>
            <p style="margin: 0; font-size: 15px;"><strong>Email (Username):</strong> ${user.email}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Get ready to explore a world of delicious flavors and amazing offers directly from our kitchen to your table.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://rasoijunction.vercel.app/menu" style="background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Explore Our Menu</a>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">If you ever have any questions or need assistance, feel free to reply directly to this email.</p>
        </div>
      </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Welcome to Rasoi Junction! 🎉',
        message: `Hi ${user.name}, welcome to Rasoi Junction!`, // Fallback for clients that don't support HTML
        html: htmlMessage, // Send the rich HTML version
      });
    } catch (err) {
      console.log('Error sending welcome email, but user was verified.', err);
    }

    // Remove sensitive fields
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return { user: userResponse, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login({ email, password, ip }) {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email address to login.', 403);
    }

    if (user.isBlocked) {
      throw new AppError('Your account has been blocked. Please email support with your concern to rasoijunction.admin@gmail.com to unlock your account.', 403);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Update refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    if (ip) user.lastIpAddress = ip;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive fields
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return { user: userResponse, accessToken, refreshToken };
  }

  /**
   * Logout user — clear refresh token
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(token) {
    if (!token) {
      throw new AppError('No refresh token provided.', 401);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    // Find user with matching refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token. Please log in again.', 401);
    }

    if (user.isBlocked) {
      throw new AppError('Your account has been blocked. Contact support.', 403);
    }

    // Generate new tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Update refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    // Prevent updating sensitive fields through this method
    const forbidden = ['password', 'role', 'isBlocked', 'isVerified', 'refreshToken'];
    forbidden.forEach((field) => delete updateData[field]);

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Send Profile Update Email
    try {
      const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f97316; padding: 30px; text-align: center;">
          <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
          <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Profile Updated Successfully</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello ${user.name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your profile details have been successfully updated in our system.</p>
          <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #db2777;">
            <p style="font-size: 14px; line-height: 1.6; color: #9d174d; margin: 0;">If you did not make this change, please contact our support team immediately to secure your account.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
          <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
          <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
        </div>
      </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Profile Updated - Rasoi Junction',
        message: 'Your profile details have been updated.',
        html: htmlMessage,
      });
    } catch (err) {
      console.log('Error sending profile update email:', err);
    }

    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    // Generate new tokens (invalidate old sessions)
    const { accessToken, refreshToken } = this.generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  /**
   * @desc    Forgot password - Generate OTP
   * @param   {String} email
   * @returns {Object} Message
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('There is no user with that email', 404);
    }

    // Generate 6-digit OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto
      .createHash('sha256')
      .update(resetOtp)
      .digest('hex');

    // Set OTP and expire (15 mins)
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your 6-digit One Time Password (OTP) is:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border-left: 4px solid #f97316;">
          <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #1f2937;">${resetOtp}</h1>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">This OTP will expire in 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - Rasoi Junction',
        message: `Your password reset OTP is: ${resetOtp}`,
        html: htmlMessage,
      });

      return { message: 'OTP sent to email' };
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('Email could not be sent', 500);
    }
  }

  /**
   * @desc    Reset password using OTP
   * @param   {String} email
   * @param   {String} otp
   * @param   {String} newPassword
   * @returns {Object} Success message
   */
  async resetPassword(email, otp, newPassword) {
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }


  /**
   * Get all users (admin)
   */
  async getAllUsers({ page = 1, limit = 10, role, search }) {
    const query = { isVerified: true };

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a user (admin)
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  /**
   * Create a new user (admin/manager tool)
   */
  async createUser(userData) {
    const { name, email, password, phone, role, staffDetails, employeeId } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered.', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      isVerified: true, // Admin created users are verified
      staffDetails,
      ...(employeeId && { employeeId })
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return userResponse;
  }

  /**
   * Update User (Admin)
   * Allows admin to edit customer or staff details and notifies the user via email.
   */
  async updateUserByAdmin(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (updateData.password) {
      user.password = updateData.password;
    }
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.role) user.role = updateData.role;
    if (updateData.staffDetails) {
      user.staffDetails = { ...user.staffDetails, ...updateData.staffDetails };
    }
    if (updateData.employeeId) {
      user.employeeId = updateData.employeeId;
    }

    await user.save();

    // Send Notification Email to the updated user
    try {
      const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f97316; padding: 30px; text-align: center;">
          <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
          <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Account Details Updated by Admin</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello ${user.name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">An administrator has recently updated your account details. Here is your current account information:</p>
          
          <ul style="font-size: 16px; line-height: 1.6; color: #4b5563; background: #f9fafb; padding: 20px 40px; border-radius: 8px;">
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Phone:</strong> ${user.phone || 'N/A'}</li>
            <li><strong>Account Role:</strong> ${user.role}</li>
          </ul>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="font-size: 14px; line-height: 1.6; color: #1e3a8a; margin: 0;">If you believe this was a mistake, please contact our support team.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
          <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
          <p style="font-size: 15px; color: #111827; font-weight: 600; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
        </div>
      </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Your Account Details Have Been Updated - Rasoi Junction',
        message: 'An administrator has updated your account details.',
        html: htmlMessage,
      });

      // Create a system notification on the website
      await Notification.create({
        user: user._id,
        message: 'An administrator has updated your account details.',
        type: 'System',
      });
    } catch (emailErr) {
      console.error('Failed to send admin update notification:', emailErr);
    }

    return user;
  }

  /**
   * Reset password by validating Full Name and Email
   */
  async resetPasswordByName({ name, email, newPassword }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('No account found with this email.', 404);
    }

    const cleanDbName = user.name.trim().toLowerCase();
    const cleanInputName = name.trim().toLowerCase();

    if (cleanDbName !== cleanInputName) {
      throw new AppError('Full name verification failed. Please enter the correct name.', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { message: 'Password reset successfully!' };
  }
}

export default new AuthService();
