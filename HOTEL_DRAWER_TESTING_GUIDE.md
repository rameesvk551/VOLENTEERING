# HotelDrawer Testing Guide

## 🎯 Test Scenarios

### Test 1: Basic Opening Flow
**Steps:**
1. Navigate to Trip Planner page
2. Select a destination (e.g., Paris)
3. Select 3+ attractions
4. Click the floating action button (FAB)
5. In OptimizeModal, select PUBLIC_TRANSPORT
6. Click "Select Transportation"
7. TransportDrawer should open with Bus selected by default
8. Click "Find Routes"
9. Click on "Express Bus Service - $25"

**Expected Result:**
✅ HotelDrawer opens
✅ Budget category is pre-selected (green)
✅ 6 budget hotels are displayed
✅ TransportDrawer closes automatically
✅ Destination shows "Paris" (or your selected city)
✅ Check-in date shows today's date
✅ Transport shows "Bus" with bus icon

---

### Test 2: Category Switching
**Steps:**
1. With HotelDrawer open (showing Budget hotels)
2. Click "Mid-Range" button

**Expected Result:**
✅ Mid-Range button turns blue with scale effect
✅ Budget button returns to white/gray
✅ 7 mid-range hotels appear instantly
✅ Price range updates to $100-$200
✅ Hotels show pool, gym, breakfast amenities

**Steps (continued):**
3. Click "Luxury" button

**Expected Result:**
✅ Luxury button turns purple with scale effect
✅ Mid-Range button returns to white/gray
✅ 8 luxury hotels appear instantly
✅ Price range updates to $200+
✅ Hotels show special features (Spa, Concierge, etc.)

---

### Test 3: Hotel Selection
**Steps:**
1. With HotelDrawer open
2. Click on any hotel card (e.g., "Comfort Inn Downtown")

**Expected Result:**
✅ Alert shows: "Selected: Comfort Inn Downtown - $65/night"
✅ HotelDrawer closes
✅ Returns to Trip Planner page
✅ FAB reappears

---

### Test 4: Close Behaviors
**Test 4a: Close Button**
**Steps:**
1. Open HotelDrawer
2. Click X button in top-right corner

**Expected Result:**
✅ Drawer closes smoothly
✅ Returns to Trip Planner

**Test 4b: Cancel Button**
**Steps:**
1. Open HotelDrawer
2. Scroll to bottom
3. Click "Cancel" button

**Expected Result:**
✅ Drawer closes
✅ Returns to Trip Planner

**Test 4c: Backdrop Click**
**Steps:**
1. Open HotelDrawer
2. Click on dark backdrop area (outside drawer)

**Expected Result:**
✅ Drawer closes
✅ Returns to Trip Planner

**Test 4d: Escape Key**
**Steps:**
1. Open HotelDrawer
2. Press Escape key

**Expected Result:**
✅ Drawer closes
✅ Returns to Trip Planner

---

### Test 5: Mobile Swipe Gesture
**Prerequisites:** Test on mobile device or browser DevTools mobile view

**Steps:**
1. Open HotelDrawer on mobile
2. Touch the swipe handle at top
3. Drag downward more than 100px
4. Release

**Expected Result:**
✅ Drawer follows finger during drag
✅ Drawer closes when released past threshold
✅ Drawer snaps back if drag < 100px

---

### Test 6: Different Transport Modes
**Test 6a: Train**
**Steps:**
1. Open TransportDrawer
2. Click "Train" button
3. Click "Find Routes"
4. Select "High Speed Express - $45"

**Expected Result:**
✅ HotelDrawer opens
✅ Transport shows "Train" with train icon

**Test 6b: Flight**
**Steps:**
1. Open TransportDrawer
2. Click "Flight" button
3. Click "Find Routes"
4. Select "Direct Flight - $120"

**Expected Result:**
✅ HotelDrawer opens
✅ Transport shows "Flight" with plane icon

---

### Test 7: Visual Elements
**Verify all hotels display correctly:**

**Budget Hotels (6):**
- [ ] Comfort Inn Downtown - $65, 3.5⭐, WiFi/Parking/Breakfast, 0.5km
- [ ] City Budget Hotel - $55, 3.0⭐, WiFi/Parking, 1.2km
- [ ] Traveler's Rest - $70, 4.0⭐, WiFi/Breakfast/Gym, 0.8km
- [ ] Economy Lodge - $50, 3.0⭐, WiFi/Parking, 2.0km
- [ ] Value Inn Express - $80, 3.5⭐, WiFi/Breakfast/Parking, 1.5km
- [ ] Smart Stay Hotel - $75, 4.0⭐, WiFi/Gym/Breakfast, 1.0km

**Mid-Range Hotels (7):**
- [ ] Grand Plaza Hotel - $145, 4.0⭐, All amenities, 0.3km
- [ ] Riverside Suites - $130, 4.5⭐, Pool/Gym/Breakfast/WiFi, 0.6km
- [ ] Central Park Inn - $155, 4.0⭐, Gym/Breakfast/Parking/WiFi, 0.4km
- [ ] Metropolitan Hotel - $165, 4.5⭐, Pool/Gym/Breakfast/WiFi, 0.5km
- [ ] Skyline Business Hotel - $140, 4.0⭐, Gym/Breakfast/Parking/WiFi, 0.9km
- [ ] Garden View Resort - $175, 4.5⭐, All amenities, 0.7km
- [ ] Urban Oasis Hotel - $150, 4.0⭐, Pool/Breakfast/Gym/WiFi, 0.8km

