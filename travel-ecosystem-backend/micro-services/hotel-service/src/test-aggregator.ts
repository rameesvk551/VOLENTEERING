/**
 * Manual Test Script for Hotel Aggregation Service
 * 
 * Run this file to test the aggregator service manually:
 * tsx src/test-aggregator.ts
 */

import { ProviderA } from './providers/ProviderA.js';
import { ProviderB } from './providers/ProviderB.js';
import { ProviderC } from './providers/ProviderC.js';
import { AggregatorService } from './services/AggregatorService.js';
import type { HotelSearchQuery } from './domain/Hotel.js';

console.log('🧪 Testing Hotel Aggregation Service\n');
console.log('═'.repeat(60));

// Initialize providers
const providers = [
  new ProviderA(),
  new ProviderB(),
  new ProviderC(),
];

// Initialize aggregator
const aggregator = new AggregatorService(providers);

// Test query
const query: HotelSearchQuery = {
  location: 'Delhi',
  checkin: '2025-12-01',
  checkout: '2025-12-05',
  guests: 2,
  cursor: 0,
  limit: 5,
};

console.log('\n📝 Test Query:');
console.log(JSON.stringify(query, null, 2));
console.log('\n' + '═'.repeat(60));

// Execute search
async function runTest() {
  console.log('\n🔍 Executing search...\n');
  
  const startTime = Date.now();
  const result = await aggregator.search(query);
  const duration = Date.now() - startTime;

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Search Completed!');
  console.log(`⏱️  Total time: ${duration}ms`);
  console.log('═'.repeat(60));

  console.log('\n📊 Results Summary:');
  console.log(`   • Total unique hotels: ${result.total}`);
  console.log(`   • Hotels in this page: ${result.hotels.length}`);
  console.log(`   • Current cursor: ${query.cursor}`);
  console.log(`   • Next cursor: ${result.cursor}`);
  console.log(`   • Has more results: ${result.hasMore}`);

  console.log('\n🏨 Hotels (sorted by price):');
  console.log('═'.repeat(60));

  result.hotels.forEach((hotel, index) => {
    console.log(`\n${index + 1}. ${hotel.name.toUpperCase()}`);
    console.log(`   💰 Price: $${hotel.price} ${hotel.currency}`);
    console.log(`   ⭐ Rating: ${hotel.rating || 'N/A'}`);
    console.log(`   📍 Location: ${hotel.lat}, ${hotel.lng}`);
    console.log(`   🏢 Provider: ${hotel.provider}`);
    console.log(`   📫 Address: ${hotel.address || 'N/A'}`);
    console.log(`   🎯 Amenities: ${hotel.amenities?.join(', ') || 'None'}`);
  });

  console.log('\n' + '═'.repeat(60));
  console.log('📄 Pagination Info:');
  console.log(`   To get next page, use cursor=${result.cursor}`);
  
  if (result.hasMore) {
    console.log(`\n🔗 Next page query:`);
    console.log(`   ${JSON.stringify({ ...query, cursor: result.cursor }, null, 2)}`);
  } else {
    console.log('\n✅ No more results available.');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎯 Test Complete!\n');

  // Test pagination - get next page
  if (result.hasMore) {
    console.log('\n🔄 Testing pagination - fetching next page...\n');
    console.log('═'.repeat(60));

    const nextQuery = { ...query, cursor: result.cursor };
    const nextResult = await aggregator.search(nextQuery);

    console.log('\n📊 Page 2 Results:');
    console.log(`   • Hotels in this page: ${nextResult.hotels.length}`);
    console.log(`   • Next cursor: ${nextResult.cursor}`);
    console.log(`   • Has more results: ${nextResult.hasMore}`);

    console.log('\n🏨 Hotels (page 2):');
    nextResult.hotels.forEach((hotel, index) => {
      console.log(`\n${index + 1}. ${hotel.name.toUpperCase()}`);
      console.log(`   💰 Price: $${hotel.price} ${hotel.currency}`);
      console.log(`   ⭐ Rating: ${hotel.rating || 'N/A'}`);
      console.log(`   🏢 Provider: ${hotel.provider}`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Pagination test complete!\n');
  }
}

// Run the test
runTest().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
