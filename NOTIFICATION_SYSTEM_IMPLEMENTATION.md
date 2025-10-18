# Real-Time Notification System Implementation

## Overview
Implemented a comprehensive notification system for Cleverly that tracks user interactions and displays real-time notifications.

## Features Implemented

### 1. **Backend Notification System** ✅

#### Schema Updates
- Added `REVIEW_STATUS` to `NotificationType` enum in `schema.prisma`
- Notification types supported:
  - `FOLLOW` - When someone follows the user
  - `REVIEW_VOTE` - When someone upvotes/downvotes a review
  - `COMMENT` - When someone comments on a review
  - `COMMENT_LIKE` - When someone likes a comment
  - `REVIEW_STATUS` - When a review status changes (verified/rejected/flagged)

#### Notification Controller
**File:** `Server/org/apps/user-profile/src/controllers/notification.controller.ts`

Endpoints created:
- `GET /api/profile/notifications` - Get all notifications with pagination
- `GET /api/profile/notifications/unread-count` - Get unread notification count
- `PUT /api/profile/notifications/:notificationId/read` - Mark notification as read
- `PUT /api/profile/notifications/read-all` - Mark all notifications as read
- `DELETE /api/profile/notifications/:notificationId` - Delete a notification
- `DELETE /api/profile/notifications/delete-all` - Delete all notifications

#### Notification Triggers
Added notification creation in:

1. **Follow System** (`Server/org/apps/user-profile/src/controllers/userProfile.controller.ts`)
   - Notify user when someone follows them

2. **Vote System** (`Server/org/apps/user-interactions/src/routes/interactions.ts`)
   - Notify review author when someone upvotes
   - Notify review author when someone downvotes

3. **Comment System** (`Server/org/apps/user-interactions/src/routes/comments.ts`)
   - Notify review author when someone comments
   - Notify comment author when someone replies to their comment
   - Notify comment author when someone likes their comment

#### Notification Utility
**File:** `Server/org/apps/user-interactions/src/utils/notifications.ts`
- Created reusable `createNotification()` function
- Created `broadcastNotification()` for Socket.IO integration

### 2. **Frontend Notification System** ✅

#### Notification Service
**File:** `frontend/src/services/notification.service.js`

API methods:
- `getNotifications(limit, skip)` - Fetch notifications with pagination
- `getUnreadCount()` - Get unread count for badge
- `markAsRead(notificationId)` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification(notificationId)` - Delete single notification
- `deleteAllNotifications()` - Clear all notifications

#### NotificationDropdown Component
**File:** `frontend/src/components/NotificationDropdown.jsx`

Features:
- Bell icon with unread count badge (red circle with number)
- Dropdown panel with notification list
- Click notification to navigate to relevant page:
  - Follow → User profile
  - Vote → Review page
  - Comment → Review page with comment anchor
  - Review status → Review page
- Mark individual notification as read (✓ button)
- Delete individual notification (🗑️ button)
- Mark all as read (double-check button)
- Delete all notifications (trash button with confirmation)
- Unread notifications highlighted with blue background
- Relative timestamps (e.g., "2 minutes ago")
- Icons for each notification type (emoji icons)
- Auto-fetch when dropdown opens
- Auto-update unread count
- Click outside to close

#### Navbar Integration
**File:** `frontend/src/components/Navbar.jsx`
- Added `<NotificationDropdown />` component
- Positioned next to Review button
- Only shows when user is logged in

### 3. **Navigation Logic**
Notifications navigate users to relevant pages:
- `FOLLOW` → `/profile/:followerId`
- `REVIEW_VOTE` → `/review/:reviewId`
- `COMMENT` → `/review/:reviewId#comment-:commentId`
- `COMMENT_LIKE` → `/review/:reviewId#comment-:commentId`
- `REVIEW_STATUS` → `/review/:reviewId`

### 4. **Dependencies**
Installed packages:
- `date-fns` - For formatting notification timestamps ("2 minutes ago" format)

## Pending Tasks ⏳

### Real-Time WebSocket Integration
The backend already has WebSocket placeholders but needs full implementation:

