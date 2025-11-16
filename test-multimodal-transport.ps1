#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test Multimodal Transportation Integration
.DESCRIPTION
    Tests the route optimizer with various transportation modes
#>

param(
    [ValidateSet('WALKING', 'CYCLING', 'DRIVING', 'PUBLIC_TRANSPORT', 'ALL')]
    [string]$Mode = 'ALL'
)

Write-Host "`n=== MULTIMODAL TRANSPORTATION TEST ===" -ForegroundColor Cyan

# Test data
$testCases = @{
    'WALKING' = @{
        modes = @('WALKING')
        description = "Walking only"
        color = "Green"
    }
    'CYCLING' = @{
        modes = @('CYCLING')
        description = "Cycling only"
        color = "Blue"
    }
    'DRIVING' = @{
        modes = @('DRIVING')
        description = "Driving only"
        color = "Yellow"
    }
    'PUBLIC_TRANSPORT' = @{
        modes = @('PUBLIC_TRANSPORT')
        description = "Public transport only"
        color = "Magenta"
    }
    'ALL' = @{
        modes = @('WALKING', 'CYCLING', 'DRIVING', 'PUBLIC_TRANSPORT')
        description = "All modes"
        color = "Cyan"
    }
}

$testPlaces = @(
    @{id='p1'; name='Marina Bay Sands'; lat=1.2834; lng=103.8607; priority=9}
    @{id='p2'; name='Gardens by the Bay'; lat=1.2816; lng=103.8636; priority=8}
    @{id='p3'; name='Orchard Road'; lat=1.3048; lng=103.8318; priority=7}
)

# Run tests
$modesToTest = if ($Mode -eq 'ALL') { @('WALKING', 'CYCLING', 'DRIVING', 'PUBLIC_TRANSPORT') } else { @($Mode) }

foreach ($testMode in $modesToTest) {
    $test = $testCases[$testMode]
    
    Write-Host "`n--- Testing: $($test.description) ---" -ForegroundColor $test.color
    
    $body = @{
        userId = 'test-user'
        places = $testPlaces
        constraints = @{
            timeBudgetMinutes = 480
            travelTypes = $test.modes
            budget = 100
        }
        options = @{
            includeRealtimeTransit = $true
            priorityWeighting = 0.4
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri http://localhost:4010/api/v2/optimize-route -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 15
        
        Write-Host "✅ Request successful" -ForegroundColor Green
        Write-Host "   Job ID: $($response.data.jobId)" -ForegroundColor Gray
        Write-Host "   Total Distance: $([math]::Round($response.data.totalDistanceMeters/1000, 2))km" -ForegroundColor Gray
        Write-Host "   Total Duration: $([math]::Round($response.data.estimatedDurationMinutes, 1))min" -ForegroundColor Gray
        Write-Host "   Processing Time: $($response.processingTime)" -ForegroundColor Gray
        
        Write-Host "`n   Route Legs:" -ForegroundColor Yellow
        foreach ($leg in $response.data.legs) {
            $providerColor = if ($leg.provider -eq 'transport-service') { 'Green' } 
                           elseif ($leg.provider -like '*fallback*') { 'Red' }
                           else { 'Yellow' }
            
            Write-Host "   • $($leg.from.name) → $($leg.to.name)" -ForegroundColor White
            Write-Host "     Provider: $($leg.provider)" -ForegroundColor $providerColor
            Write-Host "     Type: $($leg.travelType) | Distance: $([math]::Round($leg.distanceMeters/1000, 2))km | Time: $([math]::Round($leg.travelTimeSeconds/60, 1))min" -ForegroundColor Gray
            
            if ($leg.steps -and $leg.steps.Count -gt 0) {
                Write-Host "     Steps: $($leg.steps.Count) segments" -ForegroundColor Gray
            }
        }
        
        # Validation
        $fallbackCount = ($response.data.legs | Where-Object { $_.provider -like '*fallback*' }).Count
        if ($fallbackCount -eq 0) {
            Write-Host "`n   ✅ All legs using transportation service!" -ForegroundColor Green
        } else {
            Write-Host "`n   ⚠️  $fallbackCount leg(s) using fallback" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`n=== TEST COMPLETE ===`n" -ForegroundColor Cyan
