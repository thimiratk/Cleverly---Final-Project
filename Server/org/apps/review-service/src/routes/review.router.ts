import express, { Router } from 'express';
import { 
  createReview, 
  updateReview, 
  deleteReview,
  getReviews, 
  getReviewCount, 
  searchReviews,
  getExceptionalReviews, 
  convertExceptionalReview,
  createCategoryFromExceptional,
  createSubCategoryFromExceptional,
  getAdminStats,
  approveReview,
  rejectReview,
  flagReviewForManualReview,
  getCommunityStats
} from '../controllers/review_controller';

const router: Router = express.Router();

router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.get('/search', searchReviews);
router.get('/count', getReviewCount);
router.get('/', getReviews);

// Public community stats endpoint
router.get('/community/stats', getCommunityStats);

// Admin endpoints for exceptional reviews
router.get('/admin/stats', getAdminStats);
router.get('/exceptional', getExceptionalReviews);
router.put('/exceptional/:reviewId/convert', convertExceptionalReview);
router.post('/exceptional/:reviewId/create-category', createCategoryFromExceptional);
router.post('/exceptional/:reviewId/create-subcategory', createSubCategoryFromExceptional);

// Admin endpoints for review verification
router.put('/admin/reviews/:id/approve', approveReview);
router.put('/admin/reviews/:id/reject', rejectReview);
router.put('/admin/reviews/:id/flag', flagReviewForManualReview);

export default router;
