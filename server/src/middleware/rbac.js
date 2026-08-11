import { AppError } from './errorHandler.js';

/**
 * Role-Based Access Control middleware.
 * Usage: authorize('admin', 'manager')
 * Must be used AFTER protect middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized. Please log in first.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        `Role '${req.user.role}' is not authorized to access this resource.`,
        403
      ));
    }
    
    next();
  };
};

export default authorize;
