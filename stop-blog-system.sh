#!/bin/bash

# Stop Blog System Script

echo "🛑 Stopping Blog & Admin Dashboard System..."

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill processes from PID file
if [ -f /tmp/blog-system-pids.txt ]; then
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "Killing process $pid..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        fi
    done < /tmp/blog-system-pids.txt
    rm /tmp/blog-system-pids.txt
fi

# Stop MongoDB Docker container
if docker ps | grep -q travel-mongodb; then
    echo "Stopping MongoDB container..."
    docker stop travel-mongodb
    docker rm travel-mongodb
fi

# Clean up log files
rm -f /tmp/auth-service.log
rm -f /tmp/admin-service.log
rm -f /tmp/blog-service.log
rm -f /tmp/shell.log
rm -f /tmp/blog-app.log
rm -f /tmp/admin-dashboard.log

echo -e "${GREEN}✅ All services stopped successfully!${NC}"
