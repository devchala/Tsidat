const mongoose = require('mongoose');
const { PRIORITY_LEVEL } = require('@tsidat/shared');

// An incident represents the underlying operational problem;
// multiple nearby Reports can be clustered into one Incident.
const incidentSchema = new mongoose.Schema(
  {
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    priority: { type: String, enum: Object.values(PRIORITY_LEVEL), default: PRIORITY_LEVEL.LOW },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  },
  { timestamps: true }
);

incidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', incidentSchema);
