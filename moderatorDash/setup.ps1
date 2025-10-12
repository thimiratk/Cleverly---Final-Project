# Setup script for Cleverly Admin Dashboard
Write-Host "Setting up Cleverly Admin Dashboard..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`nChecking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "  npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: npm is not installed!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Success message
Write-Host "`n======================================" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "`nTo start the development server, run:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host "`nThe dashboard will be available at:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nMake sure your backend services are running:" -ForegroundColor Yellow
Write-Host "  Rule-based API: http://localhost:8001" -ForegroundColor White
Write-Host "  ML-based API:   http://localhost:8002" -ForegroundColor White
Write-Host "  Sentiment API:  http://localhost:8003" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green
