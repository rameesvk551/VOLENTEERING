# HotelDrawer vs TransportDrawer - Side-by-Side Comparison

## Visual Layout Comparison

### Structure Similarity
Both drawers follow the exact same layout pattern for consistency:

```
┌─────────────────────────────────────┐
│  TRANSPORT DRAWER                   │
├─────────────────────────────────────┤
│  Swipe Handle                       │
│  🚌 Find Transport           ✕      │ ← Fixed header
├─────────────────────────────────────┤
│  [🚌 Bus] [🚂 Train] [✈️ Flight]    │ ← Sticky category buttons
├─────────────────────────────────────┤
│  📍 Starting: Current Location      │ ← Display fields (before search)
│  📍 Destination: Paris              │
│  📅 Date: 2025-11-20                │
│  [Find Routes]                      │
├─────────────────────────────────────┤
│  🚌 Available Bus Options           │ ← Scrollable results
│  ┌─────────────────────────────┐   │
│  │ Express Bus Service    $25  │   │
│  │ ⏱️ 2h 30m  9:00→11:30       │   │
│  └─────────────────────────────┘   │
│  [6 more buses...]                  │
│  Cancel                             │
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│  HOTEL DRAWER                       │
├─────────────────────────────────────┤
│  Swipe Handle                       │
│  🏢 Find Hotels              ✕      │ ← Fixed header
├─────────────────────────────────────┤
│  📍 Destination: Paris              │ ← Display fields (always visible)
│  📅 Check-in: 2025-11-20            │
│  🚌 Transport: Bus                  │
├─────────────────────────────────────┤
│  [💲Budget] [📈Mid] [👑Luxury]      │ ← Sticky category buttons
├─────────────────────────────────────┤
│  💲 Budget Hotels ($50-$100)        │ ← Scrollable results (auto-shown)
│  ┌─────────────────────────────┐   │
│  │ Comfort Inn Downtown   $65  │   │
│  │ ⭐⭐⭐⭐ (3.5)                 │   │
│  │ 📶 🚗 ☕                      │   │
│  │ 📍 0.5 km from center       │   │
│  └─────────────────────────────┘   │
│  [6 more hotels...]                 │
│  Cancel                             │
└─────────────────────────────────────┘
```

## Key Differences

### TransportDrawer
- **Header Icon:** 🚌 Bus (from lucide-react)
- **Categories:** Bus, Train, Flight
- **Category Colors:** Blue, Green, Purple
- **Display Fields:** Hidden after "Find Routes" clicked
- **Results Trigger:** Manual - click "Find Routes" button
- **Data Count:** 6 buses, 7 trains, 8 flights
- **Card Info:** Name, Time, Price, Departure/Arrival
- **Auto-expand:** No - requires button click

### HotelDrawer
- **Header Icon:** 🏢 Building2 (from lucide-react)
- **Categories:** Budget, Mid-Range, Luxury
- **Category Colors:** Green, Blue, Purple
- **Display Fields:** Always visible at top
- **Results Trigger:** Automatic - shows on open
- **Data Count:** 6 budget, 7 mid-range, 8 luxury
- **Card Info:** Name, Rating, Price, Amenities, Distance
- **Auto-expand:** Yes - Budget shown by default

## Shared Components & Patterns

### 1. Props Structure
```typescript
// Both accept similar props
interface DrawerProps {
  isOpen: boolean;           // ✅ Same
  onClose: () => void;       // ✅ Same
  // Display data props...
  onSubmit?: (...) => void;  // ✅ Same pattern
}
```

### 2. State Management
```typescript
// Both use same state pattern
const [selected, setSelected] = useState('default');
const [showResults, setShowResults] = useState(false);
const [startY, setStartY] = useState(0);
const [currentY, setCurrentY] = useState(0);
const [isDragging, setIsDragging] = useState(false);
```

### 3. Touch Handlers
```typescript
// Identical swipe-to-dismiss logic
const handleTouchStart = (e: React.TouchEvent) => {
  setStartY(e.touches[0].clientY);
  setIsDragging(true);
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!isDragging) return;
  const deltaY = e.touches[0].clientY - startY;
  if (deltaY > 0) {
    setCurrentY(deltaY);
  }
};

const handleTouchEnd = () => {
  setIsDragging(false);
  if (currentY > 100) {
    onClose();
  }
  setCurrentY(0);
};
```

### 4. Keyboard Handling
```typescript
// Both listen for Escape key
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

### 5. Body Scroll Lock
```typescript
// Both lock body scroll when open
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

### 6. Category Button Styling
```typescript
// Identical button structure
<button
  className={`
    flex flex-col items-center justify-center gap-1.5 p-3
    border-2 rounded-xl transition-all duration-200
    ${selected === value
      ? `${color} border-transparent shadow-md scale-105`
      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
    }
  `}
>
  <Icon className="w-5 h-5" strokeWidth={2} />
  <span className="text-xs font-medium">{label}</span>
</button>
```

