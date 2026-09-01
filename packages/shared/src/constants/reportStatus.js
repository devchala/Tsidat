const REPORT_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});

const PRIORITY_LEVEL = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

module.exports = { REPORT_STATUS, PRIORITY_LEVEL };
