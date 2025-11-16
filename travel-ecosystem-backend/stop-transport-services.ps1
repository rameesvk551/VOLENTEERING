#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop Transportation Service and Route Optimizer
#>

Write-Host "`n=== STOPPING TRANSPORT SERVICES ===" -ForegroundColor Cyan

$ports = @(3008, 4010)

foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pid = $conn.OwningProcess
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Stopping process $($process.Name) (PID: $pid) on port $port..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Write-Host "✅ Port $port freed" -ForegroundColor Green
        }
    }
    else {
        Write-Host "No process found on port $port" -ForegroundColor Gray
    }
}

# Clean up any background jobs
$jobs = Get-Job -ErrorAction SilentlyContinue | Where-Object { $_.Command -like "*transportation-service*" -or $_.Command -like "*route-optimizer*" }
if ($jobs) {
    Write-Host "`nCleaning up background jobs..." -ForegroundColor Yellow
    $jobs | Remove-Job -Force
    Write-Host "✅ Jobs cleaned" -ForegroundColor Green
}

Write-Host "`n✅ All transport services stopped`n" -ForegroundColor Green
