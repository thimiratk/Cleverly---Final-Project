# Stance Detection - Frontend Implementation

## Overview
Stance detection has been moved from the backend to the frontend. The system now uses Google Gemini 2.5 Flash API directly from the frontend to analyze whether comments and replies AGREE, DISAGREE, or are NEUTRAL towards the original review.

## Architecture Change

### Previous Architecture (Backend)
```
Frontend → Backend Comment API → Backend Stance Service → Gemini API
                                ↓
                          Database (save comment + stance)
```

### New Architecture (Frontend)
```
Frontend → Gemini API (detect stance)
         ↓
Frontend → Backend Comment API (with stance data)
         ↓
   Database (save comment + stance)
```

## Benefits of Frontend Implementation
1. **Reduced Backend Load**: Stance detection happens on client side
2. **Faster Response**: No backend service dependency
3. **Better UX**: Can show "Analyzing..." state to user
4. **Simpler Backend**: Backend just stores the stance data
5. **Direct API Usage**: No intermediate microservice needed

## Files Modified

### 1. Backend Changes

#### `Server/org/apps/review-service/src/controllers/comment_controller.ts`
**Changes:**
- Removed `import { analyzeStance }` from stance-analysis utility
- Updated `createComment` to accept `stance`, `stanceConfidence`, `stanceReasoning` from request body
- Save stance data directly to database when provided
- Removed asynchronous stance detection logic
- Updated `reanalyzeReviewStances` to just recalculate counts (deprecated function)

**New Request Body:**
```typescript
{
  reviewId: string,
  userId: string,
  content: string,
  parentCommentId?: string,
  stance?: 'AGREE' | 'DISAGREE' | 'NEUTRAL',
  stanceConfidence?: number,
  stanceReasoning?: string
}
```

#### `Server/org/apps/review-service/src/utils/stance-analysis.ts`
**Status:** Backed up (no longer used by comment controller)

### 2. Frontend Changes

#### `frontend/src/services/geminiService.js` (NEW FILE)
**Purpose:** Direct integration with Google Gemini 2.5 Flash API for stance detection

**Functions:**
- `detectCommentStance(reviewText, commentText)` - Analyze comment stance
- `detectReplyStance(reviewText, parentCommentText, replyText)` - Analyze reply stance
- `detectBatchStance(reviewText, comments[])` - Batch analysis

**API Configuration:**
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
```

**Return Format:**
```javascript
{
  stance: 'AGREE' | 'DISAGREE' | 'NEUTRAL',
  confidence: 0.0 - 1.0,
  reasoning: string (max 200 chars)
}
```

#### `frontend/src/services/api.js`
**Changes:**
- Updated `addComment` function to accept optional `stanceData` parameter
- Stance data is included in POST request to backend

**New Signature:**
```javascript
export const addComment = async (
  reviewId, 
  userId, 
  content, 
  parentCommentId = null, 
  stanceData = null
) => { ... }
```

#### `frontend/src/components/CommentSection.jsx`
**Changes:**
- Added `import { detectCommentStance, detectReplyStance }` from geminiService
- Added `reviewText` prop to component
- Added `detectingStance` state for UI feedback
- Updated `handleAddComment`:
  1. Detect stance using Gemini API
  2. Submit comment with stance data
- Updated `handleReply`:
  1. Find parent comment content
  2. Detect stance using Gemini API (considers parent comment)
  3. Submit reply with stance data
- Updated submit button to show "Analyzing..." during stance detection

#### `frontend/src/components/ReviewCard.jsx`
**Changes:**
- Pass `reviewText` prop to CommentSection component

## How It Works

### Comment Flow
1. User types a comment
2. User clicks "Post Comment"
3. Frontend shows "Analyzing..." button state
4. Frontend calls `detectCommentStance(reviewText, commentText)`
5. Gemini API analyzes: AGREE, DISAGREE, or NEUTRAL
6. Frontend sends comment + stance data to backend
7. Backend saves comment with stance fields
8. Backend updates review stance counts (agreeCount, disagreeCount, neutralStanceCount)
9. UI updates with new comment

### Reply Flow
1. User types a reply to a comment
2. User clicks "Reply"
3. Frontend shows "Analyzing..." state
4. Frontend finds parent comment content
5. Frontend calls `detectReplyStance(reviewText, parentCommentText, replyText)`
6. Gemini API analyzes stance considering:
   - Original review
   - Parent comment context
   - Reply content
7. Frontend sends reply + stance data to backend
8. Backend saves reply with stance fields
9. Backend updates review stance counts
10. UI updates with new reply

## Gemini API Prompts

### Comment Stance Detection
```
Analyze the stance of the given comment towards the original review. 
Determine whether the comment AGREES, DISAGREES, or is NEUTRAL towards the review.

