/**
 * Route Optimizer API Test Suite
 * Test all endpoints with sample data
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3007/api';

// Sample attractions data
const sampleAttractions = [
  {
    name: "Eiffel Tower",
    latitude: 48.8584,
    longitude: 2.2945,
    image: "https://example.com/eiffel.jpg",
    priority: 10,
    visitDuration: 120
  },
  {
    name: "Louvre Museum",
    latitude: 48.8606,
    longitude: 2.3376,
    image: "https://example.com/louvre.jpg",
    priority: 9,
    visitDuration: 180
  },
  {
    name: "Arc de Triomphe",
    latitude: 48.8738,
    longitude: 2.2950,
    image: "https://example.com/arc.jpg",
    priority: 8,
    visitDuration: 60
  },
  {
    name: "Notre-Dame Cathedral",
    latitude: 48.8530,
    longitude: 2.3499,
    image: "https://example.com/notredame.jpg",
    priority: 9,
    visitDuration: 90
  },
  {
    name: "Sacré-Cœur",
    latitude: 48.8867,
    longitude: 2.3431,
    image: "https://example.com/sacrecoeur.jpg",
    priority: 7,
    visitDuration: 75
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n=== Testing Health Check ===', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log('✓ Health check passed', 'green');
    console.log(response.data);
    return true;
  } catch (error) {
    log('✗ Health check failed', 'red');
    console.error(error.message);
    return false;
  }
}

async function testRouteOptimization() {
  log('\n=== Testing Route Optimization ===', 'cyan');
  
  const testCases = [
    {
      name: 'Budget travel with public transport',
      data: {
        attractions: sampleAttractions,
        budget: 50,
        travelType: 'budget',
        travelMethod: 'public_transport',
        algorithm: '2opt'
      }
    },
    {
      name: 'Comfort travel with ride-sharing',
      data: {
        attractions: sampleAttractions,
        budget: 100,
        travelType: 'comfort',
        travelMethod: 'ride',
        algorithm: 'christofides'
      }
    },
    {
      name: 'Speed-optimized route',
      data: {
        attractions: sampleAttractions,
        travelType: 'speed',
        travelMethod: 'drive',
        algorithm: 'nearest_neighbor'
      }
    },
    {
      name: 'Walking tour',
      data: {
        attractions: sampleAttractions.slice(0, 3),
        travelType: 'budget',
        travelMethod: 'walk',
        algorithm: 'auto'
      }
    }
  ];

  for (const testCase of testCases) {
    log(`\n📍 Test: ${testCase.name}`, 'yellow');
    try {
      const response = await axios.post(
        `${BASE_URL}/optimize-route`,
        testCase.data
      );

      if (response.data.success) {
        log('✓ Test passed', 'green');
        console.log('Stats:', response.data.stats);
        console.log('Route:', response.data.data.optimizedRoute.map(a => a.name));
      } else {
        log('✗ Test failed', 'red');
        console.log(response.data);
      }
    } catch (error) {
      log('✗ Test failed with error', 'red');
      console.error(error.response?.data || error.message);
    }
  }
}

async function testAlgorithmComparison() {
  log('\n=== Testing Algorithm Comparison ===', 'cyan');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/compare-algorithms`,
      {
        attractions: sampleAttractions,
        budget: 75,
        travelType: 'comfort',
        travelMethod: 'public_transport'
      }
    );

    if (response.data.success) {
      log('✓ Comparison test passed', 'green');
      console.log('\nAlgorithm Comparison:');
      response.data.comparison.forEach(result => {
        console.log(`  ${result.algorithm}:`);
        console.log(`    Distance: ${result.totalDistance.toFixed(2)} km`);
        console.log(`    Duration: ${Math.floor(result.totalDuration / 60)}h ${Math.floor(result.totalDuration % 60)}m`);
        console.log(`    Cost: $${result.estimatedCost.toFixed(2)}`);
      });
    } else {
      log('✗ Comparison test failed', 'red');
    }
  } catch (error) {
    log('✗ Comparison test failed with error', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testGetTravelMethods() {
  log('\n=== Testing Get Travel Methods ===', 'cyan');
  
  try {
    const response = await axios.get(`${BASE_URL}/travel-methods`);
    log('✓ Travel methods retrieved', 'green');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    log('✗ Failed to get travel methods', 'red');
    console.error(error.message);
  }
}

async function testGetAlgorithms() {
  log('\n=== Testing Get Algorithms ===', 'cyan');
  
  try {
    const response = await axios.get(`${BASE_URL}/algorithms`);
    log('✓ Algorithms info retrieved', 'green');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    log('✗ Failed to get algorithms', 'red');
    console.error(error.message);
  }
}

async function testInvalidInput() {
  log('\n=== Testing Invalid Input Handling ===', 'cyan');
  
  const invalidCases = [
    {
      name: 'Missing required fields',
      data: {
        attractions: sampleAttractions
      }
    },
    {
      name: 'Invalid coordinates',
      data: {
        attractions: [
          { name: "Test", latitude: 100, longitude: 200 }
        ],
        travelType: 'comfort',
        travelMethod: 'walk'
      }
    },
    {
      name: 'Too few attractions',
      data: {
        attractions: [sampleAttractions[0]],
        travelType: 'comfort',
        travelMethod: 'walk'
      }
    }
  ];

  for (const testCase of invalidCases) {
    log(`\n📍 Test: ${testCase.name}`, 'yellow');
    try {
      await axios.post(`${BASE_URL}/optimize-route`, testCase.data);
      log('✗ Should have failed but passed', 'red');
    } catch (error) {
      if (error.response?.status === 400) {
        log('✓ Correctly rejected invalid input', 'green');
      } else {
        log('✗ Unexpected error', 'red');
        console.error(error.message);
      }
    }
  }
}

async function runAllTests() {
  log('🧪 Starting Route Optimizer API Tests', 'blue');
  log('=====================================', 'blue');

  const isHealthy = await testHealthCheck();
  
  if (!isHealthy) {
    log('\n❌ Service is not healthy. Exiting tests.', 'red');
    process.exit(1);
  }

  await testGetTravelMethods();
  await testGetAlgorithms();
  await testRouteOptimization();
  await testAlgorithmComparison();
  await testInvalidInput();

  log('\n✅ All tests completed!', 'green');
}

// Run tests
runAllTests().catch(error => {
  log('\n❌ Test suite failed', 'red');
  console.error(error);
  process.exit(1);
});
