#!/usr/bin/env pwsh
# Test Login with Admin User

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Admin Login" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4001"

# Test Login
Write-Host "🔐 Logging in as admin..." -ForegroundColor Yellow
$loginData = @{
    email = "rameesvk551@gmail.com"
    password = "admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.data.user.id)" -ForegroundColor White
    Write-Host "  Name: $($response.data.user.name)" -ForegroundColor White
    Write-Host "  Email: $($response.data.user.email)" -ForegroundColor White
    Write-Host "  Role: $($response.data.user.role)" -ForegroundColor White
    Write-Host "  Email Verified: $($response.data.user.isEmailVerified)" -ForegroundColor White
    Write-Host ""
    Write-Host "Tokens:" -ForegroundColor Cyan
    Write-Host "  Access Token: $($response.data.token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "  Refresh Token: $($response.data.refreshToken.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Admin user is working! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host ""
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Error: $($errorDetails.message)" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. The auth service is running on port 4001" -ForegroundColor White
    Write-Host "  2. The seeder ran successfully" -ForegroundColor White
    Write-Host "  3. PostgreSQL is running" -ForegroundColor White
    exit 1
}
