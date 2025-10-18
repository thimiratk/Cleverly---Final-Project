import express, { Router } from 'express';
import {
    createModerator,
    getModerators,
    getModeratorById,
    updateModerator,
    deleteModerator,
    moderatorLogin,
    getModeratorStats
} from '../controllers/moderator_controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isAdmin } from '../utils/auth.helper';

const router: Router = express.Router();

// Public routes
router.post('/moderators/login', moderatorLogin);

// Admin-only routes (require admin authentication)
router.post('/moderators', isAuthenticated, isAdmin, createModerator);
router.get('/moderators', isAuthenticated, isAdmin, getModerators);
router.get('/moderators/stats', isAuthenticated, isAdmin, getModeratorStats);
router.get('/moderators/:id', isAuthenticated, isAdmin, getModeratorById);
router.put('/moderators/:id', isAuthenticated, isAdmin, updateModerator);
router.delete('/moderators/:id', isAuthenticated, isAdmin, deleteModerator);

export default router;