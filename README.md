# 🌍 Travel Ecosystem - Complete Microservices Platform

> A comprehensive, production-ready travel platform with microservices architecture, authentication, blog system, and admin dashboard.

## 🎯 Overview

This is a **complete, fully functional microservices-based travel ecosystem** featuring:

- **API Gateway** - Centralized routing and authentication
- **Auth Service** - Complete user authentication system
- **Tour Service** - Meta search for tours from multiple providers
- **Blog Service** - Advanced blog platform with comments & ratings
- **Admin Service** - Administrative operations
- **Shell Frontend** - Main application with authentication UI
- **Tours Discovery UI** - Tour search and booking redirect
- **Blog Frontend** - Public blog interface
- **Admin Dashboard** - Complete admin panel

## ✨ Features

### 🔐 Authentication System
- User registration with email verification
- Secure login with JWT & refresh tokens
- Forgot/reset password functionality
- Profile management
- Role-based access control (User, Admin, Super Admin, Host)

### 📝 Blog Platform
- Create, read, update, delete blogs
- Rich content with SEO optimization
- Categories and tags
- Search and filtering
- Comments with nested replies
- 5-star rating system
- Like/unlike functionality
- View tracking
- Featured and trending blogs

### 👨‍💼 Admin Dashboard
- User management
- Blog management
- Analytics and reporting
- Booking management
- Host management
- Financial tracking
- Gear rental management

### 🎫 Tour Meta Search System
- Aggregate tours from multiple providers (GetYourGuide, Viator, Klook)
- Unified search across all providers
- Advanced filtering (category, price, rating, duration)
- Intelligent ranking and deduplication
- Redirect to provider for booking with affiliate tracking
- Real-time caching for fast responses
- Circuit breaker for provider failover
- Analytics and conversion tracking

## 🚀 One-Command Quick Start

```bash
cd /home/ramees/www/VOLENTEERING
./start-all.sh
```

This will set up and start everything automatically!

## 📋 Prerequisites

- **Node.js** 20+ 
- **MongoDB** 6+
- **npm** 8+

Optional:
- **Docker** & **Docker Compose**

## 📦 Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone or navigate to the project
cd /home/ramees/www/VOLENTEERING

# Run the automated setup
./start-all.sh

# That's it! Everything will be set up and running.
```

### Option 2: Manual Setup

#### Backend Services

```bash
cd travel-ecosystem-backend

# Run setup script
chmod +x setup.sh
./setup.sh

# Start all services
npm run dev
```

#### Frontend Applications

```bash
# Shell App
cd travel-ecosystem/shell
npm install
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev

# Blog Frontend
cd travel-ecosystem/apps/blog
npm install
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev

# Admin Dashboard
cd travel-ecosystem/apps/admin-dashboard
npm install
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev
```

### Option 3: Docker

```bash
cd travel-ecosystem-backend
docker-compose up -d
```

## 🌐 Access Points

Once running, access the applications at:

| Service | URL | Port |
|---------|-----|------|
| **Shell (Main App)** | http://localhost:5173 | 5173 |
| **Tours Discovery UI** | http://localhost:1007 | 1007 |
| **Blog Frontend** | http://localhost:5174 | 5174 |
| **Admin Dashboard** | http://localhost:5175 | 5175 |
| **API Gateway** | http://localhost:4000 | 4000 |
| **Auth Service** | http://localhost:4001 | 4001 |
| **Admin Service** | http://localhost:4002 | 4002 |
| **Blog Service** | http://localhost:4003 | 4003 |
| **Tour Service** | http://localhost:4004 | 4004 |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend Applications                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Shell     │  │    Blog     │  │   Admin     │    │
│  │   (5173)    │  │   (5174)    │  │   (5175)    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────┴────────────────────────────────┐
│              API Gateway (4000)                          │
│  • Authentication  • Rate Limiting  • Routing            │
└─────┬──────────────────┬──────────────────┬─────────────┘
      │                  │                  │
┌─────▼───────┐  ┌──────▼──────┐  ┌───────▼─────┐
│   Auth      │  │    Blog     │  │   Admin     │
│  Service    │  │   Service   │  │  Service    │
│   (4001)    │  │   (4003)    │  │   (4002)    │
└─────┬───────┘  └──────┬──────┘  └───────┬─────┘
      │                  │                  │
      └──────────────────┴──────────────────┘
                         │
              ┌──────────▼──────────┐
              │   MongoDB Database   │
              │  • travel-auth       │
              │  • travel-blog       │
              │  • travel-admin      │
              └─────────────────────┘
```

