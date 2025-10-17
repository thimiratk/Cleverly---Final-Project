# Troubleshooting Login Page Loading Issue

## Issue
Login page at `http://localhost:5173/login` shows only loading screen with no errors in console.

## Root Cause
The `AuthProvider` component was getting stuck in loading state during initialization when `fetchCurrentUser()` API call failed or timed out.

## Fix Applied
Added timeout handling to `AuthContext.jsx`:
- 5-second timeout for auth check
- Graceful fallback if auth check fails
- Prevents infinite loading state

## Testing Steps

### 1. Check Backend is Running
```powershell
# Terminal 1 - Backend
cd Server\org
npm run dev
```

Backend should show:
```
Server is running on port 6001
Server is running on port 6002
API Gateway running on port 8080
```

### 2. Check Frontend is Running
```powershell
# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Frontend should show:
```
  ➜  Local:   http://localhost:5173/
```

### 3. Test API Gateway
```powershell
# Terminal 3 - Test API
curl http://localhost:8080/api/health
```

Should return:
```json
{"status":"ok","message":"API Gateway is running"}
```

### 4. Open Browser
1. Navigate to: `http://localhost:5173/login`
2. Should now show login page (not stuck on loading)
3. Open DevTools (F12) and check console for any errors

### 5. Check Console Logs
Expected logs in browser console:
```
Auth check failed or timed out: Auth check timeout
```
OR
```
Failed to fetch current user from API: Network Error
```

These are **normal** if you're not logged in yet.

## If Still Showing Loading

### Option 1: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Option 2: Clear localStorage
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

### Option 3: Check .env Configuration
```bash
# frontend/.env
VITE_API_GATEWAY_URL="http://localhost:8080/api"
VITE_GOOGLE_CLIENT_ID="492578499793-ggj5re5j3146ht1jn3un1v8j0rc743ie.apps.googleusercontent.com"
```

### Option 4: Restart Frontend Server
```powershell
# Stop frontend (Ctrl+C)
# Clear node_modules cache
cd frontend
Remove-Item -Recurse -Force node_modules\.vite

# Restart
npm run dev
```

## Additional Debugging

### Check Network Requests
1. Open DevTools (F12) → Network tab
2. Reload page
3. Look for request to `/auth/me`
4. Check if it's timing out or failing

### Check API Response
```powershell
# Test auth endpoint directly
curl http://localhost:8080/api/auth/me
```

Should return 401 if not logged in:
```json
{"error":"Unauthorized"}
```

### Enable Verbose Logging
Add to `frontend/src/context/AuthContext.jsx`:
```javascript
console.log('AuthContext: Initializing...');
console.log('Stored user:', AuthService.getCurrentUser());
// ... after fetch
console.log('Fetched user:', fetchedUser);
console.log('Auth loading complete');
```

## Expected Behavior

### When Not Logged In
1. Loading screen shows for 4 seconds (splash screen)
2. AuthContext initializes (< 5 seconds)
3. Login page displays
4. Console may show: "Auth check failed or timed out" (normal)

### When Logged In
1. Loading screen shows for 4 seconds
2. AuthContext initializes and fetches user
3. User is authenticated
4. Redirects to home page

## File Changes Made

### `frontend/src/context/AuthContext.jsx`
- Added 5-second timeout for auth initialization
- Added Promise.race() to prevent hanging
- Added catch block for timeout errors
- Ensures `setLoading(false)` always executes

## Prevention
The timeout ensures that even if:
- Backend is down
- Network is slow
- API endpoint fails

The loading state will **always** complete within 5 seconds.

## Success Criteria
- ✅ Login page visible within 9 seconds (4s splash + 5s auth check)
- ✅ No infinite loading
- ✅ Console shows clear error messages if auth fails
- ✅ User can interact with login form

## If Problem Persists

### Check for JavaScript Errors
Look in console for:
- Syntax errors
- Import errors
- React errors

### Check Router Configuration
Verify `App.jsx` has correct route:
```jsx
<Route path="/login" element={<Login />} />
```

### Verify No Infinite Redirects
Check if login page is trying to redirect to itself.

### Test in Incognito Mode
Sometimes browser extensions cause issues.
Open in incognito/private window.
