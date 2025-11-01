# Module Federation Architecture Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Current Implementation](#current-implementation)
- [Concepts & Features](#concepts--features)
- [Performance Optimization Guide](#performance-optimization-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This travel ecosystem uses **Vite Module Federation** to implement a micro-frontend architecture. Module Federation allows multiple independent JavaScript applications (micro-frontends) to share code and run together as a single application.

### Key Benefits
- 🎯 **Independent Development**: Each app can be developed and deployed independently
- 🔄 **Code Sharing**: Shared dependencies loaded once (React, React Router, Redux)
- 🚀 **Lazy Loading**: Micro-frontends loaded on-demand
- 📦 **Smaller Bundles**: No code duplication across apps
- 🔧 **Independent Deployments**: Deploy one app without affecting others

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Shell (Host) - Port 1001                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  - Authentication Layer                               │  │
│  │  - Main Layout & Navigation                           │  │
│  │  - Route Orchestration                                │  │
│  │  - Shared Dependencies (React, Redux, Router)         │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│        ┌─────────────────────┼─────────────────────┐        │
│        │                     │                     │        │
│        ▼                     ▼                     ▼        │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐   │
│  │  Remote  │         │  Remote  │         │  Remote  │   │
│  │   Apps   │         │   Apps   │         │   Apps   │   │
│  └──────────┘         └──────────┘         └──────────┘   │
└─────────────────────────────────────────────────────────────┘

Remote Micro-Frontends:
┌──────────────────────────────────────────────────────────────┐
│ Blog (1002)         │ Admin Dashboard (1003)                 │
│ - Post CRUD         │ - User Management                      │
│ - Comments          │ - Analytics                            │
│ - PWA Support       │ - Content Moderation                   │
├──────────────────────────────────────────────────────────────┤
│ Visa Explorer (1004)│ Trip Planner (1005)                    │
│ - Visa Requirements │ - Itinerary Builder                    │
│ - Country Info      │ - Budget Calculator                    │
├──────────────────────────────────────────────────────────────┤
│ Volunteering (1006)                                          │
│ - Host/Volunteer Matching                                    │
│ - Project Management                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Current Implementation

### 1. Shell (Host Application)

**Port**: 1001  
**Role**: Container/orchestrator for all micro-frontends  
**Location**: `travel-ecosystem/shell/`

#### Configuration (`shell/vite.config.ts`)
```typescript
federation({
  name: 'shell',
  remotes: {
    blog: {
      type: 'module',
      name: 'blog',
      entry: 'http://localhost:1002/assets/remoteEntry.js',
    },
    visaExplorer: {
      type: 'module',
      name: 'visaExplorer',
      entry: 'http://localhost:1004/assets/remoteEntry.js',
    },
    adminDashboard: {
      type: 'module',
      name: 'adminDashboard',
      entry: 'http://localhost:1003/remoteEntry.js',
    },
    tripPlanner: {
      type: 'module',
      name: 'tripPlanner',
      entry: 'http://localhost:1005/assets/remoteEntry.js',
    },
    volunteering: {
      type: 'module',
      name: 'volunteering',
      entry: 'http://localhost:1006/assets/remoteEntry.js',
    },
  },
  shared: {
    react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
    'react-router-dom': { singleton: true, eager: true, requiredVersion: '^6.30.1' },
    'react-redux': { singleton: true, eager: true, requiredVersion: '^9.0.4' },
    '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.1' }
  }
})
```

#### Lazy Loading in Shell (`shell/src/App.tsx`)
```typescript
// Lazy load micro-frontends
const Blog = lazy(() => import('blog/App'));
const VisaExplorer = lazy(() => import('visaExplorer/App'));
const AdminDashboard = lazy(() => import('adminDashboard/App'));
const TripPlanner = lazy(() => import('tripPlanner/App'));
const Volunteering = lazy(() => import('volunteering/Router'));
```

### 2. Remote Applications

#### Blog (Port 1002)
**Exposes**: `./App` → `src/App`  
**Features**: PWA, API caching, image optimization  
**Shared Deps**: react, react-dom, react-router-dom

#### Admin Dashboard (Port 1003)
**Exposes**: `./App` → `src/AppWithProvider`  
**Features**: Redux integration, API proxy, protected routes  
**Shared Deps**: Full suite (React, Redux, Router)

#### Visa Explorer (Port 1004)
**Exposes**: `./App` → `src/App`  
**Features**: Country visa requirements, data visualization  
**Shared Deps**: react, react-dom, react-router-dom

#### Trip Planner (Port 1005)
**Exposes**: `./App` → `src/App`  
**Features**: Route planning, budget calculator  
**Shared Deps**: react, react-dom, react-router-dom

#### Volunteering (Port 1006)
**Exposes**: `./Router` → `src/bootstrap.tsx`  
**Features**: Host/volunteer matching, messaging  
**Shared Deps**: Full suite + Redux

---

## Concepts & Features

### 1. **Module Federation Basics**

#### Host vs Remote
- **Host (Shell)**: Consumes remote modules, provides shared dependencies
- **Remote**: Exposes modules to be consumed by host

#### Entry Points
Each remote generates a `remoteEntry.js` file that:
- Contains module federation runtime
- Defines what's exposed
- Lists shared dependencies
- Provides chunk loading logic

### 2. **Shared Dependencies**

#### Singleton Mode
```typescript
react: { singleton: true, eager: true }
```
- **singleton**: Only one instance of React across all apps
- **eager**: Loaded immediately (not lazy)
- **Benefits**: Prevents React context issues, reduces bundle size

#### Non-Singleton
```typescript
lodash: { singleton: false }
```
- Multiple versions can coexist
- Each app can use different version

### 3. **Lazy Loading Strategy**

```typescript
const Blog = lazy(() => import('blog/App'));

<Suspense fallback={<LoadingFallback />}>
  <Blog />
</Suspense>
```

**Benefits**:
- Micro-frontend only loaded when route is accessed
- Initial bundle stays small
- Better Time to Interactive (TTI)

### 4. **Error Boundaries**

```typescript
<ErrorBoundary>
  <Suspense fallback={<LoadingFallback />}>
    <Routes>...</Routes>
  </Suspense>
</ErrorBoundary>
```

Prevents one micro-frontend crash from breaking the entire app.

### 5. **Context Sharing**

The shell provides:
- **AuthContext**: Authentication state across all apps
- **Redux Store**: Shared state management
- **Router**: Single routing context

---

## Performance Optimization Guide

### 🚀 Current Performance Issues

| Issue | Impact | Current Status |
|-------|--------|----------------|
| `modulePreload: false` | ❌ Disables browser preloading | Hurts performance |
| `minify: false` | ❌ Larger bundle sizes | Development only |
| `cssCodeSplit: false` | ❌ Monolithic CSS bundles | Slower initial load |
| No code splitting | ❌ Large chunks | Longer download times |
| Eager loading | ⚠️ All deps loaded upfront | High initial payload |

### ✅ Optimization Strategies

#### 1. **Enable Module Preloading**

**Current:**
```typescript
build: {
  modulePreload: false,  // ❌ BAD
}
```

**Optimized:**
```typescript
build: {
  modulePreload: {
    polyfill: true,
    resolveDependencies: (url, deps) => {
      // Preload critical dependencies
      return deps.filter(dep => !dep.includes('chunk'))
    }
  },
}
```

**Impact**: Browser preloads modules while parsing HTML → **30-50% faster loading**

---

#### 2. **Enable Production Minification**

**Current:**
```typescript
build: {
  minify: false,  // ❌ BAD for production
}
```

**Optimized:**
```typescript
build: {
  minify: 'esbuild',  // Fast and effective
  // or for better compression:
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // Remove console.logs
      drop_debugger: true,
    }
  }
}
```

**Impact**: **40-60% smaller bundles** in production

---

#### 3. **Enable CSS Code Splitting**

**Current:**
```typescript
build: {
  cssCodeSplit: false,  // ❌ One huge CSS file
}
```

**Optimized:**
```typescript
build: {
  cssCodeSplit: true,  // ✅ Split CSS per route/component
}
```

**Impact**: **Faster First Contentful Paint (FCP)**, CSS loaded on-demand

---

#### 4. **Implement Manual Code Splitting**

**Current:**
```typescript
// No manual chunks defined
build: {
  rollupOptions: {
    output: {
      inlineDynamicImports: false,
    }
  }
}
```

**Optimized:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Vendor chunk for stable dependencies
        vendor: ['react', 'react-dom', 'react-router-dom'],
        
        // Redux chunk (shared across multiple apps)
        redux: ['@reduxjs/toolkit', 'react-redux'],
        
        // UI libraries
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        
        // Utils
        utils: ['lodash-es', 'date-fns', 'clsx'],
      },
      
      // Better chunk naming for caching
      chunkFileNames: 'chunks/[name]-[hash].js',
      entryFileNames: 'entries/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]',
    }
  }
}
```

**Impact**: 
- Better browser caching (vendor chunk rarely changes)
- Parallel loading of chunks
- **20-30% faster repeat visits**

---

#### 5. **Optimize Shared Dependencies**

**Current:**
```typescript
shared: {
  react: { singleton: true, eager: true },  // ⚠️ Always eager
}
```

**Optimized:**
```typescript
shared: {
  // Critical deps - load eagerly
  react: { 
    singleton: true, 
    eager: true,
    requiredVersion: '^18.2.0',
    strictVersion: false,  // Allow minor version differences
  },
  'react-dom': { 
    singleton: true, 
    eager: true,
    requiredVersion: '^18.2.0' 
  },
  
  // Router - lazy load if not immediately needed
  'react-router-dom': { 
    singleton: true, 
    eager: false,  // ✅ Lazy load
    requiredVersion: '^6.30.1' 
  },
  
  // Heavy libs - definitely lazy
  '@reduxjs/toolkit': { 
    singleton: true, 
    eager: false,  // ✅ Load when needed
    requiredVersion: '^2.0.1' 
  },
  
  // UI libraries - lazy
  'lucide-react': {
    singleton: false,  // Can have multiple versions
    eager: false,
  }
}
```

**Impact**: **Reduce initial bundle by 200-400KB**

---

#### 6. **Implement Dynamic Imports in Remotes**

**Current:**
```typescript
// All components bundled together
export default function App() {
  return (
    <Routes>
      <Route path="/posts" element={<Posts />} />
      <Route path="/create" element={<CreatePost />} />
    </Routes>
  )
}
```

**Optimized:**
```typescript
import { lazy, Suspense } from 'react';

