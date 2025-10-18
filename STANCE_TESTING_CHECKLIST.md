# Stance Detection Enhancements - Testing Checklist

## Prerequisites
- [ ] Backend server running: `cd Server\org && npm run dev`
- [ ] Frontend server running: `cd frontend && npm run dev`
- [ ] Browser DevTools console open (F12)
- [ ] At least 2 user accounts available for testing

## Test Suite 1: Own Review Comments (NEUTRAL)

### Test 1.1: Comment on Own Review
- [ ] Log in as User A
- [ ] Create a new review as User A
- [ ] Add a comment to your own review: "This is my own comment"
- [ ] **Expected**: Comment posts successfully
- [ ] **Expected**: Console shows: `[Gemini Service] Comment author is review author - returning NEUTRAL stance`
- [ ] **Expected**: No Gemini API call made (check Network tab)
- [ ] **Expected**: Database shows stance = "NEUTRAL", confidence = 1.0, reasoning = "User commenting on their own review"
- [ ] **Expected**: Review's `neutralStanceCount` increased by 1

### Test 1.2: Reply on Own Review
- [ ] Log in as User B
- [ ] Comment on User A's review: "I agree with this"
- [ ] Log in as User A (review author)
- [ ] Reply to User B's comment: "Thank you!"
- [ ] **Expected**: Reply saved with NEUTRAL stance
- [ ] **Expected**: Console shows: `[Gemini Service] Reply author is review author - returning NEUTRAL stance`
- [ ] **Expected**: Review's `neutralStanceCount` increased by 1

## Test Suite 2: Delete Comments Updates Stance Counts

### Test 2.1: Delete Comment with AGREE Stance
**Setup:**
- [ ] Log in as User B (not review author)
- [ ] Comment on a review: "I completely agree with this review!"
- [ ] Wait for stance detection (should be AGREE)
- [ ] Note current `agreeCount` from database or UI

**Test:**
- [ ] Delete the comment
- [ ] **Expected**: Comment removed from UI
- [ ] **Expected**: Backend console shows: `[Delete Comment] Decremented agreeCount for review: [reviewId]`
- [ ] **Expected**: Review's `agreeCount` decreased by 1
- [ ] **Expected**: Stance bar updated (if visible)

### Test 2.2: Delete Comment with DISAGREE Stance
**Setup:**
- [ ] Comment: "I totally disagree with this review"
- [ ] Wait for stance detection (should be DISAGREE)
- [ ] Note current `disagreeCount`

**Test:**
- [ ] Delete the comment
- [ ] **Expected**: Backend console shows: `[Delete Comment] Decremented disagreeCount for review: [reviewId]`
- [ ] **Expected**: Review's `disagreeCount` decreased by 1

### Test 2.3: Delete Parent Comment with Multiple Replies
**Setup:**
- [ ] Create parent comment: "This is great!" (AGREE)
- [ ] Add reply 1: "I agree too!" (AGREE)
- [ ] Add reply 2: "I don't think so" (DISAGREE)
- [ ] Wait for all stance detections
- [ ] Note current stance counts: agreeCount, disagreeCount

**Test:**
- [ ] Delete the parent comment
- [ ] **Expected**: All 3 comments deleted (parent + 2 replies)
- [ ] **Expected**: Backend console shows 3 decrement logs
- [ ] **Expected**: `agreeCount` decreased by 2 (parent + reply1)
- [ ] **Expected**: `disagreeCount` decreased by 1 (reply2)

## Test Suite 3: Edit Comments Re-analyzes Stance

### Test 3.1: Edit Top-Level Comment (AGREE → DISAGREE)
**Setup:**
- [ ] Comment: "This product is amazing, I love it!"
- [ ] Wait for stance detection (should be AGREE)
- [ ] Note current `agreeCount` and `disagreeCount`

**Test:**
- [ ] Click "Edit" button on your comment
- [ ] Change text to: "This product is terrible, I hate it!"
- [ ] Click "Save"
- [ ] **Expected**: UI shows "Analyzing..." or similar loading state
- [ ] **Expected**: Frontend console shows: `[Edit Comment] Re-analyzing stance...`
- [ ] **Expected**: Frontend console shows: `[Edit Comment] Stance detected: {stance: "DISAGREE", ...}`
- [ ] **Expected**: Backend console shows: `[Update Comment] Decremented agreeCount for review: [reviewId]`
- [ ] **Expected**: Backend console shows: `[Update Comment] Incremented disagreeCount for review: [reviewId]`
- [ ] **Expected**: `agreeCount` decreased by 1, `disagreeCount` increased by 1
- [ ] **Expected**: Comment text updated in UI

### Test 3.2: Edit Top-Level Comment (DISAGREE → NEUTRAL)
**Setup:**
- [ ] Comment: "This review is completely wrong!"
- [ ] Wait for stance detection (should be DISAGREE)
- [ ] Note current `disagreeCount` and `neutralStanceCount`

**Test:**
- [ ] Edit comment to: "Can you provide more details?"
- [ ] Save edit
- [ ] **Expected**: Stance changes to NEUTRAL
- [ ] **Expected**: `disagreeCount` decreased by 1
- [ ] **Expected**: `neutralStanceCount` increased by 1

### Test 3.3: Edit Reply (AGREE → DISAGREE)
**Setup:**
- [ ] Comment exists: "This is great!"
- [ ] Add reply: "I completely agree with you!"
- [ ] Wait for stance detection (should be AGREE)

