# Visa Explore - Complete Design System & UI/UX Guide

## 1. Summary & Concept Direction

### Vision
Visa Explore is a next-generation intelligent travel eligibility engine that transforms visa checking from a mundane data lookup into an engaging, insightful journey planning experience. It combines real-time visa intelligence, predictive analytics, and beautiful visual storytelling.

### Design Philosophy
- **Global Wanderlust Aesthetic**: Inspired by world travel, open skies, and cultural connectivity
- **Data-Driven Elegance**: Complex information presented through clean, intuitive interfaces
- **Motion as Communication**: Every animation tells a story and guides user attention
- **Mobile-First Intelligence**: Touch-optimized, thumb-friendly, and context-aware
- **Inclusive by Design**: Accessible across cultures, languages, and abilities

### Core Experience Pillars
1. **Discovery** - Explore visa requirements effortlessly through visual maps and smart search
2. **Insight** - Understand visa complexity through scores, timelines, and comparisons
3. **Action** - Make informed decisions with document checklists and embassy locators
4. **Trust** - Real-time data from authoritative sources with transparent updates

---

## 2. UI/UX Layout Breakdown

### 2.1 Mobile-First Layout (320px - 768px)

#### A. Navigation Structure
```
┌─────────────────────────────────┐
│  [☰]  Visa Explore    [🔔][👤] │ ← Sticky Header (64px)
├─────────────────────────────────┤
│                                 │
│     Main Content Area           │
│     (Swipeable Panels)          │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [🔍] [🗺️] [⚖️] [💾] [⚙️]      │ ← Bottom Nav (72px)
└─────────────────────────────────┘
```

**Bottom Navigation Items:**
- 🔍 Explore - Main visa search and discovery
- 🗺️ Map - Interactive global visa map
- ⚖️ Compare - Side-by-side destination comparison
- 💾 Saved - Bookmarked destinations and plans
- ⚙️ Settings - Preferences and notifications

#### B. Home/Explore Screen
```
┌─────────────────────────────────┐
│  My Passport: [🇮🇳 India ▾]    │ ← Country Selector (Sticky)
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🔍 Where do you want     │   │ ← Search Bar
│  │    to go?               │   │   (Auto-focus on tap)
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  [All] [Visa-Free] [eVisa] ... │ ← Horizontal Filter Pills
├─────────────────────────────────┤
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃  🇹🇭 Thailand           ┃   │
│  ┃  🟢 Visa on Arrival      ┃   │ ← Visa Cards
│  ┃  Stay: 30 days • $35    ┃   │   (Swipeable)
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃  🇯🇵 Japan              ┃   │
│  ┃  🟢 Visa-Free            ┃   │
│  ┃  Stay: 90 days          ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛   │
└─────────────────────────────────┘
```

#### C. Visa Details Screen (Slide-up Modal)
```
┌─────────────────────────────────┐
│  [←]  India → Thailand     [💾] │ ← Header with back + save
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │   🇹🇭                   │   │ ← Hero Section
│  │   Visa on Arrival       │   │   (Gradient bg)
│  │   🟡 Moderate Complexity │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  [Summary] [Docs] [Embassy]    │ ← Tab Navigation
├─────────────────────────────────┤
│  Requirements                   │
│  ✓ Valid passport (6mo+)       │
│  ✓ Return ticket               │ ← Checklist Items
│  ✓ Proof of funds ($10k)       │   (Expandable)
│  ✓ Hotel booking               │
├─────────────────────────────────┤
│  Processing Timeline            │
│  ○━━━●━━━○━━━○  15 days       │ ← Interactive Timeline
│  Apply  Review  Approve Entry  │
└─────────────────────────────────┘
```

#### D. Compare Dashboard
```
┌─────────────────────────────────┐
│  Compare Destinations      [+]  │
├─────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┐│
│  │  🇹🇭     │  🇯🇵     │  🇸🇬     ││ ← Country Headers
│  │Thailand │ Japan   │Singapore││   (Swipe horizontal)
│  ├─────────┼─────────┼─────────┤│
│  │ 🟡 VOA  │ 🟢 Free │ 🟢 Free ││
│  │ $35     │ Free    │ Free    ││ ← Comparison Grid
│  │ 30 days │ 90 days │ 30 days ││   (Sticky headers)
│  │ 2 weeks │ Instant │ Instant ││
│  └─────────┴─────────┴─────────┘│
└─────────────────────────────────┘
```

