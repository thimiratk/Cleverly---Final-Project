const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const Badge = require('../models/Badge');
const FraudReport = require('../models/FraudReport');
const router = express.Router();

// Get admin profile (simulate single admin for now)
router.get('/profile', async (req, res) => {
  try {
    // In a real app, fetch from DB. Here, return sample data for demo.
    res.json({
      name: 'Sarah Wilson',
      email: 'sarah.wilson@cleverly.com',
      phone: '+1 (555) 123-4567',
      location: 'Seattle, WA',
      department: 'Trust & Safety',
      role: 'Senior Platform Administrator',
      joinDate: '2023-01-15',
      bio: 'Senior administrator overseeing review authenticity, user verification, and platform integrity for the Cleverly consumer review platform. Specialized in fraud detection and trust score algorithms.',
      permissions: [
        'Review Verification',
        'Badge Management',
        'User Authentication',
        'Content Moderation',
        'Analytics Access',
        'Fraud Detection',
        'System Configuration'
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin profile (simulate update)
router.put('/profile', async (req, res) => {
  try {
    // In a real app, update DB. Here, just echo back.
    res.json({ ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const reviewCount = await Review.countDocuments();
    const verifiedReviews = await Review.countDocuments({ verificationStatus: 'verified' });
    const trustedReviewers = await User.countDocuments({ role: 'reviewer', trustScore: { $gte: 80 } });
    
    res.json([
      { label: 'Verified Reviews', value: verifiedReviews.toString(), description: 'Reviews verified as authentic' },
      { label: 'Trusted Reviewers', value: trustedReviewers.toString(), description: 'Users with trusted reviewer badges' },
      { label: 'Fraud Detection Rate', value: '94.8%', description: 'Fake reviews successfully detected' },
      { label: 'Review Quality Score', value: '8.7/10', description: 'Average platform review quality' }
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent admin activities
router.get('/activities', async (req, res) => {
  try {
    // In a real app, you'd have an activity log. For now, return sample data.
    res.json([
      { id: 1, action: 'Verified authenticity of 24 flagged reviews', time: '2 hours ago', type: 'verification' },
      { id: 2, action: 'Awarded "Trusted Reviewer" badge to user Emma Thompson', time: '4 hours ago', type: 'badge' },
      { id: 3, action: 'Detected and removed fake review network (18 accounts)', time: '6 hours ago', type: 'fraud_detection' },
      { id: 4, action: 'Updated ML model for sentiment analysis', time: '1 day ago', type: 'system' },
      { id: 5, action: 'Moderated reported business profile: TechGadgets Store', time: '2 days ago', type: 'moderation' }
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quick actions
router.get('/quick-actions', async (req, res) => {
  try {
    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    const fraudAlerts = await FraudReport.countDocuments({ status: 'investigating' });
    const badgeRequests = await User.countDocuments({ trustScore: { $gte: 80 }, badges: { $size: 0 } });
    
    res.json([
      { label: 'Review Queue', count: pendingReviews.toString(), description: 'Pending reviews for verification' },
      { label: 'Fraud Alerts', count: fraudAlerts.toString(), description: 'Suspicious activity detected' },
      { label: 'Badge Requests', count: badgeRequests.toString(), description: 'Users eligible for badges' },
      { label: 'User Reports', count: '8', description: 'User-reported content' }
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;