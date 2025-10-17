# Badge Creation and Category Fetching - Critical Fixes

## Issues Identified and Fixed

### Issue 1: ❌ Categories Not Fetching from Backend

**Root Causes**:
1. **Wrong Port**: Frontend was calling port 6005, but domain-management runs on port 6003
2. **Wrong API Path**: Backend had routes at `/categories`, frontend expected `/api/domain/categories`
3. **Wrong Response Format**: Backend returned array directly, frontend expected `{ categories: [...] }`

**Fixes Applied**:

#### A. Fixed Domain Management API Path
**File**: `Server/org/apps/domain-management/src/main.ts`
```typescript
// BEFORE
app.use('/', domainRoutes);

// AFTER
app.use('/api/domain', domainRoutes);
```

#### B. Fixed Response Format
**File**: `Server/org/apps/domain-management/src/controllers/domain.controller.ts`
```typescript
// BEFORE
res.json(categories);

// AFTER
res.json({ categories });
```

#### C. Fixed Port Number in Frontend
**File**: `dashboards/Admin-dash/src/pages/BadgeManagement.jsx`
```javascript
// BEFORE
fetch('http://localhost:6005/api/domain/categories')

// AFTER
fetch('http://localhost:6003/api/domain/categories')
```

### Issue 2: ❌ Badge Statistics Route Conflict

**Root Cause**: 
The route `/badges/statistics/overview` was defined AFTER `/badges/:badgeId`, causing Express to treat "statistics" as a badgeId parameter.

**Fix Applied**:
**File**: `Server/org/apps/user-profile/src/routes/badge.routes.ts`
```typescript
// BEFORE (Wrong order)
router.get('/badges/:badgeId', getBadgeById);
router.get('/badges/statistics/overview', getBadgeStatistics);

// AFTER (Correct order)
router.get('/badges/statistics/overview', getBadgeStatistics); // Specific route FIRST
router.get('/badges/:badgeId', getBadgeById);                  // Dynamic route AFTER
```

## Current Service Configuration

### Backend Services and Ports

| Service | Port | Base URL | Purpose |
|---------|------|----------|---------|
| Domain Management | 6003 | http://localhost:6003 | Categories and subcategories |
| User Profile | 6004 | http://localhost:6004 | Badge management |
| API Gateway | 8080 | http://localhost:8080 | Main gateway |

### API Endpoints

#### Domain Management (Port 6003)
```
GET  /api/domain/categories                    → Get all categories
POST /api/domain/categories                    → Create category
GET  /api/domain/categories/:id                → Get specific category
PUT  /api/domain/categories/:id                → Update category
DELETE /api/domain/categories/:id              → Delete category
```

**Response Format**:
```json
{
  "categories": [
    {
      "id": "cat1",
      "name": "Electronics",
      "subCategories": [...],
      "reviews": [...]
    }
  ]
}
```

#### Badge Management (Port 6004)
```
GET  /admin/badges/statistics/overview         → Get badge statistics
POST /admin/badges                             → Create badge
GET  /admin/badges                             → Get all badges
GET  /admin/badges/:badgeId                    → Get specific badge
PUT  /admin/badges/:badgeId                    → Update badge
DELETE /admin/badges/:badgeId                  → Delete badge
GET  /admin/badges/:badgeId/eligible-users     → Get eligible users
POST /admin/badges/:badgeId/assign             → Assign badge to user
POST /admin/badges/assign/bulk                 → Bulk assign badges
```

## Testing Steps

### 1. Test Domain Management Service

```powershell
# Start the backend services
cd "C:\Users\Thimira Kodithuwakku\Documents\Cleverly-deployment\Cleverly---Final-Project\Server\org"
npm run dev
```

**Verify domain-management is running**:
```powershell
curl http://localhost:6003
# Expected: "🌐 Domain Management API is running"

curl http://localhost:6003/api/domain/categories
# Expected: JSON with categories array
```

### 2. Test User Profile Service

**Verify user-profile is running**:
```powershell
curl http://localhost:6004
# Expected: User Profile service info

curl http://localhost:6004/admin/badges/statistics/overview
# Expected: Badge statistics JSON
```

### 3. Test Admin Dashboard

```powershell
cd "C:\Users\Thimira Kodithuwakku\Documents\Cleverly-deployment\Cleverly---Final-Project\dashboards\Admin-dash"
npm run dev
```

