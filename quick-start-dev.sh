#!/bin/bash

# Quick Deploy Script - Development Environment
# Run this to start all services locally

echo "🚀 Starting Travel Ecosystem Services..."
echo ""

# Function to start service in background
start_service() {
    local name=$1
    local path=$2
    local command=$3
    
    echo "▶️  Starting $name..."
    cd "$path"
    $command &
    echo "✓ $name started (PID: $!)"
    cd - > /dev/null
}

# Start Backend Services
echo "📡 Starting Backend Services..."
echo "================================"

start_service "API Gateway" "/home/ramees/www/VOLENTEERING/travel-ecosystem-backend/api-gateway" "npm run dev"
sleep 2

start_service "Auth Service" "/home/ramees/www/VOLENTEERING/travel-ecosystem-backend/micro-services/auth" "npm run dev"
sleep 2

start_service "Blog Service" "/home/ramees/www/VOLENTEERING/travel-ecosystem-backend/micro-services/blog" "npm run dev"
sleep 2

start_service "Admin Service" "/home/ramees/www/VOLENTEERING/travel-ecosystem-backend/micro-services/admin" "npm run dev"
sleep 2

echo ""
echo "🎨 Starting Frontend Applications..."
echo "===================================="

start_service "Blog App" "/home/ramees/www/VOLENTEERING/travel-ecosystem/apps/blog" "npm run dev"
sleep 2

start_service "Admin Dashboard" "/home/ramees/www/VOLENTEERING/travel-ecosystem/apps/admin-dashboard" "npm run dev"
sleep 2

start_service "Shell App" "/home/ramees/www/VOLENTEERING/travel-ecosystem/shell" "npm run dev"
sleep 2

echo ""
echo "✅ All Services Started!"
echo "======================="
echo ""
echo "📍 Access your applications:"
echo "   🌐 Shell:     http://localhost:5000"
echo "   📝 Blog:      http://localhost:5001"
echo "   🔐 Admin:     http://localhost:3002"
echo "   🔌 API:       http://localhost:4000"
echo ""
echo "🛑 To stop all services, run:"
echo "   killall node"
echo ""