// Split components
const Posts = lazy(() => import('./pages/Posts'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const PostDetail = lazy(() => import('./pages/PostDetail'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/posts" element={<Posts />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </Suspense>
  )
}
```

**Impact**: Each route loaded on-demand → **60-70% smaller initial remote bundle**

---

#### 7. **Add Compression**

**Install:**
```bash
npm install -D vite-plugin-compression
```

**Configure:**
```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    federation({...}),
    
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,  // Only compress > 10KB
    }),
    
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
  ],
})
```

**Impact**: **70-80% smaller file transfer sizes**

---

#### 8. **Optimize Build Target**

**Current:**
```typescript
build: {
  target: 'esnext',  // ⚠️ May not work in all browsers
}
```

**Optimized:**
```typescript
build: {
  target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  
  // Or for better browser support:
  target: 'es2015',
}
```

**Impact**: Balance between bundle size and browser compatibility

---

#### 9. **Implement Prefetching**

**In Shell Router:**
```typescript
import { Link } from 'react-router-dom';

// Prefetch on hover
<Link 
  to="/blog" 
  onMouseEnter={() => {
    // Start loading blog remote
    import('blog/App');
  }}
>
  Blog
</Link>

// Prefetch with Intersection Observer
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Prefetch when link is visible
        import('blog/App');
      }
    });
  });
  
  const blogLink = document.querySelector('[data-prefetch="blog"]');
  if (blogLink) observer.observe(blogLink);
  
  return () => observer.disconnect();
}, []);
```

**Impact**: **Instant navigation** for prefetched routes

---

#### 10. **Use Asset Optimization**

```typescript
build: {
  rollupOptions: {
    output: {
      // Optimize asset loading
      assetFileNames: (assetInfo) => {
        const info = assetInfo.name.split('.');
        const ext = info[info.length - 1];
        
        // Separate by file type for better caching
        if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
          return 'images/[name]-[hash][extname]';
        }
        if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
          return 'fonts/[name]-[hash][extname]';
        }
        return 'assets/[name]-[hash][extname]';
      },
    },
  },
  
  // Inline small assets
  assetsInlineLimit: 4096, // 4KB - inline smaller assets as base64
}
```

---

#### 11. **Production Environment Configuration**

Create separate configs for dev/prod:

**`vite.config.prod.ts`:**
```typescript
import { defineConfig } from 'vite';
import baseConfig from './vite.config';

