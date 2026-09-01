const express = require('express');
const { overview } = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { ROLES } = require('@tsidat/shared');

const router = express.Router();

router.get('/overview', requireAuth, requireRole(ROLES.ADMIN, ROLES.PLANNER), overview);

module.exports = router;
