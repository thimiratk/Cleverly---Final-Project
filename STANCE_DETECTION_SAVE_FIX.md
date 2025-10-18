# Stance Detection Save Fix

## Problem
The stance detection was working in the frontend (calling Gemini API and getting results), but the stance data was not being saved to the database. The backend was receiving the stance data but not persisting it.

## Root Cause
The backend route handler (`/comments/add`) was not extracting the stance fields from the request body and saving them to the database.

## Solution

### Backend Changes (`Server/org/apps/user-interactions/src/routes/comments.ts`)

#### 1. Extract Stance Fields from Request Body
Changed from:
```typescript
const { reviewId, userId, content, parentCommentId } = req.body;
```

To:
```typescript
const { reviewId, userId, content, parentCommentId, stance, stanceConfidence, stanceReasoning } = req.body;
```

#### 2. Add Stance Data to Comment Creation
Updated the comment creation logic to include stance fields:
```typescript
// Prepare comment data
const commentData: any = {
  reviewId,
  userId,
  content: content.trim(),
  parentCommentId: parentCommentId || null
};

// Add stance data if provided
if (stance) {
  console.log('[Comments] Saving stance data:', { stance, stanceConfidence, stanceReasoning });
  commentData.stance = stance;
  commentData.stanceConfidence = stanceConfidence;
  commentData.stanceReasoning = stanceReasoning;
  commentData.stanceAnalyzedAt = new Date();
}

// Create comment in database
const newComment = await prisma.reviewComments.create({
  data: commentData,
  // ... include options
});
```

#### 3. Update Review Stance Counts
Added logic to increment the appropriate stance count on the review when a comment with stance is created:
```typescript
// Update stance counts on the review if stance was detected
if (stance && !parentCommentId) { // Only count top-level comments
  const stanceUpper = stance.toUpperCase();
  if (stanceUpper === 'AGREE') {
    await prisma.reviews.update({
      where: { id: reviewId },
      data: { agreeCount: { increment: 1 } }
    });
  } else if (stanceUpper === 'DISAGREE') {
    await prisma.reviews.update({
      where: { id: reviewId },
      data: { disagreeCount: { increment: 1 } }
    });
  } else if (stanceUpper === 'NEUTRAL') {
    await prisma.reviews.update({
      where: { id: reviewId },
      data: { neutralStanceCount: { increment: 1 } }
    });
  }
}
```

## Data Flow

### Frontend → Backend
The frontend already correctly sends stance data:
```javascript
// frontend/src/services/api.js
if (stanceData) {
  requestBody.stance = stanceData.stance;              // "AGREE", "DISAGREE", or "NEUTRAL"
  requestBody.stanceConfidence = stanceData.confidence; // 0.0 to 1.0
  requestBody.stanceReasoning = stanceData.reasoning;   // Text explanation
}
```

### Backend → Database
The backend now correctly saves stance data:
1. Extracts stance fields from request body
2. Adds stance fields to comment document
3. Saves comment with stance data to `reviewComments` collection
4. Updates stance counts on the parent review document

## Database Schema
The Prisma schema already had the necessary fields:

### reviewComments Model
```prisma
stance String?           // AGREE, DISAGREE, NEUTRAL
stanceConfidence Float?  // 0.0 to 1.0
stanceReasoning String?
stanceAnalyzedAt DateTime?
```

### reviews Model
```prisma
agreeCount Int @default(0)
disagreeCount Int @default(0)
neutralStanceCount Int @default(0)
```

## Testing
After restarting the backend server:

1. Create a new comment on a review
2. Verify the comment is created with stance fields populated
3. Verify the review's stance counts are incremented
4. Check database to confirm data persistence:
   - `reviewComments` document has `stance`, `stanceConfidence`, `stanceReasoning`, `stanceAnalyzedAt`
   - `reviews` document has updated `agreeCount`, `disagreeCount`, or `neutralStanceCount`

## Important Notes
- Only top-level comments (not replies) update the review stance counts
- Stance detection is optional - comments without stance data will still work
- The Gemini API is called in the frontend before submitting the comment
- Stance analysis results are logged for debugging purposes
