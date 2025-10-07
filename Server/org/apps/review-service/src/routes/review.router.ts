import express, { Router } from 'express';
import { 
  createReview, 
  updateReview, 
  getReviews, 
  getReviewCount, 
  getExceptionalReviews, 
  convertExceptionalReview 
} from '../controllers/review_controller';

const router: Router = express.Router();

router.post('/', createReview);
router.put('/:id', updateReview);
router.get('/', getReviews);
router.get('/count', getReviewCount);

// Admin endpoints for exceptional reviews
router.get('/exceptional', getExceptionalReviews);
router.put('/exceptional/:reviewId/convert', convertExceptionalReview);

export default router;
