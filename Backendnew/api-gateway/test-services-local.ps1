# Test if all services are running and responding
Write-Host "Testing Cleverly Services..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$services = @(
    @{Name="Rule-based Fraud Detection"; Port=8001; Url="http://localhost:8001/docs"},
    @{Name="ML-based Fraud Detection"; Port=8002; Url="http://localhost:8002/docs"},
    @{Name="Sentiment Analysis"; Port=8003; Url="http://localhost:8003/docs"}
)

foreach ($service in $services) {
    Write-Host "`nTesting $($service.Name) on port $($service.Port)..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  Service is running and responding" -ForegroundColor Green
            Write-Host "  URL: $($service.Url)" -ForegroundColor White
        }
    }
    catch {
        Write-Host "  Service is not responding" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "Test complete!" -ForegroundColor Green
