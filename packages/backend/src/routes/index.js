const express = require('express');
const authRoutes = require('./auth.routes');
const reportRoutes = require('./report.routes');
const workerRoutes = require('./worker.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/workers', workerRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
