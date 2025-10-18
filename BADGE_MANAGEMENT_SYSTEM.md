# Badge Management System Implementation

## Overview
Complete badge management system for Cleverly admin dashboard with criteria-based badge assignment, user eligibility checking, and Cloudinary image integration.

## 🎯 Features Implemented

### 1. **Database Schema (Prisma)**
- **Badge Model**: Stores badge definitions with criteria
- **UserBadge Model**: Tracks badge assignments with metadata
- **Criteria System**: Flexible JSON-based criteria storage

### 2. **Backend API (Node.js/Express)**
- ✅ Badge CRUD operations
- ✅ Criteria evaluation engine
- ✅ Eligible user calculation
- ✅ Bulk badge assignment
- ✅ Badge statistics and analytics

### 3. **Frontend (React)**
- ✅ Three-tab interface: Overview, Assign, Create
- ✅ Cloudinary image upload with auto-compression
- ✅ Dynamic criteria builder
- ✅ User eligibility display with stats
- ✅ Bulk assignment functionality

---

## 📋 Database Schema

### Badge Model
```prisma
model Badge {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  name String @unique
  description String
  imageUrl String? // Cloudinary URL with compressed image
  category String // "all" or specific category
  criteria Json // Flexible criteria storage
  isActive Boolean @default(true)
  createdBy String? @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userBadges UserBadge[]
}
```

### UserBadge Model
```prisma
model UserBadge {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  user users @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId String @db.ObjectId
  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  assignedBy String? @db.ObjectId
  assignedAt DateTime @default(now())
  criteriaMetAt Json? // Snapshot of user stats when badge was assigned
  
  @@unique([userId, badgeId])
}
```

### Criteria JSON Structure
```json
{
  "followers": { "enabled": true, "operator": "more_than", "value": 100 },
  "totalReviews": { "enabled": true, "operator": "more_than", "value": 50 },
  "verifiedReviews": { "enabled": true, "operator": "more_than", "value": 25 },
  "upvotes": { "enabled": true, "operator": "more_than", "value": 200 },
  "downvotes": { "enabled": false, "operator": "less_than", "value": 10 },
  "totalComments": { "enabled": true, "operator": "more_than", "value": 100 },
  "agreeComments": { "enabled": true, "operator": "more_than", "value": 50 },
  "disagreeComments": { "enabled": false, "operator": "less_than", "value": 20 },
  "agreePercentage": { "enabled": true, "operator": "more_than", "value": 70 }
}
```

---

## 🔧 Backend API Routes

### Base URL
```
http://localhost:6004/admin
```

### Badge CRUD

#### Create Badge
```http
POST /admin/badges
Content-Type: application/json

{
  "name": "Top Reviewer",
  "description": "Awarded to users with exceptional review contributions",
  "imageUrl": "https://res.cloudinary.com/...",
  "category": "all",
  "criteria": { ... },
  "createdBy": "admin_id"
}
```

#### Get All Badges
```http
GET /admin/badges?isActive=true
```

#### Get Badge by ID
```http
GET /admin/badges/:badgeId
```

#### Update Badge
```http
PUT /admin/badges/:badgeId
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false
}
```

#### Delete Badge
```http
DELETE /admin/badges/:badgeId
```

### Badge Statistics

#### Get Overview Statistics
```http
GET /admin/badges/statistics/overview
```

Response:
```json
{
  "success": true,
  "statistics": {
    "totalBadges": 10,
    "activeBadges": 8,
    "inactiveBadges": 2,
    "totalAssignments": 245,
    "recentAssignments": [...]
  },
  "badges": [...]
}
```

### Eligibility & Assignment

#### Get Eligible Users for Badge
```http
GET /admin/badges/:badgeId/eligible-users
```

Response:
```json
{
  "success": true,
  "badge": { ... },
  "eligibleUsers": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "stats": {
        "followers": 150,
        "totalReviews": 75,
        "verifiedReviews": 40,
        "upvotes": 300,
        "downvotes": 5,
        "totalComments": 120,
        "agreeComments": 90,
        "disagreeComments": 10,
        "agreePercentage": 75
      }
    }
  ],
  "total": 15
}
```

#### Assign Badge to User
```http
POST /admin/badges/:badgeId/assign
Content-Type: application/json

{
  "userId": "user_id",
  "assignedBy": "admin_id"
}
```

#### Bulk Assign Badges
```http
POST /admin/badges/assign/bulk
Content-Type: application/json

{
  "badgeId": "badge_id",
  "userIds": ["user1", "user2", "user3"],
  "assignedBy": "admin_id"
}
```

Response:
```json
{
  "success": true,
  "message": "Bulk assignment completed. 2 successful, 1 skipped, 0 failed.",
  "results": {
    "successful": [...],
    "skipped": [...],
    "failed": []
  }
}
```

### User Badges