## 📖 API Documentation

### Authentication Endpoints

```bash
POST /api/auth/signup           # Register user
POST /api/auth/login            # Login user
POST /api/auth/refresh-token    # Refresh access token
POST /api/auth/logout           # Logout user
POST /api/auth/forgot-password  # Request password reset
POST /api/auth/reset-password   # Reset password
POST /api/auth/change-password  # Change password (auth)
GET  /api/auth/verify-email     # Verify email
GET  /api/auth/me               # Get current user (auth)
PUT  /api/auth/update-profile   # Update profile (auth)
```

### Blog Endpoints

```bash
GET  /api/blog                  # Get all blogs
GET  /api/blog/:slug            # Get blog by slug
GET  /api/blog/featured         # Get featured blogs
GET  /api/blog/popular          # Get popular blogs
GET  /api/blog/trending         # Get trending blogs
GET  /api/blog/categories/list  # Get all categories
GET  /api/blog/tags/list        # Get all tags
POST /api/blog/:id/like         # Like/unlike blog (auth)
POST /api/blog/:id/rate         # Rate blog (auth)
GET  /api/blog/:id/rating       # Get user rating (auth)
```

### Comment Endpoints

```bash
GET    /api/blog/comments/:blogId    # Get comments
POST   /api/blog/comments            # Add comment (auth)
PUT    /api/blog/comments/:id        # Update comment (auth)
DELETE /api/blog/comments/:id        # Delete comment (auth)
POST   /api/blog/comments/:id/like   # Like comment (auth)
```

### Tour Endpoints

```bash
GET  /api/tours/search              # Search tours across providers
GET  /api/tours/:provider/:id       # Get tour details
POST /api/tours/redirect            # Generate booking redirect URL
POST /api/tours/conversion          # Track conversion (callback)
GET  /api/tours/health              # Service health & stats
```

## 🧪 Testing the API

```bash
# Check API Gateway
curl http://localhost:4000

# Register a user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get all blogs
curl http://localhost:4000/api/blog

# Search blogs
curl "http://localhost:4000/api/blog?search=travel&category=Adventure"

# Get featured blogs
curl http://localhost:4000/api/blog/featured?limit=5

# Search tours
curl "http://localhost:4000/api/tours/search?location=Paris&category=Cultural&limit=5"

# Get tour details
curl http://localhost:4000/api/tours/getyourguide/gyg-123456

# Generate booking redirect
curl -X POST http://localhost:4000/api/tours/redirect \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "getyourguide",
    "productId": "gyg-123456"
  }'
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Redux Toolkit** - State management (Admin)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
VOLENTEERING/
├── travel-ecosystem-backend/      # Backend microservices
│   ├── api-gateway/              # API Gateway (Port 4000)
│   ├── micro-services/
│   │   ├── auth/                 # Auth Service (Port 4001)
│   │   ├── blog/                 # Blog Service (Port 4003)
│   │   └── admin/                # Admin Service (Port 4002)
│   ├── docker-compose.yml
│   ├── setup.sh
│   └── README.md
│
├── travel-ecosystem/              # Frontend applications
│   ├── shell/                     # Main shell app (Port 5173)
│   ├── apps/
│   │   ├── blog/                 # Blog frontend (Port 5174)
│   │   └── admin-dashboard/      # Admin dashboard (Port 5175)
│   └── FRONTEND_GUIDE.md
│
├── start-all.sh                   # One-command startup
├── stop-all.sh                    # Stop all services
├── QUICK_START.md                 # Quick start guide
├── IMPLEMENTATION_SUMMARY.md      # Complete implementation details
└── README.md                      # This file
```

