const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../services/token.service');
const User = require('../models/User');

/**
 * Verifies the JWT access token from the Authorization header and attaches
 * the authenticated user (minus password hash) to req.user.
 * Never trust a role sent from the client body/query - it always comes
 * from the verified token/DB record.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(decoded.sub).select('-passwordHash');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not found or disabled');
  }

  req.user = user;
  next();
});

module.exports = { requireAuth };
