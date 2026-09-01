const express = require('express');
const { verifyWorker } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { ROLES } = require('@tsidat/shared');

const router = express.Router();

router.patch('/workers/:workerId/verify', requireAuth, requireRole(ROLES.ADMIN), verifyWorker);

module.exports = router;
