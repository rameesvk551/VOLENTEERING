#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Travel Ecosystem Backend Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}\n"

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB client not found. Make sure MongoDB is installed and running.${NC}\n"
fi

# Function to setup a service
setup_service() {
    local service_path=$1
    local service_name=$2
    
    echo -e "${BLUE}📦 Setting up ${service_name}...${NC}"
    
    if [ -d "$service_path" ]; then
        cd "$service_path"
        
        # Copy .env.example to .env if not exists
        if [ -f ".env.example" ] && [ ! -f ".env" ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created .env file${NC}"
        fi
        
        # Install dependencies
        echo -e "${BLUE}  Installing dependencies...${NC}"
        npm install
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ ${service_name} setup complete${NC}\n"
        else
            echo -e "${RED}❌ Failed to setup ${service_name}${NC}\n"
            exit 1
        fi
        
        cd - > /dev/null
    else
        echo -e "${RED}❌ Service directory not found: ${service_path}${NC}\n"
        exit 1
    fi
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Setup each service
echo -e "${YELLOW}Setting up microservices...${NC}\n"

setup_service "api-gateway" "API Gateway"
setup_service "micro-services/auth" "Auth Service"
setup_service "micro-services/blog" "Blog Service"
setup_service "micro-services/admin" "Admin Service"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update .env files in each service with your configuration"
echo -e "2. Make sure MongoDB is running"
echo -e "3. Start services:\n"
echo -e "${BLUE}Development mode (separate terminals):${NC}"
echo -e "  cd api-gateway && npm run dev"
echo -e "  cd micro-services/auth && npm run dev"
echo -e "  cd micro-services/blog && npm run dev"
echo -e "  cd micro-services/admin && npm run dev\n"
echo -e "${BLUE}Or use Docker:${NC}"
echo -e "  docker-compose up -d\n"

echo -e "${YELLOW}Service URLs:${NC}"
echo -e "  API Gateway:    http://localhost:4000"
echo -e "  Auth Service:   http://localhost:4001"
echo -e "  Admin Service:  http://localhost:4002"
echo -e "  Blog Service:   http://localhost:4003\n"

echo -e "${YELLOW}API Documentation:${NC}"
echo -e "  GET  http://localhost:4000/          - Gateway info"
echo -e "  POST http://localhost:4000/api/auth/signup"
echo -e "  POST http://localhost:4000/api/auth/login"
echo -e "  GET  http://localhost:4000/api/blog\n"
