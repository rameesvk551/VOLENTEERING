@echo off
echo Starting Route Optimizer Microservice...
echo.

REM Check if .env exists
if not exist ".env" (
    echo Warning: .env file not found, copying from .env.example
    copy .env.example .env
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo Starting service on port 3007...
call npm run dev
