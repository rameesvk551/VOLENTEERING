# RAIH Blog - Complete Implementation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://www.mongodb.com/)

A fully-featured travel blog platform built as micro services with micro-frontend architecture.

## 🎯 Project Status

✅ **Backend Complete** - Full REST API with MongoDB integration
✅ **Frontend Ready** - React + Vite + Tailwind with Module Federation
✅ **PWA Enabled** - Offline support with service worker
✅ **Docker Ready** - Multi-service orchestration
✅ **SEO Optimized** - Meta tags, JSON-LD, sitemap/RSS ready

## 🏗️ Architecture

### Backend
- **Tech:** Node.js 18 + TypeScript + Express + MongoDB
- **Structure:** Layered (Routes → Controllers → Services → Models)
- **Features:** Validation, error handling, logging, security, SEO

### Frontend
- **Tech:** React 18 + TypeScript + Vite + Tailwind CSS
- **Features:** Module Federation, PWA, dark mode, SEO, lazy loading

### Infrastructure
- **Docker Compose** with MongoDB, backend, frontend
- **Nginx** for frontend serving
- **Health checks** and graceful shutdown

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and configure
git clone <repo-url>
cd VOLENTEERING
cp .env.example .env

# 2. Start all services
make up
# or: docker-compose up -d

# 3. Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
# Health: http://localhost:5000/health
```

###Option 2: Local Development

**Prerequisites:**
- Node.js >= 18.0.0
- MongoDB running locally or remotely
- npm >= 9.0.0

**Backend:**
```bash
cd blog-backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

**Frontend:**
```bash
cd blog-frontend
cp .env.example .env
# Edit .env with backend URL
npm install
npm run dev
```

## 📁 Project Structure

```
VOLENTEERING/
├── blog-backend/              # Node.js microservice
│   ├── config/                # DB, env, logger configs
│   ├── controllers/           # HTTP handlers
│   ├── middlewares/           # Validation, errors, security
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Helpers (SEO, JSON-LD)
│   ├── server.ts              # ✅ IMPLEMENTED - Express app
│   ├── package.json           # Dependencies
│   └── Dockerfile             # Backend container
│
├── blog-frontend/             # React micro-frontend
│   ├── components/            # UI components
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page views
│   ├── services/              # ✅ IMPLEMENTED - API client
│   ├── utils/                 # ✅ IMPLEMENTED - Format, SEO
│   ├── public/                # ✅ IMPLEMENTED - PWA files
│   ├── vite.config.ts         # ✅ IMPLEMENTED - Module Federation
│   ├── tailwind.config.js     # Design system
│   └── Dockerfile             # Frontend container
│
├── docker-compose.yml         # Multi-service orchestration
├── Makefile                   # Convenience commands
├── PROJECT_SETUP.md           # Complete setup documentation
└── README.md                  # This file
```

## 🔌 Backend API Endpoints

### Posts
- `GET /api/posts` - List posts (with pagination, filters)
- `GET /api/posts/:slug` - Get post by slug
- `GET /api/posts/id/:id` - Get post by ID
- `POST /api/posts` - Create post (admin)
- `PUT /api/posts/:id` - Update post (admin)
- `DELETE /api/posts/:id` - Delete post (admin)

### Meta
- `GET /api/posts/meta/categories` - Get all categories
- `GET /api/posts/meta/tags` - Get all tags

### System
- `GET /health` - Health check

## 🎨 Frontend Components

### Exposed via Module Federation
- `./PostList` - Post listing with pagination
- `./PostItem` - Individual post card
- `./BlogPost` - Full post view
- `./SEOHead` - Dynamic meta tags
- `./CategoryFilter` - Filter UI
- `./Tag` - Tag component
- `./Breadcrumbs` - Navigation breadcrumbs

### Custom Hooks
- `usePosts` - Fetch posts with pagination
- `useTheme` - Dark/light mode
- `useIntersectionObserver` - Lazy loading
- `useLocalStorage` - State persistence

## 🛠️ Development Commands

### Make Commands
```bash
make help          # Show all commands
make up            # Start all services
make down          # Stop all services
make logs          # View all logs
make logs-be       # Backend logs only
make logs-fe       # Frontend logs only
make build         # Rebuild images
make clean         # Remove containers & volumes
make install       # Install dependencies (local)
make dev-be        # Run backend locally
make dev-fe        # Run frontend locally
```

