# 🗺️ NomadicNook Component Map - Visual Reference

## Component Hierarchy

```
Home.tsx (Main Page)
│
├── Navbar (existing, not modified)
│
├── Sidebar (existing, not modified)
│
└── Main Content
    │
    ├── 1. HeroSection ⚡ REDESIGNED
    │   ├── Heading: "Discover more with NomadicNook"
    │   ├── Subheading
    │   ├── Search Card (white bg)
    │   │   ├── "Where to?" input
    │   │   ├── "When" input
    │   │   └── Search button (green)
    │   └── Carousel dots (3 dots)
    │
    ├── 2. BenefitsSection ✨ NEW
    │   ├── Heading: "Why book with NomadicNook?"
    │   └── 4 Benefits (grid)
    │       ├── 24/7 Support (Headphones icon)
    │       ├── Earn Rewards (Gift icon)
    │       ├── Millions of Reviews (Star icon)
    │       └── Plan Your Way (Calendar icon)
    │
    ├── 3. RewardsSection ✨ NEW
    │   ├── Heading: "Log in to manage bookings..."
    │   ├── Subtext
    │   ├── Login button (black)
    │   └── "Why these recommendations?" link
    │
    ├── 4. TopDestinationsCarousel ⚡ REDESIGNED
    │   ├── Heading: "Top Destinations"
    │   └── 4 Large Image Cards (grid)
    │       ├── Background image (full card)
    │       ├── Dark gradient overlay
    │       └── Title (white, bottom)
    │
    ├── 5. FlexibilitySection ✨ NEW
    │   ├── Heading: "Keep things flexible"
    │   └── Description text
    │
    ├── 6. TopAttractionsList ⚡ REDESIGNED
    │   ├── Heading: "Top Attractions"
    │   └── 9 Compact Cards (3x3 grid)
    │       ├── Small image (80x80)
    │       ├── Title
    │       └── Location
    │
    ├── 7. ToursCarousel ✨ NEW
    │   ├── Heading: "Top Tours"
    │   ├── Subheading: "Likely to sell out"
    │   └── Horizontal Carousel
    │       └── Tour Cards (288px width)
    │           ├── Image (h-48)
    │           ├── Badge (top-left)
    │           ├── Heart button (top-right)
    │           ├── Location
    │           ├── Title
    │           ├── Rating (★ 4.9)
    │           ├── Duration
    │           └── Price ("From $X")
    │
    ├── 8. WarmDestinationsCarousel ⚡ REDESIGNED
    │   ├── Heading: "Warm Destinations"
    │   └── 4 Tall Image Cards (grid)
    │       ├── Background image (h-80)
    │       ├── Dark gradient overlay
    │       ├── Title (white, large)
    │       └── Subtitle (white)
    │
    └── 9. Footer ⚡ REDESIGNED
        ├── Trust Badges Section
        │   ├── "A Tripadvisor company"
        │   └── Trustpilot rating
        ├── Main Links (4 columns)
        │   ├── Help Center
        │   ├── Company
        │   ├── Traveler
        │   └── Blog
        ├── Popular Cities (wrapped links)
        ├── Popular Attractions (wrapped links)
        └── Bottom Section
            ├── Copyright
            ├── Social Icons (4 circles)
            └── Feedback (👍 👎)
```

---

## File Structure with Status

```
shell/
├── package.json ⚡ UPDATED (added lucide-react)
├── tailwind.config.js ⚡ UPDATED (new design system)
├── VIATOR_REDESIGN_DOCUMENTATION.md ✨ NEW (600+ lines)
├── VIATOR_REDESIGN_QUICKSTART.md ✨ NEW (350+ lines)
├── VIATOR_REDESIGN_SUMMARY.md ✨ NEW (500+ lines)
├── VIATOR_REDESIGN_COMPONENT_MAP.md ✨ NEW (this file)
│
└── src/
    ├── styles/
    │   └── index.css ⚡ UPDATED (new animations, scrollbar)
    │
    ├── pages/
    │   └── Home.tsx ⚡ UPDATED (new section order)
    │
    └── components/
        ├── Home/
        │   ├── HeroSection.tsx ⚡ REDESIGNED
        │   ├── BenefitsSection.tsx ✨ NEW
        │   ├── RewardsSection.tsx ✨ NEW
        │   ├── FlexibilitySection.tsx ✨ NEW
        │   ├── FeaturesSection.tsx (old, not used)
        │   ├── DestinationsSection.tsx (old, not used)
        │   ├── ServicesSection.tsx (old, not used)
        │   └── CallToActionSection.tsx (old, not used)
        │
        ├── Carousel/
        │   ├── TopDestinationsCarousel.tsx ⚡ REDESIGNED
        │   ├── TopAttractionsList.tsx ⚡ REDESIGNED
        │   ├── ToursCarousel.tsx ✨ NEW
        │   ├── WarmDestinationsCarousel.tsx ⚡ REDESIGNED
        │   ├── carouselData.ts ⚡ UPDATED (added tour data)
        │   ├── TopActivitiesCarousel.tsx (not used)
        │   ├── RelatedProductsCarousel.tsx (not used)
        │   └── CarouselWrapper.tsx (not used)
        │
        ├── Footer/
        │   └── Footer.tsx ⚡ REDESIGNED
        │
        ├── Navbar/
        │   └── Navbar.tsx (existing, not modified)
        │
        └── Sidebar/
            └── Sidebar.tsx (existing, not modified)
```

