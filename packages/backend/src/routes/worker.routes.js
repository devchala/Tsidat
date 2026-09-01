const express = require('express');
const { getMyWorkerProfile } = require('../controllers/worker.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { ROLES } = require('@tsidat/shared');

const router = express.Router();

router.get('/me', requireAuth, requireRole(ROLES.WORKER), getMyWorkerProfile);

module.exports = router;
