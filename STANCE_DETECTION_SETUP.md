# Quick Setup Guide - Stance Detection

## Prerequisites
- Google Gemini API key
- Node.js installed
- Backend and frontend servers

## Step-by-Step Setup

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Create .env file from example
Copy-Item .env.example .env

# Edit .env file and add your API key
# Replace 'your_gemini_api_key_here' with your actual API key
notepad .env
```

**Your `.env` should look like:**
```env
VITE_GEMINI_API_KEY=AIzaSyD...your-actual-key-here
VITE_API_URL=http://localhost:8080/api
```

### 3. Install Dependencies (if not already done)

```powershell
# Frontend
cd frontend
npm install

# Backend
cd ..\Server\org
npm install
```

### 4. Start Services

#### Terminal 1: Backend
```powershell
cd Server\org
npm run dev
```

#### Terminal 2: Frontend
```powershell
cd frontend
npm run dev
```

### 5. Test Stance Detection

1. Open browser to `http://localhost:5173` (or your frontend URL)
2. Login to your account
3. Find a review
4. Add a comment:
   - Type: "I totally agree with this review!"
   - Click "Post Comment"
   - Watch button change: "Post Comment" → "Analyzing..." → "Posting..." → Done
5. Check the console (F12) for stance detection logs:
   ```
   Detecting stance for comment...
   Stance detected: {stance: "AGREE", confidence: 0.92, reasoning: "..."}
   ```

## Verification

### Check Database
```javascript
// In MongoDB Compass or shell
use your_database_name;

// Find a comment
db.reviewComments.findOne({ content: /agree/i });

// Should show:
{
  _id: ObjectId("..."),
  content: "I totally agree with this review!",
  stance: "AGREE",
  stanceConfidence: 0.92,
  stanceReasoning: "Comment expresses strong agreement...",
  stanceAnalyzedAt: ISODate("2025-01-14T..."),
  // ... other fields
}

// Check review stance counts
db.reviews.findOne({ _id: ObjectId("review_id") });

// Should show:
{
  _id: ObjectId("..."),
  agreeCount: 5,
  disagreeCount: 2,
  neutralStanceCount: 3,
  // ... other fields
}
```

## Troubleshooting

### Issue: "Gemini API key not configured"
**Fix:**
1. Check `.env` file exists in `frontend/` directory
2. Verify `VITE_GEMINI_API_KEY=...` is set
3. Restart frontend dev server (Vite only reads .env on startup)

### Issue: Stance always returns NEUTRAL with error
**Check:**
1. Valid API key
2. Internet connectivity
3. Gemini API quota not exceeded
4. Browser console for detailed errors

### Issue: Comments posted without stance
**This is normal!** Stance detection is optional:
- If Gemini API fails, comment still posts successfully
- Stance fields remain null
- Check console for error messages

## Next Steps

1. **Test different scenarios:**
   - Agreeing comments
   - Disagreeing comments
   - Neutral questions
   - Replies to comments

2. **Monitor API usage:**
   - Free tier: 60 requests/minute
   - Check [Google AI Studio Dashboard](https://makersuite.google.com/)

3. **Optional: Add visual stance badges**
   - Display AGREE/DISAGREE/NEUTRAL on comments
   - Show confidence meter
   - Filter comments by stance

## Success Criteria

✅ Frontend `.env` configured with Gemini API key
✅ Backend server running on port 8080
✅ Frontend server running on port 5173
✅ Button shows "Analyzing..." when posting comment
✅ Comments saved with stance fields in database
✅ Review stance counts updated correctly
✅ Console shows stance detection logs

## Important Notes

- **Never commit `.env` to git!** (already in `.gitignore`)
- **API key is visible in browser** - For production, use backend proxy
- **Stance detection takes 1-2 seconds** - Users see "Analyzing..." feedback
- **Graceful degradation** - Comments work even if stance detection fails

## Documentation

For detailed implementation details, see:
- `STANCE_DETECTION_FRONTEND_IMPLEMENTATION.md` - Full architecture and API docs
- `frontend/src/services/geminiService.js` - Gemini API integration
- `frontend/src/components/CommentSection.jsx` - UI implementation

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check backend terminal for API errors
3. Verify `.env` configuration
4. Test Gemini API key at [Google AI Studio](https://makersuite.google.com/)
