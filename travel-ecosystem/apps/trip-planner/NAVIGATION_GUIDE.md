# 🧭 Trip Planner Navigation Guide

## 📍 Page Routes & Access Methods

### 1️⃣ **AdvancedTripPlanner** (Main Page)
**Route:** `/trip-planner` or `/trip-planner/` (index/default)

**How to Access:**
- 🏠 **Default landing page** - Opens automatically
- 📱 Bottom Navigation → Any tab (Map, Calendar, Summary, Share)
- 🔙 From Discovery page → Click "View My Trip" or back button
- 🔙 From Route Optimizer → Click back button

**Features:**
- Main trip planning interface
- Map view
- Calendar view
- Summary view
- Collaboration/Share view
- Add destinations
- Floating action button

**Navigation Methods:**
```typescript
// From other components
navigate('/trip-planner');
// or
navigate('..');
```

---

### 2️⃣ **DiscoveryPage** (AI Discovery)
**Routes:** 
- `/trip-planner/discover`
- `/trip-planner/ai-discovery` (alternative route)

**How to Access:**
- ✨ **Header Button** → Click "AI Discovery" (✨ icon)
- 🧭 **Bottom Navigation** → Click "Plan" tab (Compass icon)
- 🔗 **Direct Link:** `http://localhost:5173/trip-planner/discover`

**Features:**
- AI-powered destination search
- Semantic search with LangChain
- Entity recognition (cities, dates, interests)
- Smart recommendations
- Festival & event discovery
- Attractions & places
- Add to trip functionality

**Navigation Methods:**
```typescript
// From AdvancedTripPlanner
navigate('discover');

// From other pages
navigate('/trip-planner/discover');
```

---

### 3️⃣ **RouteOptimizationPage** / **RouteOptimizerPage**
**Routes:** 
- `/trip-planner/route-optimizer`
- `/trip-planner/optimize-route` (alternative route)

**How to Access:**
- 🛣️ **Header Button** → Click "Route Optimizer" (Route icon)
- 🔗 **Direct Link:** `http://localhost:5173/trip-planner/route-optimizer`

**Features:**
- Optimize travel routes
- TSP algorithm for best path
- Distance calculations
- Multi-destination routing
- Interactive map visualization

**Navigation Methods:**
```typescript
// From AdvancedTripPlanner
navigate('route-optimizer');

// From other pages
navigate('/trip-planner/route-optimizer');
```

---

### 4️⃣ **PlanYourTrip** (Legacy Page - Not in Routes)
**Note:** This page exists in the codebase but is **NOT currently in the routing configuration**.

**To Enable PlanYourTrip:**

Add to `App.tsx`:
```typescript
import PlanYourTrip from './pages/PlanYourTrip';

const App: React.FC = () => {
  const element = useRoutes([
    { index: true, element: <AdvancedTripPlanner /> },
    { path: 'discover', element: <DiscoveryPage /> },
    { path: 'ai-discovery', element: <DiscoveryPage /> },
    { path: 'plan', element: <PlanYourTrip /> }, // ADD THIS
    { path: 'route-optimizer', element: <RouteOptimizationPage /> },
    { path: 'optimize-route', element: <RouteOptimizationPage /> },
    { path: '*', element: <AdvancedTripPlanner /> },
  ]);
  return element ?? null;
};
```

Then access via:
```typescript
navigate('/trip-planner/plan');
```

---

## 🗺️ Complete Navigation Structure

```
/trip-planner (Shell App Root)
│
├── / (index)                    → AdvancedTripPlanner ✅
│   ├── Header Navigation
│   │   ├── "AI Discovery" btn   → /discover
│   │   └── "Route Optimizer" btn → /route-optimizer
│   │
│   └── Bottom Navigation (Tabs)
│       ├── Plan (Compass)       → /discover
│       ├── Map                  → Stay on page (view change)
│       ├── Calendar             → Stay on page (view change)
│       ├── Summary              → Stay on page (view change)
│       └── Share                → Stay on page (view change)
│
├── /discover                    → DiscoveryPage ✅
│   ├── Back button              → Navigate back (..)
│   └── "View My Trip" btn       → Navigate back (..)
│
├── /ai-discovery                → DiscoveryPage (alias) ✅
│
├── /route-optimizer             → RouteOptimizationPage ✅
│   └── Back button              → Navigate back (-1)
│
├── /optimize-route              → RouteOptimizationPage (alias) ✅
│
└── * (catch-all)                → AdvancedTripPlanner (fallback) ✅
```

---

## 🚀 Quick Access Commands

