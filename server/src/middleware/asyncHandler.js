/**
 * Async handler wrapper to eliminate try-catch in every controller.
 * Wraps an async function and passes any errors to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
