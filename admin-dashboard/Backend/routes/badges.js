const express = require('express');
const Badge = require('../models/Badge');
const User = require('../models/User');

const router = express.Router();

// Create a badge (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, criteria, icon, color, requirements } = req.body;
    const badge = new Badge({ name, description, criteria, icon, color, requirements });
    await badge.save();
    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign badge to user (admin only)
router.post('/assign', async (req, res) => {
  try {
    const { userId, badgeId } = req.body;
    const user = await User.findById(userId);
    const badge = await Badge.findById(badgeId);
    
    if (!user || !badge) {
      return res.status(404).json({ message: 'User or badge not found' });
    }
    
    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      await user.save();
      
      badge.holders += 1;
      await badge.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all badges with holder counts
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get badge by ID
router.get('/:id', async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update badge (admin only)
router.put('/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete badge (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    // Remove badge from all users
    await User.updateMany(
      { badges: req.params.id },
      { $pull: { badges: req.params.id } }
    );
    
    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get badge statistics for admin
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBadges = await Badge.countDocuments();
    const activeBadges = await Badge.countDocuments({ active: true });
    const totalHolders = await Badge.aggregate([
      { $group: { _id: null, total: { $sum: '$holders' } } }
    ]);
    
    res.json({
      totalBadges,
      activeBadges,
      totalHolders: totalHolders[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
