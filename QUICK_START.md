# ⚡ Quick Start - Cleverly Platform

## Fastest Way to Run Everything

### 🎯 3-Terminal Setup (Recommended for Development)

#### Terminal 1️⃣ - Backend Services
```powershell
cd Server\org
npm install          # First time only
npm run dev          # Starts all Node.js microservices
```
✅ Running on ports 3333+ (API Gateway on 3333)

#### Terminal 2️⃣ - Frontend
```powershell
cd frontend
npm install          # First time only
npm run dev          # Starts React app
```
✅ Open http://localhost:5173

#### Terminal 3️⃣ - Python ML Services (Optional)
```powershell
cd Backend\api-gateway
.\start-services.ps1  # Opens 4 windows for Python services
```
✅ ML services on ports 8001-8004

---

## 🔧 First Time Setup Only

### 1. Prerequisites
- [x] Node.js installed
- [x] Python installed
- [x] PostgreSQL running
- [x] Database created: `CREATE DATABASE cleverly_db;`

### 2. Configure Environment
Create `Server\org\.env`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/cleverly_db"
JWT_SECRET="your-secret-here"
PORT=3333
```

### 3. Setup Database
```powershell
cd Server\org
npx prisma generate
npx prisma db push
```

### 4. Install Python Dependencies
```powershell
cd Backend\ruleBasedFD
pip install -r requirements.txt

cd ..\mlBasedFD
pip install -r requirements.txt

cd ..\Sentiment-Analysis-Service
pip install -r requirements.txt

cd ..\stanceDetection
pip install -r requirements.txt
```

---

## 🚀 Daily Development Start

```powershell
# 1. Start Backend (Terminal 1)
cd Server\org
npm run dev

# 2. Start Frontend (Terminal 2)
cd frontend
npm run dev

# 3. (Optional) Start Python Services (Terminal 3)
cd Backend\api-gateway
.\start-services.ps1
```

**Access Application**: http://localhost:5173

---

## 🛑 Stop Services

- **Backend/Frontend**: Press `Ctrl + C` in each terminal
- **Python Services**: Close the terminal windows OR run `.\stop-services.ps1`

---

## 🧪 Quick Test

```powershell
# Test Backend
curl http://localhost:3333/api/reviews

# Test Frontend
# Open browser: http://localhost:5173
```

---

## ⚠️ Troubleshooting

### Port Already in Use?
```powershell
netstat -ano | findstr :3333
taskkill /PID <process_id> /F
```

### Database Connection Error?
```powershell
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
```

### Prisma Client Error?
```powershell
cd Server\org
npx prisma generate
```

---

## 📊 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API Gateway | 3333 | http://localhost:3333 |
| Auth Service | 3000 | Internal |
| Review Service | 3001 | Internal |
| User Profile | 3002 | Internal |
| Rule-based Fraud | 8001 | http://localhost:8001 |
| ML Fraud Detection | 8002 | http://localhost:8002 |
| Sentiment Analysis | 8003 | http://localhost:8003 |
| Stance Detection | 8004 | http://localhost:8004 |

---

## 📚 More Help?

See detailed guide: `HOW_TO_RUN_CLEVERLY.md`

**Happy Coding! 🎉**
