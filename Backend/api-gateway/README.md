# Cleverly API Gateway

This API gateway uses Nginx as a reverse proxy to route requests to different microservices.

## Architecture

```
Client → Nginx Gateway (Port 80) → Backend Services
                                  ├─ Rule-based Fraud Detection (Port 8001)
                                  ├─ ML-based Fraud Detection (Port 8002)
                                  └─ Sentiment Analysis (Port 8003)
```

## Available Endpoints

### Rule-based Fraud Detection
- `POST /api/rule-fraud/detect` - Detect fraud in a single review
- `POST /api/rule-fraud/detect-coordinated` - Detect coordinated fraud attacks

### ML-based Fraud Detection
- `POST /api/ml-fraud/detection` - Detect fraud using ML model

### Sentiment Analysis
- `POST /api/sentiment/sentiment` - Analyze sentiment of text

### Gateway Info
- `GET /` - API gateway information and available endpoints
- `GET /health` - Health check

## Setup Options

### Option 1: Using Docker Compose (Recommended)

1. **Prerequisites:**
   - Install Docker Desktop for Windows
   - Ensure Docker is running

2. **Build and start all services:**
   ```powershell
   cd api-gateway
   docker-compose up --build
   ```

3. **Access the gateway:**
   - Gateway URL: http://localhost

4. **Stop services:**
   ```powershell
   docker-compose down
   ```

### Option 2: Manual Setup with Nginx on Windows

1. **Download Nginx for Windows:**
   - Download from: https://nginx.org/en/download.html
   - Extract to `C:\nginx` (or your preferred location)

2. **Replace the Nginx configuration:**
   ```powershell
   # Copy the configuration
   Copy-Item .\nginx.conf C:\nginx\conf\nginx.conf -Force
   ```

3. **Start the backend services manually:**
   ```powershell
   # Terminal 1 - Rule-based Fraud Detection
   cd ..\ruleBasedFD
   uvicorn ruleAPI:app --host 0.0.0.0 --port 8001

   # Terminal 2 - ML-based Fraud Detection
   cd ..\mlBasedFD
   uvicorn app:app --host 0.0.0.0 --port 8002

   # Terminal 3 - Sentiment Analysis
   cd ..\Sentiment-Analysis-Service
   uvicorn sentiment_api:app --host 0.0.0.0 --port 8003
   ```

4. **Start Nginx:**
   ```powershell
   cd C:\nginx
   start nginx
   ```

5. **Test the gateway:**
   ```powershell
   curl http://localhost
   ```

6. **Stop Nginx:**
   ```powershell
   cd C:\nginx
   nginx -s stop
   ```

### Option 3: Using Windows Start Scripts

Use the provided PowerShell scripts to manage services:

```powershell
# Start all services
.\start-services.ps1

# Stop all services
.\stop-services.ps1
```

## Testing the API

### Test Rule-based Fraud Detection
```powershell
$body = @{
    text = "This is an amazing product!"
    user_id = "user123"
    rating = 5
    timestamp = "2025-10-07T10:00:00"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost/api/rule-fraud/detect" -Method POST -Body $body -ContentType "application/json"
```

### Test ML-based Fraud Detection
```powershell
$body = @{
    text = "This product is terrible and fake"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost/api/ml-fraud/detection" -Method POST -Body $body -ContentType "application/json"
```

### Test Sentiment Analysis
```powershell
$body = @{
    text = "I love this product, it's amazing!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost/api/sentiment/sentiment" -Method POST -Body $body -ContentType "application/json"
```

## Rate Limiting

The gateway implements rate limiting:
- 10 requests per second per IP address
- Burst of 20 requests allowed

## CORS Configuration

CORS is enabled by default for all origins. For production, update the `nginx.conf` to specify allowed origins:

```nginx
add_header 'Access-Control-Allow-Origin' 'https://your-frontend-domain.com' always;
```

## Monitoring

### Check Nginx logs (if using local Nginx):
```powershell
# Access logs
Get-Content C:\nginx\logs\access.log -Tail 50 -Wait

# Error logs
Get-Content C:\nginx\logs\error.log -Tail 50 -Wait
```

### Check Docker logs (if using Docker):
```powershell
docker-compose logs -f
```

## Troubleshooting

### Port Already in Use
If port 80 is already in use, modify the `nginx.conf` or `docker-compose.yml` to use a different port:

```yaml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Service Not Responding
Check if backend services are running:
```powershell
# Check if ports are listening
netstat -ano | findstr "8001"
netstat -ano | findstr "8002"
netstat -ano | findstr "8003"
```

### Reload Nginx Configuration (without stopping):
```powershell
cd C:\nginx
nginx -s reload
```

## Production Considerations

1. **HTTPS/SSL:** Add SSL certificates for secure communication
2. **Authentication:** Implement JWT or API key authentication
3. **Logging:** Configure centralized logging
4. **Monitoring:** Add Prometheus/Grafana for metrics
5. **Load Balancing:** Add multiple instances of each service
6. **Security:** Implement IP whitelisting, API keys, etc.
