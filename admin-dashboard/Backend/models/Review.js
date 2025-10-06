const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  product: { type: String, required: true },
  category: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  rating: { type: Number, min: 1, max: 5, required: true },
  status: { type: String, enum: ['pending', 'published', 'flagged', 'removed'], default: 'pending' },
  verificationStatus: { type: String, enum: ['unverified', 'verified', 'suspicious'], default: 'unverified' },
  helpfulVotes: { type: Number, default: 0 },
  fraudScore: { type: Number, default: 0 },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
