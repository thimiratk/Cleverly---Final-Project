# PowerShell script to start all services manually
Write-Host "Starting Cleverly Backend Services..." -ForegroundColor Green

# Function to start a service in a new PowerShell window
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "Starting $ServiceName on $Path..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host 'Starting $ServiceName...' -ForegroundColor Yellow; $Command"
}

# Get the backend directory
$BackendDir = Split-Path -Parent $PSScriptRoot

# Start each service
Start-Service -ServiceName "Rule-based Fraud Detection" `
              -Path "$BackendDir\ruleBasedFD" `
              -Command "uvicorn ruleAPI:app --host 0.0.0.0 --port 8001 --reload"

Start-Sleep -Seconds 2

Start-Service -ServiceName "ML-based Fraud Detection" `
              -Path "$BackendDir\mlBasedFD" `
              -Command "uvicorn app:app --host 0.0.0.0 --port 8002 --reload"

Start-Sleep -Seconds 2

Start-Service -ServiceName "Sentiment Analysis" `
              -Path "$BackendDir\Sentiment-Analysis-Service" `
              -Command "uvicorn sentiment_api:app --host 0.0.0.0 --port 8003 --reload"

Start-Sleep -Seconds 2

Start-Service -ServiceName "Stance Detection" `
              -Path "$BackendDir\stanceDetection" `
              -Command "uvicorn app:app --host 0.0.0.0 --port 8004 --reload"

Start-Sleep -Seconds 2

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Rule-based Fraud Detection: http://localhost:8001" -ForegroundColor Yellow
Write-Host "ML-based Fraud Detection:   http://localhost:8002" -ForegroundColor Yellow
Write-Host "Sentiment Analysis:         http://localhost:8003" -ForegroundColor Yellow
Write-Host "Stance Detection:           http://localhost:8004" -ForegroundColor Yellow
Write-Host "`nIf using Nginx gateway:    http://localhost" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in each window to stop services" -ForegroundColor Gray
