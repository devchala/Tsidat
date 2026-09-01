const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    verified: { type: Boolean, default: false }, // admin approval gate
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'offline',
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    activeTaskCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Worker', workerSchema);
