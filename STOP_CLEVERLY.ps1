# Cleverly Platform - Stop All Services Script
# This script stops all running Cleverly services

Write-Host "🛑 Stopping Cleverly Platform Services..." -ForegroundColor Yellow
Write-Host ""

function Stop-ServiceOnPort {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "   🔴 Stopping $ServiceName (Port $Port, PID: $($process.Id))..." -ForegroundColor Red
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "   ✓ Stopped" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "   ℹ️  $ServiceName (Port $Port) - Not running" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️  Could not check $ServiceName on port $Port" -ForegroundColor Yellow
    }
}

function Stop-ProcessByName {
    param(
        [string]$ProcessName,
        [string]$ServiceName
    )
    
    try {
        $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($processes) {
            foreach ($proc in $processes) {
                Write-Host "   🔴 Stopping $ServiceName (PID: $($proc.Id))..." -ForegroundColor Red
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
            Write-Host "   ✓ Stopped all $ServiceName processes" -ForegroundColor Green
        } else {
            Write-Host "   ℹ️  $ServiceName - Not running" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️  Could not check $ServiceName processes" -ForegroundColor Yellow
    }
}

Write-Host "📋 Checking and stopping services..." -ForegroundColor Cyan
Write-Host ""

# Stop Frontend (Vite)
Write-Host "🎨 Frontend Services:" -ForegroundColor Yellow
Stop-ServiceOnPort -Port 5173 -ServiceName "Frontend (Vite)"
Write-Host ""

# Stop Backend Services
Write-Host "🔧 Backend Services:" -ForegroundColor Yellow
Stop-ServiceOnPort -Port 3333 -ServiceName "API Gateway"
Stop-ServiceOnPort -Port 3000 -ServiceName "Auth Service"
Stop-ServiceOnPort -Port 3001 -ServiceName "Review Service"
Stop-ServiceOnPort -Port 3002 -ServiceName "User Profile Service"
Stop-ServiceOnPort -Port 3003 -ServiceName "User Interactions Service"
Stop-ServiceOnPort -Port 3004 -ServiceName "Domain Management Service"
Write-Host ""

# Stop Python ML Services
Write-Host "🤖 Python ML Services:" -ForegroundColor Yellow
Stop-ServiceOnPort -Port 8001 -ServiceName "Rule-based Fraud Detection"
Stop-ServiceOnPort -Port 8002 -ServiceName "ML-based Fraud Detection"
Stop-ServiceOnPort -Port 8003 -ServiceName "Sentiment Analysis"
Stop-ServiceOnPort -Port 8004 -ServiceName "Stance Detection"
Write-Host ""

# Stop any remaining Node/Python processes related to Cleverly
Write-Host "🧹 Cleaning up remaining processes..." -ForegroundColor Yellow
# Note: Be careful with this - it might stop other Node/Python processes
# Uncomment only if you want to force stop all node/python processes
# Stop-ProcessByName -ProcessName "node" -ServiceName "Node.js"
# Stop-ProcessByName -ProcessName "python" -ServiceName "Python"
Write-Host "   ℹ️  Manual cleanup skipped (to avoid stopping other applications)" -ForegroundColor Gray
Write-Host ""

# Stop Nginx if running
Write-Host "🌐 Nginx Gateway:" -ForegroundColor Yellow
Stop-ServiceOnPort -Port 80 -ServiceName "Nginx"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Cleverly Platform services stopped!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   • If services are still running, close their terminal windows manually" -ForegroundColor White
Write-Host "   • Use Task Manager to verify all processes are stopped" -ForegroundColor White
Write-Host "   • To start again, run: .\START_CLEVERLY.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