### 2.2 Desktop Layout (1024px+)

#### A. Main Dashboard
```
┌───────────────────────────────────────────────────────────────┐
│  [☰] Nomadic Nook    Visa Explore    [🔔] [👤] John Doe     │ ← Global Nav (80px)
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ My Passport     │  │  🔍 Search destination...       │   │
│  │ [🇮🇳 India ▾]   │  │                                 │   │
│  │                 │  │  [Tourism ▾] [Any Duration ▾]   │   │
│  │ Visa Freedom    │  └─────────────────────────────────┘   │
│  │ Score: 85/100   │                                         │
│  │ ▓▓▓▓▓▓▓▓░░      │  ┌─────────────────────────────────┐   │
│  │                 │  │  ┌────┐  🇹🇭 Thailand          │   │
│  │ Quick Stats     │  │  │ 🟡 │  Visa on Arrival       │   │
│  │ • 58 Visa-Free  │  │  └────┘  Stay: 30 days • $35   │   │
│  │ • 42 VOA        │  │                                 │   │
│  │ • 120 eVisa     │  │  ┌────┐  🇯🇵 Japan             │   │
│  └─────────────────┘  │  │ 🟢 │  Visa-Free            │   │
│                        │  └────┘  Stay: 90 days        │   │
│  ┌─────────────────┐  └─────────────────────────────────┘   │
│  │ [🗺️] [⚖️] [💾] │                                         │
│  │  Map Compare    │  ← Sidebar (280px)  Main Content →    │
│  │  Saved          │                                         │
│  └─────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

#### B. Global Visa Map (Full Screen)
```
┌───────────────────────────────────────────────────────────────┐
│  [←]  Global Visa Map              [Tourism ▾] [🌍 View ▾]   │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│       ┌─────────────────────────────────────────┐            │
│       │  [All] [Visa-Free] [VOA] [eVisa] [Req] │            │
│       └─────────────────────────────────────────┘            │
│                                                               │
│           🌍  I n t e r a c t i v e   M a p                 │
│                                                               │
│     [Continents colored by visa accessibility]               │
│     🟢 Green = Visa-Free / Easy                              │
│     🟡 Yellow = Moderate (VOA/eVisa)                         │
│     🔴 Red = Visa Required / Complex                         │
│                                                               │
│   Hover → Tooltip    Click → Details Panel                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Component Hierarchy & Data Flow

### 3.1 Component Architecture

