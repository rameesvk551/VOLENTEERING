#!/usr/bin/env node
// CLI Tool for Crawler Management

import { Command } from 'commander';
import { crawlerManager } from './crawlers';
import { dbManager } from './database/connection';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('crawler-cli')
  .description('CLI tool for managing the discovery engine crawler')
  .version('1.0.0');

/**
 * Crawl a single city
 */
program
  .command('crawl')
  .description('Crawl data for a specific city')
  .requiredOption('-c, --city <city>', 'City name')
  .requiredOption('-C, --country <country>', 'Country name')
  .option('-t, --types <types>', 'Types to crawl (events,attractions)', 'events,attractions')
  .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
  .option('--end-date <date>', 'End date (YYYY-MM-DD)')
  .action(async (options) => {
    try {
      logger.info('Starting crawler', options);

      await dbManager.connect();

      const types = options.types.split(',') as ('events' | 'attractions')[];
      const startDate = options.startDate ? new Date(options.startDate) : undefined;
      const endDate = options.endDate ? new Date(options.endDate) : undefined;

      const result = await crawlerManager.crawlAndSave({
        city: options.city,
        country: options.country,
        types,
        startDate,
        endDate
      });

      console.log('\n' + '='.repeat(60));
      console.log('🎉 CRAWL COMPLETED SUCCESSFULLY');
      console.log('='.repeat(60));
      console.log(`📊 Results:`);
      console.log(`   • Items Crawled: ${result.crawled}`);
      console.log(`   • Items Saved:   ${result.saved}`);
      console.log(`   • Success Rate:  ${((result.saved / result.crawled) * 100).toFixed(1)}%`);
      console.log('='.repeat(60) + '\n');

      await dbManager.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Crawl failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Crawl multiple cities
 */
program
  .command('crawl-batch')
  .description('Crawl multiple cities in batch')
  .requiredOption('-f, --file <file>', 'JSON file with cities array')
  .option('-t, --types <types>', 'Types to crawl (events,attractions)', 'events,attractions')
  .action(async (options) => {
    try {
      const fs = await import('fs/promises');
      const citiesData = await fs.readFile(options.file, 'utf-8');
      const cities = JSON.parse(citiesData);

      if (!Array.isArray(cities)) {
        throw new Error('File must contain an array of cities');
      }

      logger.info('Starting batch crawl', { citiesCount: cities.length });

      await dbManager.connect();

      const types = options.types.split(',') as ('events' | 'attractions')[];

      const result = await crawlerManager.crawlMultipleCities(cities, types);

      console.log('\n' + '='.repeat(60));
      console.log('🎉 BATCH CRAWL COMPLETED');
      console.log('='.repeat(60));
      console.log(`📊 Overall Results:`);
      console.log(`   • Total Crawled: ${result.totalCrawled} items`);
      console.log(`   • Total Saved:   ${result.totalSaved} items`);
      console.log(`   • Success Rate:  ${((result.totalSaved / result.totalCrawled) * 100).toFixed(1)}%`);
      console.log('');
      console.log('📍 Per City Breakdown:');
      console.log('─'.repeat(60));
      
      result.results.forEach((r, index) => {
        const successRate = r.crawled > 0 ? ((r.saved / r.crawled) * 100).toFixed(1) : '0.0';
        console.log(`   ${index + 1}. ${r.city}`);
        console.log(`      Crawled: ${r.crawled} | Saved: ${r.saved} | Success: ${successRate}%`);
      });
      
      console.log('='.repeat(60) + '\n');

      await dbManager.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Batch crawl failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Hybrid crawl (Tavily AI + Playwright) - RECOMMENDED
 */
program
  .command('crawl-hybrid')
  .description('🚀 Crawl using Tavily AI + Playwright (Hybrid mode - RECOMMENDED)')
  .requiredOption('-c, --city <city>', 'City name')
  .requiredOption('-C, --country <country>', 'Country name')
  .option('--playwright-only', 'Use only Playwright scraping')
  .option('--tavily-only', 'Use only Tavily AI search')
  .option('--food', 'Include food searches')
  .option('--trends', 'Include trend searches')
  .action(async (options) => {
    try {
      logger.info('🚀 Starting hybrid crawl', options);

      await dbManager.connect();

      const preferTavily = !options.playwrightOnly;

      const result = await crawlerManager.crawlCityHybrid({
        city: options.city,
        country: options.country,
        preferTavily,
        includeFood: options.food,
        includeTrends: options.trends
      });

      console.log('\n' + '┏' + '━'.repeat(68) + '┓');
      console.log('┃' + ' '.repeat(20) + '🎉 HYBRID CRAWL COMPLETED' + ' '.repeat(23) + '┃');
      console.log('┗' + '━'.repeat(68) + '┛');
      console.log('');
      console.log('📊 Results Summary:');
      console.log('   ┌─────────────────────────────────────────────────────────────┐');
      console.log(`   │  Total Results:        ${String(result.total).padEnd(40)} │`);
      console.log(`   │  Tavily AI:            ${String(result.sources.tavily).padEnd(40)} │`);
      console.log(`   │  Playwright:           ${String(result.sources.playwright).padEnd(40)} │`);
      console.log('   └─────────────────────────────────────────────────────────────┘');

      // Save to database
      if (result.total > 0) {
        console.log('\n💾 Saving to database...');
        const savedCount = await crawlerManager.saveCrawlResults(result.results);
        const successRate = ((savedCount / result.total) * 100).toFixed(1);
        
        console.log('');
        console.log('✅ Save Results:');
        console.log(`   • Saved:        ${savedCount}/${result.total} (${successRate}%)`);
        console.log(`   • Failed:       ${result.total - savedCount}`);
      }

      console.log('\n' + '═'.repeat(70) + '\n');

      await dbManager.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Hybrid crawl failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Get crawler statistics
 */
program
  .command('stats')
  .description('Show crawler statistics')
  .action(async () => {
    try {
      await dbManager.connect();

      const stats = await crawlerManager.getStatistics();

      console.log('\n📊 Crawler Statistics');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Total places: ${stats.totalPlaces}`);
      console.log(`Recently crawled (24h): ${stats.recentlyCrawled}`);
      
      console.log('\n📍 By Type:');
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

      console.log('\n🌆 By City:');
      Object.entries(stats.byCity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([city, count]) => {
          console.log(`   ${city}: ${count}`);
        });

      console.log('\n🔗 By Source:');
      Object.entries(stats.bySources).forEach(([source, count]) => {
        console.log(`   ${source}: ${count}`);
      });

      await dbManager.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Failed to get stats:', error.message);
      process.exit(1);
    }
  });

/**
 * Scrape a URL to extract places and images
 */
program
  .command('scrape-url')
  .description('Scrape a URL to extract place names and images')
  .requiredOption('-u, --url <url>', 'URL to scrape')
  .option('-o, --output <file>', 'Save results to JSON file')
  .action(async (options) => {
    try {
      const { scrapeUrl } = await import('./utils/url-scraper');
      
      console.log(`\n🔍 Scraping URL: ${options.url}\n`);
      
      const results = await scrapeUrl(options.url);
      
      console.log('='.repeat(70));
      console.log(`✅ Found ${results.length} places with images`);
      console.log('='.repeat(70));
      
      if (results.length > 0) {
        console.log('\n📋 Scraped Places:\n');
        
        results.forEach((place, index) => {
          console.log(`${index + 1}. ${place.name}`);
          console.log(`   Image: ${place.image.substring(0, 80)}${place.image.length > 80 ? '...' : ''}`);
          console.log(`   URL: ${place.url.substring(0, 80)}${place.url.length > 80 ? '...' : ''}`);
          if (place.description) {
            console.log(`   Description: ${place.description.substring(0, 100)}...`);
          }
          if (place.additionalImages && place.additionalImages.length > 0) {
            console.log(`   Additional Images: ${place.additionalImages.length}`);
          }
          console.log('');
        });
      } else {
        console.log('\n⚠️  No places with images found on this page.');
        console.log('Try a different URL with visible content.');
      }
      
      // Save to file if requested
      if (options.output) {
        const fs = await import('fs/promises');
        await fs.writeFile(
          options.output,
          JSON.stringify(results, null, 2),
          'utf-8'
        );
        console.log(`\n💾 Results saved to: ${options.output}\n`);
      }
      
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Scraping failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Test a single crawler
 */
program
  .command('test')
  .description('Test crawler on a single source')
  .requiredOption('-s, --source <source>', 'Source to test (timeout, eventbrite, tripadvisor, etc.)')
  .requiredOption('-c, --city <city>', 'City name')
  .requiredOption('-C, --country <country>', 'Country name')
  .action(async (options) => {
    try {
      logger.info('Testing crawler', options);

      await dbManager.connect();

      const { EventCrawler } = await import('./crawlers/event.crawler');
      const { AttractionCrawler } = await import('./crawlers/attraction.crawler');

      let results;

      if (['timeout', 'eventbrite', 'tripadvisor'].includes(options.source)) {
        const crawler = new EventCrawler();
        results = await crawler.crawl({
          city: options.city,
          country: options.country
        });
      } else if (['google', 'lonelyplanet', 'atlasobscura'].includes(options.source)) {
        const crawler = new AttractionCrawler();
        results = await crawler.crawl({
          city: options.city,
          country: options.country
        });
      } else {
        throw new Error(`Unknown source: ${options.source}`);
      }

      console.log('\n✅ Test completed!');
      console.log(`   Found: ${results.length} items`);
      
      if (results.length > 0) {
        console.log('\n   Sample results:');
        results.slice(0, 3).forEach((r, i) => {
          console.log(`\n   ${i + 1}. ${r.data.name}`);
          console.log(`      Type: ${r.data.type}`);
          console.log(`      Category: ${r.data.category}`);
          console.log(`      Source: ${r.source}`);
        });
      }

      await dbManager.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    }
  });

/**
 * Clear cached crawl data
 */
program
  .command('clear-cache')
  .description('Clear crawler cache from Redis')
  .option('-a, --all', 'Clear all cache')
  .option('-u, --url <url>', 'Clear cache for specific URL')
  .action(async (options) => {
    try {
      await dbManager.connect();
      const redis = dbManager.getRedis();

      let cleared = 0;

      if (options.all) {
        const keys = await redis.keys('crawler:cache:*');
        if (keys.length > 0) {
          cleared = await redis.del(...keys);
        }
      } else if (options.url) {
        const cacheKey = `crawler:cache:${Buffer.from(options.url).toString('base64').slice(0, 64)}`;
        cleared = await redis.del(cacheKey);
      } else {
        console.error('Please specify --all or --url');
        process.exit(1);
      }

      console.log(`\n✅ Cleared ${cleared} cache entries`);

      await dbManager.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Failed to clear cache:', error.message);
      process.exit(1);
    }
  });

// Parse and execute
program.parse();
