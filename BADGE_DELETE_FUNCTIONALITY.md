# Badge Delete Functionality - Complete Implementation

## Changes Made

### 1. ✅ Removed Active/Inactive Badge Cards
**File**: `dashboards/Admin-dash/src/pages/BadgeManagement.jsx`

**Before**: 4 statistic cards
- Total Badges
- Active Badges
- Total Assignments  
- Inactive Badges

**After**: 2 statistic cards
- Total Badges
- Total Assignments

### 2. ✅ Added Delete Button to Badge Cards

**Changes**:
- Added `Trash2` icon import from lucide-react
- Added delete button next to "View Eligible Users" button
- Delete button shows trash icon with red background
- Includes confirmation dialog before deletion

### 3. ✅ Implemented Delete Functionality

#### Frontend (`BadgeManagement.jsx`)

Added `handleDeleteBadge` function:
```javascript
const handleDeleteBadge = async (badgeId, badgeName) => {
  if (!window.confirm(`Are you sure you want to delete "${badgeName}"?\n\nThis will also remove all user assignments and delete the badge image from Cloudinary.`)) {
    return;
  }

  setLoading(true);
  try {
    const response = await badgeAPI.deleteBadge(badgeId);
    alert(response.message || 'Badge deleted successfully!');
    loadOverviewData(); // Reload badges
  } catch (error) {
    console.error('Error deleting badge:', error);
    alert('Failed to delete badge: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};
```

**Features**:
- ✅ Confirmation dialog before deletion
- ✅ Shows loading state during deletion
- ✅ Success/error messages
- ✅ Reloads badge list after deletion

#### Backend (`badge.controller.ts`)

**Enhanced `deleteBadge` function**:
```typescript
export const deleteBadge = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;

    // 1. Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // 2. Delete image from Cloudinary if exists
    if (badge.imageUrl) {
      try {
        // Extract public_id from URL
        const urlParts = badge.imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}`, result);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
        // Continue with badge deletion even if Cloudinary deletion fails
      }
    }

    // 3. Delete the badge (cascade will remove UserBadge assignments)
    await prisma.badge.delete({
      where: { id: badgeId }
    });

    return res.status(200).json({
      success: true,
      message: `Badge deleted successfully. ${badge._count.userBadges} user assignments removed.`,
      deletedAssignments: badge._count.userBadges
    });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete badge',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
```

**Added Cloudinary configuration**:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drltde5us',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

## What Gets Deleted

When you delete a badge, the system automatically removes:

### 1. ✅ Badge Record
- Deletes the badge from the `Badge` table in MongoDB

### 2. ✅ All User Badge Assignments
- Deletes all records from the `UserBadge` table
- Uses Prisma's `onDelete: Cascade` to automatically remove assignments
- Returns count of deleted assignments in the response

### 3. ✅ Badge Image from Cloudinary
- Extracts the `public_id` from the Cloudinary URL
- Calls Cloudinary API to delete the image
- Handles both transformed and original image URLs
- Continues with badge deletion even if Cloudinary deletion fails

## How It Works

### Delete Flow

```
User clicks Delete Button
    ↓
Confirmation Dialog
    ↓ (User confirms)
Frontend sends DELETE request
    ↓
Backend checks if badge exists
    ↓
Backend extracts public_id from imageUrl
    ↓
Backend calls cloudinary.uploader.destroy(public_id)
    ↓
Backend deletes badge from database
    ↓ (Prisma cascade)
All UserBadge assignments deleted automatically
    ↓
Backend returns success with count
    ↓
Frontend shows success message
    ↓
Frontend reloads badge list
```

### Cloudinary URL Parsing

**Example URL**:
```
https://res.cloudinary.com/drltde5us/image/upload/c_fill,w_200,h_200,q_auto:low/badges/badge_123.jpg
```

**Parsing**:
1. Split by `/`
2. Find `upload` index
3. Skip transformations (`c_fill,w_200,h_200,q_auto:low`)
4. Get public_id: `badges/badge_123`
5. Remove extension: `badges/badge_123`

**Delete Call**:
```typescript
await cloudinary.uploader.destroy('badges/badge_123');
```

## Prisma Schema Cascade

The `UserBadge` model has cascade delete enabled:

```prisma
model UserBadge {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  user users @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId String @db.ObjectId
  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade) // ← Cascade here
  
  assignedBy String? @db.ObjectId
  assignedAt DateTime @default(now())
  criteriaMetAt Json?
  
  @@unique([userId, badgeId])
}
```

When a badge is deleted, Prisma automatically deletes all related `UserBadge` records.

## UI Changes

### Badge Card Layout

**Before**:
```
┌─────────────────────────────────────┐
│ [Image] Badge Name                  │
│         Description                 │
│         👥 5 users | Active          │
│ ┌─────────────────────────────────┐ │
│ │  View Eligible Users            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**After**:
```
┌─────────────────────────────────────┐
│ [Image] Badge Name                  │
│         Description                 │
│         👥 5 users | Active          │
│ ┌───────────────────┐ ┌───┐         │
│ │ View Eligible     │ │🗑️│         │
│ │ Users             │ └───┘         │
│ └───────────────────┘               │
└─────────────────────────────────────┘
```