```
App (Shell)
│
├─ AppRouter
│  ├─ Layout
│  │  ├─ Navbar (Shared from Shell)
│  │  ├─ NotificationBell
│  │  └─ UserAvatar
│  │
│  ├─ VisaExplorerPage [Route: /]
│  │  ├─ PassportSelector
│  │  │  └─ CountryDropdown
│  │  ├─ SearchBar
│  │  │  ├─ AutocompleteInput
│  │  │  └─ RecentSearches
│  │  ├─ FilterPanel
│  │  │  ├─ VisaTypeFilter
│  │  │  ├─ RegionFilter
│  │  │  └─ DurationFilter
│  │  └─ VisaCardGrid
│  │     └─ VisaCard (multiple)
│  │        ├─ CountryFlag
│  │        ├─ VisaStatusBadge
│  │        ├─ RequirementsSummary
│  │        └─ QuickActions (Save, Compare)
│  │
│  ├─ VisaDetailsPage [Route: /:origin/:destination]
│  │  ├─ VisaDetailsHeader
│  │  │  ├─ CountryPairDisplay
│  │  │  ├─ VisaComplexityScore
│  │  │  └─ SaveButton
│  │  ├─ TabNavigation
│  │  │  ├─ SummaryTab
│  │  │  │  ├─ VisaTypeCard
│  │  │  │  ├─ RequirementsChecklist
│  │  │  │  ├─ ProcessingTimeline
│  │  │  │  └─ FeesBreakdown
│  │  │  ├─ DocumentsTab
│  │  │  │  └─ DocumentChecklist
│  │  │  │     └─ DocumentCard (multiple)
│  │  │  └─ EmbassyTab
│  │  │     ├─ EmbassyMap
│  │  │     ├─ EmbassyContactCard
│  │  │     └─ WorkingHours
│  │  └─ RelatedArticles (from Blog)
│  │
│  ├─ GlobalVisaMapPage [Route: /map]
│  │  ├─ MapControls
│  │  │  ├─ ViewToggle (2D/3D)
│  │  │  ├─ LayerToggle (Tourism/Work/Study)
│  │  │  └─ LegendPanel
│  │  ├─ InteractiveWorldMap
│  │  │  ├─ MapboxGL / D3.js
│  │  │  └─ CountryTooltip
│  │  └─ MapDetailPanel (Slide-in)
│  │     └─ CountryVisaSummary
│  │
│  ├─ CompareDashboardPage [Route: /compare]
│  │  ├─ ComparisonHeader
│  │  │  ├─ AddDestinationButton
│  │  │  └─ ExportButton
│  │  ├─ ComparisonTable
│  │  │  ├─ CountryColumns (2-3)
│  │  │  └─ ComparisonRows
│  │  │     ├─ VisaTypeRow
│  │  │     ├─ CostRow
│  │  │     ├─ DurationRow
│  │  │     ├─ ProcessingTimeRow
│  │  │     └─ ComplexityScoreRow
│  │  └─ ComparisonInsights
│  │     └─ AIRecommendationCard
│  │
│  ├─ SavedPlansPage [Route: /saved]
│  │  ├─ PlansList
│  │  │  └─ PlanCard (multiple)
│  │  │     ├─ PlanName ("Europe Summer 2025")
│  │  │     ├─ DestinationList
│  │  │     ├─ LastUpdated
│  │  │     └─ EditButton
│  │  └─ EmptyState
│  │
│  └─ Footer (Shared from Shell)
│
└─ Shared Contexts
   ├─ AuthContext (from Shell)
   ├─ ThemeContext (Light/Dark)
   ├─ LanguageContext (i18n)
   └─ NotificationContext
```

### 3.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  (React Components with TypeScript & Tailwind)              │
└─────────────────┬───────────────────────────────────────────┘
                  │ User Actions
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks                              │
│  • useVisaData()    • useCountryFilter()                    │
│  • useComparison()  • useBookmarks()                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ Abstracted Logic
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  • api.ts (HTTP Client)                                     │
│  • cache.ts (Redis/localStorage)                            │
│  • analytics.ts (Event tracking)                            │
└────────┬───────────────────────────────────────────┬────────┘
         │                                            │
         ↓                                            ↓
┌────────────────────┐                    ┌────────────────────┐
│  Backend API       │                    │  External APIs     │
│  (Express + Node)  │                    │  • IATA Timatic   │
│                    │                    │  • REST Countries  │
│  ├─ Controllers    │                    │  • FlightAware    │
│  ├─ Services       │                    │  • Gov.uk         │
│  ├─ Models         │                    └────────────────────┘
│  └─ Middlewares    │
└────────┬───────────┘
         │
         ↓
