# Stance Detection Visualization - Review Card

## Overview
The ReviewCard component now displays a visual stance analysis bar showing how commenters feel about the review (Agree, Disagree, or Neutral).

## Visual Display

### Location
The stance bar appears between the review images and the action buttons (upvote/downvote/comments).

### Design
```
┌─────────────────────────────────────┐
│  Comment Sentiment    5 analyzed    │
├─────────────────────────────────────┤
│ [████████][██][████]                │ ← Progress bar
├─────────────────────────────────────┤
│ ■ 3 Agree  ■ 1 Disagree  ■ 1 Neutral│
└─────────────────────────────────────┘
```

### Colors
- **Green** (`bg-green-500`) - Agree
- **Red** (`bg-red-500`) - Disagree  
- **Gray** (`bg-gray-400`) - Neutral

## Data Source

### Database Fields (Prisma Schema)
```prisma
model reviews {
  // ...
  agreeCount Int @default(0)
  disagreeCount Int @default(0)
  neutralStanceCount Int @default(0)
  // ...
}
```

### ReviewCard Props
The stance counts are extracted from the review object:
```javascript
const reviewData = {
  // ...
  agreeCount: review?.agreeCount || 0,
  disagreeCount: review?.disagreeCount || 0,
  neutralStanceCount: review?.neutralStanceCount || 0
};
```

## Conditional Rendering

### Display Logic
The stance bar **only shows** if there's at least one analyzed comment:
```jsx
{(reviewData.agreeCount > 0 || reviewData.disagreeCount > 0 || reviewData.neutralStanceCount > 0) && (
  // Stance bar component
)}
```

### When Hidden
- Review has no comments
- No comments have been analyzed with stance detection
- All counts are 0

### When Visible
- At least one comment has been analyzed
- Shows proportional bar chart
- Displays exact counts in legend

## Features

### 1. Header Section
```jsx
<div className="flex items-center justify-between mb-2">
  <h4 className="text-xs font-semibold text-gray-600">Comment Sentiment</h4>
  <span className="text-xs text-gray-500">
    {totalAnalyzed} analyzed
  </span>
</div>
```

- Title: "Comment Sentiment"
- Right-aligned count showing total analyzed comments

### 2. Progress Bar
```jsx
<div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-200">
  {/* Green section for Agree */}
  {/* Red section for Disagree */}
  {/* Gray section for Neutral */}
</div>
```

**Proportional Width Calculation:**
```javascript
width: (count / totalCount) * 100 + '%'
```

**Example:**
- 3 Agree, 1 Disagree, 1 Neutral (Total: 5)
- Agree: 60% width
- Disagree: 20% width
- Neutral: 20% width

### 3. Legend
```jsx
<div className="flex items-center justify-between text-xs">
  <div>■ 3 Agree</div>
  <div>■ 1 Disagree</div>
  <div>■ 1 Neutral</div>
</div>
```

- Shows exact counts
- Color-coded squares match bar colors
- Evenly distributed across width

### 4. Tooltips
Each bar segment has a title attribute for hover tooltips:
```jsx
title={`${reviewData.agreeCount} Agree`}
```

## Responsive Design

### Desktop (> 768px)
- Full width bar with all legend items visible
- Clear spacing between elements

### Mobile (< 768px)
- Bar scales to container width
- Legend text remains readable
- Stacks gracefully if needed

## Styling

### Container
```jsx
className="bg-gray-50 rounded-xl p-4 border border-gray-200"
```
- Light gray background
- Rounded corners
- Border for definition
- Padding for breathing room

### Bar
```jsx
className="flex h-3 w-full rounded-full overflow-hidden"
```
- Height: 12px (h-3)
- Full width
- Rounded ends
- Overflow hidden for smooth edges

### Transitions
```jsx
className="transition-all duration-500"
```
- Smooth width changes when counts update
- 500ms duration for visibility

## Data Flow

### 1. Comment Creation
```javascript
// When user posts comment with stance
{
  content: "I agree!",
  stance: "AGREE",
  stanceConfidence: 0.92,
  stanceReasoning: "..."
}
```

### 2. Database Update
Backend increments review stance count:
```typescript
await prisma.reviews.update({
  where: { id: reviewId },
  data: {
    agreeCount: { increment: 1 }
  }
});
```

### 3. Frontend Display
```javascript
// Review object includes updated counts
{
  agreeCount: 3,
  disagreeCount: 1,
  neutralStanceCount: 1
}
```

### 4. Visual Rendering
Component calculates percentages and renders bar.

## Integration Example

