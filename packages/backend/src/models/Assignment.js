const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    incident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, enum: ['manual', 'recommended'], default: 'manual' },
    status: {
      type: String,
      enum: ['en_route', 'in_progress', 'completed', 'cancelled'],
      default: 'en_route',
    },
    completionEvidence: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
    completedAt: { type: Date },
    cancelReason: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
