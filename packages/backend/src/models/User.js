const mongoose = require('mongoose');
const { ROLES } = require('@tsidat/shared');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CITIZEN, required: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Only populated for role === WORKER; verification gate before operational access.
    workerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
