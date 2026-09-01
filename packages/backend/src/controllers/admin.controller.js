const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Worker = require('../models/Worker');
const AuditLog = require('../models/AuditLog');

// Placeholder for the team: worker approval, report/incident management,
// manual assignment. Demonstrates the audit-logging pattern to follow
// for every admin action (spec section 17: "Audit important administrative actions").
const verifyWorker = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.workerId);
  if (!worker) throw ApiError.notFound('Worker not found');

  worker.verified = true;
  worker.verifiedBy = req.user._id;
  worker.verifiedAt = new Date();
  await worker.save();

  await AuditLog.create({
    actor: req.user._id,
    action: 'worker.verify',
    targetType: 'Worker',
    targetId: worker._id,
    ipAddress: req.ip,
  });

  res.json({ success: true, worker });
});

module.exports = { verifyWorker };
