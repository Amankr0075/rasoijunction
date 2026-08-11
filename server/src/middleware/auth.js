import jwt from 'jsonwebtoken';
import User from '../modules/auth/auth.model.js';
import { AppError } from './errorHandler.js';
import asyncHandler from './asyncHandler.js';
import env from '../config/env.js';

/**
 * Protect routes — verifies JWT from cookie or Authorization header.
 * Attaches user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first, then Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please log in to access this resource.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    if (user.isBlocked) {
      throw new AppError('Your account has been blocked. Contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired. Please refresh your session.', 401);
    }
    throw error;
  }
});

/**
 * Optional auth — if token present, attach user, otherwise continue.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    } catch {
      // Token invalid — continue without user
    }
  }

  next();
});

export { protect, optionalAuth };
