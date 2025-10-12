# Frontend Project Structure

## Overview
```
frontend/
├── src/                          # Source code
│   ├── components/              # Reusable React components
│   ├── pages/                   # Page components (routes)
│   ├── services/                # API integration layer
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                       # Static assets
├── node_modules/                # Dependencies (generated)
├── dist/                        # Build output (generated)
├── API-SPECIFICATION.md         # Complete API documentation
├── INTEGRATION-GUIDE.md         # How to integrate with backend
├── PROJECT-SUMMARY.md           # Current status and next steps
├── README.md                    # Frontend documentation
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── quick-start.ps1             # Quick start script
```

## Detailed Breakdown

### `/src` - Source Code

#### `/src/components` - Reusable Components
```
components/
└── Layout.jsx                   # Main layout with sidebar navigation
    ├── Sidebar navigation with icons
    ├── Active route highlighting
    ├── Mobile responsive menu
    └── Used by all pages
```

**Key Features:**
- Shield icon logo
- Navigation links to all 6 pages
- Active state highlighting
- Responsive design (hamburger menu on mobile)

---

#### `/src/pages` - Page Components

Each page is a full-screen view accessible via React Router:

##### 1. **Dashboard.jsx** - Main Overview (`/`)
```javascript
Features:
✓ 6 stat cards (posts, fraud, comments, users, detection rate, sentiment)
✓ Weekly activity trend chart (line chart)
✓ Sentiment distribution (pie chart)
✓ Fraud detection comparison (bar chart)
✓ Recent activity feed
✓ Auto-refresh every 60 seconds
✓ Manual refresh button

API Calls:
- dashboardAPI.getStats()
- dashboardAPI.getTrends()
- dashboardAPI.getRecentActivity()
```

##### 2. **PostMonitoring.jsx** - Post Management (`/posts`)
```javascript
Features:
✓ List all posts with fraud detection results
✓ Filter by status (all, pending, approved, flagged, rejected)
✓ Search posts by content or username
✓ Analyze individual posts
✓ Approve/reject posts
✓ View fraud analysis details (ML score, rule score, confidence)
✓ Delete posts

API Calls:
- postsAPI.getAll()
- postsAPI.updateStatus()
- postsAPI.reAnalyze()
- postsAPI.delete()
```

##### 3. **CommentAnalysis.jsx** - Sentiment Analysis (`/comments`)
```javascript
Features:
✓ List all comments with sentiment scores
✓ Filter by sentiment (all, positive, neutral, negative)
✓ Bulk sentiment analysis
✓ Individual comment re-analysis
✓ Sentiment score visualization (color-coded)
✓ Hide/unhide comments
✓ Delete comments

API Calls:
- commentsAPI.getAll()
- commentsAPI.reAnalyzeSentiment()
- commentsAPI.updateStatus()
- commentsAPI.delete()
```

##### 4. **UserActivity.jsx** - User Management (`/users`)
```javascript
Features:
✓ List all users with activity statistics
✓ Filter by status (all, active, flagged, suspended, banned)
✓ Search users by username
✓ View user details (posts, comments, fraud count)
✓ Risk level assessment (low, medium, high)
✓ Suspend users (temporary)
✓ Ban users (permanent)
✓ Reactivate suspended/banned users
✓ View user activity history

API Calls:
- usersAPI.getAll()
- usersAPI.suspend()
- usersAPI.ban()
- usersAPI.reactivate()
- usersAPI.getUserPosts()
- usersAPI.getActivityHistory()
```

##### 5. **Analytics.jsx** - Advanced Analytics (`/analytics`)
```javascript
Features:
✓ Fraud detection analytics
✓ Sentiment trends over time
✓ User engagement metrics
✓ Detection method comparison (ML vs Rule-based)
✓ Time period filters (7d, 30d, 90d)
✓ Export functionality (placeholder)

API Calls:
- analyticsAPI.getFraudAnalytics()
- analyticsAPI.getSentimentAnalytics()
- analyticsAPI.getUserAnalytics()
```

##### 6. **Settings.jsx** - System Configuration (`/settings`)
```javascript
Features:
✓ Fraud detection threshold settings
  - ML threshold (0-1)
  - Rule-based threshold (0-1)
  - Auto-flag toggle
  - Auto-reject toggle
✓ Sentiment analysis settings
  - Negative threshold
  - Auto-hide negative comments toggle
✓ Notification settings
  - Email notifications toggle
  - Slack integration toggle
✓ Save settings button

API Calls:
- settingsAPI.getAll()
- settingsAPI.update()
- settingsAPI.getFraudThresholds()
- settingsAPI.updateFraudThresholds()
```