Original Review: "{reviewText}"
Comment: "{commentText}"

Guidelines:
- AGREE: The comment supports, endorses, or expresses similar opinions to the review
- DISAGREE: The comment contradicts, criticizes, or expresses opposing views to the review  
- NEUTRAL: The comment is informational, asks questions, or doesn't take a clear stance

Respond with ONLY a JSON object in this exact format:
{"stance": "AGREE|DISAGREE|NEUTRAL", "confidence": 0.85, "reasoning": "Brief explanation"}
```

### Reply Stance Detection
```
Analyze the stance of the given reply towards the original review. 
The reply is responding to a comment, but we need to determine its stance towards the original review.

Original Review: "{reviewText}"
Parent Comment: "{parentCommentText}"
Reply: "{replyText}"

Guidelines:
- AGREE: The reply ultimately supports or endorses the review's opinion
- DISAGREE: The reply ultimately contradicts or opposes the review's opinion
- NEUTRAL: The reply is informational, asks questions, or doesn't take a clear stance towards the review

Context: Consider both the parent comment's stance and the reply's relationship to it when determining the final stance towards the review.

Respond with ONLY a JSON object in this exact format:
{"stance": "AGREE|DISAGREE|NEUTRAL", "confidence": 0.85, "reasoning": "Brief explanation"}
```

## Database Schema

### reviewComments Model
```prisma
model reviewComments {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  content String
  userId String @db.ObjectId
  reviewId String @db.ObjectId
  parentCommentId String? @db.ObjectId
  
  // Stance detection fields
  stance String? // AGREE, DISAGREE, NEUTRAL
  stanceConfidence Float? // 0.0 to 1.0
  stanceReasoning String?
  stanceAnalyzedAt DateTime?
  
  // ... other fields
}
```

### reviews Model
```prisma
model reviews {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  
  // Stance detection counts
  agreeCount Int @default(0)
  disagreeCount Int @default(0)
  neutralStanceCount Int @default(0)
  
  // ... other fields
}
```

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment Variables

#### Frontend `.env`
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** Add to `.gitignore`:
```
.env
.env.local
```

### 3. Restart Services

#### Frontend
```powershell
cd frontend
npm run dev
```

#### Backend
```powershell
cd Server\org
npm run dev
```

## Testing

### Test Comment Stance
1. Create a review: "This product is amazing! Best purchase ever."
2. Add comment: "I totally agree, it changed my life!" → Should detect **AGREE**
3. Add comment: "I disagree, mine broke after one day." → Should detect **DISAGREE**
4. Add comment: "What color did you buy?" → Should detect **NEUTRAL**

### Test Reply Stance
1. Review: "This restaurant has terrible service."
2. Comment: "I had the same experience!" (DISAGREE with review = bad service)
3. Reply to comment: "Me too, the staff was so rude!" → Should detect **DISAGREE** (agrees with bad review)
4. Reply to comment: "Really? I had great service." → Should detect **AGREE** (disagrees with bad review)

### Check Database Updates
```javascript
// Query MongoDB to verify stance data
db.reviewComments.find({ reviewId: "review_id" }).pretty()

