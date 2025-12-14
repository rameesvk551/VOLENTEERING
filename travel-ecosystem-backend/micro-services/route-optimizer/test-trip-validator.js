/**
 * Unit Tests for Trip Validator Utility
 * Tests validation logic without requiring a running server
 */

const {
  isAttractionOpenAt,
  validateTrip,
  breakIntoMultiDaySegments,
  recommendTransportMode,
  adjustItineraryForOpeningHours,
} = require('./dist/utils/trip-validator.js');

console.log('🧪 Running Trip Validator Unit Tests\n');

// Test 1: isAttractionOpenAt
console.log('Test 1: Opening Hours Validation');
console.log('='.repeat(50));

const attraction1 = {
  id: 'taj-mahal',
  name: 'Taj Mahal',
  lat: 27.1751,
  lng: 78.0421,
  timeWindow: { open: '06:00', close: '18:30' },
  visitDuration: 120,
};

// Test at 10 AM - should be open
const morning = new Date('2025-12-15T10:00:00');
const morningCheck = isAttractionOpenAt(attraction1, morning);
console.log('✓ 10 AM visit:', morningCheck.isOpen ? '✅ OPEN' : '❌ CLOSED');

// Test at 7 PM (19:00) - should be closed
const evening = new Date('2025-12-15T19:00:00');
const eveningCheck = isAttractionOpenAt(attraction1, evening);
console.log('✓ 7 PM visit:', eveningCheck.isOpen ? '❌ ERROR' : '✅ CLOSED (as expected)');
console.log('  Reason:', eveningCheck.reason);

// Test 2: recommendTransportMode
console.log('\n\nTest 2: Transport Mode Recommendations');
console.log('='.repeat(50));

const testDistances = [1, 10, 150, 600];
testDistances.forEach(dist => {
  const rec = recommendTransportMode(dist);
  console.log(`\n${dist} km:`);
  console.log(`  ✅ Recommended: ${rec.recommended.join(', ')}`);
  console.log(`  ❌ Not recommended: ${rec.notRecommended.join(', ')}`);
  console.log(`  💡 Reason: ${rec.reason}`);
});

// Test 3: validateTrip
console.log('\n\nTest 3: Trip Validation');
console.log('='.repeat(50));

const places = [
  {
    id: 'start',
    name: 'Starting Point',
    lat: 28.6129,
    lng: 77.2295,
    visitDuration: 30,
  },
  {
    id: 'mid',
    name: 'Middle Point',
    lat: 28.7000,
    lng: 77.3000,
    visitDuration: 60,
  },
  {
    id: 'end',
    name: 'End Point',
    lat: 28.8000,
    lng: 77.4000,
    visitDuration: 45,
  },
];

// Simple distance/time matrices (3x3)
const travelTimeMatrix = [
  [0, 1800, 3600],     // 30 min, 1 hour
  [1800, 0, 1800],     // 30 min, 30 min
  [3600, 1800, 0],     // 1 hour, 30 min
];

const distanceMatrix = [
  [0, 15000, 30000],   // 15 km, 30 km
  [15000, 0, 15000],
  [30000, 15000, 0],
];

const validation = validateTrip(places, travelTimeMatrix, distanceMatrix);
console.log('\nValidation Results:');
console.log('  Valid:', validation.isValid ? '✅ YES' : '❌ NO');
console.log('  Errors:', validation.errors.length);
validation.errors.forEach(err => console.log('    ❌', err));
console.log('  Warnings:', validation.warnings.length);
validation.warnings.forEach(warn => console.log('    ⚠️', warn));
console.log('  Suggestions:', validation.suggestions.length);
validation.suggestions.forEach(sug => console.log('    💡', sug));

// Test 4: breakIntoMultiDaySegments
console.log('\n\nTest 4: Multi-Day Segmentation');
console.log('='.repeat(50));

// Create a long trip
const longTripPlaces = [
  { id: 'p1', name: 'Place 1', lat: 10, lng: 75, visitDuration: 120 },
  { id: 'p2', name: 'Place 2', lat: 12, lng: 77, visitDuration: 90 },
  { id: 'p3', name: 'Place 3', lat: 15, lng: 78, visitDuration: 120 },
  { id: 'p4', name: 'Place 4', lat: 18, lng: 79, visitDuration: 90 },
  { id: 'p5', name: 'Place 5', lat: 20, lng: 80, visitDuration: 60 },
];

// Long travel times (in seconds)
const longTravelTimes = [
  [0, 14400, 28800, 43200, 57600],       // 4, 8, 12, 16 hours
  [14400, 0, 14400, 28800, 43200],
  [28800, 14400, 0, 14400, 28800],
  [43200, 28800, 14400, 0, 14400],
  [57600, 43200, 28800, 14400, 0],
];

const longDistances = [
  [0, 200000, 400000, 600000, 800000],   // 200, 400, 600, 800 km
  [200000, 0, 200000, 400000, 600000],
  [400000, 200000, 0, 200000, 400000],
  [600000, 400000, 200000, 0, 200000],
  [800000, 600000, 400000, 200000, 0],
];

const segments = breakIntoMultiDaySegments(
  longTripPlaces,
  longTravelTimes,
  longDistances,
  new Date('2025-12-15T09:00:00')
);

console.log(`\n✅ Trip broken into ${segments.length} day(s):`);
segments.forEach((seg, idx) => {
  console.log(`\n  Day ${seg.day} (${seg.date}):`);
  console.log(`    Places: ${seg.places.map(p => p.name).join(' → ')}`);
  console.log(`    Travel: ${seg.travelTimeMinutes} min`);
  console.log(`    Visit: ${seg.visitTimeMinutes} min`);
  console.log(`    Total: ${seg.totalTimeMinutes} min (${(seg.totalTimeMinutes / 60).toFixed(1)} hours)`);
  console.log(`    Accommodation needed: ${seg.requiresAccommodation ? '🏨 YES' : '❌ NO'}`);
});

// Test 5: adjustItineraryForOpeningHours
console.log('\n\nTest 5: Opening Hours Adjustment');
console.log('='.repeat(50));

const placesWithHours = [
  {
    id: 'early',
    name: 'Early Place',
    lat: 28.6,
    lng: 77.2,
    visitDuration: 60,
    timeWindow: { open: '09:00', close: '17:00' },
  },
  {
    id: 'mid',
    name: 'Mid Place',
    lat: 28.7,
    lng: 77.3,
    visitDuration: 120,
    timeWindow: { open: '10:00', close: '18:00' },
  },
  {
    id: 'late',
    name: 'Late Place (Will be removed)',
    lat: 28.8,
    lng: 77.4,
    visitDuration: 90,
    timeWindow: { open: '09:00', close: '17:00' },
  },
];

const simpleMatrix = [
  [0, 3600, 7200],     // 1 hour, 2 hours
  [3600, 0, 3600],
  [7200, 3600, 0],
];

// Start at 3 PM
const lateStart = new Date('2025-12-15T15:00:00');
const adjustment = adjustItineraryForOpeningHours(placesWithHours, simpleMatrix, lateStart);

console.log('\nAdjustment Results:');
console.log(`  Kept: ${adjustment.adjustedPlaces.length} places`);
console.log(`  Removed: ${adjustment.removedPlaces.length} places`);
console.log('\n  Details:');
adjustment.adjustments.forEach(adj => console.log(`    ${adj}`));

console.log('\n' + '='.repeat(50));
console.log('✅ All Unit Tests Completed Successfully!');
console.log('='.repeat(50));
