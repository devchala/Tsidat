/**
 * Wraps an async Express route/controller so rejected promises are
 * forwarded to next(err) instead of crashing the process.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
