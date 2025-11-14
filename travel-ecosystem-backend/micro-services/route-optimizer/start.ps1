# Route Optimizer - Start Script
Write-Host "🚀 Starting Route Optimizer Microservice..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found, copying from .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Start the service
Write-Host "🎯 Starting service on port 3007..." -ForegroundColor Green
npm run dev
