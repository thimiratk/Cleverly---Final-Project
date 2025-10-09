# Quick Start Guide - Running Services Without Docker

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies (One Time Setup)

Run these commands in PowerShell:

```powershell
# Install Rule-based Fraud Detection dependencies
cd Backendnew\ruleBasedFD
pip install fastapi uvicorn pydantic

# Install ML-based Fraud Detection dependencies
cd ..\mlBasedFD
pip install -r requirements.txt

# Install Sentiment Analysis dependencies
cd ..\Sentiment-Analysis-Service
pip install -r requirements.txt
```

### Step 2: Start All Services

Navigate to the api-gateway folder and run:

```powershell
cd Backendnew\api-gateway
.\start-services-local.ps1
```

This will open 3 PowerShell windows, one for each service.

### Step 3: Test the Services

```powershell
.\test-services-local.ps1
```

## 📍 Service URLs

Once started, access your services at:

- **Rule-based Fraud Detection**: http://localhost:8001/docs
- **ML-based Fraud Detection**: http://localhost:8002/docs
- **Sentiment Analysis**: http://localhost:8003/docs

## 🛑 Stopping Services

To stop all services:

```powershell
.\stop-services-local.ps1
```

Or simply close the PowerShell windows running the services.

## 🔧 Optional: Add Nginx API Gateway

If you want to use Nginx as an API gateway (to route all requests through `http://localhost`):

1. Download Nginx for Windows: https://nginx.org/en/download.html
2. Extract to `C:\nginx`
3. Copy the configuration:
   ```powershell
   copy nginx.conf C:\nginx\conf\nginx.conf
   ```
4. Start Nginx:
   ```powershell
   cd C:\nginx
   start nginx
   ```

Then access all services through: `http://localhost/api/...`

## 🧪 Testing Examples

### Test Rule-based Fraud Detection
```powershell
curl -X POST http://localhost:8001/detect `
  -H "Content-Type: application/json" `
  -d '{\"review_text\": \"This is an amazing product!\", \"rating\": 5}'
```

### Test ML-based Fraud Detection
```powershell
curl -X POST http://localhost:8002/detection `
  -H "Content-Type: application/json" `
  -d '{\"review_text\": \"Great quality and fast shipping\"}'
```

### Test Sentiment Analysis
```powershell
curl -X POST http://localhost:8003/sentiment `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"I love this product!\"}'
```

## 📖 Full Documentation

For more details, see [SETUP-WITHOUT-DOCKER.md](SETUP-WITHOUT-DOCKER.md)
