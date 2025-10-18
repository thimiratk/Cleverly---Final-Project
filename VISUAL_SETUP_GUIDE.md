# 🎯 Cleverly Platform - Visual Setup Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLEVERLY PLATFORM                            │
│              Consumer Reviews Social Network                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🏃 TL;DR - Get Running in 60 Seconds

### Double-click these files:
1. `START_CLEVERLY.ps1` → Starts everything
2. Wait 20 seconds
3. Browser opens automatically → http://localhost:5173
4. Done! 🎉

To stop: Double-click `STOP_CLEVERLY.ps1`

---

## 📊 Architecture Diagram

```
┌──────────────┐
│   Browser    │
│  (You!)      │
└──────┬───────┘
       │ HTTP
       ↓
┌──────────────────────────────────────────────────────┐
│              FRONTEND (Port 5173)                    │
│              React + Vite + TailwindCSS              │
└───────────────────────┬──────────────────────────────┘
                        │ REST API
                        ↓
┌──────────────────────────────────────────────────────┐
│         BACKEND API GATEWAY (Port 3333)              │
│              Node.js + Express + NX                  │
└───────┬────────────────────────────────────┬─────────┘
        │                                    │
        ↓                                    ↓
┌───────────────────┐              ┌─────────────────────┐
│  Microservices    │              │  Python ML Services │
│                   │              │                     │
│  • Auth (3000)    │              │  • Fraud (8001-02) │
│  • Reviews (3001) │              │  • Sentiment (8003)│
│  • Profile (3002) │              │  • Stance (8004)   │
│  • Interact (3003)│              └─────────────────────┘
│  • Domain (3004)  │
└─────────┬─────────┘
          │
          ↓
┌─────────────────────┐
│   PostgreSQL DB     │
│   (Port 5432)       │
└─────────────────────┘
```

---

## 🎬 Step-by-Step Visual Walkthrough

### Step 1: Check Prerequisites ✅

```
┌─────────────────────────────────────────┐
│  What You Need Installed:              │
├─────────────────────────────────────────┤
│  ✓ Node.js v18+                        │
│  ✓ Python 3.9+                         │
│  ✓ PostgreSQL 14+                      │
│  ✓ Git                                 │
└─────────────────────────────────────────┘

Check versions:
  node --version
  python --version
  psql --version
```

### Step 2: Database Setup 🗄️

```sql
-- In PostgreSQL (psql or pgAdmin)
CREATE DATABASE cleverly_db;

-- Verify
\l  -- Should see cleverly_db in the list
```

### Step 3: Configure Environment ⚙️

```
Server/org/.env
┌─────────────────────────────────────────┐
│ DATABASE_URL="postgresql://..."        │
│ JWT_SECRET="your-secret-key"           │
│ PORT=3333                               │
└─────────────────────────────────────────┘

frontend/.env  
┌─────────────────────────────────────────┐
│ VITE_API_URL=http://localhost:3333/api │
└─────────────────────────────────────────┘
```

### Step 4: Install Dependencies 📦

```
Terminal 1:                    Terminal 2:
┌─────────────────────┐       ┌─────────────────────┐
│ cd Server\org       │       │ cd frontend         │
│ npm install         │       │ npm install         │
│                     │       │                     │
│ npx prisma generate │       │                     │
│ npx prisma db push  │       │                     │
└─────────────────────┘       └─────────────────────┘

      ⏱️ Takes 2-5 minutes
```

### Step 5: Start Services 🚀

#### Option A: Automated (Recommended)
```
Double-click: START_CLEVERLY.ps1

Result:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Terminal 1  │  │  Terminal 2  │  │  Terminal 3  │
│   Backend    │  │   Frontend   │  │  Python ML   │
│  (Port 3333) │  │  (Port 5173) │  │ (8001-8004)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### Option B: Manual
```
┌─────────────────────────────────────────────────┐
│  Terminal 1: Backend                           │
│  cd Server\org                                 │
│  npm run dev                                   │
│                                                 │
│  ✅ Running on http://localhost:3333           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Terminal 2: Frontend                          │
│  cd frontend                                   │
│  npm run dev                                   │
│                                                 │
│  ✅ Running on http://localhost:5173           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Terminal 3: Python ML (Optional)              │
│  cd Backend\api-gateway                        │
│  .\start-services.ps1                          │
│                                                 │
│  ✅ Running on ports 8001-8004                 │
└─────────────────────────────────────────────────┘
```

---

## 🎮 Using the Platform

### 1. Access Frontend
```
┌───────────────────────────────────────┐
│  http://localhost:5173                │
├───────────────────────────────────────┤
│  👤 Register / Login                  │
│  📝 Create Reviews                    │
│  🔍 Search Users & Reviews            │
│  ❤️  Like, Comment, Follow            │
│  📊 View Analytics                    │
└───────────────────────────────────────┘
```

### 2. Test APIs
```powershell
# Get all reviews
curl http://localhost:3333/api/reviews

