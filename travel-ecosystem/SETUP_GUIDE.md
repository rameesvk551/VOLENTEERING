# Complete Setup Guide - AI Travel Discovery Platform

This guide will walk you through setting up the entire AI-powered travel discovery platform from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# 1. Node.js (v18 or higher)
node --version  # Should output v18.x.x or higher
npm --version   # Should output v9.x.x or higher

# If not installed, download from https://nodejs.org/

# 2. Docker & Docker Compose
docker --version         # Should output 20.x.x or higher
docker-compose --version # Should output 2.x.x or higher

# If not installed:
# - Mac: Install Docker Desktop
# - Windows: Install Docker Desktop
# - Linux: Install Docker Engine + Docker Compose
```

### Required API Keys

1. **OpenAI API Key** (REQUIRED)
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - **Cost**: ~$0.50 per 1000 queries (with caching)
   - Make sure you have credits in your OpenAI account

---

## Environment Setup

### 1. Clone or Navigate to Project

```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem
```

### 2. Install Dependencies

#### Frontend Dependencies

```bash
cd apps/trip-planner
npm install

# Expected output:
# - Installing ~50 packages
# - Time: 1-2 minutes
# - No errors

# Verify installation
npm list react react-dom
# Should show react@18.2.0 and react-dom@18.2.0
```

#### Backend Dependencies

```bash
cd ../../services/discovery-engine
npm install

# Expected output:
# - Installing ~80 packages
# - Time: 2-3 minutes
# - No errors

# Verify installation
npm list @langchain/core @langchain/openai
# Should show installed versions
```

---

## Database Configuration

### Option 1: Using Docker Compose (Recommended)

#### 1. Start All Databases

```bash
# From project root
cd /home/ramees/www/VOLENTEERING/travel-ecosystem

# Start databases in detached mode
docker-compose up -d

# Expected output:
# Creating travel-mongodb ... done
# Creating travel-redis    ... done
# Creating travel-weaviate ... done
```

#### 2. Verify Databases are Running

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME              STATE    PORTS
# travel-mongodb    Up       0.0.0.0:27017->27017/tcp
# travel-redis      Up       0.0.0.0:6379->6379/tcp
# travel-weaviate   Up       0.0.0.0:8080->8080/tcp
```

#### 3. Test Connections

```bash
# Test MongoDB
docker exec -it travel-mongodb mongosh --eval "db.version()"
# Should output MongoDB version

# Test Redis
docker exec -it travel-redis redis-cli ping
# Should output: PONG

# Test Weaviate
curl http://localhost:8080/v1/meta
# Should return JSON with version info
```

### Option 2: Using Existing Databases

If you have existing MongoDB, Redis, or Weaviate instances:

1. Update the connection strings in `.env` file
2. Ensure they're accessible from your development machine
3. Test connections using the commands above (adjust for your setup)

---

## Backend Setup

### 1. Configure Environment Variables

```bash
cd services/discovery-engine

# Copy example environment file
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

#### Required Configuration

Update these values in `.env`:

```bash
# CRITICAL: Add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here

# Database URLs (default values work with Docker setup)
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
REDIS_PORT=6379
WEAVIATE_URL=http://localhost:8080

# Server Configuration (defaults are fine)
NODE_ENV=development
PORT=3000
```

### 2. Initialize Database Schema

```bash
# Still in services/discovery-engine directory

# Run the server once to initialize Weaviate schema
npm run dev

# You should see:
# ✓ MongoDB connected successfully
# ✓ Redis connected successfully
# ✓ Weaviate connected successfully
# ✓ Weaviate schema created successfully
# ✓ Server listening on http://0.0.0.0:3000

# Stop the server (Ctrl+C)
```

### 3. Seed Sample Data (Optional)

```bash
# Add sample places for testing
npm run seed

# Expected output:
# ✓ Successfully seeded 5 places
# ✓ Database seeding completed successfully
```

**Note**: Add the seed script to `package.json`:

```json
{
  "scripts": {
    "seed": "tsx src/utils/seed-data.ts"
  }
}
```

### 4. Test Backend API

```bash
# In a new terminal, start the backend
cd services/discovery-engine
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-21T...","uptime":123.45}

# Test discovery endpoint (requires sample data)
curl -X POST http://localhost:3000/api/v1/discover \
  -H "Content-Type: application/json" \
  -d '{"query": "Delhi in October"}'

# Should return JSON with discovery results
```

---

## Frontend Setup

### 1. Configure Environment Variables

```bash
cd apps/trip-planner

# Copy example environment file
cp .env.example .env

