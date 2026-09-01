const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const app = express();

// --- Security-by-design middleware stack ---
app.use(helmet()); // sets secure HTTP headers
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize()); // strips $/. operators to block NoSQL injection
app.use(xss()); // sanitizes user input against XSS
app.use(hpp()); // guards against HTTP parameter pollution
app.use(compression());
app.use(apiLimiter);

app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// --- Routes ---
app.use('/api/v1', routes);

// --- Fallbacks ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
