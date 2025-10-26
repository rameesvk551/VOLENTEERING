# Travel Ecosystem - Comprehensive Microservices Architecture

## 🏗️ Architecture Overview

This is a complete microservices-based travel ecosystem with:
- **API Gateway** - Central entry point routing to all microservices
- **Auth Service** - Authentication & user management
- **Blog Service** - Blog management with comments & ratings
- **Admin Service** - Administrative operations
- **Shell Frontend** - Main app shell with authentication
- **Blog Frontend** - Advanced blog interface
- **Admin Dashboard** - Comprehensive admin panel

## 📁 Project Structure

```
travel-ecosystem-backend/
├── api-gateway/          # Port 4000
├── micro-services/
│   ├── auth/            # Port 4001
│   ├── blog/            # Port 4003
│   └── admin/           # Port 4002
└── docker-compose.yml

travel-ecosystem/
├── shell/               # Port 5173 - Main shell with auth
├── apps/
│   ├── blog/           # Port 5174 - Blog frontend
│   └── admin-dashboard/ # Port 5175 - Admin dashboard
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 6+
- Docker & Docker Compose (optional)

### Backend Setup

1. **API Gateway**
```bash
cd travel-ecosystem-backend/api-gateway
cp .env.example .env
npm install
npm run dev
```

2. **Auth Service**
```bash
cd travel-ecosystem-backend/micro-services/auth
cp .env.example .env
npm install
npm run dev
```

3. **Blog Service**
```bash
cd travel-ecosystem-backend/micro-services/blog
cp .env.example .env
npm install
npm run dev
```

4. **Admin Service**
```bash
cd travel-ecosystem-backend/micro-services/admin
npm install
npm run dev
```

### Frontend Setup

1. **Shell (Main App)**
```bash
cd travel-ecosystem/shell
npm install
npm run dev
```

2. **Blog Frontend**
```bash
cd travel-ecosystem/apps/blog
npm install
npm run dev
```

3. **Admin Dashboard**
```bash
cd travel-ecosystem/apps/admin-dashboard
npm install
npm run dev
```

## 🔐 Authentication Flow

1. **User Registration** → Auth Service → Email Verification
2. **User Login** → Auth Service → JWT Token + Refresh Token
3. **Token Refresh** → Auth Service → New Tokens
4. **Protected Routes** → API Gateway validates JWT → Forwards to services

## 📝 Blog Service Features

- ✅ List all published blogs (pagination, search, filters)
- ✅ Get single blog by slug/ID
- ✅ Filter by category & tags
- ✅ Featured & trending blogs
- ✅ Like/unlike blogs
- ✅ Rate blogs (1-5 stars)
- ✅ Comment system with nested replies
- ✅ View tracking
- ✅ SEO optimization

## 🛡️ Admin Service Features

- ✅ Create, edit, delete blogs
- ✅ User management
- ✅ Analytics dashboard
- ✅ Manage bookings, hosts, trips
- ✅ Finance tracking
- ✅ Gear rental management

## 🌐 API Endpoints

### Auth Service (via /api/auth)
- POST /signup - Register user
- POST /login - Login user
- POST /refresh-token - Refresh access token
- POST /logout - Logout user
- POST /forgot-password - Request password reset
- POST /reset-password - Reset password
- POST /change-password - Change password (auth required)
- GET /verify-email - Verify email
- GET /me - Get current user (auth required)
- PUT /update-profile - Update profile (auth required)

### Blog Service (via /api/blog)
- GET / - Get all blogs (public)
- GET /:slug - Get blog by slug (public)
- GET /id/:id - Get blog by ID (public)
- GET /category/:category - Get blogs by category (public)
- GET /featured - Get featured blogs (public)
- GET /popular - Get popular blogs (public)
- GET /trending - Get trending blogs (public)
- POST /:id/like - Like/unlike blog (auth required)
- POST /:id/rate - Rate blog (auth required)
- GET /:id/rating - Get user's rating (auth required)
- GET /categories/list - Get all categories (public)
- GET /tags/list - Get all tags (public)

### Comments (via /api/blog/comments)
- GET /:blogId - Get all comments for a blog
- POST / - Add a comment (auth required)
- PUT /:id - Update comment (auth required)
- DELETE /:id - Delete comment (auth required)
- POST /:id/like - Like/unlike comment (auth required)

### Admin Service (via /api/admin)
All routes require admin authentication.
- POST /blog - Create blog
- PUT /blog/:id - Update blog
- DELETE /blog/:id - Delete blog
- GET /users - Get all users
- GET /analytics - Get analytics data
- And more...

## 🔧 Environment Variables

### API Gateway (.env)
```env
PORT=4000
JWT_SECRET=your-jwt-secret
AUTH_SERVICE_URL=http://localhost:4001
BLOG_SERVICE_URL=http://localhost:4003
ADMIN_SERVICE_URL=http://localhost:4002
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### Auth Service (.env)
```env
PORT=4001
MONGODB_URI=mongodb://localhost:27017/travel-auth
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Blog Service (.env)
```env
PORT=4003
MONGODB_URI=mongodb://localhost:27017/travel-blog
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

## 🐳 Docker Deployment

### Build and Run All Services
```bash
# Backend services
cd travel-ecosystem-backend
docker-compose up -d

# Frontend apps
cd travel-ecosystem
docker-compose up -d
```

## 📊 Database Models

### User Model (Auth Service)
- name, email, password
- role (user, admin, super_admin, host)
- profile information
- email verification
- password reset tokens
- refresh tokens

### Blog Model (Blog Service)
- title, slug, content, excerpt
- author information
- category, tags
- status (draft, published, archived)
- views, likes, ratings
- SEO metadata
- timestamps

### Comment Model (Blog Service)
- blogId, user, content
- parentCommentId (for nested comments)
- likes, isApproved
- timestamps

### Rating Model (Blog Service)
- blogId, userId, rating (1-5)
- One rating per user per blog

## 🔄 Service Communication

```
Frontend → API Gateway → Microservices
```

1. **Frontend** sends request with JWT token
2. **API Gateway** validates token
3. **API Gateway** forwards request to appropriate service
4. **Service** processes request
5. **Service** returns response
6. **API Gateway** forwards response to frontend

## 🎨 Frontend Technologies

- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Redux Toolkit** for state management
- **React Router** for routing
- **Axios** for API calls
- **React Hook Form** for forms
- **Module Federation** for micro-frontends

## 🛠️ Development Tips

### Adding a New Microservice
1. Create service folder in `micro-services/`
2. Add package.json, tsconfig.json, Dockerfile
3. Implement service logic
4. Update API Gateway routing
5. Update docker-compose.yml

### Testing APIs
Use the included Postman collection or:
```bash
# Register user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get blogs
curl http://localhost:4000/api/blog
```

## 📚 Additional Features to Implement

- [ ] Email verification UI
- [ ] Social auth (Google, Facebook)
- [ ] Image upload service
- [ ] Real-time notifications
- [ ] GraphQL API
- [ ] WebSocket support
- [ ] Caching with Redis
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Unit & integration tests
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License

## 👥 Authors

Travel Ecosystem Team

## 📧 Support

For support, email support@travelecosystem.com
