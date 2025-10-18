/**
 * User Profile Service
 * Handles user profile data, images, followers, badges, and trust scores
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import userProfileRoutes from './routes/userProfile.routes';
import badgeRoutes from './routes/badge.routes';

const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Handle pre-flight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/profile', userProfileRoutes);
app.use('/admin', badgeRoutes);

// Default route
app.get('/', (req, res) => {
  res.send({ 
    message: '👤 User Profile Service is running!',
    version: '1.0.0',
    endpoints: {
      'GET /profile/me': 'Get current user profile',
      'GET /profile/:userId': 'Get user profile by ID',
      'PUT /profile/me': 'Update current user profile',
      'POST /profile/me/profile-picture': 'Upload profile picture',
      'POST /profile/me/cover-picture': 'Upload cover picture',
      'GET /profile/:userId/follow-stats': 'Get follow statistics',
      'POST /profile/:userId/follow': 'Follow user',
      'DELETE /profile/:userId/follow': 'Unfollow user',
      'GET /profile/:userId/badges': 'Get user badges and trust score'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'User Profile Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware should be last
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`🚀 User Profile Service is running on port ${port}`);
  console.log(`📝 API documentation available at http://localhost:${port}`);
});
server.on('error', console.error);
