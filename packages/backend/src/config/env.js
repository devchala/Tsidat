require('dotenv').config();

/**
 * Centralized, validated access to environment variables.
 * Fail fast at startup instead of hitting `undefined` deep in the app.
 */
const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  validateEnv,
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
    maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 5,
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    authRateLimitWindowMin: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MIN, 10) || 15,
    authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  },
};
