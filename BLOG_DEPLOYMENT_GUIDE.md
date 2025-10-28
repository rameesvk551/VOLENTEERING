# Blog & Admin Dashboard Deployment Guide

## Overview
This guide covers deploying the Blog and Admin Dashboard system with authentication using your existing microservices architecture.

## Architecture

### Backend Services (Microservices)
- **Auth Service** (Port 4001): Handles login, logout, signup, token management
- **Admin Service** (Port 4000): Handles admin operations for blog CRUD and user management
- **Blog Service** (Port 4003): Handles blog posts, comments, likes, and ratings

### Frontend Applications
- **Shell** (Port 5173): Host container managing authentication state across micro-frontends
- **Blog App** (Port 5001): Public blog with listing, details, comments, and likes
- **Admin Dashboard** (Port 5002): Admin interface for blog management, comment moderation, and user management

### Database
- **MongoDB** (Port 27017): Shared database for all microservices

## Features

### Blog Application Features
- ✅ Blog listing with pagination, search, and filters
- ✅ Blog details page with full content
- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ Nested comments (replies)
- ✅ Rate posts (1-5 stars)
- ✅ Featured blogs
- ✅ Popular and trending blogs
- ✅ Category and tag filtering

### Admin Dashboard Features
- ✅ Blog CRUD operations (Create, Read, Update, Delete)
- ✅ Draft and published blog management
- ✅ Publish/unpublish blogs
- ✅ Comment moderation (approve/delete)
- ✅ User management (list, edit, delete, activate/deactivate)
- ✅ Category and tag management

### Authentication Features (via Auth Service)
- ✅ User signup with email verification
- ✅ User login with JWT tokens
- ✅ Token refresh mechanism
- ✅ Logout
- ✅ Protected routes
- ✅ Role-based access control (admin, user)

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (included in docker-compose)

## Quick Start with Docker

### 1. Start All Services

```bash
# From the project root
docker-compose -f docker-compose.blog-system.yml up -d
```

This will start:
- MongoDB
- Auth Service
- Admin Service
- Blog Service
- Shell
- Blog App
- Admin Dashboard

### 2. Check Service Health

```bash
# Auth Service
curl http://localhost:4001/health

# Admin Service
curl http://localhost:4000/health

# Blog Service
curl http://localhost:4003/health
```

### 3. Access the Applications

- **Shell (Main Entry)**: http://localhost:5173
- **Blog App**: http://localhost:5001
- **Admin Dashboard**: http://localhost:5002

## Local Development Setup

### 1. Install Dependencies

```bash
# Backend services
cd travel-ecosystem-backend/micro-services/auth
npm install

cd ../admin
npm install

cd ../blog
npm install

# Frontend applications
cd ../../../travel-ecosystem/shell
npm install

cd ../apps/blog
npm install

cd ../admin-dashboard
npm install
```

### 2. Setup Environment Variables

#### Auth Service (.env)
```env
NODE_ENV=development
PORT=4001
MONGODB_URI=mongodb://localhost:27017/travel-auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173,http://localhost:5001,http://localhost:5002
FRONTEND_URL=http://localhost:5173
```

#### Admin Service (.env)
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/travel-admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:5001,http://localhost:5002
```

#### Blog Service (.env)
```env
NODE_ENV=development
PORT=4003
MONGODB_URI=mongodb://localhost:27017/travel-blog
CORS_ORIGIN=http://localhost:5173,http://localhost:5001,http://localhost:5002
```

#### Shell (.env)
```env
VITE_AUTH_API_URL=http://localhost:4001/api/auth
VITE_BLOG_API_URL=http://localhost:4003/api/blog
VITE_ADMIN_API_URL=http://localhost:4000/api/admin
```

#### Blog App (.env)
```env
VITE_BLOG_API_URL=http://localhost:4003/api/blog
VITE_AUTH_API_URL=http://localhost:4001/api/auth
```

#### Admin Dashboard (.env)
```env
VITE_AUTH_API_URL=http://localhost:4001/api/auth
VITE_BLOG_API_URL=http://localhost:4003/api/blog
VITE_ADMIN_API_URL=http://localhost:4000/api/admin
VITE_APP_NAME=Travel Admin Dashboard
```

### 3. Start Services Locally

```bash
# Terminal 1: Auth Service
cd travel-ecosystem-backend/micro-services/auth
npm run dev

# Terminal 2: Admin Service
cd travel-ecosystem-backend/micro-services/admin
npm run dev

# Terminal 3: Blog Service
cd travel-ecosystem-backend/micro-services/blog
npm run dev

# Terminal 4: Shell
cd travel-ecosystem/shell
npm run dev

# Terminal 5: Blog App
cd travel-ecosystem/apps/blog
npm run dev

