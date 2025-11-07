#!/bin/bash

# Start all development servers concurrently

echo "🚀 Starting Travel Ecosystem Development Environment..."
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please free it before starting."
        return 1
    fi
    return 0
}

# Check all required ports
echo "Checking ports..."
check_port 1001 || exit 1
check_port 1002 || exit 1
check_port 1003 || exit 1
check_port 1004 || exit 1
check_port 1005 || exit 1
check_port 1006 || exit 1

echo "✅ All ports available"
echo ""

# Install dependencies if needed
if [ ! -d "shell/node_modules" ]; then
    echo "📦 Installing shell dependencies..."
    cd shell && npm install && cd ..
fi

if [ ! -d "apps/blog/node_modules" ]; then
    echo "📦 Installing blog dependencies..."
    cd apps/blog && npm install && cd ../..
fi

if [ ! -d "apps/visa-explorer/node_modules" ]; then
    echo "📦 Installing visa-explorer dependencies..."
    cd apps/visa-explorer && npm install && cd ../..
fi

if [ ! -d "apps/trip-planner/node_modules" ]; then
    echo "📦 Installing trip-planner dependencies..."
    cd apps/trip-planner && npm install && cd ../..
fi

if [ ! -d "apps/volunteering/node_modules" ]; then
    echo "📦 Installing volunteering dependencies..."
    cd apps/volunteering && npm install && cd ../..
fi

echo ""
echo "🎬 Starting all services..."
echo ""
echo "  Shell:         http://localhost:1001"
echo "  Blog:          http://localhost:1002"
echo "  Admin Dashboard: http://localhost:1003"
echo "  Visa Explorer: http://localhost:1004"
echo "  Trip Planner:  http://localhost:1005"
echo "  Volunteering:  http://localhost:1006"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start all services using npm-run-all or concurrently
# Using simple backgrounding with trap for cleanup

trap 'kill $(jobs -p) 2>/dev/null' EXIT

(cd shell && npm run dev) &
(cd apps/blog && npm run dev) &
(cd apps/admin-dashboard && npm run dev) &
(cd apps/visa-explorer && npm run dev) &
(cd apps/trip-planner && npm run dev) &
(cd apps/volunteering && npm run dev) &

# Wait for all background jobs
wait
