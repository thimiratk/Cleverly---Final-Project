const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  criteria: { type: String }, // e.g., 'Top Reviewer', 'Helpful', etc.
  icon: { type: String },
  color: { type: String },
  requirements: [{ type: String }],
  holders: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