┌────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────┐        ┌─────────────┐                  │
│  │   MongoDB    │        │    Redis    │                  │
│  │              │        │             │                  │
│  │ • visas      │        │ • Sessions  │                  │
│  │ • countries  │   ←→   │ • Cache     │                  │
│  │ • bookmarks  │        │ • Real-time │                  │
│  │ • users      │        │   Updates   │                  │
│  └──────────────┘        └─────────────┘                  │
└────────────────────────────────────────────────────────────┘
```

### 3.3 State Management Strategy

**Local Component State (useState)**
- Form inputs
- UI toggles (dropdowns, modals)
- Animation states

**Context API (Global State)**
- User authentication
- Theme preference (light/dark)
- Language selection
- Current passport/origin country

**Server State (React Query / SWR)**
- Visa data fetching
- Country information
- User bookmarks
- Comparison lists

**URL State (React Router)**
- Current page
- Search parameters
- Filter selections

---

## 4. Design System

### 4.1 Color Palette

#### Primary Colors (Travel & Adventure)
```css
--color-primary-50:  #eff6ff;  /* Lightest sky blue */
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Main brand blue */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;  /* Deep ocean blue */
```

#### Visa Status Colors (Traffic Light System)
```css
--visa-free:     #10b981;  /* 🟢 Green - Easy access */
--visa-arrival:  #f59e0b;  /* 🟡 Yellow - Moderate */
--visa-evisa:    #3b82f6;  /* 🔵 Blue - Digital */
--visa-required: #ef4444;  /* 🔴 Red - Complex */
--visa-closed:   #6b7280;  /* ⚫ Gray - Restricted */
```

#### Semantic Colors
```css
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error:   #ef4444;
--color-info:    #3b82f6;
```

#### Neutral Colors (Light Mode)
```css
--color-gray-50:  #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

#### Dark Mode Palette
```css
--dm-background:    #0f172a;  /* Deep slate */
--dm-surface:       #1e293b;  /* Card backgrounds */
--dm-surface-hover: #334155;  /* Hover states */
--dm-border:        #475569;  /* Dividers */
--dm-text-primary:  #f1f5f9;  /* Main text */
--dm-text-secondary:#cbd5e1;  /* Secondary text */
```

### 4.2 Typography

#### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Lexend', 'Inter', sans-serif;  /* Headings */
--font-mono:    'JetBrains Mono', 'Courier New', monospace;
```

#### Type Scale (1.25 ratio)
```css
--text-xs:   0.75rem;   /* 12px - Captions, labels */
--text-sm:   0.875rem;  /* 14px - Body small, buttons */
--text-base: 1rem;      /* 16px - Body text */
--text-lg:   1.125rem;  /* 18px - Large body */
--text-xl:   1.25rem;   /* 20px - Small headings */
--text-2xl:  1.5rem;    /* 24px - Section headings */
--text-3xl:  1.875rem;  /* 30px - Page titles */
--text-4xl:  2.25rem;   /* 36px - Hero text */
--text-5xl:  3rem;      /* 48px - Large displays */
```

#### Font Weights
```css
--font-light:   300;
--font-normal:  400;
--font-medium:  500;
--font-semibold:600;
--font-bold:    700;
--font-extrabold:800;
```

#### Line Heights
```css
--leading-tight:  1.25;  /* Headings */
--leading-snug:   1.375; /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed:1.625; /* Large body */
--leading-loose:  2;     /* Spacious text */
```

### 4.3 Spacing System (8px Base Grid)

```css
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
```

### 4.4 Border Radius

```css
--radius-sm:   0.25rem; /* 4px - Small badges */
--radius-md:   0.5rem;  /* 8px - Buttons, inputs */
--radius-lg:   0.75rem; /* 12px - Cards */
--radius-xl:   1rem;    /* 16px - Large cards */
--radius-2xl:  1.5rem;  /* 24px - Modals */
--radius-full: 9999px;  /* Circles */
```

### 4.5 Shadows (Elevation System)

```css
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.1),
              0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1),
              0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1),
              0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1),
              0 10px 10px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

### 4.6 Animation & Motion

#### Duration (Choreography)
```css
--duration-fast:    150ms;  /* Micro-interactions */
--duration-normal:  250ms;  /* Standard transitions */
--duration-slow:    400ms;  /* Page transitions */
--duration-slower:  600ms;  /* Large animations */
```

#### Easing Functions
```css
--ease-in:     cubic-bezier(0.4, 0, 1, 1);
--ease-out:    cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

#### Framer Motion Variants
```typescript
// Fade In Up
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

// Stagger Children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Scale on Hover
export const scaleOnHover = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

