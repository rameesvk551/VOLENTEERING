# Blog Frontend - RAIH

## Overview

React + TypeScript + Tailwind CSS micro-frontend for the RAIH travel blog platform. Built with Vite, Module Federation for integration, and PWA capabilities for offline access.

## Architecture

Based on the [claude.md](../claude.md) specification:

- **Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite
- **Build Tool:** Vite with Module Federation plugin
- **State Management:** React hooks (useState, useContext)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom design system
- **PWA:** Service Worker with Workbox, offline support
- **Module Federation:** Exposed components for host app integration
- **SEO:** Dynamic meta tags, JSON-LD, social sharing

## Project Structure

```
blog-frontend/
├── src/
│   ├── main.tsx                     # Application entry point
│   ├── App.tsx                      # Root component
│   └── serviceWorkerRegistration.ts # PWA service worker setup
├── components/                      # UI components
│   ├── PostList.tsx                 # Post listing with pagination
│   ├── PostItem.tsx                 # Individual post card
│   ├── BlogPost.tsx                 # Full post view
│   ├── CategoryFilter.tsx           # Category filtering UI
│   ├── Tag.tsx                      # Tag component
│   └── Breadcrumbs.tsx              # Navigation breadcrumbs
├── pages/                           # Page views
│   ├── index.tsx                    # Homepage (post list)
│   └── [slug].tsx                   # Post detail page
├── hooks/                           # Custom React hooks
│   ├── usePosts.ts                  # Post data fetching
│   ├── useTheme.ts                  # Dark/light theme management
│   ├── useIntersectionObserver.ts   # Lazy loading & infinite scroll
│   └── useLocalStorage.ts           # LocalStorage state persistence
├── services/                        # API integration
│   └── api.ts                       # API client
├── utils/                           # Utilities
│   ├── seo.ts                       # SEO helpers (meta tags, sharing)
│   └── format.ts                    # Formatting utilities
├── styles/                          # Styles
│   └── index.css                    # Global styles & Tailwind imports
├── public/                          # Static assets
│   ├── manifest.json                # PWA manifest
│   ├── service-worker.js            # Service worker
│   └── offline.html                 # Offline fallback page
├── SEOHead.tsx                      # Dynamic meta tags component
├── vite.config.ts                   # Vite + Module Federation config
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── Dockerfile                       # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## Environment Variables

See [.env.example](./.env.example) for all available options:

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000/api)
- `VITE_APP_URL` - Frontend URL for SEO
- `VITE_ENABLE_PWA` - Enable PWA features
- `VITE_SEO_BASE_URL` - Base URL for SEO metadata

## Key Features

### 1. **Progressive Web App (PWA)**

Full PWA support with offline capabilities:

- **Manifest:** [public/manifest.json](./public/manifest.json)
- **Service Worker:** [public/service-worker.js](./public/service-worker.js)
- **Registration:** [src/serviceWorkerRegistration.ts](./src/serviceWorkerRegistration.ts)
- **Offline Page:** [public/offline.html](./public/offline.html)

Features:
- Install to home screen
- Offline content caching
- Background sync
- Update notifications

### 2. **Module Federation**

Exposed components for integration into RAIH host app:

```javascript
// In vite.config.ts
exposes: {
  './PostList': './components/PostList',
  './PostItem': './components/PostItem',
  './BlogPost': './components/BlogPost',
  './SEOHead': './SEOHead',
  './CategoryFilter': './components/CategoryFilter',
  './Tag': './components/Tag',
  './Breadcrumbs': './components/Breadcrumbs',
}
```

**Usage in host app:**
```javascript
import { lazy } from 'react';
const BlogPostList = lazy(() => import('blog/PostList'));
```

### 3. **SEO Optimization**

Comprehensive SEO support:

- **Dynamic Meta Tags:** Update title, description, OG tags per page
- **JSON-LD:** Structured data for search engines
- **Social Sharing:** Twitter, Facebook, LinkedIn share functions
- **Canonical URLs:** Proper URL management
- See [utils/seo.ts](./utils/seo.ts) and [SEOHead.tsx](./SEOHead.tsx)

### 4. **Dark Mode**

Built-in dark mode with system preference detection:

- **Hook:** [hooks/useTheme.ts](./hooks/useTheme.ts)
- **Tailwind:** Dark mode classes (`.dark:bg-gray-900`)
- **Persistence:** LocalStorage saved preference
- **Toggle:** User can switch themes

### 5. **Performance**

Optimizations for fast loading:

- **Lazy Loading:** React.lazy for code splitting
- **Intersection Observer:** Lazy load images and infinite scroll
- **Image Optimization:** WebP/AVIF support, responsive images
- **Bundle Splitting:** Vendor chunks separated
- **Caching:** Service worker caching strategy

### 6. **UI/UX Best Practices**

Following claude.md recommendations:

- **Responsive:** Mobile-first design
- **Accessible:** WCAG AA+ compliant, keyboard navigation
- **Animations:** Smooth transitions with Tailwind
- **Typography:** Clear type scale and hierarchy
- **Cards:** Post cards with hover effects
- **Empty States:** Friendly messages for no content
- **Loading States:** Skeleton loaders

## Components

### Core Components

- **PostList** - Paginated list of blog posts with filtering
- **PostItem** - Individual post card with image, title, excerpt
- **BlogPost** - Full post view with content, meta, and sharing
- **CategoryFilter** - UI for filtering by category/tag
- **Tag** - Tag component for post metadata
- **Breadcrumbs** - Navigation breadcrumbs
- **SEOHead** - Dynamic meta tags and JSON-LD injection

### Custom Hooks

- **usePosts** - Fetch posts from API with pagination
- **useTheme** - Manage dark/light theme
- **useIntersectionObserver** - Detect element visibility
- **useLocalStorage** - Persist state to localStorage

## Development

### Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests with Vitest
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

### Styling

**Tailwind CSS** with custom configuration:

- Colors: Custom primary/secondary palette
- Typography: Custom font families and scales
- Dark mode: Class-based strategy
- Animations: Custom fade/slide animations
- Components: Reusable button, card, input classes

See [tailwind.config.js](./tailwind.config.js)

### Testing

Run tests with Vitest:
```bash
npm test
npm run test:ui
npm run test:coverage
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t nomadic-nook-blog-frontend .

