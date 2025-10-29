# Auth Service - Quick Start Guide

## ✅ PostgreSQL Migration Complete!

The Auth Service has been successfully migrated from MongoDB to PostgreSQL. Everything is configured and ready to run!

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)

Simply run the start script:

```powershell
.\start.ps1
```

This will:
- Start PostgreSQL in Docker
- Wait for it to become healthy
- Install dependencies if needed
- Start the Auth Service

### Option 2: Manual Start

#### Step 1: Start PostgreSQL

```powershell
docker-compose up -d
```

Wait for the container to be healthy (about 5-10 seconds):

```powershell
docker ps
# Look for "healthy" status for auth-postgres
```

#### Step 2: Start the Auth Service

```powershell
npx tsx watch src/index.ts
```

Or use the batch file:

```powershell
.\start-dev.bat
```

## 📊 Database Information

### PostgreSQL (Docker)
- **Host:** localhost
- **Port:** 5432
- **Database:** travel_auth
- **User:** postgres
- **Password:** postgres123

### Connection String
```
postgresql://postgres:postgres123@localhost:5432/travel_auth
```

## 🔍 Verify Everything is Working

### 1. Check PostgreSQL Container

```powershell
docker ps --filter "name=auth-postgres"
```

You should see:
```
NAMES           STATUS                   PORTS
auth-postgres   Up X minutes (healthy)   0.0.0.0:5432->5432/tcp
```

### 2. Check Service Logs

Look for these messages in the terminal:

```
✅ PostgreSQL Connection established successfully
📍 Connected to: localhost:5432/travel_auth
✅ Database synchronized
🔐 Auth Service running on port 4001
```

### 3. Test the Health Endpoint

Open a **NEW PowerShell window** and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:4001/health"
```

Expected response:
```json
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2025-10-29T..."
}
```

### 4. Test User Registration

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4001/api/auth/signup" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

## 📝 Available NPM Scripts

```powershell
# Start development server (after Docker is running)
npx tsx watch src/index.ts

# Start PostgreSQL
npm run db:up

# Stop PostgreSQL
npm run db:down

# View PostgreSQL logs
npm run db:logs

# Reset database (removes all data!)
npm run db:reset

# Full start with script
npm run start:full
```

## 🌐 API Endpoints

All endpoints are available at `http://localhost:4001/api/auth/`

### Public Endpoints
- `POST /signup` - Register new user
- `POST /login` - Login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /verify-email` - Verify email with token

### Protected Endpoints (require JWT token)
- `POST /logout` - Logout
- `POST /refresh-token` - Refresh access token
- `POST /change-password` - Change password
- `GET /me` - Get current user profile
- `PUT /update-profile` - Update profile

## 🛠️ Troubleshooting

### Service Won't Start

**Problem:** `Unable to connect to PostgreSQL`

**Solution:**
1. Make sure Docker is running
2. Start PostgreSQL: `docker-compose up -d`
3. Wait 10 seconds for PostgreSQL to be ready
4. Check status: `docker ps`

### Port 4001 Already in Use

**Problem:** `EADDRINUSE: address already in use :::4001`

**Solution:**
```powershell
# Find process using port 4001
netstat -ano | findstr :4001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Port 5432 Already in Use

**Problem:** Another PostgreSQL is using port 5432

**Solution 1:** Stop other PostgreSQL
```powershell
# Check what's using the port
netstat -ano | findstr :5432
```

**Solution 2:** Use a different port
Edit `docker-compose.yml` and `.env`:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead
```

```env
DB_PORT=5433
```

### Database Tables Not Creating

**Problem:** Tables not appearing in database

**Solution:**
1. Check NODE_ENV is set to "development" in `.env`
2. Delete and recreate the container:
```powershell
docker-compose down -v
docker-compose up -d
```

## 🐳 Docker Commands

```powershell
# View logs
docker-compose logs -f postgres

# Stop containers
docker-compose down

# Stop and remove data
docker-compose down -v

# Restart PostgreSQL
docker-compose restart postgres

# Access PostgreSQL shell
docker exec -it auth-postgres psql -U postgres -d travel_auth
```

## 📂 Project Structure

```
auth/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection
│   ├── controllers/
│   │   └── auth.controller.ts    # Auth logic
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── errorHandler.ts       # Error handling
│   │   └── validate.ts           # Input validation
│   ├── models/
│   │   └── User.ts                # User model (Sequelize)
│   ├── routes/
│   │   └── auth.routes.ts         # API routes
│   ├── utils/
│   │   └── email.ts               # Email sending
│   └── index.ts                   # Entry point
├── docker-compose.yml              # PostgreSQL setup
├── .env                            # Environment variables
├── package.json                   # Dependencies
└── start.ps1                      # Startup script
```

## 🔒 Security Notes

**⚠️ IMPORTANT:** The default credentials are for development only!

Before deploying to production:
1. Change `DB_PASSWORD` to a strong password
2. Update `JWT_SECRET` and `JWT_REFRESH_SECRET`
3. Configure proper SMTP credentials for email
4. Set `NODE_ENV=production`
5. Disable database auto-sync in production

## 📚 Additional Documentation

- `MIGRATION_SUMMARY.md` - Summary of MongoDB → PostgreSQL changes
- `POSTGRES_MIGRATION_GUIDE.md` - Detailed migration guide
- `README_POSTGRES.md` - PostgreSQL-specific documentation

## ✨ What's New

### Database Changes
- ✅ PostgreSQL instead of MongoDB
- ✅ Sequelize ORM instead of Mongoose
- ✅ Integer IDs instead of ObjectIds
- ✅ JSONB for preferences
- ✅ PostgreSQL arrays for refresh tokens
- ✅ Proper indexes for performance

### Features
- ✅ Connection pooling
- ✅ Auto-retry on connection failure
- ✅ Healthier error handling
- ✅ Docker-based PostgreSQL
- ✅ Easy startup scripts

## 🎉 Ready to Go!

Everything is set up and ready to use. Just run:

```powershell
.\start.ps1
```

And you're good to go!

---

**Questions or Issues?**
Check the troubleshooting section above or review the detailed migration guide.
