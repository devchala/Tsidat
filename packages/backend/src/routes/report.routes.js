const express = require('express');
const { createReport, myReports, getReportById } = require('../controllers/report.controller');
const { createReportValidator } = require('../validators/report.validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createReportValidator, validate, createReport);
router.get('/mine', requireAuth, myReports);
router.get('/:id', requireAuth, getReportById);

module.exports = router;
