# Admin Dashboard - Travel Ecosystem

A comprehensive admin dashboard micro-frontend with backend microservice for managing the Travel Ecosystem platform.

## Features

### Frontend (React + Vite + TypeScript)
- **User Management**: View, create, edit, delete users with role-based access
- **Trips & Itineraries**: Manage travel trips, destinations, and schedules
- **Hosts & Volunteers**: Verify and manage hosts and volunteers
- **Gear Rentals**: Manage equipment inventory and rental status
- **Bookings & Payments**: Track bookings and payment statuses
- **Blog Management**: Full CRUD operations, categories, tags, draft/publish workflow
- **Finance & Reporting**: Track revenue, expenses, and financial summaries
- **Analytics**: Operational metrics, charts, and insights
- **Content & Support**: Manage support tickets, FAQs, and documentation

### Backend (Node.js + Express + TypeScript + MongoDB)
- RESTful API with authentication and authorization
- Role-based access control (RBAC)
- JWT-based authentication
- Comprehensive endpoints for all management modules
- Error handling and logging
- MongoDB database integration

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Redux Toolkit (state management)
- React Router v6
- Tailwind CSS
- shadcn/ui components
- Axios for API calls
- Lucide React icons

### Backend
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- bcryptjs for password hashing
- Helmet, CORS, Morgan, Compression

## Project Structure

```
travel-ecosystem/
├── apps/
│   └── admin-dashboard/          # Frontend application
│       ├── src/
│       │   ├── components/       # Reusable UI components
│       │   │   ├── ui/          # shadcn/ui primitives
│       │   │   ├── Header.tsx
│       │   │   └── Sidebar.tsx
│       │   ├── layouts/         # Layout components
│       │   │   └── DashboardLayout.tsx
│       │   ├── pages/           # Route pages
│       │   │   ├── Dashboard.tsx
│       │   │   ├── UsersPage.tsx
│       │   │   ├── TripsPage.tsx
│       │   │   ├── HostsPage.tsx
│       │   │   ├── GearRentalsPage.tsx
│       │   │   ├── BookingsPage.tsx
│       │   │   ├── BlogPage.tsx
│       │   │   ├── FinancePage.tsx
│       │   │   ├── AnalyticsPage.tsx
│       │   │   └── ContentPage.tsx
│       │   ├── store/           # Redux store
│       │   │   ├── index.ts
│       │   │   └── slices/      # Redux slices
│       │   ├── services/        # API services
│       │   │   └── api.ts
│       │   ├── types/           # TypeScript types
│       │   └── lib/             # Utilities
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── Dockerfile
│
└── services/
    └── admin-service/            # Backend microservice
        ├── src/
        │   ├── config/          # Configuration
        │   │   └── database.ts
        │   ├── middleware/      # Express middleware
        │   │   ├── auth.ts
        │   │   └── errorHandler.ts
        │   ├── models/          # Mongoose models
        │   │   └── User.ts
        │   ├── routes/          # API routes
        │   │   ├── auth.routes.ts
        │   │   ├── user.routes.ts
        │   │   ├── trip.routes.ts
        │   │   ├── host.routes.ts
        │   │   ├── gear.routes.ts
        │   │   ├── booking.routes.ts
        │   │   ├── blog.routes.ts
        │   │   ├── finance.routes.ts
        │   │   └── analytics.routes.ts
        │   └── index.ts
        ├── package.json
        ├── tsconfig.json
        └── Dockerfile
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- MongoDB (local or cloud instance)

### Frontend Setup

1. Navigate to the admin dashboard:
```bash
cd travel-ecosystem/apps/admin-dashboard
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3002`

### Backend Setup

1. Navigate to the admin service:
```bash
cd travel-ecosystem/services/admin-service
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret:
```env
PORT=4002
MONGODB_URI=mongodb://localhost:27017/admin-service
JWT_SECRET=your-secure-secret-key
```

4. Install dependencies:
```bash
npm install
```

5. Start development server:
```bash
npm run dev
```

Backend API will be available at `http://localhost:4002`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Hosts & Volunteers
- `GET /api/hosts` - Get all hosts
- `PUT /api/hosts/:id` - Update host
- `POST /api/hosts/:id/verify` - Verify host

### Gear Rentals
- `GET /api/gear` - Get all gear
- `POST /api/gear` - Create gear
- `PUT /api/gear/:id` - Update gear
- `DELETE /api/gear/:id` - Delete gear

### Bookings
- `GET /api/bookings` - Get all bookings
- `PUT /api/bookings/:id/status` - Update booking status

### Blog
- `GET /api/blog/posts` - Get all posts
- `GET /api/blog/posts/:id` - Get post by ID
- `POST /api/blog/posts` - Create post
- `PUT /api/blog/posts/:id` - Update post
- `DELETE /api/blog/posts/:id` - Delete post
- `POST /api/blog/posts/:id/publish` - Publish post
- `GET /api/blog/categories` - Get categories
- `GET /api/blog/tags` - Get tags

### Finance
- `GET /api/finance/records` - Get financial records
- `GET /api/finance/summary` - Get financial summary

### Analytics
- `GET /api/analytics` - Get analytics metrics
- `GET /api/analytics/charts/:type` - Get chart data

## Docker Deployment

### Build and Run with Docker

Frontend:
```bash
cd travel-ecosystem/apps/admin-dashboard
docker build -t admin-dashboard .
docker run -p 80:80 admin-dashboard
```

Backend:
```bash
cd travel-ecosystem/services/admin-service
docker build -t admin-service .
docker run -p 4002:4002 --env-file .env admin-service
```

### Docker Compose (Optional)

Create `docker-compose.yml` in root:
```yaml
version: '3.8'
services:
  admin-dashboard:
    build: ./apps/admin-dashboard
    ports:
      - "3002:80"
    depends_on:
      - admin-service

  admin-service:
    build: ./services/admin-service
    ports:
      - "4002:4002"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/admin-service
      - JWT_SECRET=your-secret
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Run:
```bash
docker-compose up -d
```

## Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript
- `npm test` - Run tests

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:4002/api
VITE_APP_NAME=Travel Admin Dashboard
```

### Backend (.env)
```env
PORT=4002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/admin-service
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3002
```

## Best Practices Implemented

### UI/UX
- Responsive design for all screen sizes
- Consistent component library with shadcn/ui
- Intuitive navigation with sidebar and breadcrumbs
- Loading states and error handling
- Accessible forms with validation
- Clear visual hierarchy and spacing

### Code Quality
- TypeScript for type safety
- Modular component structure
- Centralized state management with Redux
- Reusable UI primitives
- Clean separation of concerns
- ESLint configuration

### Security
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Helmet.js for HTTP headers
- CORS configuration
- Input validation

### Performance
- Code splitting with React Router
- Lazy loading for routes
- Compression middleware
- Optimized bundle size
- Efficient data fetching

## Next Steps

1. **Database Models**: Replace mock data with actual Mongoose models
2. **Validation**: Add input validation with express-validator
3. **Testing**: Add unit and integration tests
4. **File Upload**: Implement multer for image uploads
5. **Email**: Add email notifications for important events
6. **Logging**: Integrate Winston for structured logging
7. **Monitoring**: Add APM tools (New Relic, Datadog)
8. **CI/CD**: Set up GitHub Actions or GitLab CI
9. **Documentation**: Add Swagger/OpenAPI documentation

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
