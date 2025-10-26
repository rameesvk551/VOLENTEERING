/**
 * Hybrid Crawler - Combines Tavily AI and Playwright scraping
 * Uses Tavily for real-time search, falls back to Playwright for specific sites
 */

import { tavilyService } from '../services/tavily.service';
import { EventCrawler } from './event.crawler';
import { logger } from '../utils/logger';
import type { CrawlResult } from '../types';

export interface HybridCrawlOptions {
  preferTavily?: boolean; // Use Tavily first, fallback to Playwright
  tavilyOnly?: boolean; // Only use Tavily
  playwrightOnly?: boolean; // Only use Playwright
  includeFood?: boolean; // Include food searches
  includeTrends?: boolean; // Include trend searches
}

export class HybridCrawler {
  private eventCrawler: EventCrawler;

  constructor() {
    this.eventCrawler = new EventCrawler();
  }

  /**
   * Crawl using both Tavily and Playwright
   */
  async crawl(
    city: string,
    country: string,
    options: HybridCrawlOptions = {}
  ): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];

    logger.info('Hybrid crawler started', { city, country, options });

    try {
      // Decide which sources to use
      const useTavily = tavilyService.isEnabled() && !options.playwrightOnly;
      const usePlaywright = !options.tavilyOnly;

      // 1. Tavily Search (if enabled)
      if (useTavily) {
        logger.info('Fetching data from Tavily AI...');
        const tavilyResults = await this.crawlWithTavily(city, country, options);
        results.push(...tavilyResults);
        logger.info(`Tavily found ${tavilyResults.length} results`);
      }

      // 2. Playwright Scraping (if needed)
      if (usePlaywright) {
        // Only scrape if Tavily didn't return enough results or if explicitly requested
        const needMoreResults = results.length < 5 || !options.preferTavily;
        
        if (needMoreResults) {
          logger.info('Fetching data from web scraping...');
          const scrapedResults = await this.crawlWithPlaywright(city, country);
          results.push(...scrapedResults);
          logger.info(`Playwright found ${scrapedResults.length} results`);
        }
      }

      // 3. Deduplicate results
      const uniqueResults = this.deduplicateResults(results);

      logger.info('Hybrid crawler completed', {
        city,
        country,
        totalResults: uniqueResults.length,
        tavilyCount: uniqueResults.filter(r => r.source === 'tavily').length,
        playwrightCount: uniqueResults.filter(r => r.source !== 'tavily').length
      });

      return uniqueResults;

    } catch (error: any) {
      logger.error('Hybrid crawler failed:', {
        city,
        country,
        error: error.message
      });
      return results; // Return partial results
    }
  }

  /**
   * Crawl using Tavily AI
   */
  private async crawlWithTavily(
    city: string,
    country: string,
    options: HybridCrawlOptions
  ): Promise<CrawlResult[]> {
    try {
      const comprehensiveResults = await tavilyService.comprehensiveSearch(
        city,
        country,
        {
          includeFood: options.includeFood,
          includeTrends: options.includeTrends
        }
      );

      const results: CrawlResult[] = [];

      // Convert Tavily results to CrawlResult format
      for (const event of comprehensiveResults.events) {
        results.push({
          source: 'tavily',
          url: event.url,
          data: {
            name: event.name,
            description: event.description,
            type: 'event',
            category: event.category || 'event',
            city,
            country,
            startDate: null,
            endDate: null,
            price: null,
            image: null,
            tags: this.extractTags(event.description),
            rating: null,
            reviewCount: null,
            coordinates: null,
            address: null,
            website: event.url,
            phone: null,
            openingHours: null,
            features: [],
            accessibility: []
          }
        });
      }

      for (const attraction of comprehensiveResults.attractions) {
        results.push({
          source: 'tavily',
          url: attraction.url,
          data: {
            name: attraction.name,
            description: attraction.description,
            type: 'attraction',
            category: attraction.category || 'attraction',
            city,
            country,
            startDate: null,
            endDate: null,
            price: null,
            image: null,
            tags: this.extractTags(attraction.description),
            rating: null,
            reviewCount: null,
            coordinates: null,
            address: null,
            website: attraction.url,
            phone: null,
            openingHours: null,
            features: [],
            accessibility: []
          }
        });
      }

      if (options.includeFood) {
        for (const food of comprehensiveResults.food) {
          results.push({
            source: 'tavily',
            url: food.url,
            data: {
              name: food.name,
              description: food.description,
              type: 'attraction',
              category: 'food',
              city,
              country,
              startDate: null,
              endDate: null,
              price: null,
              image: null,
              tags: this.extractTags(food.description),
              rating: null,
              reviewCount: null,
              coordinates: null,
              address: null,
              website: food.url,
              phone: null,
              openingHours: null,
              features: [],
              accessibility: []
            }
          });
        }
      }

      return results;

    } catch (error: any) {
      logger.error('Tavily crawl failed:', {
        city,
        country,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Crawl using Playwright
   */
  private async crawlWithPlaywright(
    city: string,
    country: string
  ): Promise<CrawlResult[]> {
    try {
      const results = await this.eventCrawler.crawl({ city, country });
      return results;
    } catch (error: any) {
      logger.error('Playwright crawl failed:', {
        city,
        country,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Deduplicate results based on name and URL similarity
   */
  private deduplicateResults(results: CrawlResult[]): CrawlResult[] {
    const seen = new Set<string>();
    const unique: CrawlResult[] = [];

    for (const result of results) {
      // Create a key based on name (normalized)
      const normalizedName = result.data.name.toLowerCase().trim();
      const key = normalizedName;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique;
  }

  /**
   * Extract tags from description
   */
  private extractTags(description: string): string[] {
    const tags: string[] = [];
    const text = description.toLowerCase();

    const keywords = [
      'festival', 'music', 'food', 'art', 'culture', 'heritage',
      'museum', 'temple', 'park', 'garden', 'market', 'shopping',
      'nightlife', 'entertainment', 'sports', 'adventure', 'nature',
      'family', 'kids', 'romantic', 'luxury', 'budget', 'free'
    ];

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.eventCrawler.cleanup();
  }
}
