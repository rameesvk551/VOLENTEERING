#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Transportation Service and Route Optimizer with monitoring
.DESCRIPTION
    Starts both services and keeps them running with auto-restart on failure
#>

param(
    [switch]$NoRestart,
    [int]$RestartDelay = 5
)

$ErrorActionPreference = "Continue"

Write-Host "`n=== MULTIMODAL TRANSPORT SERVICES STARTUP ===" -ForegroundColor Cyan
Write-Host "Starting Transportation Service and Route Optimizer...`n" -ForegroundColor Gray

# Define service configurations
$services = @(
    @{
        Name = "Transportation Service"
        Port = 3008
        Path = "travel-ecosystem-backend\micro-services\transportation-service"
        Color = "Green"
        HealthCheck = "http://localhost:3008/health"
    },
    @{
        Name = "Route Optimizer"
        Port = 4010
        Path = "travel-ecosystem-backend\micro-services\route-optimizer"
        Color = "Yellow"
        HealthCheck = "http://localhost:4010/api/health"
    }
)

# Kill existing processes on those ports
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
foreach ($service in $services) {
    $conn = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue
    if ($conn) {
        $pid = $conn.OwningProcess
        Write-Host "  Stopping process $pid on port $($service.Port)" -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

# Start services
$jobs = @()
foreach ($service in $services) {
    Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor $service.Color
    
    $scriptBlock = {
        param($servicePath)
        Set-Location $servicePath
        npm start 2>&1
    }
    
    $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $service.Path
    $jobs += @{
        Job = $job
        Service = $service
    }
}

# Wait for services to start
Write-Host "`nWaiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 8

# Check health
Write-Host "`n=== HEALTH CHECK ===" -ForegroundColor Cyan
$allHealthy = $true
foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.HealthCheck -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ $($service.Name): RUNNING" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $($service.Name): FAILED" -ForegroundColor Red
        $allHealthy = $false
    }
}

if ($allHealthy) {
    Write-Host "`n✅ All services are running successfully!" -ForegroundColor Green
    Write-Host "`nEndpoints:" -ForegroundColor Cyan
    Write-Host "  Transportation Service: http://localhost:3008" -ForegroundColor Gray
    Write-Host "  Route Optimizer V2:     http://localhost:4010/api/v2/optimize-route" -ForegroundColor Gray
    Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow
    
    if (-not $NoRestart) {
        # Monitor and auto-restart
        Write-Host "`nMonitoring services (auto-restart enabled)...`n" -ForegroundColor Cyan
        
        while ($true) {
            Start-Sleep -Seconds 10
            
            foreach ($jobInfo in $jobs) {
                if ($jobInfo.Job.State -eq "Failed" -or $jobInfo.Job.State -eq "Completed") {
                    $service = $jobInfo.Service
                    Write-Host "⚠️  $($service.Name) stopped. Restarting in ${RestartDelay}s..." -ForegroundColor Yellow
                    Remove-Job -Job $jobInfo.Job -Force
                    Start-Sleep -Seconds $RestartDelay
                    
                    $scriptBlock = {
                        param($servicePath)
                        Set-Location $servicePath
                        npm start 2>&1
                    }
                    
                    $jobInfo.Job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $service.Path
                    Write-Host "✅ $($service.Name) restarted" -ForegroundColor Green
                }
            }
        }
    }
    else {
        # Just keep running
        Write-Host "`nServices running. Job IDs:" -ForegroundColor Gray
        foreach ($jobInfo in $jobs) {
            Write-Host "  $($jobInfo.Service.Name): $($jobInfo.Job.Id)" -ForegroundColor Gray
        }
        Write-Host "`nRun 'Get-Job' to check status" -ForegroundColor Gray
        Write-Host "Run 'Stop-Job -Id <id>' to stop a service" -ForegroundColor Gray
    }
}
else {
    Write-Host "`n❌ Some services failed to start. Check logs above." -ForegroundColor Red
    # Clean up jobs
    foreach ($jobInfo in $jobs) {
        Remove-Job -Job $jobInfo.Job -Force
    }
    exit 1
}
