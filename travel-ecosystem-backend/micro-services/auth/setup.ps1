#!/usr/bin/env pwsh
# PostgreSQL Setup Script for Windows PowerShell
# Run this script to set up the PostgreSQL database for the Auth Service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Auth Service - PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$pgPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgPath) {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first:" -ForegroundColor Yellow
    Write-Host "  choco install postgresql" -ForegroundColor White
    Write-Host "  Or download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    exit 1
}
Write-Host "✅ PostgreSQL found at: $($pgPath.Source)" -ForegroundColor Green
Write-Host ""

# Prompt for PostgreSQL password
Write-Host "Enter PostgreSQL superuser (postgres) password:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

# Set environment variable for psql
$env:PGPASSWORD = $pgPasswordPlain

# Create database
Write-Host "Creating database 'travel_auth'..." -ForegroundColor Yellow
try {
    $result = Get-Content setup-db.sql | psql -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database creation completed with warnings" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to create database" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# Clear password from environment
Remove-Item Env:\PGPASSWORD

# Check if .env exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please update the database credentials in .env file!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file and update database credentials" -ForegroundColor White
Write-Host "2. Run the service:" -ForegroundColor White
Write-Host "   npm run dev (development)" -ForegroundColor Gray
Write-Host "   npm start (production)" -ForegroundColor Gray
Write-Host ""
Write-Host "Database Information:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: travel_auth" -ForegroundColor White
Write-Host "  User: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - README_POSTGRES.md (Quick start guide)" -ForegroundColor White
Write-Host "  - POSTGRES_MIGRATION_GUIDE.md (Detailed migration guide)" -ForegroundColor White
Write-Host "  - MIGRATION_SUMMARY.md (Summary of changes)" -ForegroundColor White
Write-Host ""
