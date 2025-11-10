@echo off
REM Start Trip Planner and Discovery Engine together

echo ╔════════════════════════════════════════════════════════╗
echo ║  Starting Trip Planner & Discovery Engine             ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Start Discovery Engine in new window
echo 🚀 Starting Discovery Engine on port 3000...
start "Discovery Engine" cmd /k "cd travel-ecosystem-backend\micro-services\discovery-engine && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Trip Planner in new window
echo 🚀 Starting Trip Planner on port 1005...
start "Trip Planner" cmd /k "cd travel-ecosystem\apps\trip-planner && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                Services Starting...                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📦 Discovery Engine: http://localhost:3000
echo 🌐 Trip Planner:     http://localhost:1005
echo.
echo ℹ️  Two terminal windows will open with the services.
echo ℹ️  Wait for both services to start (may take 10-30 seconds).
echo ℹ️  Check the terminal windows for any errors.
echo.
echo 🧪 To test the integration, run:
echo    node test-integration.js
echo.
echo 🛑 To stop services, close the terminal windows or press Ctrl+C.
echo.

pause