**Test:**
- [ ] Edit reply to: "Actually, I disagree with you"
- [ ] Save edit
- [ ] **Expected**: Stance re-analyzed considering parent comment
- [ ] **Expected**: Stance changes to DISAGREE (or NEUTRAL depending on context)
- [ ] **Expected**: Stance counts updated accordingly

### Test 3.4: Edit Own Review Comment
**Setup:**
- [ ] Log in as review author
- [ ] Comment on your own review: "Additional info"
- [ ] Confirm stance is NEUTRAL

**Test:**
- [ ] Edit your comment to any text
- [ ] Save edit
- [ ] **Expected**: Stance remains NEUTRAL (review author check)
- [ ] **Expected**: Console shows: `[Gemini Service] Comment author is review author - returning NEUTRAL stance`
- [ ] **Expected**: No stance count changes (NEUTRAL → NEUTRAL)

## Test Suite 4: Edge Cases

### Test 4.1: Edit Without Changing Stance
**Setup:**
- [ ] Comment: "I agree with this"
- [ ] Wait for AGREE stance

**Test:**
- [ ] Edit to: "I completely agree with this"
- [ ] Save edit
- [ ] **Expected**: Stance likely remains AGREE
- [ ] **Expected**: Backend console shows same stance, no count changes
- [ ] **OR**: If stance changes slightly, counts adjusted properly

### Test 4.2: Delete Comment Without Stance
**Setup:**
- [ ] Manually create comment in database without stance fields (stance = null)
- [ ] Or find old comment from before stance detection was implemented

**Test:**
- [ ] Delete the comment
- [ ] **Expected**: Comment deleted successfully
- [ ] **Expected**: No stance count changes (nothing to decrement)
- [ ] **Expected**: No errors in console

### Test 4.3: Network Failure During Edit Stance Detection
**Setup:**
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"

**Test:**
- [ ] Edit a comment
- [ ] Try to save
- [ ] **Expected**: Frontend shows error or warning
- [ ] **Expected**: Comment update fails gracefully
- [ ] **OR**: Comment updates without stance data

### Test 4.4: Rapid Edit/Delete Operations
**Test:**
- [ ] Create comment
- [ ] Immediately edit it (while stance is still being detected)
- [ ] Delete it quickly after edit
- [ ] **Expected**: All operations complete without errors
- [ ] **Expected**: Stance counts remain consistent
- [ ] **Expected**: No negative stance counts

## Test Suite 5: Database Consistency

### Test 5.1: Verify Stance Counts Match Comments
**After running all tests:**
- [ ] Open database viewer (MongoDB Compass, etc.)
- [ ] For each review, count comments manually:
  - Count comments where stance = "AGREE"
  - Count comments where stance = "DISAGREE"
  - Count comments where stance = "NEUTRAL"
- [ ] Compare with review's `agreeCount`, `disagreeCount`, `neutralStanceCount`
- [ ] **Expected**: All counts match exactly
- [ ] **If not matching**: Note the difference for debugging

### Test 5.2: Check Stance Timestamps
**After edits:**
- [ ] Check edited comments in database
- [ ] **Expected**: `stanceAnalyzedAt` timestamp updated after edit
- [ ] **Expected**: `updatedAt` timestamp updated after edit
- [ ] **Expected**: New stance values reflect edited content

## Debugging Checklist

If tests fail, check:

### Frontend Issues
- [ ] Browser console for JavaScript errors
- [ ] Network tab for failed API calls
- [ ] Check if `reviewAuthorId` is being passed to CommentSection
- [ ] Check if `detectCommentStance` is being called with correct parameters
- [ ] Verify Gemini API key is valid in `geminiService.js`

### Backend Issues
- [ ] Backend terminal for TypeScript/Prisma errors
- [ ] Check if request body includes stance data: `console.log('[API] Request body:', req.body)`
- [ ] Verify Prisma client is generating correct queries
- [ ] Check MongoDB connection status
- [ ] Look for "Decremented/Incremented" log messages

### Database Issues
- [ ] Connect to MongoDB and verify collections exist
- [ ] Check if `reviewComments` collection has stance fields
- [ ] Check if `reviews` collection has stance count fields
- [ ] Look for negative numbers in stance counts (indicates issue)

## Performance Benchmarks

Record these for baseline:
- [ ] Time to create comment (with stance detection): _____ ms
- [ ] Time to create comment (own review, no API call): _____ ms
- [ ] Time to edit comment (with re-analysis): _____ ms
- [ ] Time to delete comment (with count update): _____ ms

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Stance counts always accurate
- ✅ Own review comments always NEUTRAL
- ✅ Delete operations update counts
- ✅ Edit operations re-analyze stance
- ✅ No negative stance counts
- ✅ Clear user feedback during operations

## Final Verification

- [ ] All automated tests pass
- [ ] Manual testing complete
- [ ] Database consistency verified
- [ ] Performance acceptable
- [ ] User experience smooth
- [ ] Console logs helpful for debugging
- [ ] No memory leaks or hanging requests
- [ ] Works in Chrome, Firefox, Safari (if applicable)

---

**Tested by:** _________________
**Date:** _________________
**Status:** ☐ PASS ☐ FAIL ☐ PARTIAL
**Notes:** _______________________________________________
