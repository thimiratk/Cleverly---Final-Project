# Cleverly Admin Dashboard

A comprehensive React-based admin dashboard for managing fraud detection and sentiment analysis on your social media platform.

## 🎯 Features

### 📊 Dashboard
- Real-time statistics and metrics
- Activity trends visualization
- Sentiment distribution charts
- Recent activity feed

### 📝 Post Monitoring
- Monitor all posts on the platform
- **Rule-based Fraud Detection** - Detect fraudulent posts using rule-based algorithms
- **ML-based Fraud Detection** - AI-powered fraud detection using machine learning
- Analyze individual posts or bulk analyze
- Approve, flag, or reject posts
- Detailed fraud analysis reports

### 💬 Comment Analysis
- **Sentiment Analysis** - Analyze sentiment of user comments
- Bulk sentiment analysis
- Filter by sentiment (positive, negative, neutral)
- Real-time sentiment scoring

### 👥 User Activity
- Monitor user behavior and activity
- Track fraud attempts per user
- Risk level assessment
- Flag or suspend suspicious users
- User activity statistics

### 📈 Analytics
- Detailed reporting and analytics (Coming soon)

### ⚙️ Settings
- Configure API endpoints
- Manage notification preferences
- Set fraud detection thresholds
- Security settings

## 🏗️ Architecture

The dashboard connects to three microservices:

```
Dashboard (React)
    ├── Rule-based Fraud Detection (Port 8001)
    │   └── Detects fraud in posts using rule-based algorithms
    │
    ├── ML-based Fraud Detection (Port 8002)
    │   └── Detects fraud in post text using machine learning
    │
    └── Sentiment Analysis (Port 8003)
        └── Analyzes sentiment of comments
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend services running (see Backendnew/api-gateway)

### Installation

1. **Install dependencies:**
   ```powershell
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```powershell
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── PostMonitoring.jsx  # Post fraud detection
│   │   ├── CommentAnalysis.jsx # Comment sentiment analysis
│   │   ├── UserActivity.jsx    # User management
│   │   ├── Analytics.jsx       # Analytics page
│   │   └── Settings.jsx        # Settings page
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 🔌 API Integration

### Rule-based Fraud Detection API
```javascript
POST http://localhost:8001/detect
{
  "review_text": "Post content",
  "rating": 5,
  "reviewer_id": "user_123",
  "product_id": "post_456"
}
```

### ML-based Fraud Detection API
```javascript
POST http://localhost:8002/detection
{
  "review_text": "Post content to analyze"
}
```

### Sentiment Analysis API
```javascript
POST http://localhost:8003/sentiment
{
  "text": "Comment text to analyze"
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Making Changes

1. **Add a new page:**
   - Create component in `src/pages/`
   - Add route in `src/App.jsx`
   - Add navigation item in `src/components/Layout.jsx`

2. **Modify API calls:**
   - Update `src/services/api.js`

3. **Customize styles:**
   - Update `tailwind.config.js` for theme
   - Modify `src/index.css` for global styles

## 🔒 Security Notes

- Currently runs without authentication (development only)
- Add authentication before production deployment
- Secure API endpoints with proper authentication
- Implement rate limiting
- Add CORS configuration

## 📝 Usage Guide

### Monitoring Posts

1. Navigate to **Post Monitoring**
2. View all posts in the platform
3. Click **Analyze** on any post
4. View both rule-based and ML-based fraud detection results
5. Take action: Approve, Flag, or Reject

### Analyzing Comments

1. Navigate to **Comment Analysis**
2. Click **Analyze All** to analyze all comments at once
3. Or analyze individual comments
4. Filter by sentiment (positive, negative, neutral)
5. View sentiment scores and confidence levels

### Managing Users

1. Navigate to **User Activity**
2. View all users and their activity
3. Monitor fraud attempts per user
4. Flag suspicious users
5. Suspend users if necessary

## 🚀 Production Deployment

### Build for Production
```powershell
npm run build
```

The build output will be in the `dist/` folder.

### Deploy Options
- **Static Hosting:** Netlify, Vercel, GitHub Pages
- **Traditional Hosting:** Apache, Nginx
- **Cloud:** AWS S3, Azure Static Web Apps, Google Cloud Storage

### Environment Variables

Create `.env` file for production:
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_RULE_API_URL=https://your-api-domain.com:8001
VITE_ML_API_URL=https://your-api-domain.com:8002
VITE_SENTIMENT_API_URL=https://your-api-domain.com:8003
```

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend services are running
- Check if ports 8001, 8002, 8003 are accessible
- Verify CORS settings on backend

### Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Update dependencies: `npm update`

### Styling Issues
- Rebuild Tailwind: `npm run build`
- Check PostCSS configuration

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the Cleverly platform.

---

**Need Help?** Check the backend documentation in `Backendnew/api-gateway/`