### Statistics Cards

**Before**:
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Badges │ │Active Badges │ │  Total       │ │  Inactive    │
│      10      │ │      8       │ │ Assignments  │ │   Badges     │
│              │ │              │ │     45       │ │      2       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**After**:
```
┌────────────────────────────┐ ┌────────────────────────────┐
│      Total Badges          │ │    Total Assignments       │
│           10               │ │           45               │
│                            │ │                            │
└────────────────────────────┘ └────────────────────────────┘
```

## Testing

### Test Badge Deletion

1. **Start Backend Services**:
   ```powershell
   cd Server\org
   npm run dev
   ```

2. **Start Admin Dashboard**:
   ```powershell
   cd dashboards\Admin-dash
   npm run dev
   ```

3. **Test in Browser**:
   - Navigate to Badge Management → Overview tab
   - Find a badge card
   - Click the red trash icon 🗑️
   - Confirm the deletion dialog
   - Verify:
     - ✅ Success message appears
     - ✅ Badge disappears from list
     - ✅ Total badges count decreases
     - ✅ Total assignments count updates

4. **Verify Database**:
   ```javascript
   // Check if badge is deleted
   db.Badge.find({ name: "Deleted Badge Name" })
   // Should return empty

   // Check if user assignments are deleted
   db.UserBadge.find({ badgeId: "deleted_badge_id" })
   // Should return empty
   ```

5. **Verify Cloudinary**:
   - Log into Cloudinary dashboard
   - Navigate to Media Library → badges folder
   - Verify image is deleted

### Test Edge Cases

#### 1. Badge Without Image
- Create badge without uploading image
- Delete it
- Should succeed without Cloudinary errors

#### 2. Badge With Assignments
- Create badge
- Assign to multiple users
- Delete badge
- Verify all assignments are removed

#### 3. Network Failure
- Disconnect internet
- Try to delete badge
- Should show appropriate error message

#### 4. Cloudinary Deletion Fails
- Use invalid Cloudinary credentials
- Delete badge
- Badge should still be deleted from database
- Error logged in console

## Error Handling

### Frontend Errors

```javascript
try {
  const response = await badgeAPI.deleteBadge(badgeId);
  alert(response.message);
} catch (error) {
  alert('Failed to delete badge: ' + error.message);
}
```

### Backend Errors

1. **Badge Not Found**:
   ```json
   {
     "success": false,
     "message": "Badge not found"
   }
   ```

2. **Cloudinary Deletion Failed**:
   - Logs error to console
   - Continues with badge deletion
   - User doesn't see error (graceful degradation)

3. **Database Error**:
   ```json
   {
     "success": false,
     "message": "Failed to delete badge",
     "error": "Database connection error"
   }
   ```

## Environment Variables

Required in `Server/org/.env`:

```properties
CLOUDINARY_CLOUD_NAME="drltde5us"
CLOUDINARY_API_KEY="529591873544934"
CLOUDINARY_API_SECRET="N_4D38zJHkZF40O9uzmBlf7Pp1I"
```

## Files Modified

1. ✅ `dashboards/Admin-dash/src/pages/BadgeManagement.jsx`
   - Removed 2 statistic cards (Active/Inactive)
   - Added delete button to badge cards
   - Added handleDeleteBadge function
   - Added Trash2 icon import

2. ✅ `Server/org/apps/user-profile/src/controllers/badge.controller.ts`
   - Added Cloudinary import and configuration
   - Enhanced deleteBadge function
   - Added Cloudinary image deletion
   - Added detailed response with deletion count

3. ✅ `dashboards/Admin-dash/src/services/badgeAPI.js`
   - Already has deleteBadge function (no changes needed)

## Dependencies

- ✅ `cloudinary` package - Already installed in user-profile service
- ✅ Cloudinary credentials - Already in `.env` file
- ✅ Prisma cascade delete - Already configured in schema

## Summary

✅ **Active/Inactive cards removed** - Cleaner overview interface  
✅ **Delete button added** - Easy badge deletion from UI  
✅ **Confirmation dialog** - Prevents accidental deletions  
✅ **Badge deletion** - Removes badge from database  
✅ **Cascade deletion** - Automatically removes all user assignments  
✅ **Cloudinary deletion** - Removes badge image from cloud storage  
✅ **Error handling** - Graceful failures with user feedback  
✅ **Loading states** - Shows progress during deletion  

Badge deletion is now fully functional with complete cleanup! 🎉