#### Get User's Badges
```http
GET /admin/users/:userId/badges
```

#### Remove Badge from User
```http
DELETE /admin/users/:userId/badges/:badgeId
```

---

## 🎨 Frontend Implementation

### Badge Management Page Structure

```
BadgeManagement.jsx
├── Overview Tab
│   ├── Statistics Cards
│   ├── All Badges Grid
│   └── Recent Assignments List
├── Assign Tab
│   ├── Badge Selection
│   ├── Eligible Users List
│   ├── User Search & Filter
│   └── Bulk Assignment
└── Create Tab
    ├── Badge Name Input
    ├── Description Textarea
    ├── Cloudinary Image Upload
    ├── Category Selector
    └── Criteria Builder
```

### Key Components

#### 1. Overview Tab
- Displays statistics: Total badges, Active badges, Total assignments
- Grid view of all badges with assignment counts
- Recent assignments timeline
- Quick access to assign users

#### 2. Assign Tab
- Select badge from active badges list
- Automatically loads eligible users based on criteria
- Shows user statistics (followers, reviews, upvotes, etc.)
- Checkbox selection for bulk assignment
- Search and filter functionality

#### 3. Create Tab
- Form with validation
- Cloudinary image upload with auto-compression (200x200px, low quality)
- Category dropdown (All, Electronics, Fashion, Food, Services, Other)
- Dynamic criteria builder with 9 criteria types:
  - Followers
  - Total Reviews
  - Verified Reviews
  - Upvotes Received
  - Downvotes Received
  - Total Comments
  - Agree Comments
  - Disagree Comments
  - Agree Percentage

#### Criteria Builder Features
- Toggle checkbox to enable/disable each criterion
- Operator selection: More than, Less than, Equal to
- Numeric value input
- Special handling for percentage (0-100)

---

## 🖼️ Cloudinary Integration

### Image Upload Process

1. **Frontend Selection**: User selects image file
2. **Preview**: Image shown locally before upload
3. **Upload to Cloudinary**: 
   - Transformation: `c_scale,w_200,h_200,q_auto:low`
   - Auto-compresses and resizes
   - Returns secure URL
4. **Store URL**: Saved in badge `imageUrl` field

### Configuration

```javascript
// In badgeAPI.js
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'cleverly_badges'); // Create this in Cloudinary
  formData.append('transformation', 'c_scale,w_200,h_200,q_auto:low');
  
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  const response = await axios.post(cloudinaryUrl, formData);
  return response.data.secure_url;
};
```

### Cloudinary Setup Steps

1. Create account at https://cloudinary.com
2. Go to Settings → Upload
3. Create unsigned upload preset named `cleverly_badges`
4. Enable unsigned uploading
5. Add transformation: `c_scale,w_200,h_200,q_auto:low`
6. Add environment variable:
   ```
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

---

## 🧮 Criteria Evaluation Engine

### How It Works

1. **User Stats Calculation**: 
   - Aggregates data from reviews, comments, votes, follows
   - Calculates derived metrics (agree percentage)

2. **Criteria Check**:
   - For each enabled criterion
   - Apply operator (>, <, =)
   - Compare with threshold value

3. **Result**: 
   - User must meet ALL enabled criteria
   - Returns eligible users list with stats

### Example Evaluation

Badge Criteria:
```json
{
  "followers": { "enabled": true, "operator": "more_than", "value": 100 },
  "totalReviews": { "enabled": true, "operator": "more_than", "value": 50 },
  "agreePercentage": { "enabled": true, "operator": "more_than", "value": 70 }
}
```

User Stats:
```json
{
  "followers": 150,      // ✅ 150 > 100
  "totalReviews": 75,    // ✅ 75 > 50
  "agreePercentage": 80  // ✅ 80 > 70
}
```

Result: **User is eligible** ✅

---

## 📦 Installation & Setup

### 1. Run Prisma Migration
```bash
cd Server/org
npx prisma generate
npx prisma db push
```

### 2. Install Backend Dependencies
Already installed (Express, Prisma Client)

### 3. Start User Profile Service
```bash
cd Server/org
npm run dev
```

User Profile Service runs on port **6004**

### 4. Install Frontend Dependencies
```bash
cd dashboards/Admin-dash
npm install axios lucide-react
```

### 5. Configure Environment Variables
Create `.env` in `dashboards/Admin-dash`:
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 6. Start Admin Dashboard
```bash
cd dashboards/Admin-dash
npm run dev
```

---

## 🧪 Testing

### Test Badge Creation

1. Go to Badge Management → Create tab
2. Fill in:
   - Name: "Top Reviewer"
   - Description: "Awarded to exceptional reviewers"
   - Upload image (optional)
   - Category: "all"
   - Enable criteria:
     - Followers > 50
     - Total Reviews > 20
     - Verified Reviews > 10
3. Click "Create Badge"

### Test Eligibility Check

1. Go to Overview tab
2. Click "View Eligible Users" on a badge
3. Should show:
   - List of users meeting criteria
   - User stats displayed
   - Selection checkboxes

### Test Badge Assignment

1. In Assign tab, select users
2. Click "Assign to X users"
3. Should show success message
4. Badge added to user profiles

### Test Backend API

```bash
# Get all badges
curl http://localhost:6004/admin/badges

