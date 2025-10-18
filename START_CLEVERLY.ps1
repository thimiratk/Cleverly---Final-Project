# Cleverly Platform - Automated Startup Script
# This script starts all necessary services in separate windows

Write-Host "🚀 Starting Cleverly Platform..." -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = $PSScriptRoot

# Function to open a new PowerShell window and run a command
function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "✅ Starting $Title..." -ForegroundColor Green
    
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Command))
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-EncodedCommand", $encodedCommand
    ) -WorkingDirectory $WorkingDirectory
    
    Start-Sleep -Seconds 2
}

# Check if Node.js is installed
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "   ✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Python not found! ML services will not start." -ForegroundColor Yellow
    $pythonAvailable = $false
}

Write-Host ""
Write-Host "🎯 Starting services in separate windows..." -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend Services
$backendPath = Join-Path $projectRoot "Server\org"
$backendCommand = @"
Write-Host '🔧 Backend Services Starting...' -ForegroundColor Cyan
Write-Host ''
Set-Location '$backendPath'
if (!(Test-Path 'node_modules')) {
    Write-Host '📦 Installing dependencies...' -ForegroundColor Yellow
    npm install
}
Write-Host '🚀 Starting all microservices...' -ForegroundColor Green
npm run dev
"@
Start-ServiceWindow -Title "Backend Services" -Command $backendCommand -WorkingDirectory $backendPath

Start-Sleep -Seconds 5

# 2. Start Frontend
$frontendPath = Join-Path $projectRoot "frontend"
$frontendCommand = @"
Write-Host '🎨 Frontend Starting...' -ForegroundColor Cyan
Write-Host ''
Set-Location '$frontendPath'
if (!(Test-Path 'node_modules')) {
    Write-Host '📦 Installing dependencies...' -ForegroundColor Yellow
    npm install
}
Write-Host '🚀 Starting React app...' -ForegroundColor Green
Write-Host ''
Write-Host '✨ Frontend will be available at: http://localhost:5173' -ForegroundColor Yellow
Write-Host ''
npm run dev
"@
Start-ServiceWindow -Title "Frontend" -Command $frontendCommand -WorkingDirectory $frontendPath

Start-Sleep -Seconds 3

# 3. Start Python ML Services (if Python is available)
if ($pythonAvailable -ne $false) {
    $gatewayPath = Join-Path $projectRoot "Backend\api-gateway"
    if (Test-Path "$gatewayPath\start-services.ps1") {
        Write-Host "✅ Starting Python ML Services..." -ForegroundColor Green
        
        $pythonCommand = @"
Write-Host '🤖 Python ML Services Starting...' -ForegroundColor Cyan
Write-Host ''
Set-Location '$gatewayPath'
.\start-services.ps1
"@
        Start-ServiceWindow -Title "Python ML Services" -Command $pythonCommand -WorkingDirectory $gatewayPath
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Cleverly Platform is starting up!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Services will be available at:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   🔧 Backend:   http://localhost:3333" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Please wait 10-20 seconds for all services to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Note: Each service opened in a separate window" -ForegroundColor Gray
Write-Host "   Close the windows or press Ctrl+C in each to stop services" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: Check each window for startup status and errors" -ForegroundColor Cyan
Write-Host ""

# Wait a bit and then try to open the browser
Start-Sleep -Seconds 10

Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ All done! Happy coding! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
