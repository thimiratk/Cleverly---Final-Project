# Categories API Fix

## Issue
"Failed to load categories" error in CreateReview component showing 404 errors for `/api/categories`.

## Root Cause
The frontend was calling `/categories` but the Domain Management service expects `/domain/categories` path prefix.

## Solution

### Updated API Paths in `frontend/src/services/api.js`:

**Before:**
```javascript
export const getCategories = async () => {
  const response = await domainApi.get('/categories');
  return response.data;
};
```

**After:**
```javascript
export const getCategories = async () => {
  try {
    const response = await domainApi.get('/domain/categories');
    // Handle both direct array response and wrapped response
    return response.data.categories || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
```

### Changes Made:

1. ✅ **getCategories()** - Changed from `/categories` to `/domain/categories`
2. ✅ **createCategory()** - Changed from `/categories` to `/domain/categories`
3. ✅ **getSubCategories()** - Changed from `/subcategories` to `/domain/subcategories`
4. ✅ **getSubCategoriesByCategory()** - Changed from `/categories/:id/subcategories` to `/domain/categories/:id/subcategories`
5. ✅ **createSubCategory()** - Changed from `/subcategories` to `/domain/subcategories`

### Additional Improvements:

- Added try-catch error handling
- Added console logging for debugging
- Handle both response formats: `{ categories: [...] }` or direct array `[...]`

## Testing

### 1. Test Categories API
```bash
# Direct API test
curl http://localhost:8080/api/domain/categories

# Should return:
{
  "categories": [
    { "_id": "...", "name": "Electronics", ... }
  ]
}
```

### 2. Test in Frontend
1. Open the CreateReview modal
2. Check browser console - should NOT show 404 errors
3. Category dropdown should populate with categories
4. Select a category to load subcategories

## API Gateway Routing

The API Gateway routes domain management requests:
```
http://localhost:8080/api/domain/* → http://localhost:6003/api/domain/*
```

So:
- `/api/domain/categories` → Domain Management Service (port 6003)
- `/api/categories` → 404 (no service handles this)

## Files Modified

1. `frontend/src/services/api.js`
   - Updated `getCategories()`
   - Updated `createCategory()`
   - Updated `getSubCategories()`
   - Updated `getSubCategoriesByCategory()`
   - Updated `createSubCategory()`

## Verification

After restarting the frontend (`npm run dev`), you should see:

✅ Categories load successfully
✅ No 404 errors in console
✅ Subcategories load when category is selected
✅ CreateReview form works properly

## Related Services

- **Frontend**: `localhost:5173` (Vite dev server)
- **API Gateway**: `localhost:8080` (Nginx proxy)
- **Domain Management**: `localhost:6003` (Categories/Subcategories)

## Troubleshooting

### Still Getting 404?
1. Hard refresh browser (Ctrl+Shift+R)
2. Check frontend dev server is running
3. Check API Gateway is running
4. Check Domain Management service is running (port 6003)

### Domain Management Not Running?
```bash
cd Server/org
npm run dev
```

Look for: `🚀 Server running at http://localhost:6003`

### Check API Gateway Routes
```bash
# Check nginx.conf or gateway configuration
# Should have proxy_pass for /api/domain/*
```

## Success Indicators

✅ CreateReview modal opens without errors
✅ Categories dropdown populates
✅ Console shows: No 404 errors for categories
✅ Subcategories load when category selected
✅ Review submission works