# Get eligible users
curl http://localhost:6004/admin/badges/{badgeId}/eligible-users

# Create badge
curl -X POST http://localhost:6004/admin/badges \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Badge",
    "description": "Test description",
    "category": "all",
    "criteria": {
      "followers": {"enabled": true, "operator": "more_than", "value": 10}
    }
  }'
```

---

## 📁 Files Created/Modified

### Backend Files
- ✅ `Server/org/prisma/schema.prisma` - Added Badge and UserBadge models
- ✅ `Server/org/apps/user-profile/src/controllers/badge.controller.ts` - Badge logic
- ✅ `Server/org/apps/user-profile/src/routes/badge.routes.ts` - API routes
- ✅ `Server/org/apps/user-profile/src/main.ts` - Added badge routes

### Frontend Files
- ✅ `dashboards/Admin-dash/src/services/badgeAPI.js` - API service
- ✅ `dashboards/Admin-dash/src/pages/BadgeManagement.jsx` - Main page
- ✅ `dashboards/Admin-dash/src/components/Sidebar.jsx` - Added menu item
- ✅ `dashboards/Admin-dash/src/App.jsx` - Added route (already existed)

---

## 🎯 Available Criteria Types

1. **Followers** - Number of users following this user
2. **Total Reviews** - Total reviews posted by user
3. **Verified Reviews** - Reviews approved by admin
4. **Upvotes** - Total upvotes received on reviews
5. **Downvotes** - Total downvotes received on reviews
6. **Total Comments** - Total comments posted
7. **Agree Comments** - Comments with AGREE stance
8. **Disagree Comments** - Comments with DISAGREE stance
9. **Agree Percentage** - (Agree Comments / Total Comments) * 100

---

## 🔄 Workflow Example

### Creating a "Trusted Contributor" Badge

1. **Admin creates badge**:
   - Name: "Trusted Contributor"
   - Description: "Active community member with quality contributions"
   - Upload badge image
   - Category: "all"
   - Criteria:
     - Followers > 100
     - Total Reviews > 50
     - Verified Reviews > 30
     - Upvotes > 200
     - Agree Percentage > 75

2. **System calculates eligible users**:
   - Queries all users
   - Calculates stats for each
   - Applies criteria filters
   - Returns eligible users list

3. **Admin assigns badges**:
   - Views eligible users with stats
   - Selects users to receive badge
   - Bulk assigns badges
   - System records assignment with metadata

4. **Badge appears on user profiles**:
   - Users see badge on their profile
   - Badge displayed in user lists
   - Badge shown in review author info

---

## 🚀 Future Enhancements

- [ ] Auto-assignment: Automatically assign badges when criteria are met
- [ ] Badge tiers: Bronze, Silver, Gold versions of badges
- [ ] Time-based criteria: Reviews in last 30 days, etc.
- [ ] Category-specific criteria: Reviews in specific categories
- [ ] Badge revocation: Remove badges if criteria no longer met
- [ ] Badge notifications: Notify users when they earn a badge
- [ ] Public badge leaderboard
- [ ] Badge expiration dates
- [ ] Custom badge colors and styles
- [ ] Badge collections/achievements

---

## 📝 Notes

- All criteria operators: `more_than`, `less_than`, `equal`
- Badge names must be unique
- Deleting a badge removes all user assignments (cascade)
- Criteria evaluation happens on-demand (not real-time)
- User stats are calculated at assignment time and stored in `criteriaMetAt`
- Images are auto-compressed to 200x200px at low quality
- Admin who creates/assigns badge is tracked (`createdBy`, `assignedBy`)

---

## 🆘 Troubleshooting

### Badge not appearing in list
- Check `isActive` is `true`
- Verify badge was created successfully
- Check browser console for errors

### No eligible users found
- Verify criteria aren't too strict
- Check user stats in database
- Test with looser criteria first

### Image upload fails
- Verify Cloudinary credentials
- Check upload preset exists
- Ensure file size < 5MB
- Check network connection

### API errors
- Verify User Profile Service is running (port 6004)
- Check Prisma schema is synced
- Review backend logs for errors
- Test endpoints with curl/Postman

---

## ✅ Implementation Complete!

The Badge Management system is fully implemented and ready to use. Admins can now:
- Create custom badges with flexible criteria
- View all badges and assignment statistics
- Find eligible users based on criteria
- Assign badges individually or in bulk
- Track badge assignments with metadata

Navigate to **Badge Management** in the admin dashboard sidebar to get started!
