# Test script for API Gateway endpoints
Write-Host "Testing Cleverly API Gateway..." -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$baseUrl = "http://localhost"

# Test 1: Gateway Health Check
Write-Host "1. Testing Gateway Health Check..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Health Check: $response" -ForegroundColor Green
} catch {
    Write-Host "✗ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 2: Gateway Info
Write-Host "2. Testing Gateway Info..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✓ Gateway Info:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ Gateway Info Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 3: Rule-based Fraud Detection
Write-Host "3. Testing Rule-based Fraud Detection..." -ForegroundColor Cyan
try {
    $body = @{
        text = "This is an amazing product! Best purchase ever!"
        user_id = "user123"
        rating = 5
        timestamp = "2025-10-07T10:00:00"
        ip_address = "192.168.1.1"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/rule-fraud/detect" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Rule-based Detection:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ Rule-based Detection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 4: ML-based Fraud Detection
Write-Host "4. Testing ML-based Fraud Detection..." -ForegroundColor Cyan
try {
    $body = @{
        text = "This product is terrible and fake, complete waste of money"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/ml-fraud/detection" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ ML-based Detection:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ ML-based Detection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 5: Sentiment Analysis
Write-Host "5. Testing Sentiment Analysis..." -ForegroundColor Cyan
try {
    $body = @{
        text = "I absolutely love this product! It's fantastic and exceeded my expectations!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/sentiment/sentiment" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Sentiment Analysis:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ Sentiment Analysis Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
