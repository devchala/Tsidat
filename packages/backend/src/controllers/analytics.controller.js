const asyncHandler = require('../utils/asyncHandler');
const Report = require('../models/Report');

// Placeholder aggregate endpoint - team can extend with hotspot/trend queries
// (spec section 13). Uses MongoDB aggregation rather than pulling all docs
// into app memory.
const overview = asyncHandler(async (req, res) => {
  const byStatus = await Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byCategory = await Report.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

  res.json({ success: true, byStatus, byCategory });
});

module.exports = { overview };
