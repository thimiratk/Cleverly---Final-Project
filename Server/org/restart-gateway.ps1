# Restart API Gateway Script
# This will restart the API gateway to apply the new routing changes

Write-Host "🔄 Restarting API Gateway to apply routing fixes..." -ForegroundColor Cyan
Write-Host ""

# Find and kill the API gateway process
$apiGatewayProcess = Get-Process -Name node -ErrorAction SilentlyContinue | 
    Where-Object { $_.MainWindowTitle -match "api-gateway" -or $_.CommandLine -match "api-gateway" }

if ($apiGatewayProcess) {
    Write-Host "⏹️  Stopping API Gateway process (PID: $($apiGatewayProcess.Id))..." -ForegroundColor Yellow
    Stop-Process -Id $apiGatewayProcess.Id -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ API Gateway stopped" -ForegroundColor Green
} else {
    Write-Host "⚠️  No API Gateway process found running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Please restart the server with 'npm run dev' to apply the changes" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes applied:" -ForegroundColor Green
Write-Host "  ✅ Added /api/forgot-password route" -ForegroundColor Green
Write-Host "  ✅ Added /api/verify-forgot-password-otp route" -ForegroundColor Green
Write-Host "  ✅ Added /api/reset-password route" -ForegroundColor Green
Write-Host "  ✅ Fixed SMTP secure configuration" -ForegroundColor Green
Write-Host "  ✅ Added error handling in sendOtp" -ForegroundColor Green
