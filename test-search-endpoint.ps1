# Test Search Endpoint

Write-Host "Testing Search Endpoint..." -ForegroundColor Cyan

# Test 1: Basic search
Write-Host "`n1. Testing basic search..." -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "http://localhost:3333/api/reviews/search?q=phone" -Method Get
Write-Host "Results found: $($response1.total)" -ForegroundColor Green
Write-Host "Sample review: $($response1.reviews[0].product)" -ForegroundColor Gray

# Test 2: Search with sorting
Write-Host "`n2. Testing search with sorting (popular)..." -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:3333/api/reviews/search?q=coffee&sortBy=popular&limit=5" -Method Get
Write-Host "Results found: $($response2.total)" -ForegroundColor Green

# Test 3: Empty search
Write-Host "`n3. Testing empty search..." -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "http://localhost:3333/api/reviews/search?q=" -Method Get
Write-Host "Results found: $($response3.total) (should be 0)" -ForegroundColor Green

# Test 4: Search with recent sorting
Write-Host "`n4. Testing search with sorting (recent)..." -ForegroundColor Yellow
$response4 = Invoke-RestMethod -Uri "http://localhost:3333/api/reviews/search?q=tech&sortBy=recent&limit=3" -Method Get
Write-Host "Results found: $($response4.total)" -ForegroundColor Green

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
Write-Host "`nNote: Update the port (3333) if your backend runs on a different port." -ForegroundColor Gray