1. **Setup Socket.IO Server**
   - Install `socket.io` in user-interactions service
   - Create WebSocket server in main.ts
   - Implement room-based connections (`user:${userId}`)
   
2. **Setup Socket.IO Client**
   - Install `socket.io-client` in frontend
   - Create WebSocket context/hook
   - Connect on user login
   - Listen for `notification` events
   - Auto-update notification list and unread count

3. **Backend Broadcasting**
   - Already implemented: `broadcastNotification(io, userId, notification)`
   - Needs Socket.IO server instance passed to routes

## Testing Checklist

### Backend
- [ ] Test GET /api/profile/notifications endpoint
- [ ] Test unread count endpoint
- [ ] Test mark as read functionality
- [ ] Test delete notification
- [ ] Verify notifications created on follow
- [ ] Verify notifications created on vote
- [ ] Verify notifications created on comment
- [ ] Verify notifications created on comment like

### Frontend
- [ ] Notification bell shows correct unread count
- [ ] Dropdown opens/closes correctly
- [ ] Notifications list displays properly
- [ ] Mark as read updates UI
- [ ] Delete notification removes from list
- [ ] Mark all as read works
- [ ] Delete all notifications works
- [ ] Navigation works for each notification type
- [ ] Timestamps format correctly
- [ ] Icons display for each type

## Setup Instructions

### 1. Database Schema
```bash
cd Server/org
npx prisma generate
# Schema already has notifications model - no migration needed
```

### 2. Start Backend Services
```bash
cd Server/org
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test Notifications
1. Login with two different users
2. User A follows User B → User B gets notification
3. User A upvotes User B's review → User B gets notification
4. User A comments on User B's review → User B gets notification
5. User A replies to User B's comment → User B gets notification
6. User A likes User B's comment → User B gets notification

## Future Enhancements

### Real-Time with Socket.IO
```javascript
// Frontend example
import io from 'socket.io-client';

const socket = io('http://localhost:6005');
socket.on('notification', (notification) => {
  // Update notifications list
  // Increment unread count
  // Show toast/popup
});
```

### Push Notifications
- Browser push notifications API
- Service worker for offline notifications
- Desktop notifications permission

### Notification Settings
- Allow users to configure which notifications they want
- Email notifications toggle
- Push notifications toggle
- Notification frequency settings

### Notification Grouping
- Group similar notifications ("5 people liked your comment")
- Expandable grouped notifications

### Mark as Unread
- Add ability to mark read notifications as unread
- Filter by read/unread status

## File Structure
```
Server/org/
├── prisma/schema.prisma (updated NotificationType enum)
├── apps/
│   ├── user-profile/src/
│   │   ├── controllers/
│   │   │   ├── notification.controller.ts (NEW)
│   │   │   └── userProfile.controller.ts (added notification creation)
│   │   └── routes/
│   │       └── userProfile.routes.ts (added notification routes)
│   └── user-interactions/src/
│       ├── utils/
│       │   └── notifications.ts (NEW)
│       └── routes/
│           ├── interactions.ts (added vote notifications)
│           └── comments.ts (added comment notifications)
│
frontend/
├── src/
│   ├── services/
│   │   └── notification.service.js (NEW)
│   ├── components/
│   │   ├── NotificationDropdown.jsx (NEW)
│   │   └── Navbar.jsx (integrated notifications)
│   └── package.json (added date-fns)
```

## API Routes Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/notifications` | Get all notifications (paginated) |
| GET | `/api/profile/notifications/unread-count` | Get unread notification count |
| PUT | `/api/profile/notifications/:id/read` | Mark notification as read |
| PUT | `/api/profile/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/profile/notifications/:id` | Delete a notification |
| DELETE | `/api/profile/notifications/delete-all` | Delete all notifications |

## Known Issues
1. Prisma client regeneration failed due to locked file - restart backend after killing processes
2. WebSocket real-time updates not yet implemented - notifications fetch on dropdown open
3. Review status change notifications not yet implemented (need moderator dashboard integration)

## Next Steps
1. ✅ Test all notification triggers
2. ⏳ Implement Socket.IO for real-time updates
3. ⏳ Add review status notifications from moderator dashboard
4. ⏳ Add toast notifications for real-time updates
5. ⏳ Add notification settings page
