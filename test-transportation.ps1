# Test Transportation Service
Write-Host "🧪 Testing Real-Time Transportation System" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3008/health" -ErrorAction Stop
    Write-Host "✅ Transportation Service is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Transportation Service not running" -ForegroundColor Red
    Write-Host "   Please start it with: cd travel-ecosystem-backend\micro-services\transportation-service; npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Walking Route
Write-Host "Test 2: Walking Route (Marina Bay → Orchard Road)..." -ForegroundColor Yellow
$body = @{
    origin = @{
        name = "Marina Bay"
        lat = 1.28
        lng = 103.85
    }
    destination = @{
        name = "Orchard Road"
        lat = 1.30
        lng = 103.86
    }
    preferences = @{
        modes = @("walking")
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3008/api/v1/transport/multi-modal-route" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success -and $response.data.Count -gt 0) {
        $route = $response.data[0]
        Write-Host "✅ Walking route found!" -ForegroundColor Green
        Write-Host "   Distance: $([math]::Round($route.totalDistance))m" -ForegroundColor Gray
        Write-Host "   Duration: $([math]::Round($route.totalDuration / 60))min" -ForegroundColor Gray
        Write-Host "   Cost: `$$($route.estimatedCost)" -ForegroundColor Gray
        Write-Host "   Provider: $($route.steps[0].mode)" -ForegroundColor Gray
        
        if ($route.steps[0].polyline) {
            Write-Host "   ✅ Polyline present for map rendering" -ForegroundColor Green
        }
        Write-Host ""
    } else {
        Write-Host "❌ No walking route found" -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host "❌ API call failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Multiple Modes
Write-Host "Test 3: Multi-Modal Route (walking, cycling, driving)..." -ForegroundColor Yellow
$body2 = @{
    origin = @{
        name = "Sentosa"
        lat = 1.249
        lng = 103.830
    }
    destination = @{
        name = "Changi Airport"
        lat = 1.364
        lng = 103.991
    }
    preferences = @{
        modes = @("walking", "cycling", "driving")
        budget = "balanced"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3008/api/v1/transport/multi-modal-route" -Method POST -Body $body2 -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ Found $($response.data.Count) route options!" -ForegroundColor Green
        foreach ($route in $response.data) {
            $mode = $route.steps[0].mode
            Write-Host "   - $mode`: $([math]::Round($route.totalDistance/1000, 1))km, $([math]::Round($route.totalDuration/60))min, `$$($route.estimatedCost)" -ForegroundColor Gray
        }
        Write-Host ""
    }
} catch {
    Write-Host "❌ API call failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Check Route Optimizer Integration
Write-Host "Test 4: Route Optimizer Integration..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4010/api/health" -ErrorAction Stop
    Write-Host "✅ Route Optimizer is running!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  Route Optimizer not running" -ForegroundColor Yellow
    Write-Host "   Start it with: cd travel-ecosystem-backend\micro-services\route-optimizer; npm run dev" -ForegroundColor Gray
    Write-Host ""
}

# Summary
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🎉 Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start Route Optimizer (if not running): cd travel-ecosystem-backend\micro-services\route-optimizer; npm run dev" -ForegroundColor White
Write-Host "2. Start Frontend: cd travel-ecosystem\apps\trip-planner; npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:5173" -ForegroundColor White
Write-Host "4. Select attractions → Optimize → View results" -ForegroundColor White
Write-Host ""
Write-Host "✅ Expected: Transport details shown, NOT 'fallback matrix estimates'" -ForegroundColor Green