// Slide In from Right
export const slideInRight = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
  transition: { type: 'spring', damping: 25, stiffness: 200 }
};
```

#### Key Micro-interactions
1. **Flag Wave on Hover**
   ```typescript
   const flagWave = {
     hover: {
       rotateY: [0, 10, -10, 5, 0],
       transition: { duration: 0.5 }
     }
   };
   ```

2. **Map Zoom with Momentum**
   ```typescript
   const mapZoom = {
     scale: [1, 1.2],
     transition: {
       type: 'spring',
       stiffness: 100,
       damping: 10
     }
   };
   ```

3. **Card Flip (Comparison)**
   ```typescript
   const cardFlip = {
     rotateY: [0, 180],
     transition: { duration: 0.6 }
   };
   ```

---

## 5. Architecture Overview

### 5.1 Frontend Architecture

#### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (Fast HMR, optimized builds)
- **Styling**: Tailwind CSS v4 (JIT, custom theme)
- **Animation**: Framer Motion (60fps animations)
- **Routing**: React Router v6 (Nested routes)
- **State**: Context API + React Query
- **Maps**: Mapbox GL JS + D3.js (for custom visualizations)
- **i18n**: i18next + react-i18next
- **Forms**: React Hook Form + Zod validation
- **PWA**: Vite PWA Plugin + Workbox

#### Module Federation Config
```javascript
// webpack.config.js
export default {
  name: 'visaExplore',
  filename: 'remoteEntry.js',
  exposes: {
    './VisaExplorer': './src/App',
    './VisaMap': './src/pages/GlobalVisaMap',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-router-dom': { singleton: true },
  }
};
```

### 5.2 Backend Architecture

#### Technology Stack
- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5.0
- **Database**: MongoDB (Atlas)
- **Cache**: Redis (Upstash or local)
- **ORM**: Mongoose (with TypeScript support)
- **Auth**: JWT + Passport.js
- **Validation**: Zod (shared with frontend)
- **Logging**: Winston + Morgan
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet, CORS, express-validator

#### API Structure
```
/api/v1
├── /visa
│   ├── GET  /search?origin=IN&destination=TH
│   ├── GET  /:origin/:destination
│   ├── POST /compare (Body: [countries])
│   └── GET  /map/:origin
├── /countries
│   ├── GET  /
│   ├── GET  /:code
│   └── GET  /regions
├── /bookmarks
│   ├── GET    /
│   ├── POST   /
│   └── DELETE /:id
├── /alerts
│   ├── GET  /
│   ├── POST /subscribe
│   └── PUT  /:id/read
└── /user
    ├── GET  /profile
    └── PUT  /preferences
