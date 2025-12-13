# Trip Planner Navigation Fix - Search Redirect Issue

## Problem
When searching for a location in Trip Planner, the app was incorrectly redirecting to the admin dashboard instead of showing search results.

**Root Cause**: Navigation was using hardcoded absolute paths like `/search`, `/discover`, and `/route-optimizer` instead of using the `buildTripPlannerPath()` utility. This caused issues when the Trip Planner micro-frontend runs under the `/trip-planner` base path in the module federation setup.

## Solution
Fixed navigation throughout the Trip Planner app to use the `buildTripPlannerPath()` utility function, which properly handles both standalone mode and module federation contexts.

### Files Modified

#### 1. **src/components/discovery/DiscoverySearch.tsx**
- Added import: `import { buildTripPlannerPath } from '../../utils/navigation';`
- Fixed search navigation:
  ```typescript
  // Before
  navigate(`/search?q=${encodeURIComponent(query)}`);
  
  // After
  navigate(buildTripPlannerPath(`search?q=${encodeURIComponent(query)}`));
  ```

#### 2. **src/pages/SearchResultsPage.tsx**
- Added import: `import { buildTripPlannerPath } from '../utils/navigation';`
- Fixed "Go to Discovery" button navigation:
  ```typescript
  // Before
  onClick={() => navigate('/discover')}
  
  // After
  onClick={() => navigate(buildTripPlannerPath('discover'))}
  ```

#### 3. **src/pages/AdvancedTripPlanner.tsx**
- Added import: `import { buildTripPlannerPath } from '../utils/navigation';`
- Fixed "AI Discovery" button navigation:
  ```typescript
  // Before
  onClick={() => navigate('discover')}
  
  // After
  onClick={() => navigate(buildTripPlannerPath('discover'))}
  ```
- Fixed "Route Optimizer" button navigation:
  ```typescript
  // Before
  onClick={() => navigate('route-optimizer')}
  
  // After
  onClick={() => navigate(buildTripPlannerPath('route-optimizer'))}
  ```

## How `buildTripPlannerPath()` Works

From `src/utils/navigation.ts`:

```typescript
export const buildTripPlannerPath = (target: string) => {
  const base = getTripPlannerBasePath();
  const cleanedTarget = target.replace(/^\/+/, '');
  if (!base) {
    return `/${cleanedTarget}`;
  }
  return `${normalizePath(base)}/${cleanedTarget}`;
};
```

**Behavior**:
- Detects if app is running under `/trip-planner` base path
- Prepends the correct base path to the target route
- Handles both standalone mode and module federation contexts

**Examples**:
| Context | Input | Output |
|---------|-------|--------|
| Standalone (port 1005) | `'discover'` | `/discover` |
| Module Federation (/trip-planner) | `'discover'` | `/trip-planner/discover` |
| Search query | `search?q=Paris` | `/trip-planner/search?q=Paris` |

## Testing the Fix

### Flow to Test:
1. Navigate to Trip Planner (either standalone or through shell)
2. Click "AI Discovery" or "Discover" button
3. Type a location (e.g., "Paris")
4. Press Enter or click Search button
5. **Expected**: Should navigate to `/trip-planner/search?q=Paris` and show search results
6. **Previous behavior**: Was redirecting to `/admin` (admin dashboard)

### Standalone Testing (port 1005):
```
http://localhost:1005 → click Discover → search "Paris" → should go to /search?q=Paris
```

### Module Federation Testing (shell at port 1001):
```
http://localhost:1001/trip-planner → click Discover → search "Paris" → should go to /trip-planner/search?q=Paris
```

## Related Issues Fixed
- ✅ Search results page navigation
- ✅ Discovery page navigation
- ✅ Route optimizer navigation
- ✅ All internal navigation paths now use buildTripPlannerPath utility

## Notes
- The VirtualizedAttractionFeed component was already using buildTripPlannerPath correctly
- RouteOptimizationResultsPage was already using buildTripPlannerPath correctly
- All remaining navigation issues have been resolved