# Edit the .env file
nano .env
```

Update `.env`:

```bash
# Discovery API URL
VITE_DISCOVERY_API_URL=http://localhost:3000/api/v1
```

### 2. Start Frontend Development Server

```bash
# Still in apps/trip-planner directory
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5004/
# ➜  Network: use --host to expose
```

### 3. Access the Application

Open your browser and navigate to:

- **Main App**: http://localhost:5004
- **AI Discovery**: http://localhost:5004/ai-discovery

---

## Verification

### Complete System Check

#### 1. Backend Health Check

```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Test stats endpoint
curl http://localhost:3000/api/v1/stats

# Should show database statistics
```

#### 2. Frontend Integration Check

1. **Navigate to AI Discovery**: http://localhost:5004/ai-discovery
2. **Enter a query**: "Delhi in October"
3. **Verify**:
   - ✓ Loading indicator appears
   - ✓ Entity chips are displayed (Delhi, October)
   - ✓ Summary section appears with headline and highlights
   - ✓ Results grid shows cards
   - ✓ Recommendations carousel appears at bottom

#### 3. Integration Test

1. **Search**: Enter "Paris food tours"
2. **Add to Trip**: Click the "+" button on any result card
3. **Navigate**: Click "View My Trip" button
4. **Verify**: The destination appears in your trip planner

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Symptoms**: Error message about MongoDB connection

**Solutions**:

```bash
# 1. Check if MongoDB container is running
docker ps | grep mongo

# 2. Check MongoDB logs
docker logs travel-mongodb

# 3. Restart MongoDB
docker-compose restart mongodb

# 4. Verify connection
docker exec -it travel-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Issue: "OpenAI API key is invalid"

**Symptoms**: 401 errors when making discovery requests

**Solutions**:

```bash
# 1. Verify API key in .env file
cat services/discovery-engine/.env | grep OPENAI_API_KEY

# 2. Test API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# 3. Regenerate API key if needed
# Visit https://platform.openai.com/api-keys
```

### Issue: "Weaviate schema not found"

**Symptoms**: Errors about missing schema or class

**Solutions**:

```bash
# 1. Check Weaviate is running
curl http://localhost:8080/v1/meta

# 2. Check schema exists
curl http://localhost:8080/v1/schema

# 3. Restart backend to recreate schema
cd services/discovery-engine
npm run dev
# Schema is created automatically on startup
```

### Issue: "CORS error in browser"

**Symptoms**: Console errors about CORS policy

**Solutions**:

```bash
# 1. Update .env in backend
ALLOWED_ORIGINS=http://localhost:5004,http://localhost:3000

# 2. Restart backend server
cd services/discovery-engine
npm run dev
```

### Issue: "Port already in use"

**Symptoms**: Error: "EADDRINUSE: address already in use"

**Solutions**:

```bash
# Find process using port 3000
lsof -i :3000
# OR on Windows
netstat -ano | findstr :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Issue: "Module not found" errors

**Symptoms**: Cannot find module '@langchain/...' or similar

**Solutions**:

```bash
# 1. Delete node_modules and reinstall
cd services/discovery-engine
rm -rf node_modules package-lock.json
npm install

# 2. Verify TypeScript paths
npm run type-check

# 3. Clear npm cache if needed
npm cache clean --force
```

---

## Next Steps

### 1. Customize the System

- **Add More Sample Data**: Edit `services/discovery-engine/src/utils/seed-data.ts`
- **Customize UI**: Modify components in `apps/trip-planner/src/components/discovery/`
- **Adjust AI Prompts**: Edit prompts in `services/discovery-engine/src/chains/discovery.chain.ts`

### 2. Production Deployment

See [docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md](docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md) for:
- Deployment strategies
- Environment configuration
- Scaling recommendations
- Cost optimization

### 3. Implement Web Crawlers

The crawler framework is ready at `services/discovery-engine/src/crawlers/` but needs:
- Specific crawler implementations
- ETL pipeline configuration
- Scheduling setup

---

## Development Workflow

### Typical Development Session

```bash
# Terminal 1 - Databases
docker-compose up

# Terminal 2 - Backend
cd services/discovery-engine
npm run dev

# Terminal 3 - Frontend
cd apps/trip-planner
npm run dev

# Terminal 4 - Testing/Commands
curl http://localhost:3000/api/v1/health
```

### Before Committing Code

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests (when available)
npm test
```

---

## Support

If you encounter issues not covered in this guide:

1. Check the logs in your terminal
2. Review the architecture document: `docs/AI_TRAVEL_DISCOVERY_ARCHITECTURE.md`
3. Check Docker logs: `docker-compose logs`
4. Verify environment variables are set correctly

---

**You're all set! 🚀**

Start exploring the AI-powered travel discovery platform and happy coding!