```

#### Database Schema (MongoDB)

**Visa Collection**
```typescript
interface IVisa {
  _id: ObjectId;
  originCountry: string;        // ISO Alpha-3 code (IND)
  destinationCountry: string;   // ISO Alpha-3 code (THA)
  visaType: 'visa-free' | 'voa' | 'evisa' | 'visa-required' | 'closed';
  requirements: {
    title: string;
    description: string;
    mandatory: boolean;
  }[];
  stayDuration: number;         // in days
  validityPeriod: number;       // in days
  fees: {
    amount: number;
    currency: string;
  };
  processingTime: {
    min: number;
    max: number;
    unit: 'days' | 'weeks';
  };
  complexityScore: number;      // 0-100
  lastUpdated: Date;
  source: string;               // 'IATA', 'GOV.UK', etc.
  metadata: {
    embassy: {
      name: string;
      address: string;
      coordinates: [number, number];
      phone: string;
      email: string;
      website: string;
    };
  };
}
```

**Country Collection**
```typescript
interface ICountry {
  _id: ObjectId;
  code: string;                 // ISO Alpha-3 (IND)
  name: string;
  officialName: string;
  flag: string;                 // Emoji or URL
  region: string;
  subregion: string;
  coordinates: [number, number];
  population: number;
  languages: string[];
  currencies: string[];
  visaFreedomIndex: number;     // Global ranking
  lastUpdated: Date;
}
```

**Bookmark Collection**
```typescript
interface IBookmark {
  _id: ObjectId;
  userId: ObjectId;
  planName: string;             // "Europe Summer 2025"
  destinations: {
    country: string;
    visaType: string;
    notes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Alert Collection**
```typescript
interface IAlert {
  _id: ObjectId;
  userId: ObjectId;
  alertType: 'visa-change' | 'price-drop' | 'new-route';
  filters: {
    origin?: string;
    destinations?: string[];
    regions?: string[];
  };
  notificationChannels: ('email' | 'whatsapp' | 'push')[];
  isActive: boolean;
  createdAt: Date;
}
```

#### Caching Strategy (Redis)

**Cache Keys Structure**
```
visa:{origin}:{destination}        → TTL: 24h (Full visa data)
country:{code}                     → TTL: 7d (Country info)
map:{origin}:all                   → TTL: 12h (All destinations map)
user:{id}:bookmarks                → TTL: 1h (User bookmarks)
search:popular                     → TTL: 6h (Trending searches)
```

**Cache Invalidation**
- Manual trigger via Admin API
- Webhook from external data sources
- Scheduled job (daily at 2 AM UTC)

### 5.3 External API Integration

#### IATA Timatic API
```typescript
interface TImaticConfig {
  endpoint: 'https://api.iata.org/timatic',
  apiKey: process.env.IATA_API_KEY,
  rateLimit: 1000, // requests per hour
  cacheTTL: 86400, // 24 hours
}
```

#### REST Countries API
```typescript
interface RestCountriesConfig {
  endpoint: 'https://restcountries.com/v3.1',
  fields: ['name', 'cca3', 'flags', 'region', 'latlng'],
  cacheTTL: 604800, // 7 days (rarely changes)
}
```

#### Integration Flow
```
User Request → Backend → Check Redis Cache
                         ↓ (Cache Miss)
                         Fetch from External API
                         ↓
                         Transform & Validate
                         ↓
                         Store in MongoDB & Redis
                         ↓
                         Return to Frontend
```

---

## 6. Accessibility & Performance Enhancements

### 6.1 Accessibility (WCAG 2.2 AA)

#### Keyboard Navigation
```typescript
// All interactive elements accessible via Tab
// Custom focus styles with visible indicators
const focusStyles = `
  focus:outline-none
  focus:ring-2
  focus:ring-primary-500
  focus:ring-offset-2
`;
```

#### Screen Reader Support
- Semantic HTML5 (`<nav>`, `<main>`, `<article>`)
- ARIA labels for all icons and images
- Live regions for dynamic content updates
- Skip navigation links

#### Color Contrast
- Minimum ratio: 4.5:1 (normal text)
- Minimum ratio: 3:1 (large text)
- Color-blind friendly palette (tested with simulators)

#### Text & Content
- Resizable text up to 200% without loss of functionality
- `lang` attributes for multi-language content
- Alternative text for all images and flags

#### Motion & Animations
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 6.2 Performance Optimizations

#### Frontend Performance

**Code Splitting**
```typescript
// Lazy load heavy components
const GlobalVisaMap = lazy(() => import('./pages/GlobalVisaMap'));
const ComparisonDashboard = lazy(() => import('./pages/CompareDashboard'));
```

**Image Optimization**
- WebP format with JPEG fallback
- Lazy loading (`loading="lazy"`)
- Responsive images with `srcset`
- Country flags: SVG or optimized emoji

**Bundle Optimization**
```javascript
// Vite config
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'motion': ['framer-motion'],
          'maps': ['mapbox-gl', 'd3'],
        }
      }
    }
  }
};
```

**Performance Budgets**
- Initial load: < 200 KB (gzipped)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse score: > 90

#### Backend Performance

**Query Optimization**
```typescript
// Indexed fields in MongoDB
visaSchema.index({ originCountry: 1, destinationCountry: 1 });
countrySchema.index({ code: 1 });
```

**Connection Pooling**
```typescript
mongoose.connect(MONGO_URI, {
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
});
```

**Rate Limiting**
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

#### PWA Features

**Service Worker Strategy**
```typescript
// Workbox config
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 })
    ]
  })
);
```

**Offline Fallback**
- Cached home page
- Offline indicator UI
- Local storage for bookmarks

---

## 7. Future AI-Readiness Hooks

### 7.1 Predictive Visa Complexity Scoring
```typescript
interface AIVisaScore {
  complexityScore: number;      // 0-100 (ML-generated)
  factors: {
    documentCount: number;
    processingTime: number;
    rejectionRate: number;
    costIndex: number;
  };
  recommendation: 'easy' | 'moderate' | 'complex' | 'avoid';
  confidence: number;           // 0-1
}
```

### 7.2 Personalized Destination Recommendations
```typescript
interface AIRecommendation {
  userId: string;
  recommendations: {
    country: string;
    matchScore: number;         // Based on user preferences
    reason: string;
    visaType: string;
  }[];
  basedOn: {
    pastTravels: string[];
    searchHistory: string[];
    preferences: {
      climate: string[];
      budget: 'low' | 'medium' | 'high';
      purpose: string[];
    };
  };
}
```

### 7.3 Real-Time Visa Policy Changes (NLP)
```typescript
interface AIAlertSystem {
  source: 'news-feed' | 'government-site' | 'social-media';
  event: {
    type: 'policy-change' | 'new-restriction' | 'easing';
    countries: string[];
    summary: string;             // NLP-generated summary
    impactScore: number;         // 0-10
    detectedAt: Date;
  };
  affectedUsers: string[];       // Users with bookmarks/alerts
}
```

---

## 8. Design Tokens (For Development)

### 8.1 Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... (as defined above)
        },
        visa: {
          free: '#10b981',
          arrival: '#f59e0b',
          evisa: '#3b82f6',
          required: '#ef4444',
          closed: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Lexend', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'flag-wave': 'wave 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        wave: {
          '0%, 100%': { transform: 'rotateY(0deg)' },
          '25%': { transform: 'rotateY(10deg)' },
          '75%': { transform: 'rotateY(-10deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 9. Component Examples

### 9.1 VisaCard Component
```typescript
interface VisaCardProps {
  destination: {
    code: string;
    name: string;
    flag: string;
  };
  visaType: 'visa-free' | 'voa' | 'evisa' | 'visa-required';
  stayDuration: number;
  fees?: { amount: number; currency: string };
  onSave: () => void;
  onCompare: () => void;
}

const VisaCard: React.FC<VisaCardProps> = ({ ... }) => {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card"
    >
      <div className="flex items-start justify-between">
        <motion.span
          whileHover={{ rotateY: [0, 10, -10, 0] }}
          className="text-5xl"
        >
          {destination.flag}
        </motion.span>
        <VisaStatusBadge type={visaType} />
      </div>

      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        {destination.name}
      </h3>

      <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p>Stay: {stayDuration} days</p>
        {fees && <p>Fee: {fees.amount} {fees.currency}</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="ghost" size="sm" onClick={onSave}>
          <BookmarkIcon /> Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onCompare}>
          <CompareIcon /> Compare
        </Button>
      </div>
    </motion.div>
  );
};
```

### 9.2 ProcessingTimeline Component
```typescript
const ProcessingTimeline: React.FC<{ stages: Stage[] }> = ({ stages }) => {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" />

      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative flex items-center gap-4 pb-8"
        >
          <div className={`
            z-10 flex h-12 w-12 items-center justify-center rounded-full
            ${stage.completed ? 'bg-green-500' : 'bg-gray-300'}
          `}>
            {stage.completed ? <CheckIcon /> : <ClockIcon />}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold">{stage.title}</h4>
            <p className="text-sm text-gray-600">{stage.description}</p>
            <span className="text-xs text-gray-500">{stage.duration}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
```

---

## 10. Conclusion

This design system provides a comprehensive blueprint for building the Visa Explore micro-frontend. It balances **aesthetic appeal** with **functional excellence**, ensuring users can navigate complex visa information effortlessly while enjoying a delightful, accessible experience.

The architecture is designed to scale, integrate seamlessly with Nomadic Nook's ecosystem, and adapt to future AI-powered enhancements. Every design decision—from color choices to animation timing—serves the core mission: **empowering travelers to explore the world with confidence**.
