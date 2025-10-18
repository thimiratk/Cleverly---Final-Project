/**
 * Badge Management Routes
 * Handles badge creation, assignment, and eligibility checking
 */

import { Router } from 'express';
import {
  createBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  getEligibleUsers,
  assignBadge,
  bulkAssignBadges,
  getUserBadges,
  getBadgeStatistics,
  removeBadgeFromUser
} from '../controllers/badge.controller';

const router = Router();

// Badge statistics and overview (MUST be before :badgeId route)
router.get('/badges/statistics/overview', getBadgeStatistics);

// Badge CRUD operations
router.post('/badges', createBadge);
router.get('/badges', getAllBadges);
router.get('/badges/:badgeId', getBadgeById);
router.put('/badges/:badgeId', updateBadge);
router.delete('/badges/:badgeId', deleteBadge);

// Eligibility and assignment
router.get('/badges/:badgeId/eligible-users', getEligibleUsers);
router.post('/badges/:badgeId/assign', assignBadge);
router.post('/badges/assign/bulk', bulkAssignBadges);

// User badge operations
router.get('/users/:userId/badges', getUserBadges);
router.delete('/users/:userId/badges/:badgeId', removeBadgeFromUser);

export default router;
