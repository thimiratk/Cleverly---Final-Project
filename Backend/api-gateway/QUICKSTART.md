# Quick Start Guide - Nginx API Gateway

## 🚀 Fastest Way to Get Started

### Option A: Docker Compose (Easiest - Recommended)

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Start Docker Desktop

2. **Start Everything**
   ```powershell
   cd api-gateway
   docker-compose up --build
   ```

3. **Test**
   ```powershell
   curl http://localhost
   ```

### Option B: Manual Setup (No Docker Required)

1. **Start Backend Services**
   ```powershell
   cd api-gateway
   .\start-services.ps1
   ```
   This will open 3 terminal windows for each service.

2. **Download & Setup Nginx** (One-time)
   - Download: https://nginx.org/en/download.html (Windows version)
   - Extract to `C:\nginx`
   - Copy config: `Copy-Item api-gateway\nginx.conf C:\nginx\conf\nginx.conf -Force`

3. **Start Nginx**
   ```powershell
   cd C:\nginx
   start nginx
   ```

4. **Test**
   ```powershell
   cd api-gateway
   .\test-gateway.ps1
   ```

## 📋 API Endpoints

All requests go through: `http://localhost`

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Gateway | `/` | GET | API info |
| Gateway | `/health` | GET | Health check |
| Rule Fraud | `/api/rule-fraud/detect` | POST | Single review fraud check |
| Rule Fraud | `/api/rule-fraud/detect-coordinated` | POST | Coordinated attack detection |
| ML Fraud | `/api/ml-fraud/detection` | POST | ML-based fraud detection |
| Sentiment | `/api/sentiment/sentiment` | POST | Sentiment analysis |

## 🧪 Quick Test Examples

### Rule-based Fraud Detection
```powershell
$body = @{ text = "Amazing product!"; user_id = "user123"; rating = 5; timestamp = "2025-10-07T10:00:00" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost/api/rule-fraud/detect" -Method POST -Body $body -ContentType "application/json"
```

### ML-based Fraud Detection
```powershell
$body = @{ text = "This product is terrible and fake" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost/api/ml-fraud/detection" -Method POST -Body $body -ContentType "application/json"
```

### Sentiment Analysis
```powershell
$body = @{ text = "I love this product!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost/api/sentiment/sentiment" -Method POST -Body $body -ContentType "application/json"
```

## 🛑 Stopping Services

### Docker:
```powershell
docker-compose down
```

### Manual:
```powershell
# Stop backend services
.\stop-services.ps1

# Stop Nginx
cd C:\nginx
nginx -s stop
```

## 🔧 Troubleshooting

**Port 80 already in use?**
- Change port in `docker-compose.yml`: `ports: - "8080:80"`
- Or in `nginx.conf`: `listen 8080;`

**Services not starting?**
- Check if Python is installed: `python --version`
- Install dependencies: `pip install fastapi uvicorn`

**Nginx not found?**
- Make sure you extracted it to `C:\nginx`
- Or update paths in scripts

## 📁 Project Structure
```
api-gateway/
├── nginx.conf              # Nginx configuration
├── docker-compose.yml      # Docker setup
├── start-services.ps1      # Start all services
├── stop-services.ps1       # Stop all services
├── test-gateway.ps1        # Test all endpoints
├── QUICKSTART.md          # This file
└── README.md              # Detailed documentation
```

## Need Help?
See the full [README.md](README.md) for detailed documentation.
