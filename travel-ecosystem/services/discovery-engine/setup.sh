#!/bin/bash
# Setup script for Discovery Engine Crawler

set -e

echo "🚀 Discovery Engine Crawler Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
echo ""

# Check npm
echo -e "${BLUE}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm not found. Please install npm first.${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Install Playwright browsers
echo -e "${BLUE}Installing Playwright browsers...${NC}"
npx playwright install chromium
echo -e "${GREEN}✓ Playwright browsers installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo ""
fi

# Check MongoDB
echo -e "${BLUE}Checking MongoDB...${NC}"
if command -v mongod &> /dev/null; then
    MONGO_VERSION=$(mongod --version | head -n 1)
    echo -e "${GREEN}✓ MongoDB found: ${MONGO_VERSION}${NC}"
elif command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB not found locally. You can use Docker:${NC}"
    echo "  docker run -d -p 27017:27017 --name mongodb mongo:latest"
else
    echo -e "${YELLOW}⚠ MongoDB not found. Please install MongoDB or use Docker.${NC}"
fi
echo ""

# Check Redis
echo -e "${BLUE}Checking Redis...${NC}"
if command -v redis-server &> /dev/null; then
    REDIS_VERSION=$(redis-server --version | head -n 1)
    echo -e "${GREEN}✓ Redis found: ${REDIS_VERSION}${NC}"
elif command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Redis not found locally. You can use Docker:${NC}"
    echo "  docker run -d -p 6379:6379 --name redis redis:alpine"
else
    echo -e "${YELLOW}⚠ Redis not found. Please install Redis or use Docker.${NC}"
fi
echo ""

# Check Docker
echo -e "${BLUE}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker found: ${DOCKER_VERSION}${NC}"
    echo ""
    echo -e "${BLUE}Quick Start with Docker:${NC}"
    echo "  1. Start services: docker-compose up -d"
    echo "  2. Check status: docker-compose ps"
    echo ""
else
    echo -e "${YELLOW}⚠ Docker not found. Install Docker for easier setup.${NC}"
    echo ""
fi

echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Configure your environment:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Start required services (MongoDB, Redis):"
echo "   ${YELLOW}docker-compose up -d${NC}"
echo "   OR start them locally"
echo ""
echo "3. Test the crawler:"
echo "   ${YELLOW}npm run crawl:test -- -s timeout -c \"Delhi\" -C \"India\"${NC}"
echo ""
echo "4. Crawl your first city:"
echo "   ${YELLOW}npm run crawl -- -c \"Delhi\" -C \"India\"${NC}"
echo ""
echo "5. View statistics:"
echo "   ${YELLOW}npm run crawl:stats${NC}"
echo ""
echo "6. Start the API server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: ${BLUE}CRAWLER_QUICKSTART.md${NC}"
echo "   - Full Guide: ${BLUE}CRAWLER_README.md${NC}"
echo "   - Implementation: ${BLUE}IMPLEMENTATION_SUMMARY.md${NC}"
echo ""
echo "🎉 Happy Crawling!"
