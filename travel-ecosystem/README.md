# Travel Ecosystem - Micro-Frontend Architecture

A comprehensive travel platform built with a micro-frontend architecture using Vite and Module Federation. This project provides a unified shell container that hosts multiple independent micro-frontend applications for different travel-related functionalities.

## Architecture Overview

```
/travel-ecosystem/
│
├── shell/                    # Host container (Port 5000)
│   ├── src/
│   │   ├── components/       # Navbar, Footer, Sidebar, ThemeSwitcher
│   │   ├── layout/          # MainLayout
│   │   ├── routes/          # Routing configuration
│   │   └── App.tsx          # Main shell app
│   └── package.json
│
├── apps/                     # Micro-frontend applications
│   ├── blog/                # Blog app (Port 5001)
│   ├── visa-explorer/       # Visa Explorer (Port 5002)
│   ├── travel-hub/          # Travel Hub (Port 5003) - Placeholder
│   ├── trip-planner/        # Trip Planner (Port 5004) - Placeholder
│   └── volunteering/        # Volunteering (Port 5005) - Placeholder
│
├── shared/                   # Reusable across all apps
│   ├── ui/                  # Button, Card, Input, etc.
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── context/             # React contexts
│   ├── api/                 # API utilities
│   └── types/               # TypeScript types
│
└── docker/                   # Docker configurations
    ├── shell.Dockerfile
    ├── blog.Dockerfile
    ├── visa-explorer.Dockerfile
    ├── nginx.conf
    ├── docker-compose.yml
    └── docker-compose.dev.yml
```

## Key Features

- **Micro-Frontend Architecture**: Independent, deployable applications
- **Module Federation**: Dynamic runtime integration using Vite Module Federation
- **Shared Components**: Reusable UI components and utilities
- **Dark Mode**: System-wide theme switching
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Docker Support**: Containerized deployment

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5+
- **Styling**: Tailwind CSS 3+
- **Routing**: React Router v6
- **Module Federation**: @originjs/vite-plugin-federation
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker (optional, for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   cd travel-ecosystem
   ```

2. **Install dependencies for shell**
   ```bash
   cd shell
   npm install
   ```

3. **Install dependencies for blog**
   ```bash
   cd ../apps/blog
   npm install
   ```

4. **Install dependencies for visa-explorer**
   ```bash
   cd ../visa-explorer
   npm install
   ```

5. **Start development servers**

   Open 3 terminal windows and run:

   **Terminal 1 - Shell (Port 5000)**
   ```bash
   cd shell
   npm run dev
   ```

   **Terminal 2 - Blog (Port 5001)**
   ```bash
   cd apps/blog
   npm run dev
   ```

   **Terminal 3 - Visa Explorer (Port 5002)**
   ```bash
   cd apps/visa-explorer
   npm run dev
   ```

6. **Access the application**
   - Shell: http://localhost:5000
   - Blog: http://localhost:5001
   - Visa Explorer: http://localhost:5002

### Using Docker

**Development mode:**
```bash
cd docker
docker-compose -f docker-compose.dev.yml up
```

**Production mode:**
```bash
cd docker
docker-compose up
```

## Project Structure Details

### Shell Container

The shell is the host application that:
- Provides the main layout (Navbar, Sidebar, Footer)
- Handles routing between micro-frontends
- Manages global state (theme, authentication)
- Loads micro-frontends dynamically via Module Federation

### Micro-Frontend Apps

Each app is:
- **Independent**: Has its own package.json, dependencies, and build process
- **Isolated**: Can be developed and deployed separately
- **Exposed**: Exports its App component via Module Federation
- **Shared**: Uses shared React, ReactDOM, and React Router

### Shared Library

Contains:
- **UI Components**: Button, Card, Input, Modal, etc.
- **Hooks**: useAuth, useFetch, useDebounce, etc.
- **Utils**: Date formatting, debounce, API helpers
- **Context**: Theme, Auth contexts
- **Types**: Shared TypeScript interfaces

## Module Federation Configuration

### Shell (Host)
```typescript
// shell/vite.config.ts
federation({
  name: 'shell',
  remotes: {
    blog: 'http://localhost:5001/assets/remoteEntry.js',
    visaExplorer: 'http://localhost:5002/assets/remoteEntry.js',
    // ... other remotes
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

### Apps (Remotes)
```typescript
// apps/blog/vite.config.ts
federation({
  name: 'blog',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

## Adding a New Micro-Frontend

1. **Create app directory**
   ```bash
   mkdir -p apps/new-app/src
   cd apps/new-app
   ```

2. **Initialize package.json**
   ```bash
   npm init -y
   ```

3. **Install dependencies**
   ```bash
   npm install react react-dom react-router-dom
   npm install -D @vitejs/plugin-react @originjs/vite-plugin-federation vite typescript
   ```

4. **Create vite.config.ts with Module Federation**

5. **Update shell's vite.config.ts to include the new remote**

6. **Add routing in shell/src/App.tsx**

7. **Create Dockerfile in docker/ directory**

8. **Update docker-compose.yml**

## Scripts

### Shell
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run typecheck` - Type check

### Each App
Same scripts as shell

## Environment Variables

Create `.env` files in each app directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Travel Ecosystem
```

## Deployment

### Individual Deployment

Each micro-frontend can be deployed independently:

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure the remote URLs in shell are updated

### Docker Deployment

```bash
cd docker
docker-compose up -d
```

This will start all services:
- Shell: http://localhost:5000
- Blog: http://localhost:5001
- Visa Explorer: http://localhost:5002

## Best Practices

1. **Independent Development**: Each app should work standalone
2. **Shared Dependencies**: Keep React, ReactDOM versions aligned
3. **Type Safety**: Use TypeScript for all new code
4. **Component Reuse**: Use shared library for common components
5. **Error Boundaries**: Each app should handle its own errors
6. **Lazy Loading**: Use React.lazy() for better performance
7. **Consistent Styling**: Use Tailwind CSS utility classes
8. **API Abstraction**: Use shared API utilities

## Troubleshooting

### Module Federation Issues

If you see "Failed to fetch dynamically imported module":
1. Ensure all micro-frontends are running
2. Check port numbers match configuration
3. Clear browser cache
4. Restart dev servers

### Build Issues

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure Node version is 18+

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
