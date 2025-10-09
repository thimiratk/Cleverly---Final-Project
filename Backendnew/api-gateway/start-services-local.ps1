# Start all services locally (without Docker)
# Run this from the api-gateway directory

Write-Host "Starting Cleverly Services..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Get the parent directory (Backendnew)
$backendPath = Split-Path -Parent $PSScriptRoot

# Start Rule-based Fraud Detection Service
Write-Host "`nStarting Rule-based Fraud Detection Service on port 8001..." -ForegroundColor Cyan
$ruleBasedPath = Join-Path $backendPath "ruleBasedFD"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ruleBasedPath'; Write-Host 'Rule-based Fraud Detection Service' -ForegroundColor Yellow; uvicorn ruleAPI:app --host 0.0.0.0 --port 8001 --reload"

Start-Sleep -Seconds 2

# Start ML-based Fraud Detection Service
Write-Host "Starting ML-based Fraud Detection Service on port 8002..." -ForegroundColor Cyan
$mlBasedPath = Join-Path $backendPath "mlBasedFD"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mlBasedPath'; Write-Host 'ML-based Fraud Detection Service' -ForegroundColor Yellow; uvicorn app:app --host 0.0.0.0 --port 8002 --reload"

Start-Sleep -Seconds 2

# Start Sentiment Analysis Service
Write-Host "Starting Sentiment Analysis Service on port 8003..." -ForegroundColor Cyan
$sentimentPath = Join-Path $backendPath "Sentiment-Analysis-Service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$sentimentPath'; Write-Host 'Sentiment Analysis Service' -ForegroundColor Yellow; uvicorn sentiment_api:app --host 0.0.0.0 --port 8003 --reload"

Write-Host "`n================================" -ForegroundColor Green
Write-Host "All services started!" -ForegroundColor Green
Write-Host "`nServices running on:" -ForegroundColor White
Write-Host "  - Rule-based Fraud Detection: http://localhost:8001" -ForegroundColor White
Write-Host "  - ML-based Fraud Detection:   http://localhost:8002" -ForegroundColor White
Write-Host "  - Sentiment Analysis:         http://localhost:8003" -ForegroundColor White
Write-Host "`nAPI Documentation available at:" -ForegroundColor White
Write-Host "  - http://localhost:8001/docs" -ForegroundColor White
Write-Host "  - http://localhost:8002/docs" -ForegroundColor White
Write-Host "  - http://localhost:8003/docs" -ForegroundColor White
Write-Host "`nTo stop services, close the individual PowerShell windows or use stop-services-local.ps1" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green
