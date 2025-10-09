import express, { Router } from 'express';
import { 
  createReview, 
  updateReview, 
  getReviews, 
  getReviewCount, 
  getExceptionalReviews, 
  convertExceptionalReview,
  createCategoryFromExceptional,
  createSubCategoryFromExceptional,
  getAdminStats
} from '../controllers/review_controller';

const router: Router = express.Router();

router.post('/', createReview);
router.put('/:id', updateReview);
router.get('/', getReviews);
router.get('/count', getReviewCount);

// Admin endpoints for exceptional reviews
router.get('/admin/stats', getAdminStats);
router.get('/exceptional', getExceptionalReviews);
router.put('/exceptional/:reviewId/convert', convertExceptionalReview);
router.post('/exceptional/:reviewId/create-category', createCategoryFromExceptional);
router.post('/exceptional/:reviewId/create-subcategory', createSubCategoryFromExceptional);

export default router;