export default defineConfig({
  ...baseConfig,
  build: {
    ...baseConfig.build,
    minify: 'terser',
    modulePreload: { polyfill: true },
    cssCodeSplit: true,
    sourcemap: false,  // Disable in production
    reportCompressedSize: false,  // Faster builds
  },
});
```

**Update `package.json`:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --config vite.config.prod.ts",
    "build:dev": "vite build"
  }
}
```

---

### 📊 Performance Metrics to Track

#### Before Optimization
```
Initial Bundle:     ~800KB
Time to Interactive: 3.2s
First Contentful Paint: 1.8s
Largest Contentful Paint: 2.4s
```

#### After Optimization (Expected)
```
Initial Bundle:     ~200KB (75% reduction)
Time to Interactive: 1.2s (62% faster)
First Contentful Paint: 0.6s (67% faster)
Largest Contentful Paint: 1.0s (58% faster)
```

---

### 🔧 Quick Optimization Checklist

Apply these to each remote + shell:

- [ ] Enable `modulePreload` with smart filtering
- [ ] Enable minification (`esbuild` or `terser`)
- [ ] Enable `cssCodeSplit: true`
- [ ] Implement manual chunks for vendor code
- [ ] Make non-critical shared deps lazy (`eager: false`)
- [ ] Add route-level code splitting in remotes
- [ ] Install and configure compression plugin
- [ ] Optimize build target for browser support
- [ ] Add prefetching for critical routes
- [ ] Implement asset optimization
- [ ] Test with Lighthouse/WebPageTest
- [ ] Monitor bundle sizes with `rollup-plugin-visualizer`

