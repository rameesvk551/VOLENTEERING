# Start Real-Time Transportation System
# PowerShell script for Windows

Write-Host "🚀 Starting Real-Time Multimodal Transportation System" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL with PostGIS
Write-Host ""
Write-Host "Starting PostgreSQL with PostGIS..." -ForegroundColor Yellow
docker ps -a | Select-String "postgres-gtfs" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL container exists, starting..." -ForegroundColor Cyan
    docker start postgres-gtfs | Out-Null
} else {
    Write-Host "Creating PostgreSQL container..." -ForegroundColor Cyan
    docker run -d `
        --name postgres-gtfs `
        -e POSTGRES_PASSWORD=gtfs_password `
        -e POSTGRES_USER=gtfs_user `
        -e POSTGRES_DB=gtfs `
        -p 5432:5432 `
        postgis/postgis:14-3.2 | Out-Null
    Start-Sleep -Seconds 10
}
Write-Host "✅ PostgreSQL running on port 5432" -ForegroundColor Green

# Start Redis
Write-Host ""
Write-Host "Starting Redis..." -ForegroundColor Yellow
docker ps -a | Select-String "redis-transport" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Redis container exists, starting..." -ForegroundColor Cyan
    docker start redis-transport | Out-Null
} else {
    Write-Host "Creating Redis container..." -ForegroundColor Cyan
    docker run -d `
        --name redis-transport `
        -p 6379:6379 `
        redis:7-alpine | Out-Null
}
Write-Host "✅ Redis running on port 6379" -ForegroundColor Green

# Start MongoDB
Write-Host ""
Write-Host "Starting MongoDB..." -ForegroundColor Yellow
docker ps -a | Select-String "mongodb" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "MongoDB container exists, starting..." -ForegroundColor Cyan
    docker start mongodb | Out-Null
} else {
    Write-Host "Creating MongoDB container..." -ForegroundColor Cyan
    docker run -d `
        --name mongodb `
        -p 27017:27017 `
        mongo:latest | Out-Null
    Start-Sleep -Seconds 5
}
Write-Host "✅ MongoDB running on port 27017" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ All database services running!" -ForegroundColor Green
Write-Host ""
Write-Host "Now start these services in separate terminals:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Transportation Service):" -ForegroundColor Yellow
Write-Host "cd travel-ecosystem-backend\micro-services\transportation-service" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Route Optimizer):" -ForegroundColor Yellow
Write-Host "cd travel-ecosystem-backend\micro-services\route-optimizer" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 3 (Frontend):" -ForegroundColor Yellow
Write-Host "cd travel-ecosystem\apps\trip-planner" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then visit: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, run: .\stop-transportation-system.ps1" -ForegroundColor Gray
