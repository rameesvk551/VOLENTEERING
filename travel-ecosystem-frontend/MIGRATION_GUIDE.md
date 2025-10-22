# Migration Guide - From Standalone Apps to Micro-Frontend Architecture

This guide explains how the blog-frontend and visa-explore-frontend have been restructured into the travel-ecosystem micro-frontend architecture.

## What Changed?

### Before (Old Structure)
```
/VOLENTEERING/
├── blog-frontend/           # Standalone blog app
├── visa-explore-frontend/   # Standalone visa explorer app
├── trip-planning-frontend/  # Standalone trip planner
└── travel-hub-frontend/     # Standalone travel hub
```

### After (New Structure)
```
/VOLENTEERING/
├── travel-ecosystem/
│   ├── shell/              # Host container
│   ├── apps/
│   │   ├── blog/          # Blog micro-frontend
│   │   └── visa-explorer/ # Visa explorer micro-frontend
│   ├── shared/            # Shared components
│   └── docker/            # Docker configs
```

## Key Changes

### 1. Blog Frontend

**Package Name**
- Before: `nomadic-nook-blog-frontend`
- After: `@travel-ecosystem/blog`

**Port**
- Before: 3000
- After: 5001

**Vite Configuration**
- Added Module Federation plugin
- Exposes `./App` component
- Shares React dependencies with shell

**Location**
- Before: `/blog-frontend/`
- After: `/travel-ecosystem/apps/blog/`

### 2. Visa Explorer Frontend

**Package Name**
- Before: `visa-explore-frontend`
- After: `@travel-ecosystem/visa-explorer`

**Port**
- Before: Default Vite port
- After: 5002

**Vite Configuration**
- Added Module Federation plugin
- Exposes `./App` component
- Shares React dependencies with shell

**Location**
- Before: `/visa-explore-frontend/`
- After: `/travel-ecosystem/apps/visa-explorer/`

## Benefits of the New Architecture

### 1. Independent Development
- Each app can be developed independently
- Teams can work on different apps without conflicts
- Independent deployment cycles

### 2. Shared Resources
- Common UI components in `/shared/ui/`
- Shared utilities and hooks
- Consistent design system

### 3. Unified User Experience
- Single shell with consistent navigation
- Seamless transitions between apps
- Centralized theme management

### 4. Better Scalability
- Easy to add new micro-frontends
- Each app can be scaled independently
- Optimized bundle sizes

### 5. Technology Flexibility
- Each app can use different versions (within limits)
- Can upgrade apps independently
- Test new features in isolation

## How to Run the Old Apps

The original apps are still available in their original locations:
- `/blog-frontend/`
- `/visa-explore-frontend/`

To run them:
```bash
cd blog-frontend
npm install
npm run dev
```

## How to Run the New Architecture

### Option 1: Manual (Development)
```bash
# Terminal 1
cd travel-ecosystem/shell
npm install
npm run dev

# Terminal 2
cd travel-ecosystem/apps/blog
npm install
npm run dev

# Terminal 3
cd travel-ecosystem/apps/visa-explorer
npm install
npm run dev
```

### Option 2: Using the Start Script
```bash
cd travel-ecosystem
./start-dev.sh
```

### Option 3: Using Docker
```bash
cd travel-ecosystem/docker
docker-compose -f docker-compose.dev.yml up
```

## Migration Checklist

If you want to migrate other frontends to this architecture:

- [ ] Copy the app to `travel-ecosystem/apps/[app-name]/`
- [ ] Update `package.json` name to `@travel-ecosystem/[app-name]`
- [ ] Update dev script to use unique port
- [ ] Add Module Federation to `vite.config.ts`
- [ ] Add `@originjs/vite-plugin-federation` dependency
- [ ] Update shell's `vite.config.ts` to include new remote
- [ ] Add route in shell's `App.tsx`
- [ ] Create Dockerfile in `docker/` directory
- [ ] Update `docker-compose.yml`
- [ ] Test the app standalone
- [ ] Test the app integrated in shell

## Code Changes Required

### In Each Micro-Frontend

1. **vite.config.ts**
```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'appName',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: {
    port: 500X, // Unique port
    strictPort: true,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

2. **package.json**
```json
{
  "name": "@travel-ecosystem/app-name",
  "scripts": {
    "dev": "vite --port 500X"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.3.5"
  }
}
```

### In Shell

1. **vite.config.ts** - Add remote
```typescript
remotes: {
  appName: 'http://localhost:500X/assets/remoteEntry.js',
}
```

2. **src/App.tsx** - Add route
```typescript
const AppName = lazy(() => import('appName/App'));

// In Routes:
<Route path="/app-name/*" element={<AppName />} />
```

3. **src/components/Navbar/Navbar.tsx** - Add nav item
```typescript
{ path: '/app-name', label: 'App Name' }
```

## Troubleshooting

### Issue: "Failed to fetch dynamically imported module"

**Solution:**
- Ensure the micro-frontend is running on its configured port
- Check that the URL in shell's vite.config.ts matches the running port
- Clear browser cache and restart dev servers

### Issue: "Shared module is not available"

**Solution:**
- Ensure React versions match across shell and apps
- Check that shared dependencies are listed in both configs
- Reinstall node_modules

### Issue: Styles not appearing

**Solution:**
- Check that Tailwind is configured in each app
- Ensure CSS files are imported in main.tsx
- Verify PostCSS config is present

### Issue: Routing conflicts

**Solution:**
- Use `/*` in shell routes to pass all subroutes to app
- Use relative routes within micro-frontends
- Don't use `BrowserRouter` in micro-frontends if shell already has it

## Rollback Plan

If you need to roll back to the old architecture:

1. The original apps are unchanged in their original locations
2. Simply continue using them as before
3. Delete the `travel-ecosystem` directory if needed

## Next Steps

1. Test the new architecture thoroughly
2. Migrate other frontends (trip-planner, travel-hub, volunteering)
3. Set up CI/CD for independent deployments
4. Implement shared authentication
5. Add monitoring and error tracking
6. Optimize build configurations

## Questions?

If you have questions about the migration:
1. Review the README.md in travel-ecosystem
2. Check the example apps (blog, visa-explorer)
3. Consult Module Federation documentation
4. Open an issue on GitHub

## Resources

- [Vite Module Federation Plugin](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Docs](https://module-federation.github.io/)
- [Micro-Frontend Architecture](https://micro-frontends.org/)
- [Vite Documentation](https://vitejs.dev/)