---

#### `/src/services` - API Integration

##### `api.js` - Complete API Client
```javascript
Structure:
├── axios instance with base URL
├── Request interceptor (adds JWT token)
├── Response interceptor (handles errors)
└── Modular API objects:
    ├── dashboardAPI (3 methods)
    ├── postsAPI (7 methods)
    ├── commentsAPI (5 methods)
    ├── usersAPI (9 methods)
    ├── analyticsAPI (3 methods)
    └── settingsAPI (4 methods)

Total: 31 API methods ready to use
```

**Key Features:**
- Automatic JWT authentication
- Error handling with toast notifications
- Response data extraction
- Promise-based (async/await compatible)

---

#### Root Source Files

##### `App.jsx` - Router Configuration
```javascript
Routes:
├── / → Dashboard
├── /posts → PostMonitoring
├── /comments → CommentAnalysis
├── /users → UserActivity
├── /analytics → Analytics
└── /settings → Settings

All routes wrapped in <Layout> component
```

##### `main.jsx` - Application Entry Point
```javascript
Responsibilities:
├── React root rendering
├── Strict mode enablement
└── App component mounting
```

##### `index.css` - Global Styles
```css
Includes:
├── Tailwind CSS directives
├── Custom CSS classes:
│   ├── .card (white background, rounded, shadow)
│   ├── .btn (base button styles)
│   ├── .btn-primary (blue button)
│   ├── .btn-secondary (gray button)
│   ├── .btn-danger (red button)
│   ├── .badge-* (status badges)
│   └── Custom scrollbar styles
└── Font imports
```

---

### `/public` - Static Assets

Currently empty, but can include:
- Logo images
- Favicon
- Static JSON files
- Public assets

---

### Configuration Files

#### `package.json` - Dependencies
```json
Dependencies (Production):
├── react ^18.2.0
├── react-dom ^18.2.0
├── react-router-dom ^6.20.0
├── axios ^1.6.2
├── recharts ^2.10.3
├── lucide-react ^0.294.0
├── date-fns ^3.0.0
├── react-hot-toast ^2.4.1
└── @headlessui/react ^1.7.17

Dependencies (Development):
├── vite ^5.0.8
├── @vitejs/plugin-react ^4.2.1
├── tailwindcss ^3.3.6
├── postcss ^8.4.32
└── autoprefixer ^10.4.16

Scripts:
├── npm run dev → Start dev server
├── npm run build → Build for production
└── npm run preview → Preview production build
```

#### `vite.config.js` - Build Configuration
```javascript
Config:
├── React plugin enabled
├── Port: 5173 (default)
├── Hot module replacement (HMR)
└── Fast refresh
```

#### `tailwind.config.js` - Styling Configuration
```javascript
Config:
├── Content: ['./index.html', './src/**/*.{js,jsx}']
├── Theme extensions (if any)
└── Plugins (if any)
```

---

### Documentation Files

#### `API-SPECIFICATION.md` - Backend API Contract
**31 endpoints** fully documented with:
- Request/response schemas
- Authentication requirements
- Query parameters
- Example payloads
- Error responses
- Database recommendations

#### `INTEGRATION-GUIDE.md` - Integration Instructions
Comprehensive guide covering:
- Workflow architecture
- How to run the project
- API integration points
- Database structure
- Phase-by-phase implementation plan
- Security considerations
- Testing instructions

#### `PROJECT-SUMMARY.md` - Current Status
Quick overview of:
- What's been implemented
- Recent changes
- API endpoints summary
- Next steps
- Design decisions

#### `README.md` - Frontend Documentation
User guide with:
- Feature overview
- Tech stack
- Setup instructions
- Usage guide
- Deployment instructions

---

## Component Hierarchy

```
App.jsx
└── Layout.jsx (sidebar + main content area)
    ├── Dashboard.jsx
    │   ├── StatCard × 6
    │   ├── LineChart (activity trend)
    │   ├── PieChart (sentiment distribution)
    │   ├── BarChart (fraud comparison)
    │   └── ActivityFeed
    │
    ├── PostMonitoring.jsx
    │   ├── FilterBar
    │   ├── SearchInput
    │   └── PostTable
    │       └── PostRow × N
    │           ├── Status badge
    │           ├── Fraud analysis
    │           └── Action buttons
    │
    ├── CommentAnalysis.jsx
    │   ├── FilterBar (sentiment)
    │   ├── BulkAnalyzeButton
    │   └── CommentTable
    │       └── CommentRow × N
    │           ├── Sentiment badge
    │           └── Action buttons
    │
    ├── UserActivity.jsx
    │   ├── FilterBar
    │   ├── SearchInput
    │   └── UserTable
    │       └── UserRow × N
    │           ├── Risk level badge
    │           └── Action buttons
    │
    ├── Analytics.jsx
    │   ├── PeriodFilter
    │   ├── FraudAnalyticsChart
    │   ├── SentimentTrendChart
    │   └── UserEngagementChart
    │
    └── Settings.jsx
        ├── FraudSettings
        ├── SentimentSettings
        ├── NotificationSettings
        └── SaveButton
```

