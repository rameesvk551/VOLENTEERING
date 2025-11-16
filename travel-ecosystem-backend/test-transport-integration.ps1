#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test multimodal transportation integration
.DESCRIPTION
    Tests the route optimizer with transportation service for different travel modes
#>

param(
    [ValidateSet('WALKING', 'CYCLING', 'DRIVING', 'PUBLIC_TRANSPORT', 'ALL')]
    [string]$Mode = 'ALL',
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== MULTIMODAL TRANSPORT INTEGRATION TESTS ===" -ForegroundColor Cyan

# Check if services are running
Write-Host "`nChecking services..." -ForegroundColor Yellow
$servicesOk = $true
try {
    Invoke-RestMethod -Uri "http://localhost:3008/health" -TimeoutSec 2 | Out-Null
    Write-Host "✅ Transportation Service (3008): Running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Transportation Service (3008): Not running" -ForegroundColor Red
    $servicesOk = $false
}

try {
    Invoke-RestMethod -Uri "http://localhost:4010/api/health" -TimeoutSec 2 | Out-Null
    Write-Host "✅ Route Optimizer (4010): Running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Route Optimizer (4010): Not running" -ForegroundColor Red
    $servicesOk = $false
}

if (-not $servicesOk) {
    Write-Host "`n❌ Services not running. Run start-transport-services.ps1 first" -ForegroundColor Red
    exit 1
}

# Test data: Singapore landmarks
$testPlaces = @(
    @{id='p1'; name='Marina Bay Sands'; lat=1.2834; lng=103.8607; priority=10}
    @{id='p2'; name='Gardens by the Bay'; lat=1.2816; lng=103.8636; priority=9}
    @{id='p3'; name='Orchard Road'; lat=1.3048; lng=103.8318; priority=8}
    @{id='p4'; name='Sentosa Island'; lat=1.2494; lng=103.8303; priority=7}
)

# Define test scenarios
$scenarios = @()
if ($Mode -eq 'ALL' -or $Mode -eq 'WALKING') {
    $scenarios += @{
        Name = 'Walking Mode'
        TravelTypes = @('WALKING')
        Budget = 50
        Color = 'Cyan'
    }
}
if ($Mode -eq 'ALL' -or $Mode -eq 'CYCLING') {
    $scenarios += @{
        Name = 'Cycling Mode'
        TravelTypes = @('CYCLING')
        Budget = 100
        Color = 'Yellow'
    }
}
if ($Mode -eq 'ALL' -or $Mode -eq 'DRIVING') {
    $scenarios += @{
        Name = 'Driving Mode'
        TravelTypes = @('DRIVING')
        Budget = 200
        Color = 'Magenta'
    }
}
if ($Mode -eq 'ALL' -or $Mode -eq 'PUBLIC_TRANSPORT') {
    $scenarios += @{
        Name = 'Public Transport Mode'
        TravelTypes = @('PUBLIC_TRANSPORT', 'WALKING')
        Budget = 80
        Color = 'Green'
    }
}

# Run tests
$results = @()
foreach ($scenario in $scenarios) {
    Write-Host "`n=== Testing: $($scenario.Name) ===" -ForegroundColor $scenario.Color
    
    $body = @{
        userId = 'test-user'
        places = $testPlaces[0..2]  # Use first 3 places
        constraints = @{
            timeBudgetMinutes = 480
            travelTypes = $scenario.TravelTypes
            budget = $scenario.Budget
        }
        options = @{
            includeRealtimeTransit = $true
            priorityWeighting = 0.3
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri "http://localhost:4010/api/v2/optimize-route" -Method POST -Body $body -ContentType 'application/json'
        $duration = ((Get-Date) - $startTime).TotalMilliseconds
        
        $result = @{
            Scenario = $scenario.Name
            Success = $true
            JobId = $response.data.jobId
            Legs = $response.data.legs.Count
            Provider = $response.data.legs[0].provider
            TotalDistance = [math]::Round(($response.data.legs | Measure-Object -Property distanceMeters -Sum).Sum / 1000, 2)
            TotalDuration = [math]::Round(($response.data.legs | Measure-Object -Property travelTimeSeconds -Sum).Sum / 60, 1)
            ProcessingTime = $duration
        }
        
        Write-Host "  ✅ Job ID: $($result.JobId)" -ForegroundColor Green
        Write-Host "  📍 Legs: $($result.Legs)" -ForegroundColor Gray
        Write-Host "  🚗 Provider: $($result.Provider)" -ForegroundColor $(if($result.Provider -eq 'transport-service'){'Green'}elseif($result.Provider -eq 'osrm-fallback'){'Yellow'}else{'Red'})
        Write-Host "  📏 Total Distance: $($result.TotalDistance)km" -ForegroundColor Gray
        Write-Host "  ⏱️  Total Duration: $($result.TotalDuration)min" -ForegroundColor Gray
        Write-Host "  ⚡ Processing Time: $([math]::Round($result.ProcessingTime))ms" -ForegroundColor Gray
        
        if ($Verbose) {
            Write-Host "`n  Leg Details:" -ForegroundColor Yellow
            foreach ($leg in $response.data.legs) {
                Write-Host "    $($leg.from.name) → $($leg.to.name)" -ForegroundColor White
                Write-Host "      Type: $($leg.travelType) | Distance: $([math]::Round($leg.distanceMeters/1000,2))km | Time: $([math]::Round($leg.travelTimeSeconds/60,1))min" -ForegroundColor Gray
            }
        }
        
        $results += $result
    }
    catch {
        Write-Host "  ❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Scenario = $scenario.Name
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count
Write-Host "Passed: $successCount/$totalCount" -ForegroundColor $(if($successCount -eq $totalCount){'Green'}else{'Yellow'})

$transportServiceCount = ($results | Where-Object { $_.Provider -eq 'transport-service' }).Count
if ($transportServiceCount -gt 0) {
    Write-Host "✅ Transport Service Integration: WORKING ($transportServiceCount/$successCount using real transport data)" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Transport Service Integration: Using fallback (check service logs)" -ForegroundColor Yellow
}

# Detailed results table
Write-Host "`nDetailed Results:" -ForegroundColor Yellow
$results | Where-Object { $_.Success } | Format-Table -Property Scenario, Provider, TotalDistance, TotalDuration, ProcessingTime -AutoSize

Write-Host "`n"
