const mongoose = require('mongoose');
const { REPORT_STATUS, PRIORITY_LEVEL, WASTE_CATEGORIES } = require('@tsidat/shared');

const reportSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: WASTE_CATEGORIES, required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    status: { type: String, enum: Object.values(REPORT_STATUS), default: REPORT_STATUS.SUBMITTED },
    priority: { type: String, enum: Object.values(PRIORITY_LEVEL) },
    priorityScore: { type: Number },
    incident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
  },
  { timestamps: true }
);

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