**Steps to verify**:
1. Open browser to the admin dashboard URL (usually http://localhost:5173)
2. Navigate to Badge Management
3. Click "Create" tab
4. Check category dropdown - should show categories from database
5. Open browser console (F12) - should see: "Categories loaded: ..."

### 4. Test Badge Creation

**In the Create tab**:
1. Fill in badge name (e.g., "Test Badge")
2. Fill in description
3. Select a category from dropdown (should show real categories)
4. Upload an image (optional - Cloudinary)
5. Enable at least one criterion (e.g., "Followers" > 10)
6. Click "Create Badge"

**Expected Results**:
- ✅ Success message appears
- ✅ Badge appears in Overview tab
- ✅ No errors in browser console
- ✅ No errors in backend terminal

## Troubleshooting

### Problem: Categories still not loading

**Check 1**: Is domain-management service running?
```powershell
# In Server/org directory
npm run dev
```

Look for:
```
🚀 Server running at http://localhost:6003
```

**Check 2**: Test the endpoint directly
```powershell
curl http://localhost:6003/api/domain/categories
```

If it returns 404, the service isn't running or routes aren't mounted correctly.

**Check 3**: Check browser console
- Open DevTools (F12)
- Go to Network tab
- Try loading Badge Management → Create tab
- Look for the categories request
- Check if it's calling the right URL (http://localhost:6003/api/domain/categories)

### Problem: Badge creation fails

**Check 1**: Is user-profile service running?
```powershell
# Check if service is running on port 6004
curl http://localhost:6004/admin/badges
```

**Check 2**: Check the request payload
- Open browser DevTools → Network tab
- Try creating a badge
- Click on the POST request to `/admin/badges`
- Check the Request Payload

**Check 3**: Check backend logs
Look at the terminal where you ran `npm run dev` in Server/org
- Should show any errors
- Common issues: Prisma connection, validation errors

**Check 4**: Verify Prisma schema is synced
```powershell
cd "C:\Users\Thimira Kodithuwakku\Documents\Cleverly-deployment\Cleverly---Final-Project\Server\org"
npx prisma db push
```

### Problem: "Statistics" route returns 404

This was fixed by reordering routes. If still failing:

**Check**: Routes are in correct order
```typescript
// In badge.routes.ts
router.get('/badges/statistics/overview', ...);  // MUST be first
router.get('/badges/:badgeId', ...);              // Then dynamic routes
```

**Restart**: After fixing routes, restart the service
```powershell
# Ctrl+C to stop, then
npm run dev
```

### Problem: CORS errors

If you see CORS errors in browser console:

**Check**: Domain management CORS settings
```typescript
// In Server/org/apps/domain-management/src/main.ts
app.use(cors({
  origin: true, // Allow all origins (dev only!)
  credentials: true
}));
```

**Check**: User profile CORS settings
Should have similar CORS configuration.

## Summary of Changes

### Files Modified

1. ✅ `Server/org/apps/domain-management/src/main.ts`
   - Changed route mount from `/` to `/api/domain`

2. ✅ `Server/org/apps/domain-management/src/controllers/domain.controller.ts`
   - Changed `res.json(categories)` to `res.json({ categories })`

3. ✅ `Server/org/apps/user-profile/src/routes/badge.routes.ts`
   - Moved statistics route BEFORE dynamic :badgeId route

4. ✅ `dashboards/Admin-dash/src/pages/BadgeManagement.jsx`
   - Changed port from 6005 to 6003
   - Added console.log for debugging

### What Was Fixed

| Issue | Status | Impact |
|-------|--------|--------|
| Category fetching wrong port | ✅ Fixed | Categories now load from correct service |
| API path mismatch | ✅ Fixed | Routes now accessible at /api/domain/* |
| Response format mismatch | ✅ Fixed | Frontend receives expected data structure |
| Route order conflict | ✅ Fixed | Statistics endpoint now accessible |

## Next Steps

1. **Start all services**:
   ```powershell
   cd Server/org
   npm run dev
   ```

2. **Start admin dashboard**:
   ```powershell
   cd dashboards/Admin-dash
   npm run dev
   ```

3. **Test the complete flow**:
   - Navigate to Badge Management
   - Switch to Create tab
   - Verify categories dropdown is populated
   - Create a test badge
   - Verify it appears in Overview tab

4. **Monitor logs**:
   - Keep an eye on backend terminal for errors
   - Keep browser console open for frontend errors

## Success Criteria

✅ Categories load from database in dropdown  
✅ Category dropdown shows real category names  
✅ Badge creation succeeds without errors  
✅ Created badge appears in Overview tab  
✅ Badge statistics load correctly  
✅ No CORS errors in browser console  
✅ No 404 errors in Network tab  

All issues should now be resolved! 🎉
