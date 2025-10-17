# Review Verification System Implementation

## Overview
This document describes the implementation of the review verification system for the admin dashboard, allowing admins to approve, reject, or flag reviews for manual review.

## Database Schema Changes

### Prisma Schema Updates
Added new `PostState` enum and related fields to the `reviews` model:

```prisma
enum PostState {
  PENDING    // Default state when review is submitted
  VERIFIED   // Admin approved the review
  REJECTED   // Admin rejected the review
  FLAGGED    // Admin flagged for manual review
}

model reviews {
  // ... existing fields ...
  
  // Admin verification status
  postState PostState @default(PENDING)
  reviewedBy String? @db.ObjectId // Admin who reviewed this
  reviewedAt DateTime? // When the review was verified/rejected/flagged
  adminNotes String? // Optional notes from admin
  
  // ... rest of fields ...
}
```

## API Endpoints

### 1. Approve Review
**Endpoint:** `PUT /api/reviews/admin/reviews/:id/approve`

**Description:** Marks a review as VERIFIED

**Request Body:**
```json
{
  "adminId": "string",
  "adminNotes": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Review approved successfully",
  "review": { /* full review object */ }
}
```

### 2. Reject Review
**Endpoint:** `PUT /api/reviews/admin/reviews/:id/reject`

**Description:** Marks a review as REJECTED

**Request Body:**
```json
{
  "adminId": "string",
  "adminNotes": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Review rejected successfully",
  "review": { /* full review object */ }
}
```

### 3. Flag Review for Manual Review
**Endpoint:** `PUT /api/reviews/admin/reviews/:id/flag`

**Description:** Marks a review as FLAGGED for manual review

**Request Body:**
```json
{
  "adminId": "string",
  "adminNotes": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Review flagged for manual review successfully",
  "review": { /* full review object */ }
}
```

### 4. Get Reviews with Filtering
**Endpoint:** `GET /api/reviews`

**Query Parameters:**
- `postState` (optional): Filter by postState (PENDING, VERIFIED, REJECTED, FLAGGED)
- `categoryId` (optional): Filter by category
- `subCategoryId` (optional): Filter by subcategory
- `productOrService` (optional): Filter by product/service
- `userId` (optional): Filter by user

**Example:**
```
GET /api/reviews?postState=PENDING
GET /api/reviews?postState=VERIFIED
GET /api/reviews?postState=FLAGGED
```

### 5. Admin Stats with Verification Metrics
**Endpoint:** `GET /api/reviews/admin/stats`

**Response:**
```json
{
  "overview": {
    "totalReviews": 100,
    "exceptionalReviews": 10,
    "recentReviews": 20,
    "conversionRate": "90.0"
  },
  "verification": {
    "pendingReviews": 23,
    "verifiedReviews": 142,
    "rejectedReviews": 5,
    "flaggedReviews": 8,
    "verifiedToday": 142,
    "accuracyRate": "94.8"
  },
  "ratingDistribution": [...],
  "popularCategories": [...],
  "activeReviewers": [...],
  "exceptionalCategories": [...]
}
```

## Frontend Integration

### Admin Dashboard Components

The UI should display:

1. **Statistics Cards:**
   - Pending Reviews (23)
   - Verified Today (142)
   - Flagged Reviews (8)
   - Accuracy Rate (94.8%)

2. **Review List Tabs:**
   - Pending (17) - Default tab
   - Verified (0)
   - Flagged (0)

3. **Review Action Buttons:**
   - 🟢 **Approve** - Sets postState to VERIFIED
   - 🔴 **Reject** - Sets postState to REJECTED
   - ⚠️ **Flag for Manual Review** - Sets postState to FLAGGED

### Frontend API Calls

```javascript
// Get pending reviews
const getPendingReviews = async () => {
  const response = await fetch('/api/reviews?postState=PENDING');
  return response.json();
};

// Approve a review
const approveReview = async (reviewId, adminId, adminNotes = '') => {
  const response = await fetch(`/api/reviews/admin/reviews/${reviewId}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, adminNotes })
  });
  return response.json();
};

