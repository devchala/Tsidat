const app = require('./app');
const connectDB = require('./config/db');
const { validateEnv, env } = require('./config/env');
const logger = require('./utils/logger');

async function start() {
  validateEnv();
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`Tsidat API running on port ${env.port} [${env.nodeEnv}]`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

start();
