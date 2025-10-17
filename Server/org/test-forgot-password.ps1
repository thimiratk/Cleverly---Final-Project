# Test Forgot Password API
# This script tests if the forgot password endpoint is accessible

$baseUrl = "http://localhost:8080"
$testEmail = "test@example.com"

Write-Host "🧪 Testing Forgot Password API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if API gateway is running
Write-Host "1️⃣  Testing API Gateway health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/gateway-health" -Method Get
    Write-Host "   ✅ API Gateway is running: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API Gateway is not responding" -ForegroundColor Red
    Write-Host "   Please start the server with 'npm run dev'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Check if forgot-password endpoint is accessible (will fail validation but shouldn't be 404)
Write-Host "2️⃣  Testing /api/forgot-password endpoint..." -ForegroundColor Yellow
try {
    $body = @{ email = $testEmail } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/forgot-password" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Endpoint is accessible and returned: $($response.message)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    if ($statusCode -eq 404) {
        Write-Host "   ❌ 404 Not Found - Route is still missing!" -ForegroundColor Red
        Write-Host "   Please restart the server to apply routing changes" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400 -or $statusCode -eq 422) {
        Write-Host "   ✅ Endpoint is accessible (returned validation error - this is expected)" -ForegroundColor Green
        Write-Host "   Error: $errorBody" -ForegroundColor Gray
    } elseif ($statusCode -eq 502) {
        Write-Host "   ⚠️  Bad Gateway - Auth service (port 6001) may not be running" -ForegroundColor Yellow
        Write-Host "   Please start auth service" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  Got status code: $statusCode" -ForegroundColor Yellow
        Write-Host "   Response: $errorBody" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. If you see 404 errors, restart the server: npm run dev" -ForegroundColor White
Write-Host "2. Test the forgot password flow in the frontend" -ForegroundColor White
Write-Host "3. Check server console for detailed logs" -ForegroundColor White
