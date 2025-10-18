# Test Stance Detection API - Debugging Guide

## Issue
ReviewCard still not showing stance counts even after backend updates.

## Possible Causes

### 1. Backend Not Restarted
The updated `review_controller.ts` with explicit `select` for stance counts needs to be loaded.

**Solution:**
```powershell
cd Server\org
npm run dev
```

### 2. No Stance Counts in Database
Reviews might have all stance counts at 0 because no comments have been analyzed yet.

**Check Database:**
```javascript
// In MongoDB
db.reviews.findOne({}, {
  agreeCount: 1,
  disagreeCount: 1,
  neutralStanceCount: 1
})
```

### 3. Frontend Cache
Browser might be caching old API responses without stance counts.

**Solution:**
- Hard refresh: `Ctrl + Shift + R`
- Or clear browser cache
- Or open in incognito mode

## Testing Steps

### Step 1: Verify Backend is Running
```powershell
# Check if review service is running
curl http://localhost:8080/api/reviews
```

### Step 2: Check API Response Format
```powershell
# PowerShell - Check if stance counts are in response
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/reviews" -Method Get
$response[0] | Select-Object id, product, agreeCount, disagreeCount, neutralStanceCount, commentsCount
```

Expected output:
```
id                       : 68ee...
product                  : Product Name
agreeCount              : 0
disagreeCount           : 0
neutralStanceCount      : 0
commentsCount           : 0
```

### Step 3: Post a Comment with Stance
1. Open frontend: `http://localhost:5173`
2. Log in
3. Find a review
4. Post a comment: **"I totally agree with this review!"**
5. Wait for Gemini API to analyze (1-2 seconds)
6. Check database:

```javascript
// MongoDB - Check if comment has stance
db.reviewComments.findOne(
  { content: /agree/i },
  { stance: 1, stanceConfidence: 1, reviewId: 1 }
)

// Check if review agreeCount increased
db.reviews.findOne(
  { _id: ObjectId("REVIEW_ID_HERE") },
  { agreeCount: 1, disagreeCount: 1, neutralStanceCount: 1 }
)
```

### Step 4: Verify Frontend Receives Data

**Open Browser Console (F12):**
```javascript
// Check review data
fetch('http://localhost:8080/api/reviews')
  .then(r => r.json())
  .then(data => {
    console.log('First review:', data[0]);
    console.log('Stance counts:', {
      agree: data[0].agreeCount,
      disagree: data[0].disagreeCount,
      neutral: data[0].neutralStanceCount
    });
  });
```

### Step 5: Check ReviewCard Component

The ReviewCard console logs should show:
```
ReviewCard - Original review: { ..., agreeCount: 1, disagreeCount: 0, neutralStanceCount: 0 }
ReviewCard - Mapped reviewData: { ..., agreeCount: 1, disagreeCount: 0, neutralStanceCount: 0 }
```

## Common Issues

### Issue: API doesn't include stance counts

**Check:**
```typescript
// Server/org/apps/review-service/src/controllers/review_controller.ts
// Lines 317-319 should have:
agreeCount: true,
disagreeCount: true,
neutralStanceCount: true,
```

**Fix:** Backend needs restart after code change.

### Issue: All stance counts are 0

**Reason:** No comments have been analyzed yet.

**Solution:**
1. Post a comment on a review
2. Gemini API will analyze it
3. Backend updates review stance count
4. Refresh page to see updated count

### Issue: Comment posted but stance not updated

**Check Comment Controller:**
```typescript
// Server/org/apps/review-service/src/controllers/comment_controller.ts
// Should accept stance, stanceConfidence, stanceReasoning
// And update review's stance count
```

**Check Frontend:**
```javascript
// frontend/src/services/geminiService.js
// Should export detectCommentStance function

// frontend/src/components/CommentSection.jsx  
// Should call detectCommentStance before submitting
```

### Issue: Gemini API Error

**Check Console:**
```
Error: Google Gemini API request failed
```

