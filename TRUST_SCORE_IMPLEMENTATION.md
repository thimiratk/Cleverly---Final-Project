# Trust Score Implementation

## Overview
Implemented a real-time trust score calculation system for user profiles. Trust scores are **calculated on-the-fly** every time a user profile is fetched, ensuring the score is always up-to-date without database storage.

## Features

### Trust Score Calculation Algorithm
The trust score is calculated based on the following criteria:

1. **Base Requirement**: User must have at least 1 total review (changed from 10 for easier testing)
2. **Verified Reviews**: +5 points per verified review (max 50 points)
3. **Community Agreement**: +1 point per 2 agrees (max 30 points)
4. **Agreement Bonus**:
   - ≥80% agreement rate: +10 points
   - ≥60% agreement rate: +7 points
   - ≥40% agreement rate: +4 points
5. **Maximum Score**: Capped at 100 points

### Key Advantage: Real-Time Calculation
- **No database storage** - Trust score is computed on demand
- **Always accurate** - Reflects the latest review data
- **No sync issues** - No need to trigger updates when reviews change
- **Performance optimized** - Efficient query for review data

### Backend Implementation

#### 1. Trust Score Utility (`Server/org/apps/user-profile/src/utils/trustScore.ts`)
Three main functions:

```typescript
// Calculate trust score with detailed breakdown (called automatically)
calculateTrustScore(userId: string): Promise<{
  trustScore: number;
  breakdown: {
    totalReviews: number;
    verifiedReviews: number;
    totalAgreeCount: number;
    averageAgreePercentage: number;
    meetsMinimumThreshold: boolean;
  }
}>
```

The trust score is **automatically calculated** when:
- Fetching user profile (`GET /profile/:userId`)
- Fetching current user profile (`GET /profile/me`)
- Fetching user badges (`GET /profile/:userId/badges`)
- Explicitly requesting trust score (`GET /profile/:userId/trust-score`)

#### 2. Controller Updates (`Server/org/apps/user-profile/src/controllers/userProfile.controller.ts`)

Modified existing controllers to calculate trust score on-the-fly:
- `getUserProfile` - Now calculates and includes trust score in response
- `getCurrentUserProfile` - Calculates trust score for authenticated user
- `getUserBadges` - Includes calculated trust score with badges
- `getUserTrustScore` - Dedicated endpoint for trust score with breakdown
- `updateTrustScore` - Alias for getUserTrustScore (for API compatibility)
- `recalculateAllTrustScores` - Admin endpoint to see all user scores

#### 3. API Routes (`Server/org/apps/user-profile/src/routes/userProfile.routes.ts`)

```
GET    /profile/:userId                        - Get user profile (includes trust score)
GET    /profile/me                             - Get current user profile (includes trust score)
GET    /profile/:userId/badges                 - Get badges (includes trust score)
GET    /profile/:userId/trust-score            - Get trust score with breakdown
PUT    /profile/:userId/trust-score            - Calculate trust score (same as GET)
POST   /profile/admin/trust-scores/recalculate - Calculate all scores (admin only)
```

### Frontend Implementation

#### 1. User Profile Service (`frontend/src/services/userProfile.service.js`)

Added two new methods:
```javascript
getUserTrustScore(userId)  // Fetch trust score with breakdown
updateTrustScore(userId)   // Trigger recalculation
```

#### 2. UserProfile Component (`frontend/src/components/UserProfile.jsx`)

Enhanced trust score display with:
- Real-time calculation on profile load
- Breakdown of trust score components:
  - Total reviews count
  - Verified reviews count
  - Community agrees count
  - Agreement rate percentage
- Visual circle display with score/100

#### 3. CSS Styling (`frontend/src/components/UserProfile.css`)

Added styles for:
- `.trust-score-breakdown` - Grid layout for breakdown items
- `.breakdown-item` - Individual stat display
- `.breakdown-label` and `.breakdown-value` - Styled text
- `.trust-score-max` - "/100" indicator

## Database Schema

**Note:** Trust score is **NOT stored** in the database. It's calculated on-demand from review data.

