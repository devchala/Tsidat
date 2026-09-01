const ApiError = require('../utils/ApiError');

/**
 * RBAC guard. Usage: router.get('/admin/stuff', requireAuth, requireRole('admin'))
 * Always place after requireAuth. Enforced server-side on every protected
 * route - the client role is only used for UI, never for authorization.
 */
const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };

module.exports = { requireRole };
