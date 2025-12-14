# Transport Drawer - Quick Reference

## Key Features Comparison

| Feature | OptimizeModal | TransportDrawer |
|---------|---------------|-----------------|
| **Direction** | Bottom → Top | Top → Bottom |
| **Trigger** | Click "Optimize" FAB | Public transport NOT selected |
| **Swipe to Close** | Swipe down | Swipe up |
| **Rounded Corners** | Top rounded | Bottom rounded |
| **Handle Position** | Top | Bottom |
| **Travel Options** | Drive/Public/Bike/Walk | Bus/Train/Flight |
| **Purpose** | Route optimization | Long-distance transport |

## When Each Opens

### OptimizeModal Opens When:
✅ User clicks FAB button
✅ User has selected attractions
✅ Shows different button text based on selection

### TransportDrawer Opens When:
✅ User selects PUBLIC_TRANSPORT in OptimizeModal
✅ User clicks "Select Transportation" button
✅ System needs long-distance transport search

## Data Flow

```
User Action
    ↓
OptimizeModal Opens
    ↓
User Selects: PUBLIC TRANSPORT ✓
    ↓
Button text changes to "Select Transportation"
    ↓
User clicks "Select Transportation"
    ↓
TransportDrawer Opens from TOP
    ↓
User selects: Bus/Train/Flight
    ↓
Search for transport routes
```

## Button Text Logic

**When PUBLIC_TRANSPORT is selected:**
- Button shows: **"Select Transportation"** 🚌
- Action: Opens TransportDrawer

**When PUBLIC_TRANSPORT is NOT selected:**
- Button shows: **"Optimize Route"** 🗺️
- Action: Performs route optimization

## Transport Mode Icons

🚗 **Drive** - OptimizeModal (local transport)
🚌 **Bus** - TransportDrawer (long-distance)
🚂 **Train** - TransportDrawer (long-distance)
✈️ **Flight** - TransportDrawer (long-distance)
🚶 **Walk** - OptimizeModal (local transport)
🚴 **Bike** - OptimizeModal (local transport)

## UI Layout

### TransportDrawer Layout (Top to Bottom):
```
┌─────────────────────────────────┐
│ ╔═══════════════════════════╗   │ ← Header with title
│ ║ Find Transport        [X] ║   │
│ ╚═══════════════════════════╝   │
├─────────────────────────────────┤
│ 📍 Starting Location            │
│ [Location Input Field]          │
├─────────────────────────────────┤
│ 📍 Destination                  │
│ [Destination Input Field]       │
├─────────────────────────────────┤
│ 📅 Travel Date                  │
│ [Date Picker]                   │
├─────────────────────────────────┤
│ Transport Mode:                 │
│ [🚌 Bus] [🚂 Train] [✈️ Flight] │
├─────────────────────────────────┤
│ ☑ Use dummy data               │
├─────────────────────────────────┤
│ [Find Routes Button]            │
│ [Cancel]                        │
├─────────────────────────────────┤
│     ═══ (Swipe Handle)          │ ← Bottom handle
└─────────────────────────────────┘
```

## Pre-filled Data

When TransportDrawer opens, it receives:
- ✅ Starting location (from OptimizeModal)
- ✅ Selected date (from OptimizeModal)
- ✅ Searched city/place name
- ✅ Selected travel types (for context)

## Dummy Data Feature

Toggle ON → Uses sample data for testing
Toggle OFF → Makes real API calls

**Example Alert:**
```
Searching for bus from 
"123 Main St, New York" to 
"Central Park, New York" on 
2025-11-18 (Using dummy data)
```

## Color Scheme

- **Bus**: Blue (`bg-blue-600`)
- **Train**: Green (`bg-green-600`)
- **Flight**: Purple (`bg-purple-600`)
- **Active State**: Colored with shadow
- **Inactive State**: White with border

## Responsive Behavior

### Mobile (< 768px):
- Full width drawer
- Rounded bottom corners
- Swipe handle visible
- Touch-optimized buttons

### Desktop (≥ 768px):
- Centered modal
- Max width 512px
- Standard rounded corners
- No swipe handle
- Click backdrop to close

---

**Quick Start:**
1. Select attractions
2. Open optimize modal
3. Don't select "Public"
4. Click optimize
5. Transport drawer appears!
