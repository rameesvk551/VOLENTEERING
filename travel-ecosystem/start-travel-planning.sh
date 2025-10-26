#!/bin/bash

# Travel Planning Engine Startup Script
# This script starts both the discovery engine backend and trip planner frontend

echo "🚀 Starting Travel Planning Engine..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ports are already in use
echo "📋 Checking ports..."

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Stopping existing process...${NC}"
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 5173 is already in use. Stopping existing process...${NC}"
    kill -9 $(lsof -t -i:5173) 2>/dev/null || true
    sleep 2
fi

echo ""
echo -e "${GREEN}✅ Ports are available${NC}"
echo ""

# Start Discovery Engine Backend
echo -e "${BLUE}📡 Starting Discovery Engine Backend (Port 3000)...${NC}"
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
npm run dev:simple > /tmp/discovery-engine.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Backend may not be fully ready, continuing anyway...${NC}"
    fi
    sleep 1
done

echo ""

# Start Trip Planner Frontend
echo -e "${BLUE}🌐 Starting Trip Planner Frontend (Port 5173)...${NC}"
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/trip-planner
npm run dev > /tmp/trip-planner.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Travel Planning Engine Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📡 Discovery Engine: ${BLUE}http://localhost:3000${NC}"
echo -e "   Health Check: ${BLUE}http://localhost:3000/health${NC}"
echo -e "   Logs: tail -f /tmp/discovery-engine.log"
echo ""
echo -e "🌐 Trip Planner: ${BLUE}http://localhost:5173${NC}"
echo -e "   Logs: tail -f /tmp/trip-planner.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Save PIDs to file for easy cleanup
echo "$BACKEND_PID" > /tmp/travel-planning-pids.txt
echo "$FRONTEND_PID" >> /tmp/travel-planning-pids.txt

# Wait for Ctrl+C
trap cleanup INT

cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f /tmp/travel-planning-pids.txt
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Keep script running
wait
