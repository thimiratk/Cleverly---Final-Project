const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');

const router = express.Router();

// Basic analytics
router.get('/', async (req, res) => {
  const userCount = await User.countDocuments();
  const reviewCount = await Review.countDocuments();
  const topReviewers = await User.find().sort({ badges: -1 }).limit(5).select('name badges');
  res.json({ userCount, reviewCount, topReviewers });
});

module.exports = router;