### Backend Commands
```bash
cd blog-backend
npm run dev        # Development server
npm run build      # Build TypeScript
npm start          # Production server
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code
```

### Frontend Commands
```bash
cd blog-frontend
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview build
npm test           # Run tests
npm run lint       # Lint code
npm run format     # Format code
```

## 📝 Implementation Status

### ✅ Backend (Complete)
- [x] Server setup with Express
- [x] MongoDB Post model
- [x] CRUD controllers
- [x] Business logic services
- [x] API routes
- [x] Validation middleware
- [x] Error handling
- [x] Security (CORS, rate limiting, headers)
- [x] SEO utilities
- [x] JSON-LD structured data
- [x] Docker configuration

### ✅ Frontend (Core Complete)
- [x] API client with fetch
- [x] PWA setup (manifest, service worker)
- [x] Module Federation config
- [x] Tailwind design system
- [x] Custom hooks (theme, localStorage, observer)
- [x] SEO utilities
- [x] Format utilities
- [x] Docker + nginx config

### 🚧 Frontend (UI To Complete)
- [ ] Implement PostList component
- [ ] Implement PostItem component
- [ ] Implement BlogPost component
- [ ] Implement usePosts hook
- [ ] Add React Router
- [ ] Update SEOHead component
- [ ] Generate PWA icons

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nomadic-nook-blog
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key
LOG_LEVEL=info
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:3000
VITE_ENABLE_PWA=true
VITE_SEO_BASE_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Backend tests
cd blog-backend
npm test
npm run test:watch
npm run test:coverage

# Frontend tests
cd blog-frontend
npm test
npm run test:ui
npm run test:coverage
```

## 📦 Module Federation Integration

### In Host App (RAIH)

**1. Configure Vite:**
```typescript
// vite.config.ts
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'host',
      remotes: {
        blog: 'http://localhost:3000/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
```

**2. Import Components:**
```tsx
import { lazy, Suspense } from 'react';

const BlogPostList = lazy(() => import('blog/PostList'));
const SEOHead = lazy(() => import('blog/SEOHead'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SEOHead />
      <BlogPostList />
    </Suspense>
  );
}
```

## 🔐 Security Features

- ✅ Rate limiting (100 req/15min)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation & sanitization
- ✅ MongoDB injection prevention
- ✅ XSS protection
- ✅ HTTPS ready

## 📱 PWA Features

- ✅ Install to home screen
- ✅ Offline content caching
- ✅ Service worker with Workbox
- ✅ Background sync ready
- ✅ Update notifications
- ✅ Offline fallback page

## 🎯 SEO Features

- ✅ Dynamic meta tags
- ✅ OpenGraph tags
- ✅ Twitter Card support
- ✅ JSON-LD structured data
- ✅ Canonical URLs
- ✅ Sitemap generation ready
- ✅ RSS feed ready
- ✅ Social sharing utilities

## 📚 Documentation

- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Complete setup documentation
- **[blog-backend/BACKEND.md](./blog-backend/BACKEND.md)** - Backend architecture
- **[blog-frontend/FRONTEND.md](./blog-frontend/FRONTEND.md)** - Frontend architecture
- **[claude.md](./claude.md)** - Original specification

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
docker ps | grep mongo

# View MongoDB logs
make logs-db

# Restart MongoDB
docker-compose restart mongodb
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :5000  # Backend

# Kill the process
kill -9 <PID>
```

### Build Errors
```bash
# Clear node_modules and reinstall
cd blog-backend && rm -rf node_modules package-lock.json && npm install
cd blog-frontend && rm -rf node_modules package-lock.json && npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Architecture based on [claude.md](./claude.md) specification
- Built with modern best practices for microservices
- Follows React and Node.js community standards

---

**Next Steps:**
1. Complete frontend UI components (see blog-frontend/components/)
2. Implement usePosts hook for data fetching
3. Add React Router for navigation
4. Generate PWA icons at required sizes
5. Add unit and integration tests
6. Deploy to production

**For detailed implementation guides, see:**
- Backend: [blog-backend/BACKEND.md](./blog-backend/BACKEND.md)
- Frontend: [blog-frontend/FRONTEND.md](./blog-frontend/FRONTEND.md)
- Setup: [PROJECT_SETUP.md](./PROJECT_SETUP.md)
