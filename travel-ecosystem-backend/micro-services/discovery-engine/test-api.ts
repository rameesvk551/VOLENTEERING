#!/usr/bin/env node

/**
 * Test Script for Discovery Engine API Orchestrator
 * Tests all individual services and the main orchestrator
 */

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

interface TestResult {
  name: string;
  endpoint: string;
  status: 'PASS' | 'FAIL';
  duration: number;
  error?: string;
  dataReceived?: boolean;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: 'GET' | 'POST',
  endpoint: string,
  data?: any
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   ${method} ${endpoint}`);
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    const response = method === 'GET' 
      ? await axios.get(url)
      : await axios.post(url, data);
    
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ PASS (${duration}ms)`);
    console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    
    return {
      name,
      endpoint,
      status: 'PASS',
      duration,
      dataReceived: true
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.log(`   ❌ FAIL (${duration}ms)`);
    console.log(`   Error: ${error.message}`);
    
    return {
      name,
      endpoint,
      status: 'FAIL',
      duration,
      error: error.message,
      dataReceived: false
    };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Discovery Engine API Orchestrator - Test Suite');
  console.log('═══════════════════════════════════════════════════════');
  
  // Test 1: Health Check
  results.push(await testEndpoint('Health Check', 'GET', '/health'));
  
  // Test 2: Main Discovery Endpoint
  results.push(await testEndpoint(
    'Main Discovery Orchestrator',
    'POST',
    '/discover',
    {
      city: 'Delhi',
      country: 'India',
      fromCountryCode: 'US',
      interests: ['culture', 'food']
    }
  ));
  
  // Test 3: Attractions
  results.push(await testEndpoint(
    'Attractions Service',
    'GET',
    '/attractions?city=Paris&country=France'
  ));
  
  // Test 4: Weather
  results.push(await testEndpoint(
    'Weather Service',
    'GET',
    '/weather?city=Tokyo&country=Japan'
  ));
  
  // Test 5: Visa Requirements
  results.push(await testEndpoint(
    'Visa Service',
    'GET',
    '/visa?from=US&to=IN'
  ));
  
  // Test 6: Hotels
  results.push(await testEndpoint(
    'Hotel Service',
    'GET',
    '/hotels?city=Delhi&country=India&limit=5'
  ));
  
  // Test 7: Travel Articles
  results.push(await testEndpoint(
    'Travel Articles',
    'GET',
    '/travel-articles?city=Paris&country=France&limit=3'
  ));
  
  // Test 8: Travel Tips
  results.push(await testEndpoint(
    'Travel Tips',
    'GET',
    '/travel-tips?city=Delhi&country=India'
  ));
  
  // Test 9: Local Experiences
  results.push(await testEndpoint(
    'Local Experiences',
    'GET',
    '/local-experiences?city=Delhi&country=India&type=food'
  ));
  
  // Test 10: System Stats
  results.push(await testEndpoint('System Stats', 'GET', '/stats'));
  
  // Print Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`📊 Average: ${Math.round(totalDuration / results.length)}ms per test`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  
  // Print API Configuration Status
  console.log('\n📋 API Configuration Status:');
  console.log(`   GOOGLE_PLACES_API_KEY: ${process.env.GOOGLE_PLACES_API_KEY ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   OPENWEATHER_API_KEY: ${process.env.OPENWEATHER_API_KEY ? '✅ Configured' : '❌ Not set'}`);
  console.log(`   RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? '✅ Configured' : '⚠️  Optional'}`);
  console.log(`   TAVILY_API_KEY: ${process.env.TAVILY_API_KEY ? '✅ Configured' : '⚠️  Optional'}`);
  
  console.log('\n');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
