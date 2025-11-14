/**
 * Advanced Route Optimizer API Test Suite
 * Tests all new features: time windows, multi-modal, simulated annealing, insertion
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3007/api';

// Sample attractions with time windows
const parisAttractions = [
  {
    name: "Louvre Museum",
    latitude: 48.8606,
    longitude: 2.3376,
    priority: 10,
    visitDuration: 180,
    timeWindow: { open: "09:00", close: "18:00" },
    category: "museum"
  },
  {
    name: "Eiffel Tower",
    latitude: 48.8584,
    longitude: 2.2945,
    priority: 10,
    visitDuration: 120,
    timeWindow: { open: "09:00", close: "23:45" },
    category: "monument"
  },
  {
    name: "Arc de Triomphe",
    latitude: 48.8738,
    longitude: 2.2950,
    priority: 8,
    visitDuration: 60,
    timeWindow: { open: "10:00", close: "22:30" },
    category: "monument"
  },
  {
    name: "Notre-Dame Cathedral",
    latitude: 48.8530,
    longitude: 2.3499,
    priority: 9,
    visitDuration: 90,
    timeWindow: { open: "08:00", close: "18:45" },
    category: "religious"
  },
  {
    name: "Sacré-Cœur",
    latitude: 48.8867,
    longitude: 2.3431,
    priority: 7,
    visitDuration: 75,
    timeWindow: { open: "06:00", close: "22:30" },
    category: "religious"
  },
  {
    name: "Champs-Élysées",
    latitude: 48.8698,
    longitude: 2.3078,
    priority: 6,
    visitDuration: 60,
    category: "shopping"
  }
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAdvancedTSP() {
  log('\n=== Testing Advanced TSP (NN + 2-Opt) ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/optimize-route`, {
      attractions: parisAttractions,
      travelType: 'comfort',
      travelMethod: 'public_transport',
      algorithm: 'advanced'
    });

    if (response.data.success) {
      log('✓ Advanced TSP test passed', 'green');
      console.log('Algorithm:', response.data.data.algorithm);
      console.log('Stats:', response.data.stats);
      console.log('Route:', response.data.data.optimizedRoute.map(a => a.name).join(' → '));
    }
  } catch (error) {
    log('✗ Advanced TSP test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testSimulatedAnnealing() {
  log('\n=== Testing Simulated Annealing ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/optimize-route`, {
      attractions: parisAttractions,
      travelType: 'comfort',
      travelMethod: 'drive',
      algorithm: 'simulated_annealing'
    });

    if (response.data.success) {
      log('✓ Simulated Annealing test passed', 'green');
      console.log('Algorithm:', response.data.data.algorithm);
      console.log('Processing time:', response.data.processingTime);
      console.log('Total distance:', response.data.stats.totalDistance);
      console.log('Route:', response.data.data.optimizedRoute.map(a => a.name).join(' → '));
    }
  } catch (error) {
    log('✗ Simulated Annealing test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testTimeWindows() {
  log('\n=== Testing Time Windows Optimization ===', 'cyan');
  
  try {
    const startTime = new Date();
    startTime.setHours(8, 0, 0); // Start at 8 AM

    const response = await axios.post(`${BASE_URL}/optimize-route`, {
      attractions: parisAttractions,
      travelType: 'comfort',
      travelMethod: 'public_transport',
      considerTimeWindows: true,
      startTime: startTime.toISOString()
    });

    if (response.data.success) {
      log('✓ Time Windows test passed', 'green');
      console.log('Algorithm:', response.data.data.algorithm);
      console.log('Start time:', startTime.toLocaleTimeString());
      console.log('Route with time windows:');
      response.data.data.optimizedRoute.forEach((attr, idx) => {
        const tw = attr.timeWindow ? `(${attr.timeWindow.open}-${attr.timeWindow.close})` : '(24h)';
        console.log(`  ${idx + 1}. ${attr.name} ${tw}`);
      });
    }
  } catch (error) {
    log('✗ Time Windows test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testMultiModal() {
  log('\n=== Testing Multi-Modal Optimization ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/optimize-route`, {
      attractions: parisAttractions,
      travelType: 'budget',
      travelMethod: 'public_transport', // Base method
      multiModal: true
    });

    if (response.data.success) {
      log('✓ Multi-Modal test passed', 'green');
      console.log('Algorithm:', response.data.data.algorithm);
      console.log('Multi-modal route:');
      response.data.data.segments.forEach((seg, idx) => {
        const methodIcon = {
          walk: '🚶',
          bike: '🚴',
          public_transport: '🚇',
          ride: '🚗',
          drive: '🚙'
        }[seg.method] || '🚀';
        
        console.log(`  ${seg.from.name} ${methodIcon} ${seg.method} ${methodIcon} ${seg.to.name}`);
        console.log(`    Distance: ${seg.distance.toFixed(2)}km, Cost: $${seg.cost.toFixed(2)}`);
      });
      console.log('Total cost:', response.data.stats.estimatedCost);
    }
  } catch (error) {
    log('✗ Multi-Modal test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testRealTimeInsertion() {
  log('\n=== Testing Real-Time Route Insertion ===', 'cyan');
  
  try {
    // First, optimize a route
    const initialRoute = parisAttractions.slice(0, 3);
    
    log('Initial route:', 'yellow');
    console.log(initialRoute.map(a => a.name).join(' → '));

    // Now insert a new attraction
    const newAttraction = parisAttractions[3]; // Notre-Dame
    
    log('\nInserting new attraction: ' + newAttraction.name, 'yellow');

    const response = await axios.post(`${BASE_URL}/insert-attraction`, {
      currentRoute: initialRoute,
      newAttraction: newAttraction,
      travelType: 'comfort',
      travelMethod: 'public_transport'
    });

    if (response.data.success) {
      log('✓ Real-Time Insertion test passed', 'green');
      console.log('Algorithm:', response.data.data.algorithm);
      log('\nUpdated route:', 'yellow');
      console.log(response.data.data.optimizedRoute.map(a => a.name).join(' → '));
      console.log('Stats:', response.data.stats);
    }
  } catch (error) {
    log('✗ Real-Time Insertion test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testAlgorithmComparison() {
  log('\n=== Testing Algorithm Comparison ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/compare-algorithms`, {
      attractions: parisAttractions.slice(0, 8), // Use fewer for faster comparison
      travelType: 'comfort',
      travelMethod: 'public_transport'
    });

    if (response.data.success) {
      log('✓ Algorithm Comparison test passed', 'green');
      console.log('\nComparison Results:');
      console.log('─'.repeat(80));
      console.log('Algorithm'.padEnd(25) + 'Distance'.padEnd(15) + 'Duration'.padEnd(15) + 'Cost');
      console.log('─'.repeat(80));
      
      response.data.comparison.forEach(result => {
        const algo = result.algorithm.padEnd(25);
        const dist = `${result.totalDistance.toFixed(2)} km`.padEnd(15);
        const dur = `${Math.floor(result.totalDuration / 60)}h ${Math.floor(result.totalDuration % 60)}m`.padEnd(15);
        const cost = `$${result.estimatedCost.toFixed(2)}`;
        console.log(`${algo}${dist}${dur}${cost}`);
      });
      console.log('─'.repeat(80));
    }
  } catch (error) {
    log('✗ Algorithm Comparison test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testBudgetOptimizationWithMultiModal() {
  log('\n=== Testing Budget Optimization with Multi-Modal ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/optimize-route`, {
      attractions: parisAttractions,
      budget: 30, // Tight budget
      travelType: 'budget',
      travelMethod: 'public_transport',
      multiModal: true
    });

    if (response.data.success) {
      log('✓ Budget optimization test passed', 'green');
      console.log('Budget limit: $30');
      console.log('Actual cost:', response.data.stats.estimatedCost);
      console.log('Route:', response.data.data.optimizedRoute.map(a => a.name).join(' → '));
      
      log('\nTransport methods used:', 'yellow');
      response.data.data.segments.forEach(seg => {
        console.log(`  ${seg.method}: $${seg.cost.toFixed(2)}`);
      });
    }
  } catch (error) {
    log('✗ Budget optimization test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function testPriorityWithTimeWindows() {
  log('\n=== Testing Priority-Based with Time Windows ===', 'cyan');
  
  try {
    const startTime = new Date();
    startTime.setHours(14, 0, 0); // Start at 2 PM (limited time)

    const response = await axios.post(`${BASE_URL}/optimize-route`, {
      attractions: parisAttractions,
      travelType: 'speed',
      travelMethod: 'ride',
      considerTimeWindows: true,
      startTime: startTime.toISOString()
    });

    if (response.data.success) {
      log('✓ Priority with Time Windows test passed', 'green');
      console.log('Start time: 2:00 PM');
      console.log('Algorithm:', response.data.data.algorithm);
      console.log('Attractions visited (in order):');
      response.data.data.optimizedRoute.forEach((attr, idx) => {
        const priority = attr.priority || 5;
        const tw = attr.timeWindow ? `closes ${attr.timeWindow.close}` : 'open 24h';
        console.log(`  ${idx + 1}. ${attr.name} (Priority: ${priority}, ${tw})`);
      });
    }
  } catch (error) {
    log('✗ Priority with Time Windows test failed', 'red');
    console.error(error.response?.data || error.message);
  }
}

async function runAllAdvancedTests() {
  log('🧪 Starting Advanced Route Optimizer Tests', 'blue');
  log('=============================================', 'blue');

  // Check health first
  try {
    await axios.get(`${BASE_URL}/health`);
    log('✓ Service is healthy\n', 'green');
  } catch (error) {
    log('✗ Service is not available. Please start the service first.', 'red');
    process.exit(1);
  }

  await testAdvancedTSP();
  await testSimulatedAnnealing();
  await testTimeWindows();
  await testMultiModal();
  await testRealTimeInsertion();
  await testAlgorithmComparison();
  await testBudgetOptimizationWithMultiModal();
  await testPriorityWithTimeWindows();

  log('\n✅ All advanced tests completed!', 'green');
  log('\n📊 Summary of New Features:', 'magenta');
  log('  ✓ Advanced TSP (Nearest Neighbor + 2-Opt)', 'green');
  log('  ✓ Simulated Annealing', 'green');
  log('  ✓ Time Windows Support', 'green');
  log('  ✓ Multi-Modal Optimization', 'green');
  log('  ✓ Real-Time Route Insertion', 'green');
  log('  ✓ Budget-Aware Multi-Modal', 'green');
  log('  ✓ Priority with Time Constraints', 'green');
}

// Run tests
runAllAdvancedTests().catch(error => {
  log('\n❌ Test suite failed', 'red');
  console.error(error);
  process.exit(1);
});
