const Report = require('../models/Report');
const StatusHistory = require('../models/StatusHistory');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { REPORT_STATUS } = require('@tsidat/shared');

// Citizen creates a report. Duplicate/nearby-incident linking and priority
// scoring are intentionally left as TODOs for the team to wire up together
// (see services/priorityScore.service.js and the Incident model).
const createReport = asyncHandler(async (req, res) => {
  const { category, description, location } = req.body;

  const report = await Report.create({
    citizen: req.user._id,
    category,
    description,
    location: { type: 'Point', coordinates: location.coordinates },
    status: REPORT_STATUS.SUBMITTED,
  });

  await StatusHistory.create({
    report: report._id,
    toStatus: REPORT_STATUS.SUBMITTED,
    changedBy: req.user._id,
  });

  res.status(201).json({ success: true, report });
});

const myReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ citizen: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, reports });
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw ApiError.notFound('Report not found');

  // Citizens may only view their own reports; staff roles can view any.
  const isOwner = report.citizen.toString() === req.user._id.toString();
  const isStaff = ['worker', 'admin', 'planner'].includes(req.user.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden();

  res.json({ success: true, report });
});

module.exports = { createReport, myReports, getReportById };
