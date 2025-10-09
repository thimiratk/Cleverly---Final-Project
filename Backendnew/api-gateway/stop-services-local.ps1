# Stop all locally running services
Write-Host "Stopping Cleverly Services..." -ForegroundColor Red

# Find and kill processes running on the service ports
$ports = @(8001, 8002, 8003)

foreach ($port in $ports) {
    Write-Host "Stopping service on port $port..." -ForegroundColor Yellow
    
    # Find processes using the port
    $processes = netstat -ano | findstr ":$port" | ForEach-Object {
        $_ -match '\s+(\d+)$' | Out-Null
        $matches[1]
    } | Select-Object -Unique
    
    foreach ($processId in $processes) {
        if ($processId) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  Stopped process $processId on port $port" -ForegroundColor Green
            }
            catch {
                Write-Host "  Could not stop process $processId" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nAll services stopped!" -ForegroundColor Green
