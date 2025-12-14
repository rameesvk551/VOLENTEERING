# Performance Optimization Guide

## Overview

This document outlines the performance optimization strategies implemented in the Volunteering Platform redesign to ensure fast load times, smooth interactions, and efficient resource usage.

---

## 1. Code Splitting & Lazy Loading

### Route-Based Code Splitting
All page components are lazy-loaded using React's `lazy()` and `Suspense`:

```tsx
const HomePage = lazy(() => import('./pages/home/HomePage'));
const ExplorePage = lazy(() => import('./pages/explore/ExplorePage'));
```

**Benefits:**
- Reduces initial bundle size
- Pages load on-demand
- Faster Time to Interactive (TTI)

### Component-Level Splitting
Heavy components (maps, charts, rich text editors) should be lazy-loaded:

```tsx
const MapComponent = lazy(() => import('./components/Map'));
```

---

## 2. Image Optimization

### Lazy Loading Images
All images use native lazy loading:

```tsx
<img loading="lazy" src="..." alt="..." />
```

### Responsive Images
Use `srcset` for responsive images:

```tsx
<img
  src="/images/hero-small.jpg"
  srcSet="/images/hero-small.jpg 640w,
          /images/hero-medium.jpg 1024w,
          /images/hero-large.jpg 1920w"
  sizes="100vw"
  alt="Hero"
/>
```

### Image Formats
- Use WebP format with JPEG fallback
- Use AVIF for modern browsers when possible
- Compress images before upload

### Placeholder Strategy
Use skeleton loaders or blurred placeholders while images load.

---

## 3. Bundle Optimization

### Tree Shaking
Ensure all imports are specific:

```tsx
// ✅ Good - tree-shakeable
import { Button, Card } from '@/design-system';

// ❌ Bad - imports everything
import * as Components from '@/design-system';
```

### Vendor Chunking
Configure Vite to split vendor chunks:

```js
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
      },
    },
  },
}
```

---

## 4. Rendering Optimization

### Memoization
Use `React.memo()` for expensive components:

```tsx
const OpportunityCard = React.memo<CardProps>(({ data }) => {
  return <Card>{/* ... */}</Card>;
});
```

### useMemo & useCallback
Memoize expensive computations and callbacks:

```tsx
const filteredOpportunities = useMemo(() => {
  return opportunities.filter(o => o.category === selectedCategory);
}, [opportunities, selectedCategory]);
```

### Virtual Lists
For long lists (100+ items), use virtualization:

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={opportunities.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <OpportunityCard data={opportunities[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 5. State Management

### Local State First
Keep state as local as possible. Only lift state when truly needed.

### Avoid Prop Drilling
Use Context or state management for deeply nested data:

```tsx
const UserContext = createContext<User | null>(null);
```

### Debounce User Input
Debounce search and filter inputs:

```tsx
const debouncedSearch = useMemo(
  () => debounce((query) => searchOpportunities(query), 300),
  []
);
```

---

## 6. CSS Performance

### Tailwind Purging
Tailwind automatically purges unused CSS in production.

### Critical CSS
Inline critical CSS for above-the-fold content.

### Avoid Layout Thrashing
- Batch DOM reads and writes
- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `top`, `left`

### GPU Acceleration
Use `will-change` sparingly for complex animations:

```css
.animated-element {
  will-change: transform;
}
```

---

## 7. Network Optimization

### Prefetching
Prefetch likely next pages:

```tsx
<Link to="/explore" prefetch="intent">
  Explore
</Link>
```

### API Optimization
- Use pagination for large datasets
- Implement infinite scroll where appropriate
- Cache API responses with React Query or SWR

### Service Worker
Consider adding a service worker for offline support and caching.

---

## 8. Performance Monitoring

### Core Web Vitals
Monitor and optimize for:

| Metric | Target |
|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s |
| **FID** (First Input Delay) | < 100ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 |

### Tools
- Lighthouse
- WebPageTest
- Chrome DevTools Performance tab
- React DevTools Profiler

---

## 9. Checklist

### Development
- [ ] Code splitting implemented for all routes
- [ ] Images are lazy-loaded
- [ ] No unused dependencies in bundle
- [ ] Components are memoized where beneficial
- [ ] Lists are virtualized (if 100+ items)
- [ ] Debounced user input handlers

### Build & Deploy
- [ ] Production build optimized
- [ ] Assets are gzipped/brotli compressed
- [ ] CDN configured for static assets
- [ ] HTTP/2 enabled
- [ ] Proper cache headers set

### Monitoring
- [ ] Core Web Vitals tracking
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance budgets defined

---

## 10. Quick Wins

1. **Remove console logs** in production
2. **Optimize fonts** - Use `font-display: swap`
3. **Preconnect** to external origins
4. **Use WebP images** with fallbacks
5. **Minimize third-party scripts**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.example.com">
```