Legend:
- ✨ NEW = Newly created component
- ⚡ REDESIGNED/UPDATED = Significantly modified
- (old, not used) = Legacy component, can be deleted
- (existing, not modified) = Untouched component

---

## Component Dependencies

### HeroSection
```tsx
Imports: Search (lucide-react)
State: whereQuery, whatQuery
Props: None
```

### BenefitsSection
```tsx
Imports: HeadphonesIcon, Gift, Star, Calendar (lucide-react)
State: None
Props: None
Data: Internal benefits array
```

### RewardsSection
```tsx
Imports: useNavigate (react-router-dom)
State: None
Props: None
```

### FlexibilitySection
```tsx
Imports: None
State: None
Props: None
```

### TopDestinationsCarousel
```tsx
Imports: None
State: None
Props: data (TopDestination[])
Data Source: carouselData.ts → topDestinations
```

### TopAttractionsList
```tsx
Imports: None
State: None
Props: data (TopAttraction[])
Data Source: carouselData.ts → topAttractions
```

### ToursCarousel
```tsx
Imports: Star, Heart (lucide-react)
State: None
Props: data (Tour[])
Data Source: carouselData.ts → topTours
```

### WarmDestinationsCarousel
```tsx
Imports: None
State: None
Props: data (WarmDestination[])
Data Source: carouselData.ts → warmDestinations
```

### Footer
```tsx
Imports: Facebook, Twitter, Instagram, Youtube (lucide-react)
State: None
Props: None
Data: Internal link arrays
```

---

## Data Flow Diagram

```
carouselData.ts
├── topDestinations[] ──────→ TopDestinationsCarousel
├── topAttractions[] ───────→ TopAttractionsList
├── topTours[] ─────────────→ ToursCarousel
└── warmDestinations[] ─────→ WarmDestinationsCarousel

Home.tsx
├── imports all carousel data
├── imports all section components
└── passes data as props to components
```

---

## Styling Architecture

```
Tailwind Config
├── Colors (primary, accent, neutral)
├── Typography (fonts, sizes)
├── Spacing (custom values)
├── Shadows (soft, medium, hard, hover)
├── Border Radius (xl, 2xl, 3xl)
└── Animations (fade-in, slide-up, scale-in)
    │
    └── Used in components via className
```

### Global Styles (index.css)
```css
@tailwind base;      ← Tailwind reset
@tailwind components; ← Tailwind components
@tailwind utilities;  ← Tailwind utilities

Custom:
- CSS variables (--primary-color, --secondary-color)
- Scrollbar hiding (.scrollbar-hide)
- Animations (@keyframes)
- Focus styles
```

---

## Icon Usage Map

### lucide-react Icons Used

**HeroSection**:
- `Search` - Search button

**BenefitsSection**:
- `HeadphonesIcon` - 24/7 Support
- `Gift` - Earn Rewards
- `Star` - Millions of Reviews
- `Calendar` - Plan Your Way

**ToursCarousel**:
- `Star` - Rating display
- `Heart` - Wishlist button

**Footer**:
- `Facebook` - Social link
- `Twitter` - Social link
- `Instagram` - Social link
- `Youtube` - Social link

---

## Responsive Breakpoints Map

```
Mobile First Approach:

Default (< 640px)
├── All grids: 1 column
├── Search: stacked vertically
├── Benefits: stacked
├── Tours: horizontal scroll
└── Warm Destinations: 2 columns

md (≥ 640px)
├── Search: horizontal layout
├── Benefits: 2 columns
├── Destinations: 2 columns
└── Footer: 2 columns

lg (≥ 1024px)
├── Benefits: 4 columns
├── Destinations: 4 columns
├── Attractions: 3 columns
├── Warm Destinations: 4 columns
└── Footer: 4 columns
```

---

## Color Usage Map

### Primary Green (#22c55e)
- Search button background
- Active states
- Trust badge background
- Positive indicators

### Accent Red (#ef4444)
- "Likely to sell out" badges
- Urgency indicators
- Special offers
- Benefit icons