# Terminal 6: Admin Dashboard
cd travel-ecosystem/apps/admin-dashboard
npm run dev
```

## API Endpoints

### Auth Service (Port 4001)

```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout user
GET    /api/auth/me              - Get current user
POST   /api/auth/refresh         - Refresh access token
POST   /api/auth/verify-email    - Verify email
POST   /api/auth/forgot-password - Request password reset
POST   /api/auth/reset-password  - Reset password
```

### Blog Service (Port 4003)

```
GET    /api/blog                 - Get all published blogs
GET    /api/blog/featured        - Get featured blogs
GET    /api/blog/popular         - Get popular blogs
GET    /api/blog/trending        - Get trending blogs
GET    /api/blog/:slug           - Get blog by slug
GET    /api/blog/id/:id          - Get blog by ID
GET    /api/blog/category/:cat   - Get blogs by category
POST   /api/blog/:id/like        - Toggle like on blog
POST   /api/blog/:id/rate        - Rate a blog
GET    /api/blog/:id/rating      - Get user's rating
GET    /api/blog/categories/list - Get all categories
GET    /api/blog/tags/list       - Get all tags

# Comments
GET    /api/blog/comments/:blogId      - Get comments for blog
POST   /api/blog/comments              - Create comment
PUT    /api/blog/comments/:id/approve  - Approve comment (admin)
DELETE /api/blog/comments/:id          - Delete comment (admin)
```

### Admin Service (Port 4000)

```
# Blog Management
GET    /api/admin/posts          - Get all posts (including drafts)
GET    /api/admin/posts/:id      - Get post by ID
POST   /api/admin/posts          - Create new post
PUT    /api/admin/posts/:id      - Update post
DELETE /api/admin/posts/:id      - Delete post
POST   /api/admin/posts/:id/publish - Publish post

# User Management
GET    /api/admin/users          - Get all users
GET    /api/admin/users/:id      - Get user by ID
PUT    /api/admin/users/:id      - Update user
DELETE /api/admin/users/:id      - Delete user

# Meta
GET    /api/admin/categories     - Get categories
GET    /api/admin/tags           - Get tags
```

## Testing the System

### 1. Test Authentication Flow

```bash
# Signup
curl -X POST http://localhost:4001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (use token from login)
curl http://localhost:4001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Test Blog Operations

```bash
# Get all blogs
curl http://localhost:4003/api/blog

# Get featured blogs
curl http://localhost:4003/api/blog/featured

# Get single blog
curl http://localhost:4003/api/blog/BLOG_SLUG_HERE

# Like a blog (requires user ID header)
curl -X POST http://localhost:4003/api/blog/BLOG_ID_HERE/like \
  -H "x-user-id: USER_ID_HERE"
```

### 3. Test Admin Operations

```bash
# Create blog (requires admin token)
curl -X POST http://localhost:4000/api/admin/posts \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My First Blog",
    "content":"This is the content",
    "excerpt":"Short description",
    "featuredImage":"https://example.com/image.jpg",
    "category":"Travel Tips",
    "tags":["travel","tips"],
    "status":"published"
  }'

# Get all users
curl http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Troubleshooting

### Services Not Starting

1. Check if ports are already in use:
```bash
lsof -i :4001  # Auth
lsof -i :4000  # Admin
lsof -i :4003  # Blog
lsof -i :27017 # MongoDB
```

2. Check Docker logs:
```bash
docker-compose -f docker-compose.blog-system.yml logs -f
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Access MongoDB shell
docker exec -it travel-mongodb mongosh -u admin -p password123
```

### CORS Issues

Make sure CORS_ORIGIN environment variables include all frontend URLs:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5001,http://localhost:5002
```

### Authentication Not Working

1. Check JWT_SECRET is the same across auth and admin services
2. Verify token is being sent in Authorization header
3. Check token expiration

## Production Deployment

### Environment Variables for Production

1. Change all secrets and passwords
2. Update CORS_ORIGIN to production domains
3. Set MONGODB_URI to production MongoDB instance
4. Enable HTTPS
5. Set NODE_ENV=production

### Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific .env files
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Implement API rate limiting

## Monitoring

### Health Checks

All services expose `/health` endpoints:
- http://localhost:4001/health
- http://localhost:4000/health
- http://localhost:4003/health

### Logs

```bash
# View all logs
docker-compose -f docker-compose.blog-system.yml logs -f

# View specific service logs
docker-compose -f docker-compose.blog-system.yml logs -f auth-service
docker-compose -f docker-compose.blog-system.yml logs -f blog-service
```

## Support

For issues or questions, check:
1. Service logs
2. MongoDB connection
3. Environment variables
4. Network connectivity between services