// Check review stance counts
db.reviews.findOne({ _id: "review_id" })
// Should show: { agreeCount: X, disagreeCount: Y, neutralStanceCount: Z }
```

## Error Handling

### Gemini API Errors
- **No API key**: Returns NEUTRAL stance with 0.0 confidence
- **API failure**: Returns NEUTRAL stance with error message in reasoning
- **Invalid JSON response**: Cleans markdown formatting and retries parsing
- **Network timeout**: Returns NEUTRAL stance

### Fallback Behavior
If stance detection fails:
- Comment is still saved (stance fields remain null)
- User sees the comment posted successfully
- Error logged to console
- No user-facing error (graceful degradation)

## Performance Considerations

### API Call Timing
- Comment stance detection: ~1-2 seconds
- Reply stance detection: ~1-2 seconds
- User sees "Analyzing..." feedback during detection

### Rate Limiting
- Gemini API free tier: 60 requests/minute
- For high-traffic sites, consider:
  - Caching common stance patterns
  - Batch processing during off-peak hours
  - Paid Gemini API tier

### Optimization Opportunities
1. **Debounce**: Detect stance only after user stops typing for 2 seconds
2. **Client-side cache**: Cache stance results for identical comment+review pairs
3. **Background processing**: Allow posting without stance, detect afterwards
4. **Skip for short comments**: Don't analyze comments < 10 characters

## UI/UX Features

### Visual Feedback
- Submit button shows three states:
  - "Post Comment" (idle)
  - "Analyzing..." (detecting stance)
  - "Posting..." (submitting to backend)

### Future Enhancements
1. **Show stance badge on comments**: Display AGREE/DISAGREE/NEUTRAL icon
2. **Stance confidence indicator**: Show confidence as a visual meter
3. **Filter by stance**: Allow users to filter comments by stance
4. **Stance statistics**: Show pie chart of agree/disagree/neutral distribution

## Troubleshooting

### Issue: "API key not configured" error
**Solution:** 
1. Ensure `.env` file exists in frontend directory
2. Verify `VITE_GEMINI_API_KEY` is set
3. Restart frontend dev server

### Issue: Stance always returns NEUTRAL
**Possible Causes:**
1. Invalid Gemini API key
2. API quota exceeded
3. Network connectivity issues
4. Invalid prompt format

**Debug:**
```javascript
// Check console logs in browser
// Should see: "Detecting stance for comment..." and "Stance detected: {...}"
```

### Issue: Comments posted without stance data
**Cause:** Gemini API call failed, but comment submission succeeded (graceful degradation)

**Fix:** Check console for errors, verify API key and network connectivity

## Security Considerations

### API Key Protection
- **NEVER** commit `.env` to git
- Use environment variables only
- Consider backend proxy for production (hides API key from client)

### Production Recommendations
1. **Backend Proxy**: Route Gemini API calls through backend
2. **Rate Limiting**: Implement user-level rate limits
3. **Input Validation**: Sanitize review/comment text before sending to Gemini
4. **API Key Rotation**: Rotate Gemini API keys periodically

## Migration Notes

### For Existing Comments
Existing comments in database will have:
- `stance: null`
- `stanceConfidence: null`
- `stanceReasoning: null`

To backfill:
1. Use the deprecated `reanalyzeReviewStances` endpoint (requires re-implementing backend stance detection)
2. OR: Accept that old comments don't have stance data
3. OR: Implement a migration script using frontend Gemini service

## Cost Analysis

### Gemini API Pricing (as of 2024)
- **Free Tier**: 60 requests/minute, 1 million tokens/day
- **Paid Tier**: $0.00025 per 1K characters

### Estimated Costs
- Average comment: 100 characters
- Average review: 200 characters
- Total per stance detection: ~300 characters = $0.000075

**For 10,000 comments/day**: ~$0.75/day = $22.50/month

## Conclusion

The stance detection system now runs entirely in the frontend, providing:
- ✅ Faster user feedback
- ✅ Reduced backend complexity
- ✅ Direct Gemini API integration
- ✅ Real-time stance analysis
- ✅ Graceful error handling
- ✅ Maintained database schema compatibility

All stance data is stored in the database for analytics and display purposes.
