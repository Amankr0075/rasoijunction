/**
 * Rate limiters disabled for entire website.
 */

// General API rate limiter (disabled)
export const apiLimiter = (req, res, next) => next();

// Stricter limiter for auth routes (disabled)
export const authLimiter = (req, res, next) => next();

// Password reset limiter (disabled)
export const passwordResetLimiter = (req, res, next) => next();
