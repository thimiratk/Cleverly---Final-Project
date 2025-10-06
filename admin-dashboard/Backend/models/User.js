const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for OAuth
  role: { type: String, enum: ['admin', 'moderator', 'reviewer'], default: 'reviewer' },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  phone: { type: String },
  location: { type: String },
  department: { type: String },
  joinDate: { type: Date, default: Date.now },
  bio: { type: String },
  permissions: [{ type: String }],
  trustScore: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
