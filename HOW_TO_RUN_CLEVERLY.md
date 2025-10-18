# 🚀 How to Run Cleverly - Complete Guide

## Overview
Cleverly is a full-stack social media platform for consumer reviews with microservices architecture.

## System Architecture
```
Frontend (React + Vite) → API Gateway (Nginx) → Microservices
                                               ├─ Backend Services (NX Monorepo)
                                               │  ├─ Auth Service
                                               │  ├─ Review Service
                                               │  ├─ User Profile Service
                                               │  ├─ User Interactions
                                               │  └─ Domain Management
                                               │
                                               └─ Python ML Services
                                                  ├─ Rule-based Fraud Detection
                                                  ├─ ML-based Fraud Detection
                                                  ├─ Sentiment Analysis
                                                  └─ Stance Detection
```

---

## 📋 Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/

2. **Python** (v3.9 or higher)
   - Download: https://www.python.org/downloads/

3. **PostgreSQL** (v14 or higher)
   - Download: https://www.postgresql.org/download/

4. **Redis** (Optional - for caching)
   - Windows: https://github.com/microsoftarchive/redis/releases
   - Or use Docker: `docker run -d -p 6379:6379 redis`

5. **Docker Desktop** (Optional - for API Gateway)
   - Download: https://www.docker.com/products/docker-desktop/

---

## 🎯 Quick Start (Recommended)

### Step 1: Setup Database

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE cleverly_db;
   ```

2. **Configure Environment**
   ```powershell
   cd Server\org
   # Create .env file (copy from .env.example if exists)
   ```

   Add to `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/cleverly_db"
   JWT_SECRET="your-secret-key-here"
   PORT=3333
   ```

### Step 2: Install Dependencies

**Backend (Node.js Microservices):**
```powershell
cd Server\org
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

**Python ML Services:**
```powershell
# Rule-based Fraud Detection
cd Backend\ruleBasedFD
pip install -r requirements.txt

# ML-based Fraud Detection
cd ..\mlBasedFD
pip install -r requirements.txt

# Sentiment Analysis
cd ..\Sentiment-Analysis-Service
pip install -r requirements.txt

# Stance Detection
cd ..\stanceDetection
pip install -r requirements.txt
```

### Step 3: Setup Database Schema

```powershell
cd Server\org
npx prisma generate
npx prisma db push
# Or if you have migrations:
npx prisma migrate deploy
```

### Step 4: Start Services

**Open 3 separate terminal windows:**

**Terminal 1 - Backend Services:**
```powershell
cd Server\org
npm run dev
```
This starts all Node.js microservices on ports 3333+

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

**Terminal 3 - Python ML Services (Optional but Recommended):**
```powershell
cd Backend\api-gateway
.\start-services.ps1
```
This opens separate windows for each Python service.

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3333
- **API Gateway**: http://localhost (if running)

---

## 🔧 Detailed Setup Instructions

### Option A: Development Mode (All Services Separate)

#### 1. Backend Node.js Services

```powershell
cd Server\org

# Install dependencies
npm install

# Setup environment
# Edit .env file with your configurations

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start all microservices
npm run dev
```

**Services will start on:**
- Auth Service: Port 3000
- Review Service: Port 3001
- User Profile: Port 3002
- User Interactions: Port 3003
- Domain Management: Port 3004
- API Gateway: Port 3333

#### 2. Frontend Application

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Access at: http://localhost:5173

#### 3. Python ML Services

**Manual Start (Each in separate terminal):**

```powershell
# Terminal 1 - Rule-based Fraud Detection
cd Backend\ruleBasedFD
pip install -r requirements.txt
uvicorn ruleAPI:app --host 0.0.0.0 --port 8001

# Terminal 2 - ML-based Fraud Detection
cd Backend\mlBasedFD
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8002

# Terminal 3 - Sentiment Analysis
cd Backend\Sentiment-Analysis-Service
pip install -r requirements.txt
uvicorn sentiment_api:app --host 0.0.0.0 --port 8003

# Terminal 4 - Stance Detection
cd Backend\stanceDetection
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8004
```

**Or use the automation script:**

```powershell
cd Backend\api-gateway
.\start-services.ps1
```

### Option B: Using Docker (API Gateway + Python Services)

```powershell
cd Backend\api-gateway

# Build and start all Python services
docker-compose up --build

# Access via Nginx gateway
curl http://localhost
```

---

## 📁 Project Structure

