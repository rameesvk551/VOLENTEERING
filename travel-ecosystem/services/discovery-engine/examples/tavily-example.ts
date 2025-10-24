/**
 * Example: Using Tavily AI Integration
 * Run with: npx tsx examples/tavily-example.ts
 */

import { tavilyService } from '../src/services/tavily.service';
import { HybridCrawler } from '../src/crawlers/hybrid.crawler';
import { logger } from '../src/utils/logger';

async function main() {
  console.log('🎯 Tavily AI Integration Example\n');

  // Check if Tavily is enabled
  if (tavilyService.isEnabled()) {
    console.log('✅ Tavily AI is enabled!\n');

    // Example 1: Search for events
    console.log('📅 Searching for events in Delhi...');
    const events = await tavilyService.searchEvents('Delhi', 'India', 'October');
    console.log(`Found ${events.length} events`);
    if (events.length > 0) {
      console.log('\nSample event:');
      console.log(`  • ${events[0].name}`);
      console.log(`  • ${events[0].description.substring(0, 100)}...`);
      console.log(`  • ${events[0].url}\n`);
    }

    // Example 2: Search for attractions
    console.log('🏛️ Searching for attractions in Paris...');
    const attractions = await tavilyService.searchAttractions('Paris', 'France', ['culture', 'art']);
    console.log(`Found ${attractions.length} attractions`);
    if (attractions.length > 0) {
      console.log('\nSample attraction:');
      console.log(`  • ${attractions[0].name}`);
      console.log(`  • ${attractions[0].description.substring(0, 100)}...`);
      console.log(`  • ${attractions[0].url}\n`);
    }

    // Example 3: Comprehensive search
    console.log('🌍 Comprehensive search for Tokyo...');
    const comprehensive = await tavilyService.comprehensiveSearch('Tokyo', 'Japan', {
      month: 'October',
      interests: ['food', 'culture'],
      includeFood: true,
      includeTrends: false
    });
    console.log(`Found:`);
    console.log(`  • Events: ${comprehensive.events.length}`);
    console.log(`  • Attractions: ${comprehensive.attractions.length}`);
    console.log(`  • Food: ${comprehensive.food.length}\n`);

  } else {
    console.log('⚠️  Tavily AI is not configured');
    console.log('Add TAVILY_API_KEY to .env to enable real-time search\n');
  }

  // Example 4: Hybrid Crawler
  console.log('🚀 Testing Hybrid Crawler...');
  const crawler = new HybridCrawler();
  
  const results = await crawler.crawl('Delhi', 'India', {
    preferTavily: true,
    includeFood: false,
    includeTrends: false
  });

  console.log(`\nHybrid Crawler Results:`);
  console.log(`  • Total: ${results.length}`);
  console.log(`  • Tavily: ${results.filter(r => r.source === 'tavily').length}`);
  console.log(`  • Playwright: ${results.filter(r => r.source !== 'tavily').length}`);

  if (results.length > 0) {
    console.log('\nSample results:');
    results.slice(0, 3).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.data.name} (${item.source})`);
    });
  }

  await crawler.cleanup();

  console.log('\n✅ Example completed!\n');
}

main().catch(console.error);
