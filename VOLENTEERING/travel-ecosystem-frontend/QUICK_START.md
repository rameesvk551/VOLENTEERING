# Quick Start Guide

Get up and running with the Travel Ecosystem micro-frontend architecture in minutes.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Terminal/Command line access

## Quick Start (3 Steps)

### Step 1: Navigate to the project
```bash
cd travel-ecosystem
```

### Step 2: Install all dependencies
```bash
# Option A: Install individually
cd shell && npm install && cd ..
cd apps/blog && npm install && cd ../..
cd apps/visa-explorer && npm install && cd ../..

# Option B: Use the root script
npm run install:all
```

### Step 3: Start development servers

**Option A: Use the start script (Recommended)**
```bash
./start-dev.sh
```

**Option B: Start manually in separate terminals**

Terminal 1:
```bash
cd shell
npm run dev
```

Terminal 2:
```bash
cd apps/blog
npm run dev
```

Terminal 3:
```bash
cd apps/visa-explorer
npm run dev
```

## Access the Applications

Once all servers are running:

- **Shell (Main App)**: http://localhost:5000
- **Blog**: http://localhost:5001
- **Visa Explorer**: http://localhost:5002

## Quick Commands

```bash
# Start all dev servers
npm run dev

# Build all applications
npm run build:all

# Start with Docker (Development)
npm run docker:dev

# Start with Docker (Production)
npm run docker:prod

# Clean all build artifacts and node_modules
npm run clean
```

## What to Expect

When you open http://localhost:5000, you'll see:

1. **Navigation Bar** at the top with links to all apps
2. **Sidebar** (mobile) for easy navigation
3. **Theme Switcher** (light/dark mode) in the top right
4. **Content Area** where micro-frontends load

### Testing the Architecture

1. Click "Blog" in the navigation → Blog app loads
2. Click "Visa Explorer" → Visa Explorer app loads
3. Toggle dark mode → Theme persists across apps
4. Open DevTools → See module federation in action

## Troubleshooting

### Ports Already in Use?

```bash
# Find what's using the ports
lsof -i :5000
lsof -i :5001
lsof -i :5002

# Kill the processes
kill -9 <PID>
```

### Module not found errors?

```bash
# Clean and reinstall
rm -rf shell/node_modules apps/*/node_modules
npm run install:all
```

### Build errors?

```bash
# Clean build artifacts
npm run clean

# Reinstall dependencies
npm run install:all

# Try building again
npm run build:all
```

### "Failed to fetch dynamically imported module"?

Make sure ALL three servers are running:
- Shell on port 5000
- Blog on port 5001
- Visa Explorer on port 5002

## Project Structure at a Glance

```
travel-ecosystem/
├── shell/                    # Main container (Port 5000)
│   ├── src/
│   │   ├── components/      # Navbar, Footer, Sidebar
│   │   ├── layout/         # MainLayout
│   │   └── App.tsx         # Main app with routing
│   └── package.json
│
├── apps/
│   ├── blog/               # Blog app (Port 5001)
│   └── visa-explorer/      # Visa app (Port 5002)
│
├── shared/                 # Shared components & utilities
│   ├── ui/                # Button, Card, Input
│   └── utils/             # Helper functions
│
└── docker/                # Docker configs
```

## Next Steps

1. **Explore the code**: Check out [shell/src/App.tsx](shell/src/App.tsx)
2. **Read the docs**: See [README.md](README.md) for detailed info
3. **Check migration**: See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
4. **Add a feature**: Try modifying a component
5. **Add a new app**: Follow the guide in README.md

## Common Development Tasks

### Add a new route to Blog
1. Open `apps/blog/src/App.tsx`
2. Add your route
3. Save and see hot reload in action

### Modify the Navbar
1. Open `shell/src/components/Navbar/Navbar.tsx`
2. Edit the navigation items
3. Changes reflect immediately

### Create a shared component
1. Add to `shared/ui/YourComponent.tsx`
2. Export from `shared/ui/index.ts`
3. Import in any app

### Test dark mode
1. Click the moon/sun icon in navbar
2. Theme persists across page navigations
3. Stored in localStorage

## Development Tips

1. **Keep all 3 servers running** for the full experience
2. **Use the shell** (port 5000) as your main dev URL
3. **Direct ports** (5001, 5002) are for testing apps standalone
4. **Hot reload** works across all apps
5. **Browser console** shows module federation logs

## Production Build

```bash
# Build all apps
npm run build:all

# Preview production build
cd shell && npm run preview

# Or use Docker
npm run docker:prod
```

## Need Help?

- Check [README.md](README.md) for comprehensive documentation
- Review [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for architecture details
- Open an issue on GitHub
- Check the console for error messages

## Success Indicators

You'll know everything is working when:

- ✅ All 3 dev servers start without errors
- ✅ Shell loads at http://localhost:5000
- ✅ Navigation between apps is smooth
- ✅ Theme switching works
- ✅ No console errors
- ✅ Hot reload works when you edit files

Happy coding! 🚀
