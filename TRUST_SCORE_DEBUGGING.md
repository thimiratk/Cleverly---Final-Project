# Trust Score Debugging Guide

## Issue
Trust score showing as 0% in frontend

## Root Causes & Solutions

### 1. Data Source Priority
**Problem:** Frontend was checking multiple sources for trust score, but not in the right order.

**Solution:** Updated display logic to check sources in this order:
```javascript
trustScore?.trustScore || profile?.trustScore || badges?.trustScore || 0
```

This ensures we use:
1. Dedicated trust score API response first
2. Profile data trust score second
3. Badges trust score as fallback
4. 0 as final fallback

### 2. No Review Data
**Problem:** If user has no reviews, trust score will legitimately be 0.

**Solution:** Added user-friendly message when no reviews exist:
```jsx
{trustScore?.breakdown && trustScore.breakdown.totalReviews > 0 ? (
  <div className="trust-score-breakdown">
    {/* Show breakdown */}
  </div>
) : (
  <p style={{ fontStyle: 'italic' }}>
    No reviews yet. Write reviews to start building your trust score!
  </p>
)}
```

### 3. Backend Calculation Errors
**Problem:** Silent failures in trust score calculation could result in 0 scores.

**Solution:** Added comprehensive error handling and logging:
```typescript
let trustScoreResult;
try {
  const { calculateTrustScore } = await import('../utils/trustScore.js');
  trustScoreResult = await calculateTrustScore(userId);
  console.log(`✅ Trust score calculated for user ${userId}:`, trustScoreResult.trustScore);
} catch (error) {
  console.error('❌ Error calculating trust score:', error);
  trustScoreResult = { trustScore: 0, breakdown: {} };
}
```

## Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and look for these logs:
```
=== User Profile Data Debug ===
Profile Data: {...}
Profile Trust Score: 0 or number
Badges Data: {...}
Badges Trust Score: 0 or number
Trust Score Data: {trustScore: 0, breakdown: {...}}
Trust Score Value: 0 or number
=============================
```

### Step 2: Check Backend Console
Look for these logs in the server terminal:
```
✅ Trust score calculated for user 123...: 75
```

Or errors:
```
❌ Error calculating trust score: [error details]
```

### Step 3: Test API Directly
```bash
# Test trust score endpoint
curl http://localhost:6004/api/profile/USER_ID/trust-score

# Test profile endpoint (includes trust score)
curl http://localhost:6004/api/profile/USER_ID
```

Expected response:
```json
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

### Step 4: Check Database
```javascript
// Check if user has reviews
db.reviews.find({ userId: "USER_ID" }).count()

// Check review states
db.reviews.find({ userId: "USER_ID" }).forEach(r => {
  print(`Review ${r._id}: ${r.postState}, agrees: ${r.agreeCount}`)
})
```

## Common Issues

### Issue 1: Trust Score is 0
**Reasons:**
- User has no reviews (< 1 review)
- All reviews are PENDING/REJECTED (not VERIFIED)
- All reviews have 0 agree count
- Backend calculation error

**Solution:**
1. Check browser console logs
2. Check backend console logs  
3. Verify user has verified reviews with agree counts
4. Run test: `node test-trust-score-calculation.js`

### Issue 2: Trust Score Not Updating
**Reasons:**
- Frontend not refetching data
- Backend cache issue
- Component not re-rendering

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check if `fetchUserData()` is called
3. Navigate away and back to profile
4. Check network tab for API calls

### Issue 3: Trust Score Inconsistent
**Reasons:**
- Different endpoints return different values
- Race condition in API calls
- Caching issues

**Solution:**
1. Check all console logs
2. Compare trustScore values from all sources
3. Clear browser cache
4. Restart backend server

## Test Commands

### Frontend Test
```bash
# In browser console
console.log('Trust Score:', trustScore);
console.log('Profile:', profile);
console.log('Badges:', badges);
```

### Backend Test
```bash
# Test direct calculation
cd Server/org
node test-trust-score.mjs

# Or test via API
curl http://localhost:6004/api/profile/USER_ID/trust-score
```

## Files Modified

### Backend
1. `Server/org/apps/user-profile/src/controllers/userProfile.controller.ts`
   - Added error handling for trust score calculation
   - Added detailed logging
   - Updated getUserProfile, getCurrentUserProfile, getUserBadges

### Frontend  
1. `frontend/src/components/UserProfile.jsx`
   - Added comprehensive logging
   - Updated trust score display priority
   - Added "no reviews" message
   - Fixed multiple data source handling

## Expected Behavior

### User with No Reviews
- Display: "0 Trust Score"
- Message: "No reviews yet. Write reviews to start building your trust score!"
- Console: Shows trustScore: 0, totalReviews: 0

### User with 1-9 Reviews (Below Old Threshold)
- Display: Calculated score (10+ base points if ≥1 review)
- Breakdown: Shows actual numbers
- Console: Shows non-zero trust score

### User with 10+ Reviews
- Display: Full calculated score (up to 100)
- Breakdown: Shows all metrics
- Console: Shows calculation details

## Trust Score Formula Reminder

```
Base: 10 points (if ≥1 review)
+ Verified Reviews: 5 points each (max 50)
+ Agree Count: 0.5 points per agree (max 30)
+ Agreement Bonus: 
  - ≥80%: +10 points
  - ≥60%: +7 points
  - ≥40%: +4 points
= Max 100 points
```

## Next Steps if Still Not Working

1. **Check if backend is running:**
   ```bash
   curl http://localhost:6004/api/profile/health
   ```

2. **Rebuild frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Rebuild backend:**
   ```bash
   cd Server/org
   npm run dev
   ```

4. **Check for TypeScript compilation errors:**
   Look for red underlines in VS Code or errors in terminal

5. **Verify Prisma schema:**
   ```bash
   cd Server/org
   npx prisma generate
   ```

6. **Test with a specific user:**
   - Find a user ID with reviews
   - Test API: `curl http://localhost:6004/api/profile/USER_ID`
   - Check response trust score value
   - Compare with frontend display

## Success Indicators

✅ Backend console shows: "✅ Trust score calculated for user..."
✅ Frontend console shows: "Trust Score Data: {trustScore: X, breakdown: {...}}"
✅ Profile displays non-zero trust score (if user has reviews)
✅ Trust score breakdown shows correct numbers
✅ No errors in browser or server console

