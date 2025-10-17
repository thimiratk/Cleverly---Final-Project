# Review Verification Flag Count and Display Fix

## Problems Identified

1. **Flag count not updating properly**: When reviews were flagged, rejected, or verified, the counts in the stats cards were not updating correctly.
2. **Flagged reviews not showing**: The flagged reviews tab was not displaying all flagged reviews properly.
3. **Rejected reviews missing**: There was no way to view rejected reviews - no tab or display for them.
4. **Partial refresh**: When actions were taken, only the current tab was refreshed, not all tabs, leading to stale data.

## Root Causes

### 1. Missing Rejected Reviews Tab
The admin dashboard had tabs for pending, verified, and flagged reviews, but **no tab for rejected reviews**. This meant rejected reviews disappeared from view after rejection.

### 2. Incomplete Stats State
The stats state was missing counts for `verifiedReviews` and `rejectedReviews`, only tracking:
- `pendingReviews`
- `verifiedToday`
- `flaggedReviews`

### 3. Partial Data Refresh
After actions (approve/reject/flag), only the current tab was being refreshed:
```javascript
await fetchReviewsByState(activeTab);  // Only current tab
```

This meant:
- Moving a review from pending to flagged updated pending, but flagged count wasn't recalculated
- Stats would be stale until full page refresh

## Solution Implemented

### 1. Added Rejected Reviews Support

#### Frontend State (`dashboards/Admin-dash/src/pages/ReviewVerification.jsx`)

**Added rejected to reviews state:**
```javascript
const [reviews, setReviews] = useState({
  pending: [],
  verified: [],
  rejected: [],  // NEW
  flagged: []
});
```

**Added rejected stats:**
```javascript
const [stats, setStats] = useState({
  pendingReviews: 0,
  verifiedReviews: 0,  // NEW
  rejectedReviews: 0,  // NEW
  verifiedToday: 0,
  flaggedReviews: 0
});
```

#### Fetch Rejected Reviews

**Updated fetchAllData:**
```javascript
const fetchAllData = async () => {
  setLoading(true);
  try {
    await Promise.all([
      fetchReviewsByState('pending'),
      fetchReviewsByState('verified'),
      fetchReviewsByState('rejected'),  // NEW
      fetchReviewsByState('flagged'),
      fetchStats()
    ]);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
```

**Updated stats fetching:**
```javascript
const fetchStats = async () => {
  try {
    const data = await reviewsAPI.getAdminStats();
    if (data?.verification) {
      setStats({
        pendingReviews: data.verification.pendingReviews || 0,
        verifiedReviews: data.verification.verifiedReviews || 0,  // NEW
        rejectedReviews: data.verification.rejectedReviews || 0,  // NEW
        verifiedToday: data.verification.verifiedToday || 0,
        flaggedReviews: data.verification.flaggedReviews || 0
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};
```

### 2. Full Data Refresh on Actions

**Changed handlers to refresh ALL data:**
```javascript
const handleApproveReview = async (reviewId) => {
  try {
    await reviewsAPI.approveReview(reviewId, adminId, 'Approved by admin');
    // Refresh all tabs to update counts
    await fetchAllData();  // Changed from fetchReviewsByState(activeTab)
    alert('Review approved successfully!');
  } catch (error) {
    console.error('Error approving review:', error);
    alert('Error approving review. Please try again.');
  }
};

const handleRejectReview = async (reviewId) => {
  try {
    await reviewsAPI.rejectReview(reviewId, adminId, 'Rejected by admin');
    await fetchAllData();  // Full refresh
    alert('Review rejected successfully!');
  } catch (error) {
    console.error('Error rejecting review:', error);
    alert('Error rejecting review. Please try again.');
  }
};

const handleFlagReview = async (reviewId) => {
  try {
    await reviewsAPI.flagReview(reviewId, adminId, 'Flagged for manual review');
    await fetchAllData();  // Full refresh
    alert('Review flagged successfully!');
  } catch (error) {
    console.error('Error flagging review:', error);
    alert('Error flagging review. Please try again.');
  }
};
```

### 3. Updated UI Components

#### Stats Cards
Changed from 3-column to **4-column layout** to show all states:
```javascript
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {/* Pending Reviews */}
  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
    <p className="text-gray-600 text-sm">Pending Reviews</p>
    <p className="text-2xl font-bold text-gray-800">{stats.pendingReviews}</p>
  </div>

  {/* Verified Reviews - NEW */}
  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
    <p className="text-gray-600 text-sm">Verified Reviews</p>
    <p className="text-2xl font-bold text-gray-800">{stats.verifiedReviews}</p>
  </div>

  {/* Rejected Reviews - NEW */}
  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
    <p className="text-gray-600 text-sm">Rejected Reviews</p>
    <p className="text-2xl font-bold text-gray-800">{stats.rejectedReviews}</p>
  </div>

  {/* Flagged Reviews */}
  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
    <p className="text-gray-600 text-sm">Flagged Reviews</p>
    <p className="text-2xl font-bold text-gray-800">{stats.flaggedReviews}</p>
  </div>
</div>
```

#### Added Rejected Tab
```javascript
<button
  onClick={() => setActiveTab('rejected')}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    activeTab === 'rejected' 
      ? 'bg-red-600 text-white' 
      : 'text-gray-600 hover:bg-gray-100'
  }`}
