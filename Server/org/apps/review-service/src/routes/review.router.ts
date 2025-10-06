import express, { Router } from 'express';
import { createReview, updateReview, getReviews, getReviewCount } from '../controllers/review_controller';

const router: Router = express.Router();

router.post('/', createReview);
router.put('/:id', updateReview);
router.get('/', getReviews);
router.get('/count', getReviewCount);

export default router;
