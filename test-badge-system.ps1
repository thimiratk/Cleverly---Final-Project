# Quick Test Script for Badge Management
# Run this to verify all fixes are working

Write-Host "🔍 Badge Management - Quick Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if services are running
Write-Host "Test 1: Checking if services are running..." -ForegroundColor Yellow

# Test Domain Management (Port 6003)
try {
    $domain = Invoke-WebRequest -Uri "http://localhost:6003" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Domain Management Service (6003): Running" -ForegroundColor Green
} catch {
    Write-Host "❌ Domain Management Service (6003): NOT RUNNING" -ForegroundColor Red
    Write-Host "   Start with: cd Server\org; npm run dev" -ForegroundColor Yellow
}

# Test User Profile (Port 6004)
try {
    $profile = Invoke-WebRequest -Uri "http://localhost:6004" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ User Profile Service (6004): Running" -ForegroundColor Green
} catch {
    Write-Host "❌ User Profile Service (6004): NOT RUNNING" -ForegroundColor Red
    Write-Host "   Start with: cd Server\org; npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: Check Categories API
Write-Host "Test 2: Testing Categories API..." -ForegroundColor Yellow

try {
    $categories = Invoke-RestMethod -Uri "http://localhost:6003/api/domain/categories" -Method Get
    if ($categories.categories) {
        Write-Host "✅ Categories API: Working correctly" -ForegroundColor Green
        Write-Host "   Found $($categories.categories.Count) categories" -ForegroundColor Gray
        
        # Show first 3 categories
        $categories.categories | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Categories API returned unexpected format" -ForegroundColor Yellow
        Write-Host "   Expected: { categories: [...] }" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Categories API: Failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 3: Check Badge Statistics API
Write-Host "Test 3: Testing Badge Statistics API..." -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:6004/admin/badges/statistics/overview" -Method Get
    if ($stats.statistics) {
        Write-Host "✅ Badge Statistics API: Working correctly" -ForegroundColor Green
        Write-Host "   Total Badges: $($stats.statistics.totalBadges)" -ForegroundColor Gray
        Write-Host "   Active Badges: $($stats.statistics.activeBadges)" -ForegroundColor Gray
        Write-Host "   Total Assignments: $($stats.statistics.totalAssignments)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Badge Statistics API returned unexpected format" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Badge Statistics API: Failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Test 4: Check All Badges API
Write-Host "Test 4: Testing All Badges API..." -ForegroundColor Yellow

try {
    $badges = Invoke-RestMethod -Uri "http://localhost:6004/admin/badges" -Method Get
    if ($badges.badges) {
        Write-Host "✅ All Badges API: Working correctly" -ForegroundColor Green
        Write-Host "   Found $($badges.badges.Count) badges" -ForegroundColor Gray
        
        # Show first 3 badges
        $badges.badges | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Badges API returned unexpected format" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ All Badges API: Failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   If all tests passed (✅), your badge system is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Start Admin Dashboard:" -ForegroundColor White
Write-Host "      cd dashboards\Admin-dash" -ForegroundColor Gray
Write-Host "      npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Open in browser and navigate to Badge Management" -ForegroundColor White
Write-Host ""
Write-Host "   3. Try creating a badge in the Create tab" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - BADGE_CREATION_FIX.md - Detailed fixes and troubleshooting" -ForegroundColor Gray
Write-Host "   - BADGE_CATEGORY_CLOUDINARY_FIX.md - Cloudinary setup" -ForegroundColor Gray
Write-Host ""