# Search reviews
curl "http://localhost:3333/api/reviews/search?q=phone"

# Search users
curl "http://localhost:3333/api/user-profile/search?q=john"
```

---

## 🛑 Stopping Services

### Method 1: Automated
```
Double-click: STOP_CLEVERLY.ps1

✅ Stops all services automatically
```

### Method 2: Manual
```
In each terminal window:
  Ctrl + C

Or close the terminal windows
```

---

## 🔥 Common Scenarios

### Scenario 1: Port Already in Use
```
Error: Port 3333 already in use

Solution:
┌─────────────────────────────────────┐
│ netstat -ano | findstr :3333       │
│ taskkill /PID <pid> /F             │
└─────────────────────────────────────┘
```

### Scenario 2: Database Connection Failed
```
Error: Can't reach database

Check:
  ✓ PostgreSQL is running
  ✓ Database 'cleverly_db' exists
  ✓ DATABASE_URL in .env is correct
  ✓ Username/password are correct
```

### Scenario 3: Prisma Client Not Found
```
Error: Cannot find @prisma/client

Solution:
┌─────────────────────────────────────┐
│ cd Server\org                       │
│ npx prisma generate                │
└─────────────────────────────────────┘
```

---

## 📈 Service Status Dashboard

```
┌─────────────────────────────────────────────────┐
│  SERVICE STATUS                                 │
├──────────────────┬──────────┬───────────────────┤
│ Service          │ Port     │ Status           │
├──────────────────┼──────────┼───────────────────┤
│ Frontend         │ 5173     │ 🟢 Running       │
│ API Gateway      │ 3333     │ 🟢 Running       │
│ Auth Service     │ 3000     │ 🟢 Running       │
│ Review Service   │ 3001     │ 🟢 Running       │
│ Profile Service  │ 3002     │ 🟢 Running       │
│ Interactions     │ 3003     │ 🟢 Running       │
│ Domain Mgmt      │ 3004     │ 🟢 Running       │
│ Fraud Detection  │ 8001-02  │ 🟡 Optional      │
│ Sentiment        │ 8003     │ 🟡 Optional      │
│ Stance Detection │ 8004     │ 🟡 Optional      │
└──────────────────┴──────────┴───────────────────┘

Legend: 🟢 Required  🟡 Optional
```

---

## 🎓 Learning Path

```
Day 1: Setup
  ↓
┌─────────────────────┐
│ 1. Install prereqs  │
│ 2. Clone repo       │
│ 3. Setup DB         │
│ 4. Configure .env   │
│ 5. Install deps     │
│ 6. Run migrations   │
└─────────────────────┘
  ↓
Day 2: Explore
  ↓
┌─────────────────────┐
│ 1. Start services   │
│ 2. Open frontend    │
│ 3. Create account   │
│ 4. Post review      │
│ 5. Test features    │
└─────────────────────┘
  ↓
Day 3: Development
  ↓
┌─────────────────────┐
│ 1. Explore code     │
│ 2. Make changes     │
│ 3. Test locally     │
│ 4. Commit & push    │
└─────────────────────┘
```

---

## 📞 Quick Reference

| Need to... | Run this... |
|------------|-------------|
| Start everything | `.\START_CLEVERLY.ps1` |
| Stop everything | `.\STOP_CLEVERLY.ps1` |
| Test backend | `curl http://localhost:3333/api/reviews` |
| Test frontend | Open http://localhost:5173 |
| View database | `npx prisma studio` |
| Check logs | Look in terminal windows |
| Reset DB | `cd Server\org && npx prisma migrate reset` |

---

## 🎯 Success Checklist

- [ ] All prerequisites installed
- [ ] Database created and running
- [ ] Dependencies installed (npm install)
- [ ] Environment files configured
- [ ] Database migrations run
- [ ] Backend services start successfully
- [ ] Frontend starts successfully
- [ ] Browser opens to http://localhost:5173
- [ ] Can register/login
- [ ] Can create a review
- [ ] Can search users/reviews

---

## 🌟 You're All Set!

```
     ╔═══════════════════════════════════════╗
     ║                                       ║
     ║   🎉 CLEVERLY IS NOW RUNNING! 🎉     ║
     ║                                       ║
     ║   Frontend: http://localhost:5173    ║
     ║   Backend:  http://localhost:3333    ║
     ║                                       ║
     ║        Happy Coding! 💻✨            ║
     ║                                       ║
     ╚═══════════════════════════════════════╝
```

**Need more help?** Check out:
- `QUICK_START.md` - Fast reference
- `HOW_TO_RUN_CLEVERLY.md` - Detailed guide
- `Backend/api-gateway/README.md` - ML services guide
