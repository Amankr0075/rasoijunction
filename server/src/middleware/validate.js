import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Middleware to check express-validator results.
 * Use after validator arrays in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    throw new AppError(messages.join('. '), 400);
  }
  next();
};

export default validate;