### ReviewCard Usage
```jsx
<ReviewCard 
  review={{
    id: "123",
    reviewText: "Great product!",
    agreeCount: 5,
    disagreeCount: 1,
    neutralStanceCount: 2,
    // ... other fields
  }}
/>
```

### Expected Output
```
Comment Sentiment             8 analyzed
[█████████████][██][████]
■ 5 Agree  ■ 1 Disagree  ■ 2 Neutral
```

## Performance Considerations

### Calculation Efficiency
```javascript
const total = agreeCount + disagreeCount + neutralStanceCount;
const agreePercent = (agreeCount / total) * 100;
```

- O(1) complexity
- Inline calculation
- No additional API calls needed

### Re-rendering
The stance bar only re-renders when:
- Review prop changes
- Stance counts update
- Component remounts

## Accessibility

### Color Blind Friendly
- Not relying solely on color
- Includes text labels
- Shows exact numbers

### Screen Readers
Consider adding:
```jsx
<div aria-label={`Comment sentiment: ${agreeCount} agree, ${disagreeCount} disagree, ${neutralStanceCount} neutral`}>
```

### Keyboard Navigation
Currently no interactive elements in the stance bar (display only).

## Future Enhancements

### 1. Click to Filter
```jsx
<button onClick={() => filterCommentsByStance('AGREE')}>
  {agreeCount} Agree
</button>
```
Allow users to filter comments by stance.

### 2. Animated Counting
```jsx
<CountUp end={agreeCount} duration={1} />
```
Animate numbers counting up.

### 3. Percentage Display
```jsx
<span>{Math.round(agreePercent)}%</span>
```
Show percentages alongside counts.

### 4. Tooltip Details
```jsx
title={`${agreeCount} comments agree with this review\nAvg confidence: 0.85`}
```
Show more details on hover.

### 5. Trend Indicators
```jsx
{agreeCount > previousAgreeCount && <FaArrowUp />}
```
Show if sentiment is increasing/decreasing.

## Testing

### Test Cases

#### 1. No Comments
```javascript
{
  agreeCount: 0,
  disagreeCount: 0,
  neutralStanceCount: 0
}
```
**Expected:** Stance bar hidden

#### 2. All Agree
```javascript
{
  agreeCount: 5,
  disagreeCount: 0,
  neutralStanceCount: 0
}
```
**Expected:** Full green bar, "5 Agree, 0 Disagree, 0 Neutral"

#### 3. Mixed Sentiment
```javascript
{
  agreeCount: 3,
  disagreeCount: 2,
  neutralStanceCount: 1
}
```
**Expected:** 50% green, 33% red, 17% gray

#### 4. Single Comment
```javascript
{
  agreeCount: 0,
  disagreeCount: 1,
  neutralStanceCount: 0
}
```
**Expected:** Full red bar, "0 Agree, 1 Disagree, 0 Neutral"

### Visual Testing Checklist
- [ ] Bar displays correctly on desktop
- [ ] Bar displays correctly on mobile
- [ ] Colors match design (green/red/gray)
- [ ] Proportions calculate correctly
- [ ] Legend shows accurate counts
- [ ] Tooltips work on hover
- [ ] Hidden when all counts are 0
- [ ] Transitions smooth when data updates

## Troubleshooting

### Issue: Bar Not Showing
**Possible Causes:**
1. All stance counts are 0
2. Review object missing stance fields
3. Component not receiving updated data

**Solution:**
```javascript
console.log('Stance counts:', {
  agree: review.agreeCount,
  disagree: review.disagreeCount,
  neutral: review.neutralStanceCount
});
```

### Issue: Incorrect Proportions
**Cause:** Division by zero or wrong total

**Solution:** Check calculation:
```javascript
const total = agreeCount + disagreeCount + neutralStanceCount;
if (total > 0) {
  const percent = (count / total) * 100;
}
```

### Issue: Colors Not Visible
**Cause:** Tailwind CSS not loading colors

**Solution:** Verify Tailwind config includes colors:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        green: { 500: '#10b981' },
        red: { 500: '#ef4444' },
        gray: { 400: '#9ca3af' }
      }
    }
  }
}
```

## Success Metrics

✅ Visual feedback for comment sentiment
✅ Proportional bar chart display
✅ Exact counts in legend
✅ Conditional rendering (hidden when no data)
✅ Color-coded for easy interpretation
✅ Responsive design
✅ Smooth transitions
✅ No performance impact

## Conclusion

The stance detection visualization provides users with immediate insight into how commenters feel about a review. The proportional bar chart makes it easy to see at a glance whether comments are generally supportive, critical, or neutral.