**Luxury Hotels (8):**
- [ ] Royal Palace Hotel - $350, 5.0⭐, Spa/Concierge/Fine Dining, 0.2km
- [ ] Diamond Suites & Spa - $425, 5.0⭐, Spa/Concierge/Rooftop Bar, 0.1km
- [ ] Platinum Tower - $280, 5.0⭐, Concierge/Fine Dining, 0.4km
- [ ] Elite Grand Resort - $500, 5.0⭐, Spa/Concierge/Fine Dining/Butler, 0.3km
- [ ] Prestige Hotel & Casino - $320, 5.0⭐, Casino/Spa/Fine Dining, 0.5km
- [ ] Imperial Crown Suites - $380, 5.0⭐, Spa/Concierge/Private Chef, 0.2km
- [ ] Monarch Luxury Hotel - $295, 5.0⭐, Spa/Fine Dining/Rooftop Pool, 0.6km
- [ ] Opulent Towers - $450, 5.0⭐, Spa/Concierge/Fine Dining/Helipad, 0.1km

---

### Test 8: Amenity Icons
**Verify icons display:**
- [ ] 📶 WiFi icon (Wifi component)
- [ ] 🌊 Pool icon (Waves component)
- [ ] 💪 Gym icon (Dumbbell component)
- [ ] ☕ Breakfast icon (Coffee component)
- [ ] 🚗 Parking icon (Car component)
- [ ] 📍 Distance icon (MapPin component)
- [ ] ⭐ Rating stars (Star component with fill)

---

### Test 9: Responsive Design
**Desktop (>768px):**
- [ ] Drawer centered on screen
- [ ] Max width: lg (32rem)
- [ ] Rounded corners on all sides
- [ ] No swipe handle visible
- [ ] Padding: p-4

**Mobile (<768px):**
- [ ] Drawer at bottom of screen
- [ ] Full width
- [ ] Rounded top corners only
- [ ] Swipe handle visible
- [ ] Padding: p-3

---

### Test 10: FAB Visibility
**Steps:**
1. Start at Trip Planner with selections made
2. Verify FAB is visible (bottom-right corner)
3. Open TransportDrawer
4. Verify FAB is hidden
5. Open HotelDrawer (from TransportDrawer)
6. Verify FAB is still hidden
7. Close HotelDrawer
8. Verify FAB reappears

**Expected Result:**
✅ FAB hides when either drawer is open
✅ FAB shows when both drawers are closed

---

### Test 11: Accessibility
**Keyboard Navigation:**
- [ ] Tab key moves focus through elements
- [ ] Enter key activates buttons
- [ ] Escape key closes drawer
- [ ] Focus visible on interactive elements

**Screen Reader:**
- [ ] Header reads as "Find Hotels"
- [ ] Categories announce selection state
- [ ] Hotels announce name, price, rating
- [ ] Close button announces properly

---

### Test 12: Edge Cases
**No Data:**
- [ ] Drawer still opens if hotel data is empty
- [ ] Shows "No hotels found" message (if implemented)

**Long Hotel Names:**
- [ ] Text wraps properly
- [ ] Doesn't overflow container

**Many Amenities:**
- [ ] Icons wrap to next line
- [ ] Maintains spacing

**Rapid Clicking:**
- [ ] No duplicate drawers
- [ ] State remains consistent
- [ ] No console errors

---

## 🐛 Known Issues / Future Enhancements

### Currently Not Implemented:
- [ ] Real API integration
- [ ] Hotel images (placeholder URLs only)
- [ ] Filtering by price/rating
- [ ] Sorting options
- [ ] Favorite/save functionality
- [ ] Reviews/detailed descriptions
- [ ] Availability checking
- [ ] Multi-night pricing
- [ ] Room type selection

### Could Add:
- [ ] Loading states for API calls
- [ ] Error handling for failed requests
- [ ] Infinite scroll for large datasets
- [ ] Map view of hotels
- [ ] Comparison feature
- [ ] Price alerts
- [ ] Loyalty program integration

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Smooth animations
- ✅ Proper data display
- ✅ Correct state management
- ✅ Responsive on all devices
- ✅ Accessible keyboard/screen reader

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Test 1 (Basic Opening): ☐ Pass ☐ Fail
Test 2 (Category Switching): ☐ Pass ☐ Fail
Test 3 (Hotel Selection): ☐ Pass ☐ Fail
Test 4 (Close Behaviors): ☐ Pass ☐ Fail
Test 5 (Mobile Swipe): ☐ Pass ☐ Fail
Test 6 (Transport Modes): ☐ Pass ☐ Fail
Test 7 (Visual Elements): ☐ Pass ☐ Fail
Test 8 (Amenity Icons): ☐ Pass ☐ Fail
Test 9 (Responsive Design): ☐ Pass ☐ Fail
Test 10 (FAB Visibility): ☐ Pass ☐ Fail
Test 11 (Accessibility): ☐ Pass ☐ Fail
Test 12 (Edge Cases): ☐ Pass ☐ Fail

Overall: ☐ All Pass ☐ Some Failures

Notes:
_________________________________
_________________________________
```

---

## 🚀 Quick Start Testing

**Fastest way to test everything:**

1. **Start the app:**
   ```bash
   cd travel-ecosystem/apps/trip-planner
   npm run dev
   ```

2. **Open browser:**
   - Navigate to `http://localhost:5173` (or your dev URL)

3. **Quick test flow:**
   - Select destination
   - Pick 3 attractions
   - Click FAB → OptimizeModal → PUBLIC_TRANSPORT
   - Click "Select Transportation"
   - Click "Find Routes" → Select bus
   - HotelDrawer opens → Switch categories → Select hotel
   - ✅ Done!

**Expected time:** 2-3 minutes for full flow test
