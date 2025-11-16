#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop Transportation and Route Optimizer Services
.DESCRIPTION
    Gracefully stops all transportation-related services
#>

Write-Host "`n=== STOPPING TRANSPORTATION SERVICES ===" -ForegroundColor Cyan

# Stop PowerShell jobs
$jobs = Get-Job | Where-Object { $_.Name -like "*transport*" -or $_.Name -like "*optimizer*" -or $_.State -eq "Running" }
if ($jobs) {
    Write-Host "Stopping background jobs..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "✅ Background jobs stopped" -ForegroundColor Green
} else {
    Write-Host "No background jobs found" -ForegroundColor Gray
}

# Stop Node processes on specific ports
Write-Host "Stopping services on ports 3008 and 4010..." -ForegroundColor Yellow

$ports = @(3008, 4010)
foreach ($port in $ports) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conn) {
            $pid = $conn.OwningProcess
            Write-Host "  Killing process $pid on port $port" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
            Write-Host "  ✅ Port $port freed" -ForegroundColor Green
        } else {
            Write-Host "  No process on port $port" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️  Could not check port $port" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All services stopped`n" -ForegroundColor Green