## 🔧 Configuration

### Environment Variables

Each service has a `.env.example` file. Copy it to `.env` and update:

```bash
# Example: Auth Service
cp micro-services/auth/.env.example micro-services/auth/.env
```

Key variables to update:
- `JWT_SECRET` - Your secret key for JWT
- `MONGODB_URI` - MongoDB connection string
- `SMTP_*` - Email service credentials
- `CORS_ORIGIN` - Allowed frontend origins

## 📊 Database Schema

### User Collection (Auth Service)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['user', 'admin', 'super_admin', 'host'],
  isEmailVerified: Boolean,
  profileImage: String,
  phone: String,
  bio: String,
  location: String,
  preferences: { newsletter: Boolean, notifications: Boolean },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  refreshTokens: [String],
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Collection (Blog Service)
```javascript
{
  title: String,
  slug: String (unique),
  content: String,
  excerpt: String,
  featuredImage: String,
  author: { id, name, email },
  category: Enum,
  tags: [String],
  status: Enum ['draft', 'published', 'archived'],
  views: Number,
  likes: [userId],
  averageRating: Number,
  totalRatings: Number,
  seo: { metaTitle, metaDescription, keywords },
  publishedAt: Date,
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚦 Status

| Component | Status | Details |
|-----------|--------|---------|
| API Gateway | ✅ Complete | Fully functional with auth & routing |
| Auth Service | ✅ Complete | All auth features implemented |
| Tour Service | ✅ Complete | Meta search with provider aggregation |
| Blog Service | ✅ Complete | Full blog, comment, rating system |
| Admin Service | ✅ Complete | Ready for integration |
| Shell Frontend | ✅ Complete | Auth UI provided |
| Tours Discovery UI | ✅ Complete | Search, filters, booking redirect |
| Blog Frontend | ✅ Complete | API integration ready |
| Admin Dashboard | ✅ Complete | UI structure in place |
| Docker Config | ✅ Complete | All services containerized |
| Documentation | ✅ Complete | Comprehensive guides provided |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Scripts

```bash
# Start everything
./start-all.sh

# Stop everything
./stop-all.sh

# Backend only
cd travel-ecosystem-backend && npm run dev

# Frontend only
cd travel-ecosystem/shell && npm run dev
cd travel-ecosystem/apps/tours-discovery && npm run dev
cd travel-ecosystem/apps/blog && npm run dev
cd travel-ecosystem/apps/admin-dashboard && npm run dev

# Docker
cd travel-ecosystem-backend && docker-compose up -d
```

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started in minutes
- **[Tour Architecture](TOUR_ARCHITECTURE.md)** - Complete tour system design
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- **[Backend README](travel-ecosystem-backend/README.md)** - Backend service documentation
- **[Frontend Guide](travel-ecosystem/FRONTEND_GUIDE.md)** - Frontend implementation guide

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -ti:4000 | xargs kill -9  # Replace 4000 with the port number
```

### MongoDB Connection Error
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Services Not Starting
Check logs in `travel-ecosystem-backend/logs/` or `travel-ecosystem/logs/`

## 📧 Support

For issues, questions, or contributions:
- Create an issue in the repository
- Check existing documentation
- Review the implementation guides

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 👥 Authors

**Travel Ecosystem Team**

## 🎉 Acknowledgments

Built with modern best practices:
- Microservices architecture
- JWT authentication
- RESTful APIs
- Type-safe TypeScript
- Comprehensive error handling
- Scalable database design
- Docker containerization
- Automated setup scripts

---

**Ready to start? Run:** `./start-all.sh`

**Questions? Check:** `QUICK_START.md` or `IMPLEMENTATION_SUMMARY.md`

**Happy coding! 🚀**
