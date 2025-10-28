# 🚀 Quick Start Guide - Blog & Admin Dashboard

## What We Built

✅ **Complete Blog System** with your existing microservices backend:
- Blog listing, details, comments, likes
- Admin dashboard for content management
- User authentication and management
- All connected to your microservices (Auth, Admin, Blog services)

## 📋 Prerequisites

- Docker installed (for MongoDB)
- Node.js 18+ installed
- Ports available: 4000, 4001, 4003, 5001, 5002, 5173, 27017

## 🎯 3-Step Quick Start

### Step 1: Start All Services
```bash
cd /home/ramees/www/VOLENTEERING
./start-blog-system.sh
```

This starts:
- MongoDB (Docker container)
- Auth Service (Port 4001)
- Admin Service (Port 4000)  
- Blog Service (Port 4003)
- Shell (Port 5173)
- Blog App (Port 5001)
- Admin Dashboard (Port 5002)

### Step 2: Test the System
```bash
./test-blog-system.sh
```

This will:
- Test all service health checks
- Create a test user
- Test authentication
- Verify all API endpoints

### Step 3: Access the Applications

🌐 **Open in your browser:**
- Main Shell: http://localhost:5173
- Blog App: http://localhost:5001
- Admin Dashboard: http://localhost:5002

## 🔑 Default Access

After running the test script, you'll get test credentials:
- Email: test[timestamp]@example.com
- Password: Password123!

**To create an admin user**, you need to:
1. Sign up normally
2. Update the user role in MongoDB to 'admin'

```bash
# Connect to MongoDB
docker exec -it travel-mongodb mongosh -u admin -p password123

# Switch to auth database
use travel-auth

# Update user role
db.users.updateOne(
  {email: "your-email@example.com"},
  {$set: {role: "admin"}}
)
```

## 📡 API Endpoints Overview

### Authentication (Port 4001)
```
POST /api/auth/signup    - Create account
POST /api/auth/login     - Login
GET  /api/auth/me        - Get profile
POST /api/auth/logout    - Logout
```

### Blog Public API (Port 4003)
```
GET  /api/blog                  - List all blogs
GET  /api/blog/:slug            - Get blog details
POST /api/blog/:id/like         - Like a blog
GET  /api/blog/comments/:blogId - Get comments
POST /api/blog/comments         - Add comment
```

### Admin API (Port 4000)
```
GET    /api/admin/posts     - List all posts
POST   /api/admin/posts     - Create post
PUT    /api/admin/posts/:id - Update post
DELETE /api/admin/posts/:id - Delete post
GET    /api/admin/users     - List users
PUT    /api/admin/users/:id - Update user
```

## �� Manual Testing Examples

### Create a User
```bash
curl -X POST http://localhost:4001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get All Blogs
```bash
curl http://localhost:4003/api/blog
```

### Create a Blog (Admin)
```bash
curl -X POST http://localhost:4000/api/admin/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the full content of my blog post...",
    "excerpt": "A short summary",
    "featuredImage": "https://example.com/image.jpg",
    "category": "Travel Tips",
    "tags": ["travel", "tips"],
    "status": "published"
  }'
```

## 🛑 Stop Services

```bash
./stop-blog-system.sh
```

## 📁 Key Files Created

```
VOLENTEERING/
├── start-blog-system.sh              # Start all services
├── stop-blog-system.sh               # Stop all services
├── test-blog-system.sh               # Integration tests
├── docker-compose.blog-system.yml    # Docker configuration
├── BLOG_DEPLOYMENT_GUIDE.md          # Detailed guide
├── BLOG_README.md                    # Full documentation
│
├── travel-ecosystem/
│   ├── shell/src/services/
│   │   └── authService.ts            # Auth API client
│   ├── apps/blog/services/
│   │   └── blogApi.ts                # Blog API client
│   └── apps/admin-dashboard/src/services/
│       └── adminApi.ts               # Admin API client
│
└── travel-ecosystem-backend/
    └── micro-services/
        ├── auth/     # Already exists ✅
        ├── admin/    # Already exists ✅
        └── blog/     # Already exists ✅
```

## 🔍 Troubleshooting

### Services Won't Start
```bash
# Check ports
lsof -i :4001
lsof -i :4000
lsof -i :4003

# View logs
tail -f /tmp/auth-service.log
tail -f /tmp/blog-service.log
tail -f /tmp/admin-service.log
```

### MongoDB Issues
```bash
# Check MongoDB container
docker ps | grep mongodb

# Restart MongoDB
docker restart travel-mongodb

# View MongoDB logs
docker logs travel-mongodb
```

### CORS Errors
Make sure your backend services have CORS configured for all frontend URLs:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5001,http://localhost:5002
```

## 📚 Learn More

- [Complete Deployment Guide](./BLOG_DEPLOYMENT_GUIDE.md)
- [Full Documentation](./BLOG_README.md)

## ✅ What's Working

✅ Authentication (signup, login, logout, token refresh)
✅ Blog listing with pagination and filters
✅ Blog details with full content
✅ Like/unlike functionality
✅ Comments system
✅ Blog ratings
✅ Admin blog CRUD operations
✅ Comment moderation
✅ User management
✅ Category and tag management
✅ Featured/popular/trending blogs
✅ Search functionality

## 🎉 You're Ready!

Everything is set up and ready to use. Just run:
```bash
./start-blog-system.sh
```

Then visit http://localhost:5173 to get started!