```
Cleverly---Final-Project/
├── Server/org/                    # Node.js Microservices (NX Monorepo)
│   ├── apps/
│   │   ├── auth-service/         # Authentication & Authorization
│   │   ├── review-service/       # Review Management
│   │   ├── user-profile/         # User Profiles
│   │   ├── user-interactions/    # Likes, Comments, Follows
│   │   └── domain-management/    # Categories, Badges
│   ├── prisma/                   # Database Schema
│   └── package.json
│
├── frontend/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Reusable Components
│   │   ├── pages/                # Page Components
│   │   ├── hooks/                # Custom Hooks
│   │   └── services/             # API Services
│   └── package.json
│
├── Backend/                       # Python ML Services
│   ├── ruleBasedFD/              # Rule-based Fraud Detection
│   ├── mlBasedFD/                # ML-based Fraud Detection
│   ├── Sentiment-Analysis-Service/
│   ├── stanceDetection/          # Stance Detection
│   └── api-gateway/              # Nginx Gateway Config
│
├── admin-dashboard/               # Admin Dashboard (Separate)
└── dashboards/                    # Other Dashboards
```

---

## 🧪 Testing the Setup

### 1. Test Backend API

```powershell
# Health check
curl http://localhost:3333/health

# Get reviews
curl http://localhost:3333/api/reviews
```

### 2. Test Frontend

Open browser: http://localhost:5173

### 3. Test Python Services

```powershell
# Rule-based Fraud Detection
$body = @{ text = "Great product!"; user_id = "user123"; rating = 5 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8001/api/detect" -Method POST -Body $body -ContentType "application/json"

# Sentiment Analysis
$body = @{ text = "I love this product!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8003/api/sentiment" -Method POST -Body $body -ContentType "application/json"

# Stance Detection
$body = @{ review_text = "iPhone is great"; comment_text = "I agree" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8004/api/detect-stance" -Method POST -Body $body -ContentType "application/json"
```

---

## 🛑 Stopping Services

### Stop Backend Services
```powershell
# In the terminal running npm run dev
Ctrl + C
```

### Stop Frontend
```powershell
# In the terminal running npm run dev
Ctrl + C
```

### Stop Python Services
```powershell
# If using start-services.ps1
cd Backend\api-gateway
.\stop-services.ps1

# Or manually close each terminal window
```

### Stop Docker Services
```powershell
cd Backend\api-gateway
docker-compose down
```

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cleverly_db"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3333
NODE_ENV=development

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Frontend Environment Variables (.env)

```env
VITE_API_URL=http://localhost:3333/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🔥 Common Issues & Solutions

### Issue 1: Port Already in Use

**Problem:** "Port 3333 is already in use"

**Solution:**
```powershell
# Find and kill the process using the port
netstat -ano | findstr :3333
taskkill /PID <process_id> /F
```

### Issue 2: Prisma Client Not Generated

**Problem:** "Cannot find module '@prisma/client'"

**Solution:**
```powershell
cd Server\org
npx prisma generate
```

### Issue 3: Database Connection Error

**Problem:** "Can't reach database server"

**Solution:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Test connection: `psql -U username -d cleverly_db`

### Issue 4: Python Dependencies Error

**Problem:** "ModuleNotFoundError"

**Solution:**
```powershell
# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Issue 5: Frontend Not Connecting to Backend

**Problem:** CORS errors or connection refused

**Solution:**
1. Check backend is running on port 3333
2. Verify VITE_API_URL in frontend/.env
3. Check CORS configuration in backend

---

## 📚 Additional Commands

### Database Commands

```powershell
cd Server\org

# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Seed database (if seeder exists)
npx prisma db seed
```

### Build for Production

**Backend:**
```powershell
cd Server\org
npx nx build --all
```

**Frontend:**
```powershell
cd frontend
npm run build
```

---

## 🎓 Development Workflow

1. **Start Backend Services**: `cd Server\org && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Start Python Services** (if needed): `cd Backend\api-gateway && .\start-services.ps1`
4. **Make Changes**: Edit code in your preferred editor
5. **Hot Reload**: Changes automatically reload
6. **Test**: Use the application at http://localhost:5173

---

## 📞 Getting Help

- Check documentation files in the root directory
- Review API documentation at http://localhost:3333/api-docs (if configured)
- Check console logs for errors
- Verify all services are running

---

## ✅ Checklist for First Time Setup

- [ ] Install Node.js
- [ ] Install Python
- [ ] Install PostgreSQL
- [ ] Create database
- [ ] Clone repository
- [ ] Install backend dependencies (`Server\org`)
- [ ] Install frontend dependencies (`frontend`)
- [ ] Install Python dependencies (each service)
- [ ] Configure .env files
- [ ] Run Prisma migrations
- [ ] Start backend services
- [ ] Start frontend
- [ ] Start Python services (optional)
- [ ] Access application at http://localhost:5173

---

## 🚀 You're Ready!

Once all services are running:
1. Open http://localhost:5173 in your browser
2. Create an account or login
3. Start exploring the platform!

**Happy Coding! 🎉**