**Solutions:**
1. Check API key in `frontend/.env`:
   ```
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

2. Verify API key is valid at: https://aistudio.google.com/apikey

3. Check API quota hasn't been exceeded

## Manual Test Flow

### Complete End-to-End Test

1. **Start Backend:**
   ```powershell
   cd Server\org
   npm run dev
   # Wait for: "Review service running at port! 6002"
   ```

2. **Start Frontend:**
   ```powershell
   cd frontend
   npm run dev
   # Wait for: "Local: http://localhost:5173"
   ```

3. **Open Browser:**
   - Go to `http://localhost:5173`
   - Open DevTools (F12) → Console tab

4. **Login:**
   - Use existing account or create new one

5. **Find a Review:**
   - Go to home page
   - Look for any review

6. **Check Current State:**
   ```javascript
   // In browser console
   console.log('Initial review data from ReviewCard logs');
   // Should show: agreeCount: 0, disagreeCount: 0, neutralStanceCount: 0
   ```

7. **Post Comment:**
   - Click "Add Comment"
   - Type: "I completely agree with this!"
   - Submit

8. **Watch Console:**
   - Should see Gemini API call
   - Should see stance detection result
   - Should see comment submission with stance data

9. **Refresh Page:**
   ```javascript
   // Check if count increased
   // agreeCount should now be 1
   ```

10. **Check Stance Bar:**
    - Should appear above action buttons
    - Should show green bar for "agree"
    - Should show "1 analyzed" in header

## Expected Behavior

### When Working Correctly:

1. **API Response includes:**
   ```json
   {
     "id": "...",
     "product": "...",
     "agreeCount": 1,
     "disagreeCount": 0,
     "neutralStanceCount": 0,
     "commentsCount": 1
   }
   ```

2. **ReviewCard Console Logs:**
   ```
   ReviewCard - Original review: {..., agreeCount: 1, ...}
   ReviewCard - Mapped reviewData: {..., agreeCount: 1, ...}
   ```

3. **Visual Display:**
   ```
   ┌─────────────────────────────────────┐
   │  Comment Sentiment | 1 analyzed     │
   │  ████████████                       │  ← Green bar
   │  ■ 1 Agree  ■ 0 Disagree  ■ 0 Neutral│
   └─────────────────────────────────────┘
   ```

## Debugging Commands

### Check Backend Health
```powershell
curl http://localhost:8080/api/reviews | ConvertFrom-Json | Select-Object -First 1
```

### Check Database
```javascript
// MongoDB Shell
use your_database_name

// Find review with comments
db.reviews.findOne(
  { commentsCount: { $gt: 0 } },
  { product: 1, commentsCount: 1, agreeCount: 1, disagreeCount: 1, neutralStanceCount: 1 }
)

// Find comments with stance
db.reviewComments.find(
  { stance: { $exists: true } },
  { content: 1, stance: 1, stanceConfidence: 1 }
).limit(5)
```

### Test Gemini API Directly
```javascript
// In browser console
const GEMINI_API_KEY = 'YOUR_API_KEY';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: 'Analyze: Review: "Great product!" Comment: "I agree!"'
      }]
    }]
  })
})
.then(r => r.json())
.then(data => console.log('Gemini response:', data));
```

## Files to Check

### Backend
- ✅ `Server/org/apps/review-service/src/controllers/review_controller.ts` (lines 317-319)
- ✅ `Server/org/apps/review-service/src/controllers/comment_controller.ts`
- ✅ `Server/org/prisma/schema.prisma` (lines 140-142)

### Frontend
- ✅ `frontend/src/components/ReviewCard.jsx` (lines 56-58, 738-780)
- ✅ `frontend/src/services/geminiService.js`
- ✅ `frontend/src/components/CommentSection.jsx`
- ✅ `frontend/.env` (VITE_GEMINI_API_KEY)

## Success Criteria

- [ ] Backend includes stance counts in API response
- [ ] Frontend receives stance counts from API
- [ ] ReviewCard console logs show stance counts > 0
- [ ] Stance bar is visible on reviews with comments
- [ ] Posting new comment increases stance count
- [ ] Bar shows correct proportions and colors

## Next Steps

1. **Restart backend if not already done**
2. **Clear browser cache**
3. **Post test comments on different reviews**
4. **Verify stance bar appears with correct data**

If still not working after all these steps, provide:
- Browser console logs (especially ReviewCard logs)
- Network tab showing API response for `/api/reviews`
- Backend terminal output showing any errors
