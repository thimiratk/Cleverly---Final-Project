# 🚀 QUICK START - Stance Detection Testing

## 1. Start Servers

### Backend
```powershell
cd Server\org
npm run dev
```
✅ Wait for: **"Review service running at port! 6002"**

### Frontend
```powershell
cd frontend
npm run dev
```
✅ Wait for: **"Local: http://localhost:5173"**

## 2. Open Browser

1. Go to `http://localhost:5173`
2. Press `F12` (DevTools)
3. Click **Console** tab
4. **Keep console open!**

## 3. Test Comment

### Post this comment:
```
"I completely agree with this review!"
```

## 4. Watch Console Logs

### ✅ SUCCESS - You should see:

**Browser Console:**
```
ReviewCard - reviewText length: 150
[Stance Detection] ReviewText is truthy: true
[Stance Detection] Starting stance detection...
[Stance Detection] Result: {stance: "AGREE", ...}
[API] Adding stance data to request
[API] Comment added successfully
```

**Backend Terminal:**
```
[Stance Update] Comment stance: AGREE
[updateReviewStanceCounts] Starting stance count update
[updateReviewStanceCounts] Calculated counts: {agreeCount: 1, ...}
[updateReviewStanceCounts] Successfully updated
```

### ❌ PROBLEM - If you see:

**Browser Console:**
```
[Stance Detection] ⚠️ SKIPPING - No review text available!
```
→ reviewText is missing! Check database.

## 5. Verify Result

1. **Refresh page** (`F5`)
2. **Check console** shows: `agree: 1`
3. **Visual bar** should appear with green segment
4. **Legend** shows "1 Agree"

## 6. Database Check

```javascript
// Check comment has stance
db.reviewComments.findOne(
  {content: /agree/i},
  {stance: 1, stanceConfidence: 1}
)

// Should show:
// stance: "AGREE"
// stanceConfidence: 0.95
```

## 🎯 That's it!

If you see all the logs → Everything is working! 🎉

If missing logs → Share what you see in console and I'll help debug.

---

📚 **Full details:** `COMPLETE_STANCE_DETECTION_FIX.md`
