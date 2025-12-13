#!/bin/bash

# Pre-Deployment Checklist and Deployment Script
# This script checks all services and prepares them for deployment

set -e

echo "================================"
echo "PRE-DEPLOYMENT HEALTH CHECK"
echo "================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_PASSED=true

# Parse command line arguments
FORCE_DEPLOY=false
if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
    FORCE_DEPLOY=true
    echo -e "${YELLOW}⚠ Running in FORCE mode - uncommitted changes will be ignored${NC}"
    echo ""
fi

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ALL_PASSED=false
        return 1
    fi
}

echo "0. CHECKING GIT STATUS"
echo "=================================="
echo ""

# Check for uncommitted changes
echo -n "→ Git Working Tree Status... "
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
else
    if [ "$FORCE_DEPLOY" = true ]; then
        echo -e "${YELLOW}⚠ WARNING: Uncommitted changes detected (proceeding anyway)${NC}"
    else
        echo -e "${RED}✗ FAILED - Uncommitted changes detected${NC}"
        echo ""
        echo -e "${YELLOW}You have uncommitted changes in your working directory.${NC}"
        echo -e "${YELLOW}Please commit or stash your changes before deployment.${NC}"
        echo ""
        echo "Changed files:"
        git status --short
        echo ""
        echo -e "${YELLOW}To proceed anyway, use: $0 --force${NC}"
        echo ""
        exit 1
    fi
fi

echo ""

echo "1. CHECKING FRONTEND APPLICATIONS"
echo "=================================="
echo ""

# Check Shell
echo -n "→ Shell Application Build Test... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/shell
npm run build > /dev/null 2>&1
check_status

# Check Blog
echo -n "→ Blog Application Build Test... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/blog
npm run build > /dev/null 2>&1
check_status

# Check Admin Dashboard
echo -n "→ Admin Dashboard Build Test... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/apps/admin-dashboard
npm run build > /dev/null 2>&1
check_status

echo ""
echo "2. CHECKING BACKEND SERVICES"
echo "=================================="
echo ""

# Check API Gateway
echo -n "→ API Gateway TypeScript Check... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem-backend/api-gateway
npx tsc --noEmit > /dev/null 2>&1
check_status

# Check Auth Service
echo -n "→ Auth Service TypeScript Check... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem-backend/micro-services/auth
npx tsc --noEmit > /dev/null 2>&1
check_status

# Check Blog Service
echo -n "→ Blog Service TypeScript Check... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem-backend/micro-services/blog
npx tsc --noEmit > /dev/null 2>&1
check_status

# Check Admin Service
echo -n "→ Admin Service TypeScript Check... "
cd /home/ramees/www/VOLENTEERING/travel-ecosystem-backend/micro-services/admin
npx tsc --noEmit > /dev/null 2>&1
check_status

echo ""
echo "3. CHECKING ENVIRONMENT CONFIGURATIONS"
echo "======================================="
echo ""

# Check Shell .env
echo -n "→ Shell .env Configuration... "
if [ -f "/home/ramees/www/VOLENTEERING/travel-ecosystem/shell/.env" ]; then
    check_status
else
    echo -e "${YELLOW}⚠ WARNING: .env file not found${NC}"
fi

# Check Admin Dashboard .env
echo -n "→ Admin Dashboard .env Configuration... "
if [ -f "/home/ramees/www/VOLENTEERING/travel-ecosystem/apps/admin-dashboard/.env" ]; then
    check_status
else
    echo -e "${YELLOW}⚠ WARNING: .env file not found${NC}"
fi

# Check API Gateway .env
echo -n "→ API Gateway .env Configuration... "
if [ -f "/home/ramees/www/VOLENTEERING/travel-ecosystem-backend/api-gateway/.env" ]; then
    check_status
else
    echo -e "${YELLOW}⚠ WARNING: .env file not found${NC}"
fi

echo ""
echo "4. CHECKING DOCKER CONFIGURATIONS"
echo "=================================="
echo ""

# Check Dockerfiles
echo -n "→ Blog Dockerfile... "
if [ -f "/home/ramees/www/VOLENTEERING/travel-ecosystem/apps/blog/Dockerfile" ]; then
    check_status
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    ALL_PASSED=false
fi

echo -n "→ Admin Dashboard Dockerfile... "
if [ -f "/home/ramees/www/VOLENTEERING/travel-ecosystem/apps/admin-dashboard/Dockerfile" ]; then
    check_status
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    ALL_PASSED=false
fi

echo -n "→ API Gateway Dockerfile... "
if [ -f "/home/ramees/www/VOLENTEERING/travel-ecosystem-backend/api-gateway/Dockerfile" ]; then
    check_status
else
    echo -e "${RED}✗ NOT FOUND${NC}"
    ALL_PASSED=false
fi

echo ""
echo "================================"
echo "FINAL SUMMARY"
echo "================================"
echo ""

if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your applications are ready for deployment!"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Review the deployment guide: DEPLOYMENT_GUIDE.md"
    echo "2. Set up your production environment variables"
    echo "3. Deploy using Docker Compose or your preferred method"
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi
