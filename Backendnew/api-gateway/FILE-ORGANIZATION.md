# 📁 File Organization - Docker vs Non-Docker Setup

## ✅ Active Files (Currently in Use - No Docker)

### PowerShell Scripts (For Running Services Locally)
- **`start-services-local.ps1`** - Start all three services without Docker
- **`stop-services-local.ps1`** - Stop all running services
- **`test-services-local.ps1`** - Test if services are responding

### Configuration Files
- **`nginx.conf`** - Nginx configuration (optional, for API Gateway routing)

### Documentation
- **`QUICKSTART-NO-DOCKER.md`** - Quick start guide for running without Docker
- **`SETUP-WITHOUT-DOCKER.md`** - Detailed setup instructions without Docker
- **`ARCHITECTURE.md`** - System architecture documentation
- **`README.md`** - General information

---

## 🗄️ Backup Files (Docker-Related - Not Currently Used)

These files have been renamed with `.backup` extension and are **NOT** active:

### Docker Configuration Files
- **`docker-compose.yml.backup`** - Docker Compose configuration (in api-gateway folder)
- **`../docker-compose.yml.backup`** - Root Docker Compose file

### Dockerfiles
- **`../mlBasedFD/Dockerfile.backup`** - ML Fraud Detection Docker config
- **`../ruleBasedFD/Dockerfile.backup`** - Rule-based Fraud Detection Docker config
- **`../Sentiment-Analysis-Service/Dockerfile.backup`** - Sentiment Analysis Docker config

### Old Scripts (Docker-Related)
- **`start-services.ps1.backup`** - Old service startup script
- **`stop-services.ps1.backup`** - Old service stop script
- **`test-gateway.ps1.backup`** - Old gateway testing script (requires Nginx)

---

## 🚀 How to Run the Services

### Option 1: Quick Start (Recommended)
```powershell
# Make sure you're in the api-gateway directory
cd Backendnew\api-gateway

# Start all services
.\start-services-local.ps1

# Test services (optional)
.\test-services-local.ps1
```

### Option 2: Manual Start
Open 3 separate PowerShell terminals and run:

**Terminal 1:**
```powershell
cd Backendnew\ruleBasedFD
uvicorn ruleAPI:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2:**
```powershell
cd Backendnew\mlBasedFD
uvicorn app:app --host 0.0.0.0 --port 8002 --reload
```

**Terminal 3:**
```powershell
cd Backendnew\Sentiment-Analysis-Service
uvicorn sentiment_api:app --host 0.0.0.0 --port 8003 --reload
```

---

## 🛑 How to Stop the Services

```powershell
cd Backendnew\api-gateway
.\stop-services-local.ps1
```

Or simply close the PowerShell windows running the services.

---

## 📊 Service URLs

Once running, access the services at:

- **Rule-based Fraud Detection**: http://localhost:8001/docs
- **ML-based Fraud Detection**: http://localhost:8002/docs
- **Sentiment Analysis**: http://localhost:8003/docs

---

## 🔄 Restoring Docker Setup (If Needed)

If you want to use Docker again in the future:

1. Remove the `.backup` extension from all Docker files:
   ```powershell
   Move-Item "docker-compose.yml.backup" "docker-compose.yml"
   Move-Item "../mlBasedFD/Dockerfile.backup" "../mlBasedFD/Dockerfile"
   Move-Item "../ruleBasedFD/Dockerfile.backup" "../ruleBasedFD/Dockerfile"
   Move-Item "../Sentiment-Analysis-Service/Dockerfile.backup" "../Sentiment-Analysis-Service/Dockerfile"
   ```

2. Run Docker Compose:
   ```powershell
   docker-compose up --build
   ```

---

## 📝 Notes

- All services are currently configured to run **without Docker**
- Docker files are preserved as backups for future use
- The current setup is simpler and faster for development
- No containerization overhead or build times

---

## 🆘 Need Help?

- See `QUICKSTART-NO-DOCKER.md` for quick start guide
- See `SETUP-WITHOUT-DOCKER.md` for detailed setup instructions
- Check service logs in the PowerShell windows where they're running