// Reject a review
const rejectReview = async (reviewId, adminId, adminNotes = '') => {
  const response = await fetch(`/api/reviews/admin/reviews/${reviewId}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, adminNotes })
  });
  return response.json();
};

// Flag a review
const flagReview = async (reviewId, adminId, adminNotes = '') => {
  const response = await fetch(`/api/reviews/admin/reviews/${reviewId}/flag`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, adminNotes })
  });
  return response.json();
};

// Get admin stats
const getAdminStats = async () => {
  const response = await fetch('/api/reviews/admin/stats');
  return response.json();
};
```

## Workflow

1. **User submits a review:**
   - Review is created with `postState: PENDING`

2. **Admin views pending reviews:**
   - Fetch reviews with `?postState=PENDING`
   - Display reviews in the admin dashboard

3. **Admin takes action:**
   - **Approve:** Click "Approve" button → calls `/admin/reviews/:id/approve` → sets `postState: VERIFIED`
   - **Reject:** Click "Reject" button → calls `/admin/reviews/:id/reject` → sets `postState: REJECTED`
   - **Flag:** Click "Flag for Manual Review" button → calls `/admin/reviews/:id/flag` → sets `postState: FLAGGED`

4. **Review is tracked:**
   - `reviewedBy`: Admin ID who took action
   - `reviewedAt`: Timestamp of action
   - `adminNotes`: Optional notes for why the action was taken

## Files Modified

1. **Schema:**
   - `Server/org/prisma/schema.prisma` - Added PostState enum and review verification fields

2. **Controller:**
   - `Server/org/apps/review-service/src/controllers/review_controller.ts`
     - Added `approveReview()` function
     - Added `rejectReview()` function
     - Added `flagReviewForManualReview()` function
     - Updated `getReviews()` to support postState filtering
     - Updated `getAdminStats()` to include verification metrics

3. **Routes:**
   - `Server/org/apps/review-service/src/routes/review.router.ts`
     - Added PUT `/admin/reviews/:id/approve`
     - Added PUT `/admin/reviews/:id/reject`
     - Added PUT `/admin/reviews/:id/flag`

## Next Steps for Frontend

1. Update the Admin Dashboard to fetch pending reviews on load
2. Implement the three action buttons (Approve, Reject, Flag)
3. Add admin authentication/authorization to get admin ID
4. Implement tab switching to view different postStates
5. Update the statistics display to show verification metrics
6. Add confirmation dialogs for admin actions
7. Optionally add a modal for admin notes when taking actions

## Testing

Test the endpoints using curl or Postman:

```bash
# Get pending reviews
curl http://localhost:8080/api/reviews?postState=PENDING

# Approve a review
curl -X PUT http://localhost:8080/api/reviews/admin/reviews/{reviewId}/approve \
  -H "Content-Type: application/json" \
  -d '{"adminId": "admin-id-here", "adminNotes": "Looks good"}'

# Reject a review
curl -X PUT http://localhost:8080/api/reviews/admin/reviews/{reviewId}/reject \
  -H "Content-Type: application/json" \
  -d '{"adminId": "admin-id-here", "adminNotes": "Spam content"}'

# Flag a review
curl -X PUT http://localhost:8080/api/reviews/admin/reviews/{reviewId}/flag \
  -H "Content-Type: application/json" \
  -d '{"adminId": "admin-id-here", "adminNotes": "Needs further review"}'

# Get admin stats
curl http://localhost:8080/api/reviews/admin/stats
```

## Notes

- All new reviews default to `PENDING` state
- Admin must be authenticated to access these endpoints (add authentication middleware as needed)
- The `reviewedBy` field stores the admin ID for audit purposes
- `adminNotes` can be used for internal documentation of decisions
- Statistics are automatically calculated based on postState
