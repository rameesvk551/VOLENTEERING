#!/usr/bin/env pwsh
# Stop Auth Service and PostgreSQL

Write-Host "Stopping Auth Service and PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services stopped successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to stop services" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "To remove data volume as well, run:" -ForegroundColor Yellow
Write-Host "  docker-compose down -v" -ForegroundColor Gray
