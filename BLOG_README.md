# Blog & Admin Dashboard System

Complete blog and admin dashboard system with authentication, built using microservices architecture.

## 🎯 Features

### Blog Application
- **Blog Listing**: Browse all published blogs with pagination
- **Blog Details**: View full blog content with metadata
- **Like System**: Like/unlike blog posts
- **Comments**: Add comments and reply to other comments
- **Ratings**: Rate blogs (1-5 stars)
- **Search & Filter**: Search blogs and filter by category/tags
- **Featured Blogs**: Showcase important posts
- **Popular/Trending**: Discover most viewed and trending content

### Admin Dashboard
- **Blog Management**: Create, edit, update, and delete blog posts
- **Draft System**: Save blogs as drafts before publishing
- **Publish Control**: Publish and unpublish blogs
- **Comment Moderation**: Approve or delete user comments
- **User Management**: View, edit, and manage user accounts
- **Role Management**: Control user access levels
- **Analytics**: View blog statistics and engagement

### Authentication System
- **User Signup**: Register with email verification
- **User Login**: Secure JWT-based authentication
- **Token Refresh**: Automatic token refresh for seamless experience
- **Logout**: Secure session termination
- **Protected Routes**: Role-based access control
- **Password Reset**: Forgot password functionality

## 🏗️ Architecture

### Backend Services (Microservices)
```
┌─────────────────┐
│  Auth Service   │  Port 4001
│  (Login, JWT)   │
└─────────────────┘
        │
┌─────────────────┐
│  Admin Service  │  Port 4000
│  (Blog CRUD)    │
└─────────────────┘
        │
┌─────────────────┐
│  Blog Service   │  Port 4003
│  (Public API)   │
└─────────────────┘
        │
┌─────────────────┐
│    MongoDB      │  Port 27017
│   (Database)    │
└─────────────────┘
```

┌─────────────────┐
│  postgress      │  Port 27017
│   (Database)    │
└─────────────────┘

### Frontend Applications
```
┌─────────────────┐
│      Shell      │  Port 5173  (Host Container + Auth State)
└─────────────────┘
        │
┌─────────────────┬─────────────────┐
│    Blog App     │ Admin Dashboard │
│    Port 5001    │    Port 5002    │
└─────────────────┴─────────────────┘
```

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.blog-system.yml up -d

# Check services are running
docker-compose -f docker-compose.blog-system.yml ps

# View logs
docker-compose -f docker-compose.blog-system.yml logs -f

# Stop all services
docker-compose -f docker-compose.blog-system.yml down
```

### Option 2: Using Startup Script

```bash
# Start all services
./start-blog-system.sh

# Stop all services
./stop-blog-system.sh
```

### Option 3: Manual Startup

```bash
# 1. Start MongoDB
docker run -d --name travel-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:6.0

# 2. Start backend services
cd travel-ecosystem-backend/micro-services/auth && npm run dev &
cd travel-ecosystem-backend/micro-services/admin && npm run dev &
cd travel-ecosystem-backend/micro-services/blog && npm run dev &

# 3. Start frontend apps
cd travel-ecosystem/shell && npm run dev &
cd travel-ecosystem/apps/blog && npm run dev &
cd travel-ecosystem/apps/admin-dashboard && npm run dev &
```

## 📍 Access URLs

- **Shell (Main Entry)**: http://localhost:5173
- **Blog Application**: http://localhost:5001
- **Admin Dashboard**: http://localhost:5002

### API Endpoints
- **Auth API**: http://localhost:4001/api/auth
- **Admin API**: http://localhost:4000/api/admin
- **Blog API**: http://localhost:4003/api/blog

## 🧪 Testing

### 1. Test Authentication

```bash
# Create a user
curl -X POST http://localhost:4001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 2. Test Blog Operations

```bash
# Get all blogs
curl http://localhost:4003/api/blog

# Get featured blogs
curl http://localhost:4003/api/blog/featured

# Get categories
curl http://localhost:4003/api/blog/categories/list
```

### 3. Create Admin User

```bash
# You'll need to create an admin user directly in MongoDB or via the auth service
# Then use the admin token to access admin endpoints
```

## 📁 Project Structure

```
VOLENTEERING/
├── travel-ecosystem-backend/
│   └── micro-services/
│       ├── auth/          # Authentication service
│       ├── admin/         # Admin operations service
│       └── blog/          # Blog service
│
├── travel-ecosystem/
│   ├── shell/            # Host container (Port 5173)
│   └── apps/
│       ├── blog/         # Blog frontend (Port 5001)
│       └── admin-dashboard/  # Admin frontend (Port 5002)
│
├── docker-compose.blog-system.yml  # Docker compose config
├── start-blog-system.sh            # Startup script
├── stop-blog-system.sh             # Stop script
└── BLOG_DEPLOYMENT_GUIDE.md        # Detailed guide
```

## 🔧 Configuration

### Environment Variables

#### Auth Service
- `PORT`: Service port (default: 4001)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `CORS_ORIGIN`: Allowed origins for CORS

#### Blog Service
- `PORT`: Service port (default: 4003)
- `MONGODB_URI`: MongoDB connection string
- `CORS_ORIGIN`: Allowed origins for CORS

#### Frontend Apps
- `VITE_AUTH_API_URL`: Auth service URL
- `VITE_BLOG_API_URL`: Blog service URL
- `VITE_ADMIN_API_URL`: Admin service URL

## 🔒 Security

- JWT-based authentication
- Password hashing (bcrypt)
- CORS protection
- Helmet security headers
- Rate limiting (recommended for production)
- Environment-based configuration

## 📝 API Documentation

### Auth Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Blog Endpoints
- `GET /api/blog` - Get all published blogs
- `GET /api/blog/:slug` - Get blog by slug
- `POST /api/blog/:id/like` - Toggle like
- `POST /api/blog/:id/rate` - Rate blog
- `GET /api/blog/comments/:blogId` - Get comments
- `POST /api/blog/comments` - Create comment

### Admin Endpoints
- `GET /api/admin/posts` - Get all posts (admin)
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/:id` - Update post
- `DELETE /api/admin/posts/:id` - Delete post
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :4001

# Kill the process
kill -9 <PID>
```

### Services Not Connecting
1. Check all services are running
2. Verify environment variables
3. Check CORS configuration
4. Review service logs

### MongoDB Connection Issues
```bash
# Check MongoDB is running
docker ps | grep mongodb

# View MongoDB logs
docker logs travel-mongodb
```

## 📚 Additional Resources

- [Detailed Deployment Guide](./BLOG_DEPLOYMENT_GUIDE.md)
- [API Testing Examples](./BLOG_DEPLOYMENT_GUIDE.md#testing-the-system)
- [Production Deployment](./BLOG_DEPLOYMENT_GUIDE.md#production-deployment)

## 🛠️ Development

### Adding New Features

1. **Backend**: Add routes → controllers → services → models
2. **Frontend**: Add pages → components → API calls
3. **Test**: Write tests for new features
4. **Deploy**: Update docker-compose if needed

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 📦 Dependencies

### Backend
- Express.js - Web framework
- MongoDB/Mongoose - Database
- JWT - Authentication
- Helmet - Security
- CORS - Cross-origin requests

### Frontend
- React 18 - UI framework
- Vite - Build tool
- TailwindCSS - Styling
- TypeScript - Type safety

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - feel free to use for your projects

## 💬 Support

For issues or questions:
1. Check the deployment guide
2. Review service logs
3. Check environment variables
4. Verify network connectivity

---

**Made with ❤️ for the Travel Ecosystem**
