# Stop Real-Time Transportation System
# PowerShell script for Windows

Write-Host "🛑 Stopping Real-Time Multimodal Transportation System" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""

Write-Host "Stopping PostgreSQL..." -ForegroundColor Yellow
docker stop postgres-gtfs 2>$null
Write-Host "✅ PostgreSQL stopped" -ForegroundColor Green

Write-Host "Stopping Redis..." -ForegroundColor Yellow
docker stop redis-transport 2>$null
Write-Host "✅ Redis stopped" -ForegroundColor Green

Write-Host "Stopping MongoDB..." -ForegroundColor Yellow
docker stop mongodb 2>$null
Write-Host "✅ MongoDB stopped" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "✅ All services stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "To remove containers completely, run:" -ForegroundColor Gray
Write-Host "docker rm postgres-gtfs redis-transport mongodb" -ForegroundColor White
Write-Host ""
Write-Host "To start again, run: .\start-transportation-system.ps1" -ForegroundColor Cyan
