# Trust Score Real-Time Calculation - Summary

## What Changed

### Previous Approach (Removed)
- Trust score was stored in `users.trustScore` field in database
- Required manual updates via `updateUserTrustScore()` function
- Needed sync logic when reviews changed
- Could become stale if not updated properly

### New Approach (Current)
- Trust score is **calculated on-the-fly** every time it's requested
- No database storage needed
- Always reflects current review data
- Automatically up-to-date

## Modified Files

### Backend Changes

#### 1. `Server/org/apps/user-profile/src/controllers/userProfile.controller.ts`
**Changes:**
- `getUserProfile()` - Added dynamic trust score calculation
- `getCurrentUserProfile()` - Added dynamic trust score calculation  
- `getUserBadges()` - Removed trustScore from database query, added calculation
- `updateTrustScore()` - Updated to just calculate (no database update)
- `recalculateAllTrustScores()` - Updated to return calculated scores without storing

**Code Pattern:**
```typescript
// Calculate trust score dynamically
const { calculateTrustScore } = await import('../utils/trustScore.js');
const trustScoreResult = await calculateTrustScore(userId);

// Use in response
trustScore: trustScoreResult.trustScore
```

#### 2. `Server/org/apps/user-profile/src/utils/trustScore.ts`
**No changes needed** - The `calculateTrustScore()` function already exists and works perfectly for on-demand calculation.

**Note:** The `updateUserTrustScore()` and `recalculateAllTrustScores()` functions still exist in the utility but are not used by controllers anymore.

### Frontend Changes

#### 1. `frontend/src/components/UserProfile.jsx`
**Changes:**
- Updated to use `trustScore?.trustScore` from API response
- Added fallback error handling for trust score fetch
- Added console logging for debugging

**Code Pattern:**
```javascript
// Fetch trust score with fallback
const trustScorePromise = userProfileService.getUserTrustScore(userId).catch(err => {
  console.warn('Trust score fetch failed, using fallback:', err);
  return null;
});

// Display trust score
trustScore?.trustScore || badges?.trustScore || 0
```

#### 2. `frontend/src/services/userProfile.service.js`
**No changes needed** - Service methods already support trust score endpoints.

### Documentation

#### `TRUST_SCORE_IMPLEMENTATION.md`
Updated to reflect:
- Real-time calculation approach
- No database storage
- Automatic updates on every fetch
- Simplified API usage

## Benefits

### 1. **Always Accurate**
Trust score reflects the most current review data without any sync delays.

### 2. **No Sync Issues**
No need to trigger updates when:
- Reviews are verified
- Community votes change
- Reviews are deleted

### 3. **Simpler Code**
- No database update logic needed
- No background jobs for recalculation
- No stale data concerns

### 4. **Better Performance** (with future optimization)
Can add Redis caching later if needed:
```typescript
// Future optimization (not implemented yet)
const cached = await redis.get(`trust-score:${userId}`);
if (cached) return JSON.parse(cached);

const calculated = await calculateTrustScore(userId);
await redis.setex(`trust-score:${userId}`, 300, JSON.stringify(calculated)); // 5 min cache
return calculated;
```

## How It Works

### Request Flow

1. **User visits profile page**
   ```
   Frontend → GET /api/profile/:userId
   ```

2. **Controller fetches data**
   ```typescript
   // Get user data from database
   const userProfile = await prisma.users.findUnique({ where: { id: userId } });
   
   // Calculate trust score on-the-fly
   const trustScoreResult = await calculateTrustScore(userId);
   ```

3. **Controller returns combined data**
   ```json
   {
     "id": "123",
     "username": "john_doe",
     "trustScore": 75,  // ← Calculated, not from DB
     "badges": [...]
   }
   ```

4. **Frontend displays trust score**
   ```jsx
   <span className="stat-number">{trustScore?.trustScore || 0}</span>
   ```

### Trust Score Calculation

The `calculateTrustScore()` function:

1. Queries all reviews for the user
2. Counts verified reviews
3. Sums agree/disagree counts
4. Calculates agreement percentage
5. Applies scoring formula:
   - Base: 10 points (if ≥1 review)
   - Verified: 5 points each (max 50)
   - Agrees: 0.5 points each (max 30)
   - Bonus: Up to 10 points for high agreement rate
   - Max: 100 points

## Testing

### Test Trust Score Endpoint
```bash
# Get trust score for a specific user
curl http://localhost:6004/api/profile/68d7786a0b386ba69a76d33e/trust-score

# Expected response:
{
  "trustScore": 75,
  "breakdown": {
    "totalReviews": 25,
    "verifiedReviews": 15,
    "totalAgreeCount": 50,
    "averageAgreePercentage": 83.3,
    "meetsMinimumThreshold": true
  }
}
```

### Test Profile with Trust Score
```bash
# Get full profile (includes trust score)
curl http://localhost:6004/api/profile/68d7786a0b386ba69a76d33e

# Response includes:
{
  "id": "68d7786a0b386ba69a76d33e",
  "username": "john_doe",
  "trustScore": 75,  // ← Calculated on-the-fly
  "badges": [...]
}
```

## Migration Notes

### Database Field
The `users.trustScore` field still exists in the schema but is no longer used. You can:

**Option 1: Keep it** (for backwards compatibility)
```prisma
model users {
  trustScore Int @default(0)  // Not used, but kept for compatibility
}
```

**Option 2: Remove it** (cleaner approach)
```prisma
model users {
  // trustScore Int @default(0)  // Removed - calculated on-the-fly
}
```

If you remove it, run:
```bash
npx prisma db push
```

### Frontend Compatibility
The frontend is updated to handle both:
- New calculated trust score: `trustScore?.trustScore`
- Legacy stored trust score: `badges?.trustScore`
- Default fallback: `0`

## Performance Considerations

### Current Performance
- **Fast**: Single query for all user reviews
- **Efficient**: Simple aggregation calculations
- **Scalable**: No database writes needed

### Query Optimization
The trust score calculation uses:
```typescript
const reviews = await prisma.reviews.findMany({
  where: { userId },
  select: {
    postState: true,
    agreeCount: true,
    disagreeCount: true
  }
});
```

This is efficient because:
- Only fetches necessary fields
- Uses indexed `userId` field
- No joins required

### Future Optimization (Optional)
If performance becomes an issue:

1. **Add Redis caching**
   - Cache for 5-10 minutes
   - Invalidate on review changes

2. **Add database indexes**
   ```sql
   CREATE INDEX idx_reviews_userid_poststate ON reviews(userId, postState);
   ```

3. **Use database aggregation**
   ```typescript
   const stats = await prisma.reviews.aggregate({
     where: { userId },
     _count: true,
     _sum: { agreeCount: true, disagreeCount: true }
   });
   ```

## Rollback Plan

If needed, you can rollback to storing trust scores:

1. Uncomment database update code in `trustScore.ts`
2. Update controllers to save scores
3. Run batch calculation: `POST /api/profile/admin/trust-scores/recalculate`
4. Revert frontend to use stored value

However, the real-time approach is recommended for:
- Data accuracy
- Code simplicity
- Maintenance ease