### Neutral Dark (#171717)
- Headings
- Body text
- Footer background
- Login button

### Neutral Light (#f5f5f5)
- Section backgrounds
- Card backgrounds
- Subtle dividers

### Special Backgrounds
- `bg-neutral-100` - Hero background
- `bg-white` - Most sections
- `bg-purple-50` - Rewards section
- `bg-teal-50` - Flexibility section
- `bg-neutral-900` - Footer

---

## Animation Usage

### Hover Transitions
```tsx
All cards: hover:shadow-medium
Images: group-hover:scale-105
Buttons: hover:bg-darker-shade
Links: hover:text-white
```

### Transform Durations
```
Fast: 200ms (button colors)
Medium: 300ms (card shadows)
Slow: 500ms (image scales)
```

### Transition Types
```
transition-colors (buttons)
transition-all (cards)
transition-transform (images)
```

---

## Section Background Colors

```
Hero Section       → bg-gradient (neutral-50 to neutral-200)
Benefits          → bg-white
Rewards           → bg-purple-50
Top Destinations  → bg-white
Flexibility       → bg-teal-50
Top Attractions   → bg-white
Top Tours         → bg-white
Warm Destinations → bg-white
Footer            → bg-neutral-900
```

---

## Grid Patterns Reference

### 4-Column Grid (Benefits, Destinations)
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
```

### 3-Column Grid (Attractions)
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

### 2-Column Grid (Warm Destinations mobile)
```tsx
className="grid grid-cols-2 lg:grid-cols-4 gap-4"
```

### Horizontal Scroll (Tours)
```tsx
className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
```

---

## Component Size Reference

### Card Dimensions

**Destination Cards**:
- Height: `h-64` (256px)
- Width: Grid-based (auto)
- Image: Cover full card

**Attraction Cards**:
- Height: Auto (content-based)
- Width: Grid-based
- Image: `w-20 h-20` (80x80)

**Tour Cards**:
- Height: Auto (content-based)
- Width: `w-72` (288px fixed)
- Image: `h-48` (192px)

**Warm Destination Cards**:
- Height: `h-80` (320px)
- Width: Grid-based (auto)
- Image: Cover full card

---

## Typography Hierarchy

```
Page Heading (Hero)
└── text-4xl md:text-5xl lg:text-6xl
    font-bold
    text-neutral-900
    tracking-tight

Section Heading
└── text-2xl md:text-3xl lg:text-4xl
    font-bold
    text-neutral-900
    mb-6

Subsection Heading
└── text-xl md:text-2xl
    font-bold
    text-neutral-900
    mb-4

Card Title
└── text-base md:text-lg
    font-bold
    text-neutral-900
    line-clamp-2

Body Text
└── text-base md:text-lg
    text-neutral-600

Small Text
└── text-sm md:text-base
    text-neutral-600

Tiny Text (labels)
└── text-xs
    text-neutral-500
```

---

## Shadow Hierarchy

```
Resting State
└── shadow-soft (subtle presence)

Hover State
└── shadow-medium (elevated)

Important Elements
└── shadow-hard (prominent)

Interactive Hover
└── shadow-hover (maximum elevation)
```

---

## Spacing Patterns

### Section Padding
```tsx
py-12 px-4  ← Most sections
py-20 md:py-28  ← Hero section
```

### Container Width
```tsx
max-w-7xl mx-auto  ← Standard container
max-w-4xl mx-auto  ← Narrow container (Rewards, Flexibility)
max-w-2xl mx-auto  ← Text container
```

### Element Gaps
```tsx
gap-4   ← Card grids
gap-8   ← Benefits grid
mb-6    ← Section heading bottom margin
mb-3    ← Card element spacing
```

---

## Quick Component Checklist

When creating new components, ensure:
- [ ] Mobile-first responsive classes
- [ ] Hover states on interactive elements
- [ ] Proper semantic HTML
- [ ] Accessibility (alt text, ARIA labels)
- [ ] Consistent spacing (use design tokens)
- [ ] Consistent colors (use theme colors)
- [ ] Consistent shadows (use shadow tokens)
- [ ] Smooth transitions (200-500ms)
- [ ] Loading states (if applicable)
- [ ] Error states (if applicable)

---

## Performance Checklist

- [ ] Images have loading="lazy"
- [ ] No unnecessary re-renders
- [ ] Efficient CSS (Tailwind purge)
- [ ] No inline styles (use Tailwind)
- [ ] Minimal dependencies
- [ ] Code splitting (React.lazy if needed)
- [ ] Optimized animations (GPU accelerated)
- [ ] Debounced scroll handlers

---

This component map provides a complete visual and technical reference for the redesigned homepage structure.
