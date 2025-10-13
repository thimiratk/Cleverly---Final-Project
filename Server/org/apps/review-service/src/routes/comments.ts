import { Router } from 'express';
import {
  createComment,
  getCommentsByReview,
  getCommentStance,
  reanalyzeReviewStances,
} from '../controllers/comment_controller';

const router = Router();

// Create a new comment
router.post('/', createComment);

// Get comments for a review
router.get('/review/:reviewId', getCommentsByReview);

// Get stance analysis for a specific comment
router.get('/:commentId/stance', getCommentStance);

// Re-analyze stance for all comments of a review (admin endpoint)
router.post('/review/:reviewId/reanalyze-stance', reanalyzeReviewStances);

export default router;