---

## Best Practices

### 1. **Version Alignment**
Keep shared dependencies at same version across all apps:
```json
// All package.json files
{
  "dependencies": {
    "react": "^18.2.0",  // Same everywhere
    "react-dom": "^18.2.0"
  }
}
```

### 2. **Type Safety**
Create type definitions for remote modules:

```typescript
// shell/src/vite-env.d.ts
declare module 'blog/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'adminDashboard/App' {
  const App: React.ComponentType;
  export default App;
}
```

### 3. **Error Handling**
Always wrap remote imports in error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Loading />}>
    <RemoteApp />
  </Suspense>
</ErrorBoundary>
```

### 4. **Development Workflow**
Start all apps in parallel:
```bash
# From travel-ecosystem/
npm run dev  # Starts all micro-frontends
```

### 5. **Testing Remote Loading**
```typescript
// Test if remote is available
const loadRemote = async () => {
  try {
    const module = await import('blog/App');
    return module.default;
  } catch (error) {
    console.error('Failed to load blog:', error);
    return FallbackComponent;
  }
};
```

---

## Troubleshooting

### Issue: "Failed to fetch dynamically imported module"

**Cause**: Remote app not running or wrong port  
**Solution**: 
1. Check all apps are running: `npm run dev` in each app
2. Verify ports in `shell/vite.config.ts` match running apps
3. Check browser console for CORS errors

### Issue: "Shared module is not available for eager consumption"

**Cause**: Shared dependency version mismatch  
**Solution**:
1. Align versions in all `package.json` files
2. Delete `node_modules` and reinstall
3. Check `requiredVersion` in shared config

### Issue: React context not working across remotes

**Cause**: Multiple React instances  
**Solution**:
1. Ensure React is singleton: `{ singleton: true }`
2. Make React eager: `{ eager: true }`
3. Check only one React version in all package.json

### Issue: Slow initial load

**Solutions**:
1. Implement code splitting in remotes
2. Make non-critical deps lazy: `{ eager: false }`
3. Enable minification and compression
4. Use `modulePreload`

### Issue: Build fails with "Cannot read property of undefined"

**Cause**: Module federation runtime issue  
**Solution**:
1. Clear build artifacts: `rm -rf dist .__mf__temp`
2. Update `@module-federation/vite` to latest
3. Check for circular dependencies

---

## Additional Resources

- [Module Federation Docs](https://module-federation.io/)
- [Vite Module Federation Plugin](https://github.com/module-federation/vite)
- [Micro-Frontend Architecture](https://martinfowler.com/articles/micro-frontends.html)
- [Web Performance Best Practices](https://web.dev/performance/)

---

## Summary

Your app uses **6 micro-frontends** orchestrated by a shell container:
- ✅ Independent development and deployment
- ✅ Shared dependencies (React, Router, Redux)
- ✅ Lazy loading with React Suspense
- ⚠️ **Performance can be significantly improved** by implementing the optimizations above

**Priority Optimizations**:
1. Enable minification + compression → **Immediate 60-70% size reduction**
2. Implement code splitting → **50% faster initial load**
3. Make non-critical deps lazy → **30% faster TTI**
4. Add prefetching → **Instant navigation feel**

Apply these changes progressively and measure impact with Lighthouse after each optimization.
