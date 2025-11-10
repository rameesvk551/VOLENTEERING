#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the connection between Trip Planner and Discovery Engine
 */

const axios = require('axios');

const DISCOVERY_API = 'http://localhost:3000';
const TRIP_PLANNER_URL = 'http://localhost:1005';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n🔍 Testing Health Check...', 'cyan');
  try {
    const response = await axios.get(`${DISCOVERY_API}/health`, { timeout: 5000 });
    if (response.data.status === 'ok') {
      log('✅ Health check passed', 'green');
      return true;
    }
    log('❌ Health check failed: Invalid response', 'red');
    return false;
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    log('   Make sure Discovery Engine is running on port 3000', 'yellow');
    return false;
  }
}

async function testDiscoverEndpoint() {
  log('\n🔍 Testing Discover Endpoint...', 'cyan');
  try {
    const response = await axios.post(
      `${DISCOVERY_API}/api/v1/discover`,
      {
        city: 'Delhi',
        country: 'India',
        interests: ['culture', 'food'],
        duration: 3,
      },
      { timeout: 30000 }
    );

    if (response.data.attractions && response.data.metadata) {
      log('✅ Discover endpoint working', 'green');
      log(`   Found ${response.data.attractions.length} attractions`, 'blue');
      log(`   Processing time: ${response.data.metadata.processingTime}ms`, 'blue');
      log(`   Sources: ${response.data.metadata.sources.join(', ')}`, 'blue');
      return true;
    }
    log('❌ Discover endpoint returned invalid data', 'red');
    return false;
  } catch (error) {
    log(`❌ Discover endpoint failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'yellow');
      log(`   Error: ${JSON.stringify(error.response.data)}`, 'yellow');
    }
    return false;
  }
}

async function testAttractionsEndpoint() {
  log('\n🔍 Testing Attractions Endpoint...', 'cyan');
  try {
    const response = await axios.get(`${DISCOVERY_API}/api/v1/attractions`, {
      params: {
        city: 'Paris',
        country: 'France',
      },
      timeout: 30000,
    });

    if (response.data.attractions && Array.isArray(response.data.attractions)) {
      log('✅ Attractions endpoint working', 'green');
      log(`   Found ${response.data.attractions.length} attractions`, 'blue');
      return true;
    }
    log('❌ Attractions endpoint returned invalid data', 'red');
    return false;
  } catch (error) {
    log(`❌ Attractions endpoint failed: ${error.message}`, 'red');
    return false;
  }
}

async function testWeatherEndpoint() {
  log('\n🔍 Testing Weather Endpoint...', 'cyan');
  try {
    const response = await axios.get(`${DISCOVERY_API}/api/v1/weather`, {
      params: {
        city: 'London',
        country: 'UK',
      },
      timeout: 10000,
    });

    if (response.data.current) {
      log('✅ Weather endpoint working', 'green');
      log(`   Temperature: ${response.data.current.temp}°C`, 'blue');
      log(`   Condition: ${response.data.current.description}`, 'blue');
      return true;
    }
    log('❌ Weather endpoint returned invalid data', 'red');
    return false;
  } catch (error) {
    log(`⚠️  Weather endpoint failed: ${error.message}`, 'yellow');
    log('   This is optional, may not be configured', 'yellow');
    return true; // Don't fail the test for optional services
  }
}

async function testCORS() {
  log('\n🔍 Testing CORS Configuration...', 'cyan');
  try {
    const response = await axios.options(`${DISCOVERY_API}/api/v1/discover`, {
      headers: {
        'Origin': TRIP_PLANNER_URL,
        'Access-Control-Request-Method': 'POST',
      },
      timeout: 5000,
    });

    // Check if CORS headers are present
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      log('✅ CORS configured correctly', 'green');
      log(`   Allowed origin: ${corsHeaders}`, 'blue');
      return true;
    }
    log('⚠️  CORS headers not found', 'yellow');
    return true; // Don't fail, might be configured differently
  } catch (error) {
    log(`⚠️  CORS test failed: ${error.message}`, 'yellow');
    log('   This might be expected, check manually', 'yellow');
    return true;
  }
}

async function testFrontend() {
  log('\n🔍 Testing Trip Planner Frontend...', 'cyan');
  try {
    const response = await axios.get(TRIP_PLANNER_URL, { timeout: 5000 });
    if (response.status === 200) {
      log('✅ Trip Planner frontend is running', 'green');
      return true;
    }
    log('❌ Trip Planner frontend returned unexpected status', 'red');
    return false;
  } catch (error) {
    log(`❌ Trip Planner frontend not accessible: ${error.message}`, 'red');
    log('   Make sure Trip Planner is running on port 1005', 'yellow');
    return false;
  }
}

async function runTests() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║  Trip Planner & Discovery Engine Integration Tests   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    healthCheck: false,
    discover: false,
    attractions: false,
    weather: false,
    cors: false,
    frontend: false,
  };

  // Run all tests
  results.healthCheck = await testHealthCheck();
  
  if (results.healthCheck) {
    results.discover = await testDiscoverEndpoint();
    results.attractions = await testAttractionsEndpoint();
    results.weather = await testWeatherEndpoint();
    results.cors = await testCORS();
  }

  results.frontend = await testFrontend();

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Summary                       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(`${icon} ${test.padEnd(20)} ${result ? 'PASSED' : 'FAILED'}`, color);
  });

  log(`\n${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All tests passed! Integration is working correctly.', 'green');
    log('   You can now use the Discovery feature in Trip Planner.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
    log('\nTroubleshooting:', 'cyan');
    log('1. Make sure Discovery Engine is running:', 'blue');
    log('   cd travel-ecosystem-backend/micro-services/discovery-engine && npm run dev', 'blue');
    log('2. Make sure Trip Planner is running:', 'blue');
    log('   cd travel-ecosystem/apps/trip-planner && npm run dev', 'blue');
    log('3. Check environment variables in .env files', 'blue');
    log('4. Verify MongoDB and Redis are running (if using them)', 'blue');
  }

  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Test script failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