Reviews are evaluated based on:
```prisma
model reviews {
  postState    PostState @default(PENDING) // VERIFIED, REJECTED, FLAGGED
  agreeCount   Int       @default(0)
  disagreeCount Int      @default(0)
  // ... other fields
}

enum PostState {
  PENDING
  VERIFIED
  REJECTED
  FLAGGED
}
```

## Usage

### Get Trust Score
```javascript
// Frontend
const trustScore = await userProfileService.getUserTrustScore(userId);
console.log(trustScore);
// Output:
// {
//   trustScore: 75,
//   breakdown: {
//     totalReviews: 25,
//     verifiedReviews: 15,
//     totalAgreeCount: 50,
//     totalDisagreeCount: 10,
//     averageAgreePercentage: 83.33
//   }
// }
```

### Recalculate Trust Score (Same as Get)
```javascript
// Frontend - triggers calculation
const result = await userProfileService.updateTrustScore(userId);
console.log(result.message); // "Trust score calculated successfully"
```

### Admin: View All Scores
```bash
# Using API directly
curl -X POST http://localhost:6004/api/profile/admin/trust-scores/recalculate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Automatic Updates

**No manual updates needed!** Trust scores are automatically calculated fresh every time:
- User profile is viewed
- Badges are fetched
- Trust score endpoint is called

This means when a review is verified or community votes change, the trust score will automatically reflect the new data on the next profile fetch.

## Display on Frontend

The trust score now displays on user profiles with:
- Large circular badge showing score/100
- Detailed breakdown showing:
  - Total reviews
  - Verified reviews
  - Community agrees
  - Agreement percentage
- Color-coded visual indicator (gradient blue)

## Testing

### Test Trust Score Calculation
```bash
# Get trust score for a specific user
curl http://localhost:6004/api/profile/USER_ID/trust-score

# Update trust score
curl -X PUT http://localhost:6004/api/profile/USER_ID/trust-score \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Batch Recalculation
```bash
# Recalculate all user trust scores (admin only)
curl -X POST http://localhost:6004/api/profile/admin/trust-scores/recalculate \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Next Steps

1. **Badges**: Create achievement badges for trust score milestones (50, 75, 100)
2. **Notifications**: Notify users when their trust score increases significantly
3. **Leaderboard**: Create a leaderboard of highest trust score users
4. **Review Sorting**: Sort reviews by author's trust score
5. **Weighted Voting**: Give higher trust score users more weight in agree/disagree
6. **Caching**: Add Redis caching for frequently accessed trust scores (optional optimization)

## Files Modified

### Backend
- `Server/org/apps/user-profile/src/utils/trustScore.ts` (NEW)
- `Server/org/apps/user-profile/src/controllers/userProfile.controller.ts`
- `Server/org/apps/user-profile/src/routes/userProfile.routes.ts`

### Frontend
- `frontend/src/services/userProfile.service.js`
- `frontend/src/components/UserProfile.jsx`
- `frontend/src/components/UserProfile.css`

## API Documentation

### GET /profile/:userId/trust-score
Get trust score with detailed breakdown.

**Response:**
```json
{
  "trustScore": 75,
  "breakdown": {
    "totalReviews": 25,
    "verifiedReviews": 15,
    "totalAgreeCount": 50,
    "totalDisagreeCount": 10,
    "averageAgreePercentage": 83.33
  }
}
```

### PUT /profile/:userId/trust-score
Calculate trust score (same as GET, for API compatibility).

**Response:**
```json
{
  "message": "Trust score calculated successfully (no database update needed)",
  "trustScore": 75,
  "breakdown": { ... }
}
```

### POST /profile/admin/trust-scores/recalculate
Calculate all user trust scores and return top scores (admin only).

**Response:**
```json
{
  "message": "Trust scores calculated successfully (calculated on-the-fly, not stored)",
  "totalUsers": 150,
  "calculated": 148,
  "errors": 2,
  "topScores": [
    { "userId": "123", "username": "user1", "trustScore": 95 },
    { "userId": "456", "username": "user2", "trustScore": 87 }
  ]
}
```
