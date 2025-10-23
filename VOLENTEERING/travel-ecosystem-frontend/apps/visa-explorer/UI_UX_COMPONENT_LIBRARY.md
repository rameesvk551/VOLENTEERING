# Visa Explore - UI/UX Component Library

## 🎨 Design Philosophy

As a Senior UI/UX Expert, this component library embodies industry-leading practices:

### Core UX Principles
1. **Accessibility First** - WCAG 2.2 AA compliant by default
2. **Mobile-First Responsive** - Touch-optimized for 44x44px minimum targets
3. **Progressive Disclosure** - Reveal complexity gradually
4. **Feedback & Affordance** - Every interaction has clear visual feedback
5. **Performance** - 60fps animations, optimized re-renders
6. **Consistency** - Predictable patterns across the entire application

---

## 📦 Component Architecture

### Atomic Design System
```
atoms/        → Basic building blocks (Button, Input, Badge)
molecules/    → Simple combinations (SearchBar, VisaCard)
organisms/    → Complex sections (Navbar, FilterPanel)
templates/    → Page layouts
pages/        → Complete views
```

---

## ⚛️ Atoms (Foundational Components)

### Button Component
**File**: `/src/components/atoms/Button.tsx`

**Features**:
- ✅ 6 variants (primary, secondary, outline, ghost, danger, success)
- ✅ 4 sizes (sm, md, lg, xl)
- ✅ Loading state with spinner
- ✅ Icon support (left/right)
- ✅ Full accessibility (ARIA labels, keyboard nav)
- ✅ Smooth micro-interactions (scale on hover/tap)
- ✅ Disabled state with proper visual feedback
- ✅ Focus visible for keyboard users

**Usage**:
```tsx
import Button from '@/components/atoms/Button';
import { ArrowRight } from 'lucide-react';

<Button
  variant="primary"
  size="md"
  leftIcon={<ArrowRight />}
  isLoading={isSubmitting}
  onClick={handleSubmit}
>
  Search Visas
</Button>
```

**UX Best Practices**:
- Minimum touch target: 44x44px (WCAG 2.5.5)
- Color contrast ratio > 4.5:1
- Hover state: 1.02x scale (subtle, not jarring)
- Tap state: 0.98x scale (haptic-like feedback)
- Loading: spinner replaces icon, button stays same size

---

### Input Component
**File**: `/src/components/atoms/Input.tsx`

**Features**:
- ✅ Label with required indicator
- ✅ Error/success validation states
- ✅ Helper text support
- ✅ Left/right icons
- ✅ Password toggle (show/hide)
- ✅ Auto-generated unique IDs for a11y
- ✅ Proper ARIA attributes
- ✅ Focus ring with smooth transition

**Usage**:
```tsx
import Input from '@/components/atoms/Input';
import { Mail } from 'lucide-react';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  leftIcon={<Mail className="h-5 w-5" />}
  error={errors.email}
  helperText="We'll never share your email"
  required
  {...register('email')}
/>
```

