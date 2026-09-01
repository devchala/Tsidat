const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Run after an express-validator chain. Collects validation errors into
 * a single 400 ApiError instead of letting bad input reach controllers.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest(
      'Validation failed',
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
}

module.exports = validate;
