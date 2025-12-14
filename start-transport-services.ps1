#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Transportation and Route Optimizer Services
.DESCRIPTION
    Starts both transportation service (port 3008) and route optimizer (port 4010)
    with proper dependency management and health checks
#>

param(
    [switch]$KillExisting = $true
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== TRANSPORTATION SERVICES STARTUP ===" -ForegroundColor Cyan
Write-Host "Starting Transportation Service and Route Optimizer`n" -ForegroundColor Gray

# Kill existing processes if requested
if ($KillExisting) {
    Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

# Check PostgreSQL
try {
    $pgTest = Test-NetConnection -ComputerName localhost -Port 5433 -WarningAction SilentlyContinue
    if ($pgTest.TcpTestSucceeded) {
        Write-Host "✅ PostgreSQL (PostGIS) running on port 5433" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL not running on port 5433" -ForegroundColor Red
        Write-Host "   Start with: docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=gtfs_password postgis/postgis" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ PostgreSQL check failed" -ForegroundColor Red
    exit 1
}

# Check Redis
try {
    $redisTest = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redisTest.TcpTestSucceeded) {
        Write-Host "✅ Redis running on port 6379" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis not running on port 6379" -ForegroundColor Red
        Write-Host "   Start with: docker run -d -p 6379:6379 redis:alpine" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Redis check failed" -ForegroundColor Red
    exit 1
}

# Check MongoDB
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "✅ MongoDB running on port 27017" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB not running on port 27017" -ForegroundColor Red
        Write-Host "   Start with: docker run -d -p 27017:27017 mongo:latest" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ MongoDB check failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start Transportation Service
Write-Host "Starting Transportation Service (port 3008)..." -ForegroundColor Cyan
$transportPath = "C:\Users\ACER\www\VOLENTEERING\VOLENTEERING\travel-ecosystem-backend\micro-services\transportation-service"
$transportJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm start 2>&1
} -ArgumentList $transportPath

Start-Sleep -Seconds 5

# Check if Transportation Service started
$transportHealthy = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $health = Invoke-RestMethod -Uri http://localhost:3008/health -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq "ok") {
            Write-Host "✅ Transportation Service is running (port 3008)" -ForegroundColor Green
            $transportHealthy = $true
            break
        }
    } catch {
        Write-Host "   Attempt $i/10: Waiting for service..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $transportHealthy) {
    Write-Host "❌ Transportation Service failed to start" -ForegroundColor Red
    Stop-Job $transportJob -ErrorAction SilentlyContinue
    Remove-Job $transportJob -ErrorAction SilentlyContinue
    exit 1
}

# Start Route Optimizer
Write-Host "Starting Route Optimizer (port 4010)..." -ForegroundColor Cyan
$optimizerPath = "C:\Users\ACER\www\VOLENTEERING\VOLENTEERING\travel-ecosystem-backend\micro-services\route-optimizer"
$optimizerJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm start 2>&1
} -ArgumentList $optimizerPath

Start-Sleep -Seconds 5

# Check if Route Optimizer started
$optimizerHealthy = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $health = Invoke-RestMethod -Uri http://localhost:4010/api/health -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq "healthy") {
            Write-Host "✅ Route Optimizer is running (port 4010)" -ForegroundColor Green
            $optimizerHealthy = $true
            break
        }
    } catch {
        Write-Host "   Attempt $i/10: Waiting for service..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $optimizerHealthy) {
    Write-Host "❌ Route Optimizer failed to start" -ForegroundColor Red
    Stop-Job $optimizerJob -ErrorAction SilentlyContinue
    Remove-Job $optimizerJob -ErrorAction SilentlyContinue
    Stop-Job $transportJob -ErrorAction SilentlyContinue
    Remove-Job $transportJob -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`n=== ALL SERVICES RUNNING ===" -ForegroundColor Green
Write-Host "Transportation Service: http://localhost:3008" -ForegroundColor Cyan
Write-Host "Route Optimizer: http://localhost:4010" -ForegroundColor Cyan
Write-Host "`nJob IDs:" -ForegroundColor Yellow
Write-Host "  Transportation Service: $($transportJob.Id)" -ForegroundColor Gray
Write-Host "  Route Optimizer: $($optimizerJob.Id)" -ForegroundColor Gray
Write-Host "`nTo stop services, run:" -ForegroundColor Yellow
Write-Host "  Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop monitoring (services will continue in background)`n" -ForegroundColor Yellow

# Monitor services
try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        # Check Transportation Service
        try {
            $health = Invoke-RestMethod -Uri http://localhost:3008/health -TimeoutSec 2
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ Transportation Service: OK (uptime: $([math]::Round($health.uptime, 1))s)" -ForegroundColor Green
        } catch {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ Transportation Service: DOWN" -ForegroundColor Red
        }
        
        # Check Route Optimizer
        try {
            $health = Invoke-RestMethod -Uri http://localhost:4010/api/health -TimeoutSec 2
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ Route Optimizer: OK" -ForegroundColor Green
        } catch {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ Route Optimizer: DOWN" -ForegroundColor Red
        }
    }
} finally {
    Write-Host "`nServices are still running in background jobs" -ForegroundColor Yellow
}
