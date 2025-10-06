const express = require('express');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const router = express.Router();

// Create a new review
router.post('/', async (req, res) => {
  try {
    const { content, product, rating, author } = req.body;
    const review = new Review({
      author: author || 'Anonymous',
      product,
      rating,
      content
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('author', 'name badges').populate('comments');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a review
router.post('/:id/comments', async (req, res) => {
  try {
    const { content, author } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const comment = new Comment({ author: author || 'Anonymous', review: review._id, content });
    await comment.save();
    review.comments.push(comment._id);
    await review.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('author', 'name badges').populate('comments');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review
router.put('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    Object.assign(review, req.body);
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
