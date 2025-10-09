# API Gateway Setup (Without Docker)

This guide explains how to run the API Gateway and services directly without Docker containerization.

## Prerequisites

1. **Python 3.11+** installed
2. **Nginx** installed (for Windows, download from: https://nginx.org/en/download.html)
3. **Node.js** (if using auth-service)

## Architecture

The API Gateway uses Nginx to route requests to three backend services:
- **Rule-based Fraud Detection** (Port 8001)
- **ML-based Fraud Detection** (Port 8002)
- **Sentiment Analysis** (Port 8003)

## Setup Instructions

### Step 1: Install Service Dependencies

#### Rule-based Fraud Detection Service
```powershell
cd ..\ruleBasedFD
pip install fastapi uvicorn pydantic
```

#### ML-based Fraud Detection Service
```powershell
cd ..\mlBasedFD
pip install -r requirements.txt
```

#### Sentiment Analysis Service
```powershell
cd ..\Sentiment-Analysis-Service
pip install -r requirements.txt
```

### Step 2: Start the Services

You have two options:

#### Option A: Use the PowerShell Script (Recommended)
```powershell
cd api-gateway
.\start-services-local.ps1
```

#### Option B: Start Each Service Manually

Open 3 separate PowerShell terminals:

**Terminal 1 - Rule-based Fraud Detection:**
```powershell
cd Backendnew\ruleBasedFD
uvicorn ruleAPI:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - ML-based Fraud Detection:**
```powershell
cd Backendnew\mlBasedFD
uvicorn app:app --host 0.0.0.0 --port 8002 --reload
```

**Terminal 3 - Sentiment Analysis:**
```powershell
cd Backendnew\Sentiment-Analysis-Service
uvicorn sentiment_api:app --host 0.0.0.0 --port 8003 --reload
```

### Step 3: Configure and Start Nginx

1. **Install Nginx for Windows:**
   - Download from: https://nginx.org/en/download.html
   - Extract to `C:\nginx`

2. **Copy the configuration:**
   ```powershell
   copy nginx.conf C:\nginx\conf\nginx.conf
   ```

3. **Start Nginx:**
   ```powershell
   cd C:\nginx
   start nginx
   ```

4. **To reload Nginx configuration:**
   ```powershell
   nginx -s reload
   ```

5. **To stop Nginx:**
   ```powershell
   nginx -s stop
   ```

## Testing the API Gateway

Once all services and Nginx are running:

### Health Check
```powershell
curl http://localhost/health
```

### Test Rule-based Fraud Detection
```powershell
curl -X POST http://localhost/api/rule-fraud/detect `
  -H "Content-Type: application/json" `
  -d '{"review_text": "This is a test review", "rating": 5}'
```

### Test ML-based Fraud Detection
```powershell
curl -X POST http://localhost/api/ml-fraud/detection `
  -H "Content-Type: application/json" `
  -d '{"review_text": "This is a test review"}'
```

### Test Sentiment Analysis
```powershell
curl -X POST http://localhost/api/sentiment/sentiment `
  -H "Content-Type: application/json" `
  -d '{"text": "This product is amazing!"}'
```

## API Endpoints

All requests go through `http://localhost` (port 80)

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Gateway | `/health` | GET | Health check |
| Gateway | `/` | GET | API documentation |
| Rule Fraud | `/api/rule-fraud/detect` | POST | Single review detection |
| Rule Fraud | `/api/rule-fraud/detect-coordinated` | POST | Coordinated fraud detection |
| ML Fraud | `/api/ml-fraud/detection` | POST | ML-based detection |
| Sentiment | `/api/sentiment/sentiment` | POST | Sentiment analysis |

## Troubleshooting

### Port Already in Use
If a port is already in use, find and kill the process:
```powershell
# Find process using port 8001
netstat -ano | findstr :8001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Nginx Not Starting
- Check if port 80 is available
- Run PowerShell as Administrator
- Check Nginx error logs: `C:\nginx\logs\error.log`

### Service Not Responding
- Check if the service is running on the correct port
- Check service logs in the terminal
- Verify Python dependencies are installed

## Stopping Services

1. **Stop Nginx:**
   ```powershell
   cd C:\nginx
   nginx -s stop
   ```

2. **Stop Python services:**
   - Press `Ctrl+C` in each service terminal
   - Or use the stop script: `.\stop-services-local.ps1`

## Alternative: Run Without Nginx

If you don't want to set up Nginx, you can access the services directly:

- Rule-based Fraud Detection: `http://localhost:8001`
- ML-based Fraud Detection: `http://localhost:8002`
- Sentiment Analysis: `http://localhost:8003`

Each service has its own API documentation at `http://localhost:PORT/docs`
