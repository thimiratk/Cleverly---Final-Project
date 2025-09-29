const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema({
  type: String,
  description: String,
  riskScore: Number,
  status: { type: String, enum: ['confirmed', 'investigating', 'dismissed'], default: 'investigating' },
  detectedBy: String,
  affectedReviews: Number,
  timestamp: Date,
  evidence: [String]
}, { timestamps: true });

module.exports = mongoose.model('FraudReport', fraudReportSchema);