>
  Rejected ({reviews.rejected.length})
</button>
```

#### Rejected Review Card Display
```javascript
{type === 'rejected' && (
  <div className="space-y-3">
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-800">
        <span className="font-semibold">Rejected:</span> This review was marked as fraudulent or violating guidelines.
      </p>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-600">Rejected At:</span>
      <span className="text-sm text-red-600">
        {review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString() : 'N/A'}
      </span>
    </div>
    {review.adminNotes && (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Notes:</span>
        <span className="text-sm text-gray-700">{review.adminNotes}</span>
      </div>
    )}
  </div>
)}
```

#### Enhanced Flagged Reviews
Added action buttons to flagged reviews so admins can approve or reject them:
```javascript
{type === 'flagged' && (
  <div className="space-y-3">
    {/* Flag notice */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="text-sm text-yellow-800">
        <span className="font-semibold">Flagged for Review:</span> This review requires manual investigation.
      </p>
    </div>
    
    {/* Action buttons */}
    <div className="flex space-x-3 mt-4">
      <button 
        onClick={() => handleApproveReview(review.id)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <ThumbsUp size={16} />
        <span>Approve</span>
      </button>
      <button 
        onClick={() => handleRejectReview(review.id)}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <ThumbsDown size={16} />
        <span>Reject</span>
      </button>
    </div>
  </div>
)}
```

### 4. Updated getActiveReviews Function
```javascript
const getActiveReviews = () => {
  switch (activeTab) {
    case 'pending': return reviews.pending;
    case 'verified': return reviews.verified;
    case 'rejected': return reviews.rejected;  // NEW
    case 'flagged': return reviews.flagged;
    default: return reviews.pending;
  }
};
```

## Backend (Already Working)

The backend was already correctly implemented:

### Stats Endpoint
```typescript
// Server/org/apps/review-service/src/controllers/review_controller.ts
const pendingReviews = await prisma.reviews.count({
  where: { postState: 'PENDING' }
});

const verifiedReviews = await prisma.reviews.count({
  where: { postState: 'VERIFIED' }
});

const rejectedReviews = await prisma.reviews.count({
  where: { postState: 'REJECTED' }
});

const flaggedReviews = await prisma.reviews.count({
  where: { postState: 'FLAGGED' }
});
```

### Action Endpoints
All three action endpoints correctly update `postState`, `reviewedBy`, `reviewedAt`, and `adminNotes`:
- `/admin/reviews/:id/approve` - sets `postState: 'VERIFIED'`
- `/admin/reviews/:id/reject` - sets `postState: 'REJECTED'`
- `/admin/reviews/:id/flag` - sets `postState: 'FLAGGED'`

### Filter Endpoint
```typescript
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  const { postState } = req.query;
  const filters: any = {};
  if (postState) filters.postState = postState;
  
  const reviews = await prisma.reviews.findMany({
    where: filters,
    // ... includes
  });
}
```

## Testing Steps

1. **Start the admin dashboard:**
   ```powershell
   cd "c:\Users\Thimira Kodithuwakku\Documents\Cleverly-deployment\Cleverly---Final-Project\dashboards\Admin-dash"
   npm run dev
   ```

2. **Test the workflow:**
   - Navigate to Review Verification page
   - Check that all 4 stat cards are showing: Pending, Verified, Rejected, Flagged
   - Check that all 4 tabs are visible: Pending, Verified, Rejected, Flagged
   
3. **Test actions:**
   - **Approve a pending review:**
     - Go to Pending tab
     - Click "Approve" on a review
     - Verify it disappears from Pending
     - Switch to Verified tab - should appear there
     - Check that stats are updated (pending count decreased, verified count increased)
   
   - **Reject a pending review:**
     - Go to Pending tab
     - Click "Reject" on a review
     - Verify it disappears from Pending
     - Switch to Rejected tab - should appear there
     - Check stats updated (pending decreased, rejected increased)
   
   - **Flag a pending review:**
     - Go to Pending tab
     - Click "Flag for Manual Review" on a review
     - Verify it disappears from Pending
     - Switch to Flagged tab - should appear there
     - Check stats updated (pending decreased, flagged increased)
   
   - **Process flagged reviews:**
     - Go to Flagged tab
     - Click "Approve" or "Reject" on a flagged review
     - Verify it moves to appropriate tab
     - Check all counts update correctly

4. **Verify persistence:**
   - Refresh the page
   - Verify all tabs show correct reviews
   - Verify all counts are accurate

## Benefits

1. **Complete visibility**: Admins can now see all review states
2. **Accurate counts**: All stats update in real-time after actions
3. **Better workflow**: Flagged reviews can be processed directly
4. **No lost reviews**: Rejected reviews are visible and tracked
5. **Consistent UI**: All states have dedicated tabs and cards
6. **Real-time updates**: All tabs refresh after any action

## Files Modified

- `dashboards/Admin-dash/src/pages/ReviewVerification.jsx` - Main verification page
  - Added rejected state tracking
  - Updated stats to include all counts
  - Changed action handlers to refresh all data
  - Added rejected tab and card display
  - Enhanced flagged reviews with action buttons
  - Updated layout to 4-column grid

## Notes

- Backend was already working correctly, no changes needed there
- The issue was purely frontend state management and UI display
- All review state transitions now work properly
- Stats are always accurate and up-to-date
