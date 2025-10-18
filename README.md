# Cleverly - Social Media Platform for Consumer Reviews

A full-stack social media platform built with React, Node.js microservices, and Python ML services for consumer reviews with fraud detection, sentiment analysis, and stance detection capabilities.

## 🚀 Quick Start

### Automated Start (Easiest)
```powershell
.\START_CLEVERLY.ps1
```
This opens all services in separate windows and launches the browser automatically.

### Manual Start
```powershell
# Terminal 1 - Backend
cd Server\org
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Terminal 3 - ML Services (Optional)
cd Backend\api-gateway
.\start-services.ps1
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3333

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Fast setup in 3 terminals
- **[Complete Setup Guide](HOW_TO_RUN_CLEVERLY.md)** - Detailed installation and configuration
- **[API Gateway Guide](Backend/api-gateway/README.md)** - Python ML services setup

## 🛑 Stop Services

```powershell
.\STOP_CLEVERLY.ps1
```
Or press `Ctrl+C` in each terminal window.

## 🏗️ Architecture

```
Frontend (React + Vite) → Backend (Node.js Microservices) → Database (PostgreSQL)
                       ↓
              Python ML Services (FastAPI)
              ├─ Fraud Detection
              ├─ Sentiment Analysis
              └─ Stance Detection
```

## 🔧 Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- Tanstack Query
- Axios

### Backend
- Node.js + Express
- NX Monorepo
- PostgreSQL + Prisma
- JWT Authentication
- Socket.io (Real-time)

### ML Services
- Python + FastAPI
- TensorFlow/PyTorch
- NLP Models
- Scikit-learn

## 📋 Prerequisites

- Node.js v18+
- Python 3.9+
- PostgreSQL 14+
- npm or yarn

## 🔨 First Time Setup

1. **Install dependencies**
   ```powershell
   cd Server\org && npm install
   cd frontend && npm install
   ```

2. **Setup database**
   ```powershell
   cd Server\org
   npx prisma generate
   npx prisma db push
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env` in `Server/org`
   - Update database connection string
   - Set JWT secret

4. **Start services** (see Quick Start above)

## 📁 Project Structure

```
├── Server/org/              # Node.js Microservices
│   ├── apps/               # Individual services
│   ├── prisma/             # Database schema
│   └── packages/           # Shared packages
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   └── public/
│
├── Backend/               # Python ML Services
│   ├── ruleBasedFD/      # Rule-based fraud detection
│   ├── mlBasedFD/        # ML fraud detection
│   ├── Sentiment-Analysis-Service/
│   ├── stanceDetection/
│   └── api-gateway/      # Nginx gateway
│
└── admin-dashboard/      # Admin panel
```

## 🎯 Features

- ✅ User authentication & authorization
- ✅ Review creation and management
- ✅ Real-time notifications
- ✅ Fraud detection (Rule-based + ML)
- ✅ Sentiment analysis
- ✅ Stance detection
- ✅ User profiles & badges
- ✅ Trust score system
- ✅ Search functionality (reviews & users)
- ✅ Follow system
- ✅ Comments & interactions
- ✅ Admin dashboard

## 🧪 Testing

```powershell
# Backend tests
cd Server\org
npm test

# Frontend tests
cd frontend
npm test
```

## 🔐 Environment Variables

See [HOW_TO_RUN_CLEVERLY.md](HOW_TO_RUN_CLEVERLY.md#configuration) for complete environment configuration.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the Cleverly Team

## 📞 Support

For issues and questions, please check the documentation files or create an issue on GitHub.

---

**Happy Coding! 🎉**
