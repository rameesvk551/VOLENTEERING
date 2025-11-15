/**
 * Test Script for Route Optimization
 * Run with: node test-route-optimization.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000';

// Test payload
const testPayload = {
  userId: 'test-user-123',
  places: [
    {
      id: 'p1',
      name: 'Marina Bay Sands',
      lat: 1.2838,
      lng: 103.8607,
      priority: 8,
      visitDuration: 90
    },
    {
      id: 'p2',
      name: 'Gardens by the Bay',
      lat: 1.2816,
      lng: 103.8636,
      priority: 9,
      visitDuration: 120
    },
    {
      id: 'p3',
      name: 'Merlion Park',
      lat: 1.2868,
      lng: 103.8545,
      priority: 7,
      visitDuration: 30
    },
    {
      id: 'p4',
      name: 'Clarke Quay',
      lat: 1.2894,
      lng: 103.8467,
      priority: 6,
      visitDuration: 60
    }
  ],
  constraints: {
    startLocation: { lat: 1.290, lng: 103.850 },
    startTime: new Date().toISOString(),
    timeBudgetMinutes: 480, // 8 hours
    travelTypes: ['PUBLIC_TRANSPORT', 'WALKING'],
    budget: 50
  },
  options: {
    includeRealtimeTransit: true,
    algorithm: 'auto'
  }
};

async function testOptimization() {
  console.log('🧪 Testing Route Optimization\n');
  console.log('📤 Sending request to:', `${API_BASE_URL}/api/v1/optimize-route`);
  console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));
  console.log('\n⏳ Optimizing...\n');

  try {
    const startTime = Date.now();
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/optimize-route`,
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const processingTime = Date.now() - startTime;

    console.log('✅ SUCCESS!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n⏱️  Total time: ${processingTime}ms`);

    // Display optimized order in readable format
    console.log('\n🗺️  Optimized Route Order:');
    response.data.optimizedOrder.forEach((stop, index) => {
      const place = testPayload.places.find(p => p.id === stop.placeId);
      console.log(`  ${stop.seq}. ${place.name} (${place.priority}/10 priority)`);
    });

    console.log(`\n📏 Total Distance: ${(response.data.totalDistanceMeters / 1000).toFixed(2)} km`);
    console.log(`⏰ Estimated Duration: ${response.data.estimatedDurationMinutes} minutes`);
    console.log(`💡 ${response.data.notes}`);

  } catch (error) {
    console.error('❌ ERROR!\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Make sure:');
      console.error('  1. API Gateway is running on port 4000');
      console.error('  2. Route Optimizer is running on port 4010');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run test
testOptimization();
