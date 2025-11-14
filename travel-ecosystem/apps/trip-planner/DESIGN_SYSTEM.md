# Trip Planner Design System
## Mobile-First UI/UX Specification

### 1. Design Tokens (Tailwind CSS)

#### Colors
```css
Primary: #2563eb (blue-600)
Primary Hover: #1d4ed8 (blue-700)
Secondary: #64748b (slate-500)
Success: #10b981 (emerald-500)
Warning: #f59e0b (amber-500)
Danger: #ef4444 (red-500)
Background: #ffffff
Surface: #f8fafc (slate-50)
Border: #e2e8f0 (slate-200)
Text Primary: #0f172a (slate-900)
Text Secondary: #64748b (slate-500)
```

#### Typography Scale
- **title-xl**: 24px / 1.5 / font-bold
- **title-lg**: 20px / 1.4 / font-semibold
- **body-medium**: 16px / 1.5 / font-normal
- **body-small**: 14px / 1.5 / font-normal
- **caption**: 13px / 1.4 / font-normal

#### Spacing
- xs: 4px (1)
- sm: 8px (2)
- md: 16px (4)
- lg: 24px (6)
- xl: 32px (8)
- 2xl: 48px (12)

#### Shadows
- sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
- xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

#### Border Radius
- sm: 4px (rounded)
- md: 8px (rounded-lg)
- lg: 12px (rounded-xl)
- full: 9999px (rounded-full)

#### Touch Targets
- Minimum: 44px × 44px
- Recommended: 48px × 48px

### 2. Screen Flow & Wireframes

#### Screen 1: Attraction Selection Grid
```
┌────────────────────────────────────┐
│ ☰  Singapore Trip      🔍  ⚙      │ Sticky Header (56px)
│ 3 attractions selected             │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ [Image 3:2 ratio]              │ │
│ │ Marina Bay Sands          ☑    │ │ Card (44px touch)
│ │ Iconic waterfront resort...    │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ [Image 3:2 ratio]              │ │
│ │ Gardens by the Bay        ☑    │ │
│ │ Futuristic botanical garden... │ │
│ └────────────────────────────────┘ │
│                                    │
│                                [🗺] │ FAB (56px)
└────────────────────────────────────┘
```

#### Screen 2: Optimization Modal (Bottom Sheet)
```
┌────────────────────────────────────┐
│        ━━━━                        │ Swipe handle
│                                    │
│ Plan trip for 3 stops              │ Title
│                                    │
│ Travel preferences                 │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 🚗   │ │ 🚌   │ │ 🚶   │        │ Chips (48px)
│ │ Drive│ │Public│ │ Walk │        │
│ └──────┘ └──────┘ └──────┘        │
│                                    │
│ Budget                             │
│ ━━━━━━━━━○━━━━━━━ $50             │ Slider
│                                    │
│ ☑ Include live transit             │ Toggle (44px)
│                                    │
│ ┌────────────────────────────────┐ │
│ │      Optimize Route            │ │ Primary CTA
│ └────────────────────────────────┘ │
│            Cancel                  │ Secondary
└────────────────────────────────────┘
```

#### Screen 3: Optimized Route View
```
┌────────────────────────────────────┐
│ ☰  Optimized Route        ⋮        │ Header
├────────────────────────────────────┤
│                                    │
│  [Map with numbered pins 1→2→3]   │ Map (40vh)
│  [Polyline showing route]          │ Collapsible
│                                    │
├────────────────────────────────────┤
│ Leg 1 • 8 min • $1.20             │ Leg Header
│ Gardens by Bay → Marina Bay        │
│                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │🚌 8min│ │🚶12min│ │🚕 5min│      │ Options (scroll)
│ │$1.20 │ │Free  │ │$3.50 │        │
│ │  ✓   │ │      │ │      │        │ Selected
│ └──────┘ └──────┘ └──────┘        │
│                                    │
│ Leg 2 • 6 min • $0.90             │
│ Marina Bay → Sentosa              │
│ [Options...]                       │
├────────────────────────────────────┤
│ Total: 45 min • $8.50              │ Sticky Footer
│ ┌────────────────────────────────┐ │
│ │    Generate PDF Itinerary      │ │ CTA
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

#### Screen 4: PDF Preview
```
┌────────────────────────────────────┐
│ ←  Your Itinerary        Share  📤 │
├────────────────────────────────────┤
│                                    │
│   [PDF Page 1 Thumbnail]          │
│   [PDF Page 2 Thumbnail]          │
│                                    │
│ ┌────────────────────────────────┐ │
│ │      Download PDF              │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │      Email to Me               │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### 3. Component Specifications

