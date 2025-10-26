#!/bin/bash

# Test script for Travel Planning Engine

echo "🧪 Testing Travel Planning Engine..."
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Backend Health Check
echo "Test 1: Backend Health Check"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
    curl -s http://localhost:3000/health | jq .
else
    echo -e "${RED}❌ Backend is not responding on port 3000${NC}"
    echo "   Start it with: cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine && npm run dev:simple"
fi

echo ""

# Test 2: Discovery API
echo "Test 2: Discovery API"
if curl -s -X POST http://localhost:3000/api/v1/discover \
    -H "Content-Type: application/json" \
    -d '{"query":"test"}' | jq -e '.query' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Discovery API is working${NC}"
    echo "   Sample response:"
    curl -s -X POST http://localhost:3000/api/v1/discover \
        -H "Content-Type: application/json" \
        -d '{"query":"test"}' | jq '.metadata'
else
    echo -e "${RED}❌ Discovery API is not responding${NC}"
fi

echo ""

# Test 3: Frontend
echo "Test 3: Frontend Check"
if curl -s http://localhost:5004 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is responding on port 5004${NC}"
    echo "   Open in browser: http://localhost:5004"
else
    echo -e "${YELLOW}⚠️  Frontend is not responding on port 5004${NC}"
    echo "   Start it with: cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/trip-planner && npm run dev"
fi

echo ""

# Test 4: Port Status
echo "Test 4: Port Status"
echo "Checking ports 3000 and 5004..."
lsof -i :3000 -i :5004 2>/dev/null || echo "No services detected"

echo ""
echo "===================="
echo "Test Summary"
echo "===================="
if curl -s http://localhost:3000/health > /dev/null 2>&1 && curl -s http://localhost:5004 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "🌐 Access the application:"
    echo "   Trip Planner: http://localhost:5004"
    echo "   API Backend: http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    echo ""
    echo "Start services:"
    echo "  Backend:  cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine && npm run dev:simple"
    echo "  Frontend: cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/trip-planner && npm run dev"
fi
