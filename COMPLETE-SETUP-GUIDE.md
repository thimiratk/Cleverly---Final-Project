# 🚀 Cleverly Platform - Complete Setup Guide

This guide will help you run the complete Cleverly platform with both backend services and frontend dashboard.

## 📋 Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- All Python dependencies installed (see Backend setup)

## 🎯 Quick Start (2 Steps)

### Step 1: Start Backend Services

Open a PowerShell terminal:

```powershell
cd Backendnew\api-gateway
.\start-services-local.ps1
```

This will start 3 services:
- ✅ Rule-based Fraud Detection (Port 8001)
- ✅ ML-based Fraud Detection (Port 8002)
- ✅ Sentiment Analysis (Port 8003)

### Step 2: Start Frontend Dashboard

Open another PowerShell terminal:

```powershell
cd frontend
npm install  # First time only
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

## 📊 Access Points

Once everything is running:

### Admin Dashboard
- **URL:** http://localhost:3000
- **Features:** Full admin interface for monitoring and management

### Backend Services (Direct Access)
- **Rule-based API:** http://localhost:8001/docs
- **ML-based API:** http://localhost:8002/docs
- **Sentiment API:** http://localhost:8003/docs

## 🎨 Dashboard Features

### 1. Dashboard (Home)
- Real-time statistics
- Activity trends
- Sentiment distribution
- Recent activity feed

### 2. Post Monitoring
- View all posts
- Analyze posts for fraud (both rule-based and ML)
- Approve/Flag/Reject posts
- Detailed fraud analysis

### 3. Comment Analysis
- Analyze comment sentiment
- Bulk or individual analysis
- Filter by sentiment type
- View confidence scores

### 4. User Activity
- Monitor user behavior
- Track fraud attempts
- Flag or suspend users
- Risk assessment

### 5. Analytics
- Detailed reporting (Coming soon)

### 6. Settings
- Configure API endpoints
- Manage notifications
- Set detection thresholds

## 🛑 Stopping Services

### Stop Backend Services
```powershell
cd Backendnew\api-gateway
.\stop-services-local.ps1
```

### Stop Frontend
Press `Ctrl + C` in the terminal running `npm run dev`

## 🔧 Troubleshooting

### Backend Services Not Starting
1. Check if Python is installed: `python --version`
2. Verify dependencies: `pip list`
3. Check if ports are free: `netstat -ano | findstr "8001 8002 8003"`

### Frontend Not Loading
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Clear npm cache: `npm cache clean --force`
4. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### API Connection Issues
1. Verify backend services are running
2. Check browser console for errors (F12)
3. Test API endpoints directly in browser:
   - http://localhost:8001/docs
   - http://localhost:8002/docs
   - http://localhost:8003/docs

## 📝 First-Time Setup

### Backend Setup (One Time)

```powershell
# Rule-based Fraud Detection
cd Backendnew\ruleBasedFD
pip install fastapi uvicorn pydantic

# ML-based Fraud Detection
cd ..\mlBasedFD
pip install -r requirements.txt

# Sentiment Analysis
cd ..\Sentiment-Analysis-Service
pip install -r requirements.txt
```

### Frontend Setup (One Time)

```powershell
cd frontend
npm install
```

## 🎯 Development Workflow

### Typical Development Session

1. **Start Backend Services** (Terminal 1)
   ```powershell
   cd Backendnew\api-gateway
   .\start-services-local.ps1
   ```

2. **Start Frontend** (Terminal 2)
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Open Dashboard**
   - Go to http://localhost:3000
   - Start monitoring your platform!

4. **When Done**
   - Stop frontend: `Ctrl + C`
   - Stop backend: `.\stop-services-local.ps1`

## 🚀 Production Deployment

### Backend Deployment
- Use a process manager like PM2 or systemd
- Configure reverse proxy (Nginx)
- Set up SSL certificates
- Configure environment variables

### Frontend Deployment
```powershell
cd frontend
npm run build
```
Deploy the `dist/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Your web server

## 📚 Additional Documentation

- **Backend Services:** `Backendnew/api-gateway/README.md`
- **Frontend Dashboard:** `frontend/README.md`
- **API Documentation:** Access `/docs` endpoint on each service

## 🆘 Getting Help

1. Check service logs in the PowerShell windows
2. Review browser console for frontend errors
3. Test API endpoints directly
4. Check file organization: `Backendnew/api-gateway/FILE-ORGANIZATION.md`

## 🎉 Success Indicators

You know everything is working when:
- ✅ 3 PowerShell windows are running backend services
- ✅ Frontend terminal shows "Local: http://localhost:3000"
- ✅ Dashboard loads in browser
- ✅ You can analyze a post and see results
- ✅ Comment sentiment analysis works
- ✅ All API docs pages load

---

**Enjoy your Cleverly platform! 🎊**
