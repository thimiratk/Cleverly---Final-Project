const express = require('express');
const FraudReport = require('../models/FraudReport');
const router = express.Router();

// Get all fraud reports
router.get('/', async (req, res) => {
  const reports = await FraudReport.find();
  res.json(reports);
});

// Create a fraud report
router.post('/', async (req, res) => {
  const report = new FraudReport(req.body);
  await report.save();
  res.status(201).json(report);
});

// Update a fraud report
router.put('/:id', async (req, res) => {
  const report = await FraudReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(report);
});

// Delete a fraud report
router.delete('/:id', async (req, res) => {
  await FraudReport.findByIdAndDelete(req.params.id);
  res.json({ message: 'Fraud report deleted' });
});

module.exports = router;
