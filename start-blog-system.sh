#!/bin/bash

# Blog System Startup Script
# This script starts all microservices and frontend apps for the blog system

set -e

echo "🚀 Starting Blog & Admin Dashboard System..."
echo "================================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $service to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service is ready!${NC}"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service failed to start${NC}"
    return 1
}

# Check required ports
echo ""
echo "📡 Checking ports..."
check_port 27017 || { echo "MongoDB port in use. Stop existing MongoDB or use Docker."; }
check_port 4001 || { echo "Auth service port in use."; exit 1; }
check_port 4000 || { echo "Admin service port in use."; exit 1; }
check_port 4003 || { echo "Blog service port in use."; exit 1; }

echo ""
echo "🗄️  Starting MongoDB..."
if ! docker ps | grep -q travel-mongodb; then
    docker run -d \
        --name travel-mongodb \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        mongo:6.0
    sleep 5
else
    echo -e "${GREEN}✅ MongoDB already running${NC}"
fi

# Start Auth Service
echo ""
echo "🔐 Starting Auth Service (Port 4001)..."
cd travel-ecosystem-backend/micro-services/auth
npm install --silent 2>/dev/null || true
npm run dev > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
echo "Auth Service PID: $AUTH_PID"
cd ../../..

# Start Admin Service
echo ""
echo "👨‍💼 Starting Admin Service (Port 4000)..."
cd travel-ecosystem-backend/micro-services/admin
npm install --silent 2>/dev/null || true
npm run dev > /tmp/admin-service.log 2>&1 &
ADMIN_PID=$!
echo "Admin Service PID: $ADMIN_PID"
cd ../../..

# Start Blog Service
echo ""
echo "📝 Starting Blog Service (Port 4003)..."
cd travel-ecosystem-backend/micro-services/blog
npm install --silent 2>/dev/null || true
npm run dev > /tmp/blog-service.log 2>&1 &
BLOG_PID=$!
echo "Blog Service PID: $BLOG_PID"
cd ../../..

# Wait for services to be ready
sleep 5
wait_for_service "http://localhost:4001/health" "Auth Service"
wait_for_service "http://localhost:4000/health" "Admin Service"
wait_for_service "http://localhost:4003/health" "Blog Service"

# Start Shell
echo ""
echo "🏠 Starting Shell (Port 5173)..."
cd travel-ecosystem/shell
npm install --silent 2>/dev/null || true
npm run dev > /tmp/shell.log 2>&1 &
SHELL_PID=$!
echo "Shell PID: $SHELL_PID"
cd ../..

# Start Blog App
echo ""
echo "📰 Starting Blog App (Port 5001)..."
cd travel-ecosystem/apps/blog
npm install --silent 2>/dev/null || true
npm run dev > /tmp/blog-app.log 2>&1 &
BLOG_APP_PID=$!
echo "Blog App PID: $BLOG_APP_PID"
cd ../../..

# Start Admin Dashboard
echo ""
echo "🎛️  Starting Admin Dashboard (Port 5002)..."
cd travel-ecosystem/apps/admin-dashboard
npm install --silent 2>/dev/null || true
npm run dev > /tmp/admin-dashboard.log 2>&1 &
ADMIN_DASH_PID=$!
echo "Admin Dashboard PID: $ADMIN_DASH_PID"
cd ../../..

# Save PIDs for cleanup
echo "$AUTH_PID" > /tmp/blog-system-pids.txt
echo "$ADMIN_PID" >> /tmp/blog-system-pids.txt
echo "$BLOG_PID" >> /tmp/blog-system-pids.txt
echo "$SHELL_PID" >> /tmp/blog-system-pids.txt
echo "$BLOG_APP_PID" >> /tmp/blog-system-pids.txt
echo "$ADMIN_DASH_PID" >> /tmp/blog-system-pids.txt

echo ""
echo "================================================"
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo "================================================"
echo ""
echo "📍 Service URLs:"
echo "  • Shell (Main):        http://localhost:5173"
echo "  • Blog App:            http://localhost:5001"
echo "  • Admin Dashboard:     http://localhost:5002"
echo "  • Auth Service:        http://localhost:4001"
echo "  • Admin Service:       http://localhost:4000"
echo "  • Blog Service:        http://localhost:4003"
echo "  • MongoDB:             mongodb://localhost:27017"
echo ""
echo "📋 Logs:"
echo "  • Auth Service:        tail -f /tmp/auth-service.log"
echo "  • Admin Service:       tail -f /tmp/admin-service.log"
echo "  • Blog Service:        tail -f /tmp/blog-service.log"
echo "  • Shell:               tail -f /tmp/shell.log"
echo "  • Blog App:            tail -f /tmp/blog-app.log"
echo "  • Admin Dashboard:     tail -f /tmp/admin-dashboard.log"
echo ""
echo "🛑 To stop all services, run:"
echo "   ./stop-blog-system.sh"
echo ""
echo "Press Ctrl+C to view logs..."
sleep 2
tail -f /tmp/auth-service.log /tmp/blog-service.log
