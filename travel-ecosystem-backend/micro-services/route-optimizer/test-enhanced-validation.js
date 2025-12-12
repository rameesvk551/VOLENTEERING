/**
 * Test Enhanced Route Optimization with:
 * - Opening hours validation
 * - Multi-day trip segmentation
 * - Smart transport mode selection
 * - Daily travel limits
 */

const axios = require('axios');

const BASE_URL = process.env.ROUTE_OPTIMIZER_URL || 'http://localhost:3006';

// Test Case 1: Multi-day trip with opening hours
async function testMultiDayTripWithOpeningHours() {
  console.log('\n🧪 TEST 1: Multi-day trip Kozhikode → Delhi with opening hours');
  console.log('=' .repeat(60));

  const payload = {
    places: [
      {
        id: 'kozhikode',
        name: 'Kozhikode Beach',
        lat: 11.2588,
        lng: 75.7804,
        visitDuration: 60,
        timeWindow: { open: '06:00', close: '20:00' },
        priority: 8,
      },
      {
        id: 'bangalore',
        name: 'Bangalore Palace',
        lat: 12.9716,
        lng: 77.5946,
        visitDuration: 90,
        timeWindow: { open: '10:00', close: '17:30' },
        priority: 7,
      },
      {
        id: 'hyderabad',
        name: 'Charminar',
        lat: 17.3850,
        lng: 78.4867,
        visitDuration: 60,
        timeWindow: { open: '09:00', close: '18:00' },
        priority: 9,
      },
      {
        id: 'jaipur',
        name: 'Hawa Mahal',
        lat: 26.9239,
        lng: 75.8267,
        visitDuration: 75,
        timeWindow: { open: '09:00', close: '17:00' },
        priority: 8,
      },
      {
        id: 'agra',
        name: 'Taj Mahal',
        lat: 27.1751,
        lng: 78.0421,
        visitDuration: 120,
        timeWindow: { open: '06:00', close: '18:30' },
        priority: 10,
      },
      {
        id: 'delhi-qutub',
        name: 'Qutub Minar',
        lat: 28.5244,
        lng: 77.1855,
        visitDuration: 60,
        timeWindow: { open: '07:00', close: '17:00' },
        priority: 7,
      },
    ],
    constraints: {
      startTime: '2025-12-15T09:00:00+05:30',
      travelTypes: ['PUBLIC_TRANSPORT', 'WALKING'],
      budget: 5000,
    },
    options: {
      includeRealtimeTransit: true,
      algorithm: 'auto',
    },
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/optimize-route`, payload);
    const result = response.data;

    console.log('\n✅ Response received:');
    console.log('  - Job ID:', result.jobId);
    console.log('  - Places optimized:', result.optimizedOrder?.length);
    console.log('  - Total duration:', result.estimatedDurationMinutes, 'minutes');
    console.log('  - Total distance:', (result.totalDistanceMeters / 1000).toFixed(2), 'km');
    
    if (result.validation) {
      console.log('\n🔍 Validation Results:');
      console.log('  - Valid:', result.validation.isValid);
      
      if (result.validation.errors?.length > 0) {
        console.log('  - Errors:', result.validation.errors.length);
        result.validation.errors.forEach(err => console.log('    ❌', err));
      }
      
      if (result.validation.warnings?.length > 0) {
        console.log('  - Warnings:', result.validation.warnings.length);
        result.validation.warnings.forEach(warn => console.log('    ⚠️', warn));
      }
      
      if (result.validation.suggestions?.length > 0) {
        console.log('  - Suggestions:', result.validation.suggestions.length);
        result.validation.suggestions.forEach(sug => console.log('    💡', sug));
      }
    }

    if (result.timeline) {
      console.log('\n📅 Timeline:');
      result.timeline.forEach((entry, idx) => {
        const arrival = new Date(entry.arrivalTime);
        const departure = new Date(entry.departureTime);
        console.log(`  ${idx + 1}. ${entry.placeId}`);
        console.log(`     Arrival: ${arrival.toLocaleTimeString()}`);
        console.log(`     Departure: ${departure.toLocaleTimeString()}`);
        console.log(`     Visit: ${entry.visitDurationMinutes} min`);
      });
    }

    if (result.notes) {
      console.log('\n📝 Notes:', result.notes);
    }

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test Case 2: Long distance route (should recommend flights)
async function testLongDistanceFlightRecommendation() {
  console.log('\n🧪 TEST 2: Long distance route (Flight recommendation)');
  console.log('=' .repeat(60));

  const payload = {
    places: [
      {
        id: 'mumbai',
        name: 'Gateway of India',
        lat: 18.9220,
        lng: 72.8347,
        visitDuration: 60,
        priority: 9,
      },
      {
        id: 'delhi',
        name: 'India Gate',
        lat: 28.6129,
        lng: 77.2295,
        visitDuration: 45,
        priority: 8,
      },
      {
        id: 'kolkata',
        name: 'Victoria Memorial',
        lat: 22.5448,
        lng: 88.3426,
        visitDuration: 90,
        priority: 7,
      },
    ],
    constraints: {
      startTime: '2025-12-20T10:00:00+05:30',
      travelTypes: ['DRIVING', 'PUBLIC_TRANSPORT'],
      timeBudgetMinutes: 720, // 12 hours
    },
    options: {
      includeRealtimeTransit: false,
      algorithm: 'auto',
    },
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/optimize-route`, payload);
    const result = response.data;

    console.log('\n✅ Response received:');
    console.log('  - Total distance:', (result.totalDistanceMeters / 1000).toFixed(2), 'km');
    console.log('  - Total duration:', result.estimatedDurationMinutes, 'minutes');
    
    if (result.validation?.suggestions) {
      console.log('\n💡 Transport Suggestions:');
      result.validation.suggestions.forEach(sug => console.log('  -', sug));
    }

    if (result.legs) {
      console.log('\n🚗 Legs:');
      result.legs.forEach((leg, idx) => {
        const distKm = (leg.distanceMeters / 1000).toFixed(2);
        const durationHrs = (leg.travelTimeSeconds / 3600).toFixed(1);
        console.log(`  ${idx + 1}. ${leg.from.name} → ${leg.to.name}`);
        console.log(`     Distance: ${distKm} km | Duration: ${durationHrs} hrs`);
        console.log(`     Mode: ${leg.travelType}`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test Case 3: Opening hours conflict (late night visit)
async function testOpeningHoursConflict() {
  console.log('\n🧪 TEST 3: Opening hours conflict (late evening)');
  console.log('=' .repeat(60));

  const payload = {
    places: [
      {
        id: 'morning-place',
        name: 'Morning Attraction',
        lat: 28.6129,
        lng: 77.2295,
        visitDuration: 120,
        timeWindow: { open: '09:00', close: '17:00' },
        priority: 8,
      },
      {
        id: 'afternoon-place',
        name: 'Afternoon Attraction',
        lat: 28.6500,
        lng: 77.2500,
        visitDuration: 180,
        timeWindow: { open: '10:00', close: '18:00' },
        priority: 7,
      },
      {
        id: 'evening-place',
        name: 'Evening Attraction (Will Conflict)',
        lat: 28.7000,
        lng: 77.3000,
        visitDuration: 90,
        timeWindow: { open: '09:00', close: '17:00' }, // Closes at 5 PM
        priority: 6,
      },
    ],
    constraints: {
      startTime: '2025-12-15T15:00:00+05:30', // Start at 3 PM
      travelTypes: ['WALKING', 'PUBLIC_TRANSPORT'],
    },
    options: {
      includeRealtimeTransit: false,
      algorithm: 'auto',
    },
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/optimize-route`, payload);
    const result = response.data;

    console.log('\n✅ Response received:');
    console.log('  - Places in route:', result.optimizedOrder?.length, '/ 3 requested');
    
    if (result.validation?.errors) {
      console.log('\n❌ Opening Hours Errors:');
      result.validation.errors.forEach(err => console.log('  -', err));
    }

    if (result.timeline) {
      console.log('\n📅 Final Timeline:');
      result.timeline.forEach((entry, idx) => {
        const arrival = new Date(entry.arrivalTime);
        console.log(`  ${idx + 1}. ${entry.placeId} - Arrival: ${arrival.toLocaleTimeString()}`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Route Optimization Tests');
  console.log('='.repeat(60));

  try {
    await testMultiDayTripWithOpeningHours();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testLongDistanceFlightRecommendation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testOpeningHoursConflict();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test suite failed');
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testMultiDayTripWithOpeningHours,
  testLongDistanceFlightRecommendation,
  testOpeningHoursConflict,
};
