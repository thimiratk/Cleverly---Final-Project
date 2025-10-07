# PowerShell script to stop all services
Write-Host "Stopping Cleverly Backend Services..." -ForegroundColor Red

# Function to stop processes on a specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc -Force
                Write-Host "Stopped process on port $Port (PID: $proc)" -ForegroundColor Yellow
            } catch {
                Write-Host "Could not stop process $proc" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No process found on port $Port" -ForegroundColor Gray
    }
}

# Stop services on their respective ports
Write-Host "Stopping Rule-based Fraud Detection (Port 8001)..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 8001

Write-Host "Stopping ML-based Fraud Detection (Port 8002)..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 8002

Write-Host "Stopping Sentiment Analysis (Port 8003)..." -ForegroundColor Cyan
Stop-ProcessOnPort -Port 8003

Write-Host "`nAll services stopped!" -ForegroundColor Green
