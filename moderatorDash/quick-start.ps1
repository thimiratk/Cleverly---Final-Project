Write-Host 'Cleverly Admin Dashboard - Quick Start' -ForegroundColor Cyan
Write-Host ''
if (-Not (Test-Path 'package.json')) {
    Write-Host 'Error: Run this from the frontend directory' -ForegroundColor Red
    exit 1
}
Write-Host 'Checking Node.js...' -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host 'Node.js version:' $nodeVersion -ForegroundColor Gray
} catch {
    Write-Host 'Node.js not found! Install from https://nodejs.org/' -ForegroundColor Red
    exit 1
}
Write-Host ''
Write-Host 'Checking dependencies...' -ForegroundColor Green
if (-Not (Test-Path 'node_modules')) {
    Write-Host 'Installing dependencies...' -ForegroundColor Yellow
    npm install
}
Write-Host ''
Write-Host 'Starting dashboard at http://localhost:5173' -ForegroundColor Cyan
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host ''
npm run dev