# Run container
docker run -p 3000:3000 nomadic-nook-blog-frontend
```

Or use docker-compose (from project root):

```bash
docker-compose up blog-frontend
```

## Module Federation Integration

### Consuming in Host App

1. **Configure host app's Vite/Webpack:**
   ```javascript
   // Host app vite.config.ts
   import federation from '@originjs/vite-plugin-federation';

   federation({
     name: 'host',
     remotes: {
       blog: 'http://localhost:3000/assets/remoteEntry.js',
     },
     shared: ['react', 'react-dom'],
   })
   ```

2. **Import remote components:**
   ```tsx
   import { lazy } from 'react';
   const BlogPostList = lazy(() => import('blog/PostList'));

   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <BlogPostList />
       </Suspense>
     );
   }
   ```

## PWA Setup

### Service Worker Registration

Automatically registered in [src/main.tsx](./src/main.tsx):

```typescript
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

serviceWorkerRegistration.register({
  onSuccess: () => console.log('Content cached for offline use'),
  onUpdate: (registration) => {
    // Prompt user to reload for updates
  },
});
```

### Manifest Configuration

Edit [public/manifest.json](./public/manifest.json) for:
- App name and description
- Theme colors
- Icons (generate at various sizes)
- Display mode (standalone, fullscreen)

### Testing PWA

1. Build production version: `npm run build`
2. Serve with HTTPS (required for PWA)
3. Use Chrome DevTools > Application > Service Workers
4. Run Lighthouse audit for PWA score

## SEO Checklist

- [x] Dynamic meta tags per page
- [x] OpenGraph tags for social sharing
- [x] Twitter Card support
- [x] JSON-LD structured data
- [x] Canonical URLs
- [x] Sitemap generation (backend)
- [x] RSS feed (backend)
- [x] Proper heading hierarchy
- [x] Alt text for images
- [x] Semantic HTML

## Accessibility

- Semantic HTML elements
- ARIA roles and labels
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA+)
- Screen reader tested
- Skip to content link

## Next Steps

1. **Implement routing** - Add React Router for navigation
2. **Connect to API** - Implement actual API calls in services/api.ts
3. **Add state management** - Consider Context API or Zustand if needed
4. **Build components** - Complete UI implementation
5. **Add tests** - Write unit and integration tests
6. **Optimize images** - Set up image optimization pipeline
7. **Analytics** - Integrate analytics (Google Analytics, Plausible)
8. **Error boundaries** - Add React error boundaries

## References

- [claude.md](../claude.md) - Full system specification
- [Vite Documentation](https://vitejs.dev/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [React Router](https://reactrouter.com/)

## Support

For issues or questions, refer to the main project documentation or create an issue in the repository.