---

## Data Flow

### 1. Page Load
```
User visits page
  ↓
React Router matches route
  ↓
Page component mounts
  ↓
useEffect() hook fires
  ↓
API call via services/api.js
  ↓
Loading state shown
  ↓
Response received
  ↓
State updated with data
  ↓
Component re-renders with data
```

### 2. User Action (e.g., Approve Post)
```
User clicks "Approve" button
  ↓
onClick handler called
  ↓
API call: postsAPI.updateStatus(id, 'approved')
  ↓
Axios sends: PATCH /api/admin/posts/:id/status
  ↓
JWT token added by interceptor
  ↓
Backend processes request
  ↓
Response received
  ↓
Success: Toast notification + refresh data
Error: Error toast + log to console
```

### 3. Auto-refresh
```
Dashboard mounts
  ↓
setInterval(fetchDashboardData, 60000)
  ↓
Every 60 seconds:
  - Fetch new stats
  - Update state
  - Re-render with fresh data
```

---

## State Management

### Local State (useState)
Each page component manages its own state:
- `loading` - Boolean for loading indicator
- `data` - Array/object from API
- `filters` - Current filter selections
- `searchQuery` - Search input value
- `selectedItems` - Selected rows for bulk actions

### No Global State
- No Redux, Context, or other state management
- Each page is independent
- Simpler architecture
- Easier to understand and maintain

---

## Styling Approach

### Tailwind CSS Utility Classes
```jsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600 mt-2">Description</p>
</div>
```

### Custom CSS Classes (in index.css)
```jsx
<div className="card">
  <button className="btn btn-primary">Action</button>
  <span className="badge-success">Active</span>
</div>
```

### Inline Styles (sparingly)
Only for dynamic styles:
```jsx
<div style={{ width: `${percentage}%` }}>
```

---

## Error Handling

### API Level (services/api.js)
```javascript
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    toast.error(error.response?.data?.message || 'An error occurred');
    return Promise.reject(error);
  }
);
```

### Component Level
```javascript
try {
  const response = await postsAPI.getAll();
  setData(response.data);
} catch (error) {
  console.error('Failed to fetch posts:', error);
  // Toast already shown by interceptor
  setData([]); // Fallback to empty array
} finally {
  setLoading(false);
}
```

---

## Performance Considerations

### Optimizations
✓ **Lazy Loading** - Could implement with React.lazy()
✓ **Memoization** - Could use useMemo() for expensive calculations
✓ **Debouncing** - Search inputs should use debounce
✓ **Pagination** - Lists should paginate (backend support needed)
✓ **Virtual Scrolling** - For very long lists (recharts handles this)

### Bundle Size
- Vite automatically code-splits
- Tree-shaking eliminates unused code
- Production build is optimized

---

## Browser Compatibility

Targets modern browsers:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

No IE11 support (React 18 requirement)

---

## Accessibility

Implemented features:
✓ Semantic HTML elements
✓ ARIA labels where needed
✓ Keyboard navigation support
✓ Color contrast ratios
✓ Focus states on interactive elements

---

## Security Features

✓ **XSS Protection** - React auto-escapes content
✓ **CSRF** - Can add CSRF tokens (backend needed)
✓ **JWT Storage** - localStorage (can upgrade to httpOnly cookies)
✓ **Input Validation** - Form validation before submission
✓ **HTTPS** - Use in production

---

## Future Enhancements

Could add:
- [ ] React Query for caching
- [ ] Redux for global state (if needed)
- [ ] WebSocket for real-time updates
- [ ] Service Worker for offline support
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright/Cypress)

---

## Quick Reference

### Start Development
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
# Output in dist/
```

### Preview Production Build
```bash
npm run preview
```

### Key Commands
```bash
npm install <package>     # Add dependency
npm install -D <package>  # Add dev dependency
npm update                # Update dependencies
npm run build             # Production build
```

---

This structure is designed for:
- **Maintainability** - Clear separation of concerns
- **Scalability** - Easy to add new pages/features
- **Collaboration** - Multiple developers can work simultaneously
- **Testing** - Each component can be tested independently

