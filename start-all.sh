#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Travel Ecosystem - Complete Setup & Run          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}\n"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

if ! command -v mongod &> /dev/null && ! pgrep -x mongod > /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB may not be running. Make sure it's started.${NC}"
else
    echo -e "${GREEN}✓ MongoDB detected${NC}"
fi

echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠ Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Setup backend
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Setting up Backend Services${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

cd travel-ecosystem-backend

# Check if already set up
if [ ! -d "api-gateway/node_modules" ]; then
    echo -e "${YELLOW}Running first-time setup...${NC}\n"
    chmod +x setup.sh
    ./setup.sh
else
    echo -e "${GREEN}✓ Backend already set up${NC}\n"
fi

# Start backend services
echo -e "${BLUE}Starting backend services...${NC}\n"

# Check ports
check_port 4000 || echo -e "${RED}API Gateway port occupied${NC}"
check_port 4001 || echo -e "${RED}Auth Service port occupied${NC}"
check_port 4002 || echo -e "${RED}Admin Service port occupied${NC}"
check_port 4003 || echo -e "${RED}Blog Service port occupied${NC}"

# Start services in background
echo -e "${GREEN}Starting API Gateway (Port 4000)...${NC}"
cd api-gateway && npm run dev > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
cd ..

sleep 2

echo -e "${GREEN}Starting Auth Service (Port 4001)...${NC}"
cd micro-services/auth && npm run dev > ../../logs/auth.log 2>&1 &
AUTH_PID=$!
cd ../..

sleep 2

echo -e "${GREEN}Starting Blog Service (Port 4003)...${NC}"
cd micro-services/blog && npm run dev > ../../logs/blog.log 2>&1 &
BLOG_PID=$!
cd ../..

sleep 2

echo -e "${GREEN}Starting Admin Service (Port 4002)...${NC}"
cd micro-services/admin && npm run dev > ../../logs/admin.log 2>&1 &
ADMIN_PID=$!
cd ../..

cd ..

# Wait for services to start
echo -e "\n${YELLOW}Waiting for services to initialize...${NC}"
sleep 5

# Setup frontend
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Setting up Frontend Applications${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

cd travel-ecosystem

# Shell setup
if [ ! -d "shell/node_modules" ]; then
    echo -e "${YELLOW}Setting up Shell app...${NC}"
    cd shell
    npm install
    if [ ! -f ".env" ]; then
        echo "VITE_API_URL=http://localhost:4000" > .env
    fi
    cd ..
fi

# Blog setup
if [ ! -d "apps/blog/node_modules" ]; then
    echo -e "${YELLOW}Setting up Blog app...${NC}"
    cd apps/blog
    npm install
    if [ ! -f ".env" ]; then
        echo "VITE_API_URL=http://localhost:4000" > .env
    fi
    cd ../..
fi

# Admin setup
if [ ! -d "apps/admin-dashboard/node_modules" ]; then
    echo -e "${YELLOW}Setting up Admin Dashboard...${NC}"
    cd apps/admin-dashboard
    npm install
    if [ ! -f ".env" ]; then
        echo "VITE_API_URL=http://localhost:4000" > .env
    fi
    cd ../..
fi

# Start frontend apps
mkdir -p logs

echo -e "\n${BLUE}Starting frontend applications...${NC}\n"

echo -e "${GREEN}Starting Shell App (Port 5173)...${NC}"
cd shell && npm run dev > ../logs/shell.log 2>&1 &
SHELL_PID=$!
cd ..

sleep 3

echo -e "${GREEN}Starting Blog Frontend (Port 5174)...${NC}"
cd apps/blog && npm run dev > ../../logs/blog-frontend.log 2>&1 &
BLOG_FRONTEND_PID=$!
cd ../..

sleep 3

echo -e "${GREEN}Starting Admin Dashboard (Port 5175)...${NC}"
cd apps/admin-dashboard && npm run dev > ../../logs/admin-dashboard.log 2>&1 &
ADMIN_DASHBOARD_PID=$!
cd ../..

cd ..

# Save PIDs
mkdir -p .pids
echo $GATEWAY_PID > .pids/gateway.pid
echo $AUTH_PID > .pids/auth.pid
echo $BLOG_PID > .pids/blog.pid
echo $ADMIN_PID > .pids/admin.pid
echo $SHELL_PID > .pids/shell.pid
echo $BLOG_FRONTEND_PID > .pids/blog-frontend.pid
echo $ADMIN_DASHBOARD_PID > .pids/admin-dashboard.pid

# Wait for everything to start
echo -e "\n${YELLOW}Waiting for all services to be ready...${NC}"
sleep 10

# Display status
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉 All Services Started Successfully! 🎉     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}Backend Services:${NC}"
echo -e "  ✓ API Gateway:       ${GREEN}http://localhost:4000${NC}"
echo -e "  ✓ Auth Service:      ${GREEN}http://localhost:4001${NC}"
echo -e "  ✓ Admin Service:     ${GREEN}http://localhost:4002${NC}"
echo -e "  ✓ Blog Service:      ${GREEN}http://localhost:4003${NC}\n"

echo -e "${BLUE}Frontend Applications:${NC}"
echo -e "  ✓ Shell (Main):      ${GREEN}http://localhost:5173${NC}"
echo -e "  ✓ Blog Frontend:     ${GREEN}http://localhost:5174${NC}"
echo -e "  ✓ Admin Dashboard:   ${GREEN}http://localhost:5175${NC}\n"

echo -e "${YELLOW}Quick Test Commands:${NC}"
echo -e "  ${BLUE}# Test API Gateway${NC}"
echo -e "  curl http://localhost:4000\n"
echo -e "  ${BLUE}# Register a user${NC}"
echo -e '  curl -X POST http://localhost:4000/api/auth/signup \\'
echo -e '    -H "Content-Type: application/json" \\'
echo -e '    -d '"'"'{"name":"Test User","email":"test@example.com","password":"password123"}'"'"'\n'
echo -e "  ${BLUE}# Get blogs${NC}"
echo -e "  curl http://localhost:4000/api/blog\n"

echo -e "${YELLOW}View Logs:${NC}"
echo -e "  tail -f travel-ecosystem-backend/logs/gateway.log"
echo -e "  tail -f travel-ecosystem/logs/shell.log\n"

echo -e "${YELLOW}Stop All Services:${NC}"
echo -e "  ./stop-all.sh\n"

echo -e "${GREEN}Open your browser and visit:${NC}"
echo -e "  ${BLUE}http://localhost:5173${NC} - Main Application\n"

# Create stop script
cat > stop-all.sh << 'EOF'
#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Stopping all services...${NC}\n"

if [ -d ".pids" ]; then
    for pid_file in .pids/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            if ps -p $pid > /dev/null 2>&1; then
                kill $pid
                echo "Stopped process $pid"
            fi
            rm "$pid_file"
        fi
    done
    rmdir .pids 2>/dev/null
fi

echo -e "\n${GREEN}All services stopped!${NC}"
EOF

chmod +x stop-all.sh

echo -e "${YELLOW}Process IDs saved to .pids/ directory${NC}"
echo -e "${YELLOW}All logs saved to logs/ directories${NC}\n"