### From Browser DevTools Console:
```javascript
// Go to Discovery
window.location.href = '/trip-planner/discover';

// Go to Route Optimizer
window.location.href = '/trip-planner/route-optimizer';

// Go to Main Page
window.location.href = '/trip-planner';
```

### From React Components:
```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  // Navigate to Discovery
  navigate('/trip-planner/discover');
  
  // Navigate to Route Optimizer
  navigate('/trip-planner/route-optimizer');
  
  // Navigate back
  navigate(-1);
  
  // Navigate to parent
  navigate('..');
};
```

---

## 📱 Bottom Navigation Tabs Explained

| Tab | Icon | Behavior | View |
|-----|------|----------|------|
| **Plan** | 🧭 Compass | **Routes to Discovery** | `/discover` |
| **Map** | 🗺️ Map | Changes view on same page | Map view |
| **Calendar** | 📅 Calendar | Changes view on same page | Calendar view |
| **Summary** | 📄 FileText | Changes view on same page | Summary view |
| **Share** | 👥 Users | Changes view on same page | Collaborate view |

---

## 🎯 Direct URLs (Development)

```
Main App:           http://localhost:5173/trip-planner
Discovery:          http://localhost:5173/trip-planner/discover
AI Discovery:       http://localhost:5173/trip-planner/ai-discovery
Route Optimizer:    http://localhost:5173/trip-planner/route-optimizer
Optimize Route:     http://localhost:5173/trip-planner/optimize-route
```

---

## 💡 Pro Tips

1. **The "Plan" tab in Bottom Nav goes to Discovery page** - This is the AI-powered search
2. **Other bottom nav tabs change the view** - They don't navigate to new pages
3. **All pages have a back button** - Discovery and Route Optimizer can navigate back
4. **Header buttons are always visible** - Quick access to Discovery and Route Optimizer
5. **Routes have aliases** - `/discover` = `/ai-discovery`, `/route-optimizer` = `/optimize-route`

---

## 🔧 Adding New Pages

To add a new page to the Trip Planner:

1. **Create the page component:**
   ```typescript
   // src/pages/MyNewPage.tsx
   const MyNewPage: React.FC = () => {
     return <div>My New Page</div>;
   };
   export default MyNewPage;
   ```

2. **Add to routing in App.tsx:**
   ```typescript
   import MyNewPage from './pages/MyNewPage';
   
   const App: React.FC = () => {
     const element = useRoutes([
       // ... existing routes
       { path: 'my-new-page', element: <MyNewPage /> },
     ]);
     return element ?? null;
   };
   ```

3. **Add navigation button (optional):**
   - In header (AdvancedTripPlanner.tsx)
   - In bottom nav (BottomNav.tsx)
   - As a floating button
   - As a link in other pages

---

## 🐛 Troubleshooting

**Problem:** "Page not found"
- ✅ Check the route starts with `/trip-planner/`
- ✅ Verify the route exists in `App.tsx`
- ✅ Check for typos in the path

**Problem:** "Navigation doesn't work"
- ✅ Make sure you're using React Router's `navigate()` not `window.location`
- ✅ Check if the component has `useNavigate()` hook imported
- ✅ Verify relative paths vs absolute paths

**Problem:** "Bottom nav doesn't highlight"
- ✅ Check if `isRoute: true` is set for route-based tabs
- ✅ Verify the `route` property matches the actual route
- ✅ Ensure `location.pathname` is being checked correctly

---

## 📊 Current Route Configuration

```typescript
// apps/trip-planner/src/App.tsx
const routes = [
  { index: true, element: <AdvancedTripPlanner /> },      // Default
  { path: 'discover', element: <DiscoveryPage /> },       // AI Search
  { path: 'ai-discovery', element: <DiscoveryPage /> },   // Alias
  { path: 'route-optimizer', element: <RouteOptimizationPage /> }, // Optimizer
  { path: 'optimize-route', element: <RouteOptimizationPage /> },  // Alias
  { path: '*', element: <AdvancedTripPlanner /> },        // Fallback
];
```

---

## 🎨 UI Updates Made

### New Header Navigation (AdvancedTripPlanner)
- ✨ AI Discovery button with Sparkles icon
- 🛣️ Route Optimizer button with Route icon
- 📱 Responsive design (icons on mobile, full text on desktop)
- 🎨 Gradient styling matching the app theme
- 🌙 Full dark mode support

### Improved Discovery Page
- 📱 Mobile-first responsive design
- 🎯 Better spacing and padding
- 🌈 Enhanced gradients and animations
- ♿ Accessibility improvements (aria-labels)
- 🖼️ Lazy loading for images

---

**Last Updated:** November 9, 2025
**Version:** 2.0