### 7. Card Layout
```typescript
// Similar card structure
<button
  className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl
             hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
  onClick={handleSelect}
>
  <div className="flex items-center justify-between mb-2">
    <h4 className="font-semibold text-slate-900">{name}</h4>
    <span className="text-lg font-bold text-blue-600">{price}</span>
  </div>
  {/* Additional info */}
</button>
```

## Styling Constants (Shared)

| Property | Value | Used In |
|----------|-------|---------|
| Border radius | `rounded-xl` | Both category buttons & cards |
| Padding (mobile) | `p-3` | Both content areas |
| Padding (desktop) | `md:p-4` | Both content areas |
| Gap | `gap-2` | Both category grids |
| Icon size | `w-5 h-5` | Both icons |
| Text size | `text-xs` | Both button labels |
| Hover border | `hover:border-blue-500` | Both cards |
| Hover shadow | `hover:shadow-md` | Both cards |
| Selected scale | `scale-105` | Both category buttons |
| Transition | `duration-200` | Both interactive elements |
| Max height | `max-h-[90vh]` | Both drawers |
| Z-index | `z-40` (backdrop), `z-50` (drawer) | Both |

## Animation Timing

```css
/* Both use same transitions */
transition-transform: 300ms ease-out;
transition-opacity: 300ms;
transition-all: 200ms; /* for buttons */
```

## Responsive Breakpoints

| Breakpoint | TransportDrawer | HotelDrawer |
|------------|-----------------|-------------|
| Mobile (<768px) | Full width, bottom | Full width, bottom |
| Tablet/Desktop (≥768px) | Centered, max-w-lg | Centered, max-w-lg |
| Swipe handle | Visible mobile only | Visible mobile only |
| Padding | p-3 → md:p-4 | p-3 → md:p-4 |

## Data Structure Comparison

### TransportDrawer Data
```typescript
{
  id: number;
  name: string;
  time: string;        // "2h 30m"
  price: string;       // "$25"
  departure: string;   // "09:00 AM"
  arrival: string;     // "11:30 AM"
}
```

### HotelDrawer Data
```typescript
{
  id: number;
  name: string;
  price: string;       // "$65"
  rating: number;      // 3.5
  amenities: string[]; // ['wifi', 'pool']
  distance: string;    // "0.5 km from center"
  image: string;       // "hotel-1.jpg"
  features?: string[]; // ['Spa', 'Concierge'] (luxury only)
}
```

## Integration Pattern

### TransportDrawer Integration
```tsx
// In TripPlannerPage.tsx
const [isTransportDrawerOpen, setIsTransportDrawerOpen] = useState(false);
const [transportDrawerData, setTransportDrawerData] = useState({...});

<TransportDrawer
  isOpen={isTransportDrawerOpen}
  onClose={() => setIsTransportDrawerOpen(false)}
  {...data}
  onOpenHotelDrawer={handleOpenHotelDrawer} // 🔗 Connects to HotelDrawer
/>
```

### HotelDrawer Integration
```tsx
// In TripPlannerPage.tsx
const [isHotelDrawerOpen, setIsHotelDrawerOpen] = useState(false);
const [hotelDrawerData, setHotelDrawerData] = useState({...});

<HotelDrawer
  isOpen={isHotelDrawerOpen}
  onClose={() => setIsHotelDrawerOpen(false)}
  {...data}
  onSubmit={handleHotelSubmit} // Optional callback
/>
```

## User Flow Chain

```
User selects attractions
        ↓
OptimizeModal opens
        ↓
Selects PUBLIC_TRANSPORT
        ↓
Clicks "Select Transportation"
        ↓
📱 TransportDrawer opens ← You are here
        ↓
Selects transport mode (Bus/Train/Flight)
        ↓
Clicks "Find Routes"
        ↓
Clicks on a transport option
        ↓
🏨 HotelDrawer opens ← NEW!
        ↓
Browses categories (Budget/Mid/Luxury)
        ↓
Selects a hotel
        ↓
Returns to Trip Planner
```

## Code Reusability

### Could Extract to Shared Component
These patterns are identical and could be extracted:

1. **BottomDrawer wrapper** (swipe handle, backdrop, animations)
2. **CategoryButtonGroup** (sticky button grid)
3. **DrawerHeader** (title + close button)
4. **useDrawerState** hook (swipe logic, escape key, body scroll lock)

### Example Extracted Hook
```typescript
// useDrawerBehavior.ts
export function useDrawerBehavior(isOpen: boolean, onClose: () => void) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) setCurrentY(deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) onClose();
    setCurrentY(0);
  };

  return {
    isDragging,
    currentY,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
```

## Summary

✅ **Same Layout** - Both use identical drawer structure
✅ **Same Behavior** - Swipe, escape, backdrop click all work the same
✅ **Same Styling** - Consistent colors, spacing, animations
✅ **Same Patterns** - State management, touch handling, keyboard support
✅ **Connected Flow** - TransportDrawer → HotelDrawer integration
✅ **User Experience** - Familiar, predictable, consistent

The HotelDrawer successfully replicates the TransportDrawer's UX patterns while extending functionality for hotel selection! 🎉
