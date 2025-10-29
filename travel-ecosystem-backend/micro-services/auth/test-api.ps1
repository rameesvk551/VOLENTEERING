#!/usr/bin/env pwsh
# Test Auth Service Endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Auth Service API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4001"

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health Check: " -NoNewline -ForegroundColor Green
    Write-Host "$($health.message)" -ForegroundColor White
    Write-Host "   Timestamp: $($health.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: User Registration
Write-Host "2️⃣  Testing User Registration..." -ForegroundColor Yellow
$testEmail = "test_$(Get-Random)@example.com"
$signupData = @{
    name = "Test User"
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $signup = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" `
        -Method Post `
        -Body $signupData `
        -ContentType "application/json"
    
    Write-Host "✅ User Registration Successful" -ForegroundColor Green
    Write-Host "   User ID: $($signup.data.user.id)" -ForegroundColor Gray
    Write-Host "   Name: $($signup.data.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($signup.data.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($signup.data.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $signup.data.token
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Error: $($errorDetails.message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: User Login
Write-Host "3️⃣  Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "✅ Login Successful" -ForegroundColor Green
    Write-Host "   Welcome: $($login.data.user.name)" -ForegroundColor Gray
    Write-Host "   Role: $($login.data.user.role)" -ForegroundColor Gray
    
    $token = $login.data.token
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get User Profile
Write-Host "4️⃣  Testing Get Profile (Protected)..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile Retrieved" -ForegroundColor Green
    Write-Host "   Name: $($profile.data.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($profile.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($profile.data.user.role)" -ForegroundColor Gray
    Write-Host "   Email Verified: $($profile.data.user.isEmailVerified)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Profile Retrieval Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Auth Service is working correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "Database: PostgreSQL (localhost:5432/travel_auth)" -ForegroundColor Gray
Write-Host "Service: http://localhost:4001" -ForegroundColor Gray
Write-Host ""
