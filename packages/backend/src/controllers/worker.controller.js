const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Worker = require('../models/Worker');

// Placeholder for the team to build out: registration request, availability
// toggle, assigned-task list, en-route/in-progress/completed transitions.
const getMyWorkerProfile = asyncHandler(async (req, res) => {
  const worker = await Worker.findOne({ user: req.user._id });
  if (!worker) throw ApiError.notFound('Worker profile not found');
  res.json({ success: true, worker });
});

module.exports = { getMyWorkerProfile };
