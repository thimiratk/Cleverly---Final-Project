const express = require('express');
const Setting = require('../models/Setting');
const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  const settings = await Setting.find();
  res.json(settings);
});

// Update or create a setting
router.put('/', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const setting = await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true }
  );
  res.json(setting);
});

module.exports = router;
