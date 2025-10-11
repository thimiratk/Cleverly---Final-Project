# User Profile Service

A comprehensive user profile management service for the Cleverly platform that handles user profile data, images, followers, badges, and trust scores.

## Features

### Core Functionality
- **User Profile Management**: Get and update user profile information
- **Image Uploads**: Profile pictures and cover photos with Cloudinary integration
- **Social Features**: Follow/unfollow users and track follower statistics
- **Badges System**: Display user achievements and badges
- **Trust Score**: Community-based trust scoring system
- **Authentication**: JWT-based authentication middleware

### API Endpoints

#### Profile Management
- `GET /api/profile/me` - Get current user's profile
- `GET /api/profile/:userId` - Get any user's profile by ID
- `PUT /api/profile/me` - Update current user's profile
- `POST /api/profile/me/profile-picture` - Upload profile picture
- `POST /api/profile/me/cover-picture` - Upload cover picture

#### Social Features
- `GET /api/profile/:userId/follow-stats` - Get follow statistics
- `POST /api/profile/:userId/follow` - Follow a user
- `DELETE /api/profile/:userId/follow` - Unfollow a user

#### Badges & Trust
- `GET /api/profile/:userId/badges` - Get user badges and trust score

#### Health Check
- `GET /health` - Service health check

## Setup

### Environment Variables
Environment variables are configured in the main `.env` file located at `/Server/org/.env`. This includes Cloudinary configuration that matches the frontend setup.

### Installation & Running

```bash
# Install dependencies
npm install

# Run in development mode
npx nx serve user-profile

# Build for production
npx nx build user-profile

# Run production build
npx nx serve user-profile --configuration=production
```

The service will run on `http://localhost:6005` by default.

**Note:** Cloudinary configuration is managed in the main `.env` file at the root of the Server/org directory, ensuring consistency across all services.

## Data Models

### UserProfile
```typescript
interface UserProfile {
  id: string;
  userId: string;
  username: string;
  email: string;
  profilePicture?: string;
  coverPicture?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  followersCount: number;
  followingCount: number;
  trustScore: number;
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Badge
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
}
```

## Frontend Integration

### Components Available
- `UserProfile` - Main profile display component
- `EditProfile` - Profile editing modal
- `UserProfilePage` - Complete profile page

### Service Methods
```javascript
import { userProfileService } from './services/userProfile.service';

// Get profile data
const profile = await userProfileService.getCurrentUserProfile();
const userProfile = await userProfileService.getUserProfile(userId);

// Update profile
await userProfileService.updateProfile({ username: 'newusername', bio: 'New bio' });

// Upload images
await userProfileService.uploadProfilePicture(file);
await userProfileService.uploadCoverPicture(file);

// Social features
await userProfileService.followUser(userId);
await userProfileService.unfollowUser(userId);
const stats = await userProfileService.getFollowStats(userId);

// Badges
const badges = await userProfileService.getUserBadges(userId);
```

## File Upload Configuration

- **Max file size**: 5MB
- **Supported formats**: JPEG, PNG, WebP, GIF
- **Auto-optimization**: Images are automatically resized and optimized
- **Profile pictures**: Resized to 500x500px
- **Cover pictures**: Resized to 1200x400px

## Authentication

The service uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Development Notes

- Currently uses mock data for development
- Ready for database integration (PostgreSQL/MongoDB)
- Includes TypeScript types and interfaces
- Fully responsive frontend components
- Error handling and loading states
- File upload validation and security

## Next Steps

1. **Database Integration**: Replace mock data with real database
2. **Enhanced Badges**: Add more badge types and earning criteria
3. **Advanced Trust Score**: Implement complex trust score algorithms
4. **Real-time Updates**: Add WebSocket support for live follow notifications
5. **Privacy Settings**: Add profile visibility controls
6. **Activity Feed**: Track and display user activities

## API Testing

You can test the API endpoints using curl:

```bash
# Health check
curl http://localhost:6005/health

# Get user profile (requires authentication)
curl -H "Authorization: Bearer <token>" http://localhost:6005/api/profile/me

# Upload profile picture
curl -X POST -H "Authorization: Bearer <token>" \
  -F "profilePicture=@/path/to/image.jpg" \
  http://localhost:6005/api/profile/me/profile-picture
```