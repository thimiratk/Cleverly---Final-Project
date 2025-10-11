import express from 'express';
import {
  getUserProfile,
  getCurrentUserProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPicture,
  getFollowStats,
  followUser,
  unfollowUser,
  getUserBadges
} from '../controllers/userProfile.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { upload } from '../utils/fileUpload';

const router = express.Router();

// Multer error handling middleware
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large', limit: '10MB' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name' });
    }
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Get current user's profile (requires authentication)
router.get('/me', authenticateToken, getCurrentUserProfile);

// Get any user's profile (optional authentication for follow status)
router.get('/:userId', optionalAuth, getUserProfile);

// Update current user's profile
router.put('/me', authenticateToken, updateProfile);

// Upload profile picture
router.post('/me/profile-picture', 
  authenticateToken, 
  upload.single('profilePicture'),
  handleMulterError,
  uploadProfilePicture
);

// Upload cover picture
router.post('/me/cover-picture', 
  authenticateToken, 
  upload.single('coverPicture'),
  handleMulterError,
  uploadCoverPicture
);

// Get follow statistics for a user
router.get('/:userId/follow-stats', optionalAuth, getFollowStats);

// Follow a user
router.post('/:userId/follow', authenticateToken, followUser);

// Unfollow a user
router.delete('/:userId/follow', authenticateToken, unfollowUser);

// Get user badges and trust score
router.get('/:userId/badges', getUserBadges);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'User Profile Service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;