**UX Best Practices**:
- Always show label (not just placeholder)
- Error messages are specific and actionable
- Success state for positive reinforcement
- Focus state with ring (not just border change)
- Password toggle for UX (don't force memorization)

---

### Badge Component
**File**: `/src/components/atoms/Badge.tsx` (To be created)

**Features**:
- Visa status indicators (🟢 🟡 🔵 🔴)
- Color-coded by visa type
- Icon support
- Rounded pill design
- Accessible color contrast

**Usage**:
```tsx
<Badge variant="visa-free" icon="🟢">
  Visa-Free
</Badge>
```

---

### Card Component
**File**: `/src/components/atoms/Card.tsx` (To be created)

**Features**:
- Elevation levels (flat, elevated, interactive)
- Hover animations
- Click states
- Border options
- Padding variants

---

## 🧩 Molecules (Composite Components)

### VisaCard
**Purpose**: Display visa information in a digestible, scannable format

**Visual Hierarchy**:
1. **Flag** - Instant recognition (largest visual element)
2. **Country Name** - Primary information
3. **Visa Status Badge** - Color-coded for quick scanning
4. **Key Details** - Stay duration, fees (secondary info)
5. **Actions** - Save, Compare (tertiary)

**UX Patterns**:
- F-pattern reading: Important info top-left
- Progressive disclosure: Click for full details
- Hover state: Lift effect (0 → 4px shadow)
- Active state: Scale down slightly
- Skeleton loading during data fetch

**Responsive Behavior**:
- Mobile: Stack vertically, larger touch targets
- Tablet: 2-column grid
- Desktop: 3-4 column grid with hover previews

---

### SearchBar
**Purpose**: Primary entry point for visa exploration

**Features**:
- Autocomplete with fuzzy search
- Recent searches (local storage)
- Popular destinations (from cache)
- Keyboard navigation (↑↓ arrows, Enter, Esc)
- Clear button (×)
- Search icon (magnifying glass)
- Loading state during API calls

**UX Optimizations**:
- Debounced input (300ms) to reduce API calls
- Show results after 2 characters
- Highlight matching text
- Show country flags for visual recognition
- "No results" state with suggestions

---

### FilterPanel
**Purpose**: Refine visa search results

**Filter Categories**:
1. **Visa Type** - Pills (multi-select)
2. **Region** - Dropdown with checkboxes
3. **Duration** - Range slider (7-365 days)
4. **Complexity** - Toggle buttons (Easy/Moderate/Complex)
5. **Cost** - Range slider ($0-$500)

**UX Patterns**:
- Collapsible on mobile (drawer from bottom)
- Sticky on desktop (sidebar)
- Live count of results
- "Clear all" option
- Applied filters shown as removable chips

---

### ComparisonCard
**Purpose**: Side-by-side visa comparison

**Visual Design**:
- Table layout on desktop
- Swipeable cards on mobile
- Color-coded differences
- Sticky headers
- Export to PDF/Image

**Compared Attributes**:
- Visa Type
- Processing Time
- Cost
- Stay Duration
- Complexity Score
- Required Documents (count)

---

## 🏗️ Organisms (Complex Sections)

### Navbar
**Features**:
- Logo (links to home)
- Main navigation (Explore, Map, Compare, Saved)
- Search (global)
- User menu (avatar + dropdown)
- Notifications bell
- Language selector
- Theme toggle (light/dark)

**Responsive**:
- Desktop: Full horizontal nav
- Mobile: Hamburger menu (slide from left)
- Sticky on scroll (with reduced height)

---

### GlobalVisaMap
**Purpose**: Interactive world map visualization

**Technology**: Mapbox GL JS + D3.js overlay

**Features**:
- Color-coded countries by visa type
- Hover tooltips with quick info
- Click to open detailed panel
- Zoom controls
- Layer toggle (Tourism/Business/Study)
- Search location
- Reset view button

**UX Optimizations**:
- Smooth pan/zoom (momentum scrolling)
- Debounced hover (100ms)
- Loading shimmer during tile load
- Fallback for countries without data (gray)

---

### ProcessingTimeline
**Purpose**: Visualize visa application journey

**Stages**:
1. **Application** - Submit documents
2. **Review** - Embassy processing
3. **Approval** - Decision made
4. **Entry** - Valid for travel

**Visual Design**:
- Vertical timeline (mobile)
- Horizontal timeline (desktop)
- Animated progress bar
- Icons for each stage
- Estimated dates
- Current stage highlighted

---

## 🎨 Design Tokens

### Color System
```css
/* Primary Brand */
--primary-50: #eff6ff;
--primary-500: #3b82f6;  /* Main brand */
--primary-900: #1e3a8a;

/* Visa Status */
--visa-free: #10b981;     /* 🟢 Green */
--visa-arrival: #f59e0b;  /* 🟡 Yellow */
--visa-evisa: #3b82f6;    /* 🔵 Blue */
--visa-required: #ef4444; /* 🔴 Red */
```

### Typography
```css
/* Font Families */
--font-sans: 'Inter', system-ui;
--font-display: 'Lexend', 'Inter';

/* Type Scale (1.25 ratio) */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
```

### Spacing (8px Grid)
```css
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem;  /* 8px */
--spacing-4: 1rem;    /* 16px */
--spacing-8: 2rem;    /* 32px */
```

### Shadows (Elevation)
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
```

---

## 🎭 Animation Guidelines

### Micro-interactions
```javascript
// Button hover
scale: 1 → 1.02
duration: 150ms
easing: easeOut

// Card lift
translateY: 0 → -4px
shadow: md → lg
duration: 200ms

// Flag wave on hover
rotateY: 0deg → 10deg → -10deg → 0deg
duration: 500ms
```

### Page Transitions
```javascript
// Route change
fadeIn + slideUp
duration: 400ms
easing: easeInOut
```

### Loading States
```javascript
// Skeleton shimmer
background: linear-gradient(90deg, gray-200 → white → gray-200)
animation: shimmer 2s infinite
```

### Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

---

## 📱 Responsive Breakpoints

```javascript
const breakpoints = {
  xs: '320px',   // Small phones
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
};
```

### Mobile-First Approach
```css
/* Base styles for mobile (320px+) */
.card { padding: 1rem; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .card { padding: 1.5rem; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .card { padding: 2rem; }
}
```

---

## ♿ Accessibility Checklist

### Component Requirements
- [ ] Semantic HTML (`<button>` not `<div>`)
- [ ] ARIA labels for icon-only buttons
- [ ] Focus visible (ring, not outline)
- [ ] Keyboard navigation (Tab, Enter, Space, Esc)
- [ ] Screen reader text for context
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Touch target size ≥ 44x44px
- [ ] Form labels with `htmlFor`
- [ ] Error messages linked with `aria-describedby`
- [ ] Loading state announced

### Testing Tools
- axe DevTools (Chrome extension)
- Lighthouse (Performance & A11y)
- Keyboard-only navigation
- Screen reader (NVDA/VoiceOver)

---

## 🚀 Performance Optimizations

### Component-Level
```typescript
// Lazy load heavy components
const GlobalVisaMap = lazy(() => import('./organisms/GlobalVisaMap'));

// Memoize expensive calculations
const complexityScore = useMemo(() =>
  calculateScore(visaData),
  [visaData]
);

// Debounce search input
const debouncedSearch = useMemo(() =>
  debounce(handleSearch, 300),
  []
);
```

### Image Optimization
```tsx
<img
  src={flag}
  alt={`${countryName} flag`}
  loading="lazy"
  width={64}
  height={64}
  className="object-cover"
/>
```

### Bundle Splitting
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'animations': ['framer-motion'],
          'maps': ['mapbox-gl'],
        }
      }
    }
  }
};
```

---

## 🎯 User Flows

### Primary Flow: Search Visa
1. **Land on homepage** → PassportSelector pre-filled (geolocation)
2. **Search destination** → Autocomplete suggestions
3. **Select country** → Loading skeleton → VisaCard appears
4. **View details** → Slide-up modal with full info
5. **Save or Compare** → Add to bookmarks/comparison

### Secondary Flow: Explore Map
1. **Click "Map" in nav** → Loading shimmer
2. **Map loads** → Zoom to user's country
3. **Hover countries** → Tooltip with visa type
4. **Click country** → Side panel with details
5. **Filter by visa type** → Map colors update instantly

---

## 💡 UX Best Practices Applied

### 1. **Progressive Disclosure**
Don't overwhelm users. Show essentials first:
- VisaCard shows: Type, Duration, Cost
- Click for more: Requirements, Timeline, Embassy

### 2. **Feedback Loops**
Every action has feedback:
- Button click: Scale animation
- Form submit: Loading state
- Save bookmark: Toast notification
- Error: Inline message with retry

### 3. **Zero State Design**
Empty states are opportunities:
- "No bookmarks yet" → CTA to explore
- "No search results" → Suggest popular destinations
- "Loading..." → Skeleton screens (not blank)

### 4. **Error Prevention**
Design to prevent errors:
- Autocomplete reduces typos
- Date picker prevents invalid dates
- Form validation on blur (not on submit)
- Confirm destructive actions

### 5. **Mobile Gestures**
Native-like interactions:
- Swipe cards left/right
- Pull-to-refresh
- Bottom sheets (not dropdowns)
- Large touch targets

---

## 📊 Component Usage Examples

### Complete Form with Validation
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        showPasswordToggle
        error={errors.password?.message}
        {...register('password')}
      />
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
      >
        Sign In
      </Button>
    </form>
  );
}
```

### Interactive VisaCard
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
  whileTap={{ scale: 0.98 }}
  className="bg-white rounded-xl p-6 shadow-card cursor-pointer"
>
  <div className="flex items-start justify-between">
    <span className="text-5xl" role="img" aria-label={`${country} flag`}>
      {flag}
    </span>
    <Badge variant={visaType}>{visaTypeLabel}</Badge>
  </div>

  <h3 className="mt-4 text-xl font-semibold">{countryName}</h3>

  <div className="mt-3 space-y-2 text-sm text-gray-600">
    <p>Stay: {stayDuration} days</p>
    {fees && <p>Fee: {formatCurrency(fees.amount, fees.currency)}</p>}
  </div>

  <div className="mt-4 flex gap-2">
    <Button variant="ghost" size="sm" leftIcon={<Bookmark />}>
      Save
    </Button>
    <Button variant="ghost" size="sm" leftIcon={<ArrowsLeftRight />}>
      Compare
    </Button>
  </div>
</motion.div>
```

---

## 🎓 Next Steps for Developers

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Review design tokens** in `tailwind.config.js`

3. **Study atomic components** in `/src/components/atoms/`

4. **Build molecules** by composing atoms

5. **Test accessibility** with keyboard + screen reader

6. **Optimize performance** with React DevTools Profiler

7. **Document new components** following this format

---

## 📚 Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Material Design 3](https://m3.material.io/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind UI Components](https://tailwindui.com/)

---

**Created by**: Senior UI/UX Expert Team
**Last Updated**: October 13, 2025
**Version**: 1.0.0

---

This component library ensures that Visa Explore delivers a **world-class user experience** with:
- ⚡ Lightning-fast interactions
- ♿ Universal accessibility
- 📱 Mobile-first responsiveness
- 🎨 Beautiful, cohesive design
- 🚀 Optimized performance

**Every pixel matters. Every interaction delights.**
