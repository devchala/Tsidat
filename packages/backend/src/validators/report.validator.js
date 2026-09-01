const { body } = require('express-validator');
const { WASTE_CATEGORIES } = require('@tsidat/shared');

const createReportValidator = [
  body('category').isIn(WASTE_CATEGORIES).withMessage('Invalid waste category'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('location.coordinates must be [lng, lat]'),
];

module.exports = { createReportValidator };