#### AttractionCard
- **Size**: Full width × auto height
- **Touch area**: Entire card (min 44px height)
- **States**: default, selected, disabled
- **Image**: aspect-ratio 3:2, object-fit cover
- **Checkbox**: Top-right, 44px × 44px touch target
- **Animation**: Scale 0.98 on press, spring bounce on select

#### FloatingActionButton (FAB)
- **Size**: 56px × 56px
- **Position**: Fixed bottom-right, 16px margin
- **Shadow**: elevation-6 (0 6px 10px rgba(0,0,0,0.15))
- **Icon**: Route/Map icon, 24px
- **States**: hidden (0 selected), visible (1+ selected)
- **Animation**: Scale entrance, badge pulse

#### OptimizeModal (Bottom Sheet)
- **Max Height**: 85vh
- **Border Radius**: 24px top corners
- **Backdrop**: rgba(0,0,0,0.5), tap to dismiss
- **Animation**: Slide up 300ms ease-out
- **Swipe**: Down to dismiss (threshold 100px)

#### TransportOptionCard
- **Size**: 120px × 140px
- **Layout**: Vertical, icon top, text below
- **Border**: 2px solid (selected: primary, default: border)
- **Icon**: 32px × 32px
- **Text**: mode name, duration, cost
- **Badge**: "Fastest" / "Cheapest" absolute top-right

### 4. Accessibility Requirements

✓ Semantic HTML (header, nav, main, section, article)
✓ ARIA labels for icon-only buttons
✓ Focus visible (2px ring offset-2 ring-primary)
✓ Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI components)
✓ Keyboard navigation (Tab, Enter, Escape)
✓ Screen reader announcements for dynamic content
✓ Touch targets ≥ 44px
✓ Skip links for navigation
✓ Reduced motion support (@media prefers-reduced-motion)

### 5. Motion Design

#### Micro-interactions
- **Button press**: scale(0.96), 100ms
- **Card select**: scale(1.02) + glow, 200ms spring
- **Modal enter**: translateY(100%) → 0, 300ms ease-out
- **Loading skeleton**: shimmer gradient animation
- **Map polyline**: draw animation 1.5s ease-in-out

#### Loading States
- Skeleton screens for cards (gradient shimmer)
- Spinner for modal actions (16px, primary color)
- Progressive disclosure (show results as they load)

### 6. Responsive Breakpoints

- **Mobile**: 0-639px (default)
- **Tablet**: 640-1023px
- **Desktop**: 1024px+

Mobile-first approach: all base styles for mobile, use `sm:` and `md:` prefixes for larger screens.

### 7. Error States

#### Empty State
```
┌────────────────────────────────────┐
│         🗺️                         │
│   No attractions selected          │
│   Tap cards to build your trip     │
└────────────────────────────────────┘
```

#### Error State
```
┌────────────────────────────────────┐
│         ⚠️                         │
│   Route optimization failed        │
│   [Try Again]  [Use Default]       │
└────────────────────────────────────┘
```

### 8. Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Core Web Vitals: All green
- Image optimization: WebP with AVIF fallback
- Lazy load below-fold images
- Code splitting per route

---

**Design handoff includes:**
- Figma file with all screens (4 screens × 3 states each)
- Exported PNG assets (2x, 3x for retina)
- Component library with props table
- Interaction video prototypes
- Developer annotation document
