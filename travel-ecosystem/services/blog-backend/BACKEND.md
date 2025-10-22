# Blog Backend - RAIH

## Overview

Node.js + TypeScript + Express microservice for the RAIH travel blog platform. This backend provides RESTful APIs for managing blog posts with SEO optimization, validation, security, and MongoDB persistence.

## Architecture

Based on the [claude.md](../claude.md) specification:

- **Tech Stack:** Node.js 18+, TypeScript, Express, MongoDB
- **Design Pattern:** Layered architecture (Routes → Controllers → Services → Models)
- **API Style:** RESTful with JSON responses
- **Security:** Rate limiting, CORS, input validation, helmet security headers
- **SEO:** Structured data (JSON-LD), meta tags, sitemap/RSS generation
- **Logging:** Winston-based request/response logging
- **Testing:** Jest for unit and integration tests

## Project Structure

```
blog-backend/
├── config/               # Configuration files
│   ├── database.ts       # MongoDB connection setup
│   ├── environment.ts    # Environment variable management
│   └── logger.ts         # Winston logger configuration
├── controllers/          # Route handlers
│   └── posts.ts          # Post CRUD operations
├── middlewares/          # Express middlewares
│   ├── validation.ts     # Request validation (express-validator)
│   ├── errorHandler.ts   # Error handling and custom error classes
│   ├── requestLogger.ts  # HTTP request/response logging
│   └── security.ts       # Security headers, rate limiting, CORS
├── models/               # Mongoose schemas
│   └── postModel.ts      # Post model definition
├── routes/               # Express routers
│   └── postRoutes.ts     # Post endpoints
├── services/             # Business logic
│   └── postService.ts    # Post operations
├── utils/                # Utility functions
│   ├── seo.ts            # SEO helpers (meta tags, slugs, excerpts)
│   ├── jsonLd.ts         # JSON-LD structured data generators
│   └── helpers.ts        # General utilities (formatting, pagination)
├── tests/                # Test files
├── server.ts             # Application entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variable template
└── Dockerfile            # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or remote instance)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   - Local: `mongod --dbpath /path/to/data`
   - Docker: `docker run -d -p 27017:27017 mongo:7`

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

See [.env.example](./.env.example) for all available configuration options:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `CORS_ORIGIN` - Allowed frontend origin
- `JWT_SECRET` - Secret for authentication
- `LOG_LEVEL` - Logging level (info/debug/error)

## API Endpoints

### Posts

- `GET /api/posts` - List posts with filtering and pagination
  - Query params: `page`, `limit`, `category`, `tag`, `sort`
- `GET /api/posts/:slug` - Get single post by slug
- `POST /api/posts` - Create new post (validation required)
- `PUT /api/posts/:id` - Update post by ID
- `DELETE /api/posts/:id` - Delete post by ID

### CMS Sync (Optional)

- `POST /api/webhook/cms-sync` - Webhook for external CMS integration

## Key Features

### 1. **Validation**
- Express-validator for request validation
- Custom validation rules for posts, slugs, queries
- See [middlewares/validation.ts](./middlewares/validation.ts)

### 2. **Error Handling**
- Centralized error middleware
- Custom error classes (ApiError, NotFoundError, ValidationError)
- Consistent error response format
- See [middlewares/errorHandler.ts](./middlewares/errorHandler.ts)

### 3. **Security**
- Rate limiting to prevent abuse
- CORS configuration for frontend access
- Security headers via helmet
- Input sanitization
- See [middlewares/security.ts](./middlewares/security.ts)

### 4. **SEO & Structured Data**
- Meta tag generation for posts
- JSON-LD for BlogPosting, BreadcrumbList, Organization
- Slug generation and validation
- Sitemap and RSS feed support
- See [utils/seo.ts](./utils/seo.ts) and [utils/jsonLd.ts](./utils/jsonLd.ts)

### 5. **Logging**
- Winston-based request/response logging
- Performance monitoring for slow requests
- Log rotation and file output
- See [config/logger.ts](./config/logger.ts) and [middlewares/requestLogger.ts](./middlewares/requestLogger.ts)

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm test` - Run Jest tests
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

### Testing

Run tests with Jest:
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Code Quality

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with TypeScript plugin
- **Formatting:** Prettier with consistent rules
- **Pre-commit:** Consider adding husky for hooks

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t nomadic-nook-blog-backend .

# Run container
docker run -p 5000:5000 --env-file .env nomadic-nook-blog-backend
```

Or use docker-compose (from project root):

```bash
docker-compose up blog-backend
```

## Integration with RAIH

This backend is designed as a standalone microservice:

1. **Independent deployment** - Can run separately or as part of the main app
2. **API-first** - RESTful API for frontend consumption
3. **No coupling** - No dependencies on other RAIH services
4. **Docker-ready** - Containerized for easy orchestration

## Next Steps

1. **Implement actual logic** - Replace placeholder comments with real code
2. **Add authentication** - Implement JWT-based admin authentication
3. **Connect database** - Configure Mongoose models and connections
4. **Add tests** - Write unit and integration tests
5. **Enable CMS sync** - Set up webhook for external CMS (if needed)
6. **Configure monitoring** - Add APM, error tracking, and analytics

## References

- [claude.md](../claude.md) - Full system specification
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

## Support

For issues or questions, refer to the main project documentation or create an issue in the repository.
