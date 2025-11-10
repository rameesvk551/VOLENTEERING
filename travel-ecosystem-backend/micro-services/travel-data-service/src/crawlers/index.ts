// Crawler Manager - Orchestrates all crawlers

import { EventCrawler } from './event.crawler';
import { AttractionCrawler } from './attraction.crawler';
import { HybridCrawler } from './hybrid.crawler';
import { logger } from '@/utils/logger';
import { Place } from '@/database/models';
import type { CrawlResult } from '@/types';

export class CrawlerManager {
  private eventCrawler: EventCrawler;
  private attractionCrawler: AttractionCrawler;
  private hybridCrawler: HybridCrawler;

  constructor() {
    this.eventCrawler = new EventCrawler();
    this.attractionCrawler = new AttractionCrawler();
    this.hybridCrawler = new HybridCrawler();
  }

  /**
   * Crawl all data for a city
   */
  async crawlCity(params: {
    city: string;
    country: string;
    types?: ('events' | 'attractions')[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    events: CrawlResult[];
    attractions: CrawlResult[];
    total: number;
  }> {
    const { city, country, types = ['events', 'attractions'], startDate, endDate } = params;

    logger.info('Starting city crawl', { city, country, types });

    const results = {
      events: [] as CrawlResult[],
      attractions: [] as CrawlResult[],
      total: 0
    };

    try {
      // Crawl events
      if (types.includes('events')) {
        logger.info('🎪 Crawling events', { city });
        results.events = await this.eventCrawler.crawl({
          city,
          country,
          startDate,
          endDate
        });
        logger.info(`✅ Events crawled: ${results.events.length}`);
        
        // Log detailed event data
        if (results.events.length > 0) {
          logger.info('📋 Crawled Events Details:');
          results.events.forEach((event, index) => {
            logger.info(`\n  [${index + 1}/${results.events.length}] ${event.data.name}`, {
              source: event.source,
              type: event.data.type,
              category: event.data.category,
              city: event.data.city,
              startDate: event.data.startDate,
              price: event.data.price,
              url: event.url,
              tags: event.data.tags
            });
          });
        }
      }

      // Crawl attractions
      if (types.includes('attractions')) {
        logger.info('🏛️ Crawling attractions', { city });
        results.attractions = await this.attractionCrawler.crawl({
          city,
          country
        });
        logger.info(`✅ Attractions crawled: ${results.attractions.length}`);
        
        // Log detailed attraction data
        if (results.attractions.length > 0) {
          logger.info('📋 Crawled Attractions Details:');
          results.attractions.forEach((attraction, index) => {
            logger.info(`\n  [${index + 1}/${results.attractions.length}] ${attraction.data.name}`, {
              source: attraction.source,
              type: attraction.data.type,
              category: attraction.data.category,
              city: attraction.data.city,
              rating: attraction.data.rating,
              price: attraction.data.price,
              url: attraction.url,
              features: attraction.data.features
            });
          });
        }
      }

      results.total = results.events.length + results.attractions.length;

      logger.info('🎉 City crawl completed', {
        city,
        events: results.events.length,
        attractions: results.attractions.length,
        total: results.total
      });

      return results;
    } catch (error: any) {
      logger.error('City crawl failed:', {
        city,
        country,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Crawl city using Hybrid Crawler (Tavily + Playwright)
   * This is the recommended method that combines AI search with web scraping
   */
  async crawlCityHybrid(params: {
    city: string;
    country: string;
    preferTavily?: boolean;
    includeFood?: boolean;
    includeTrends?: boolean;
  }): Promise<{
    results: CrawlResult[];
    total: number;
    sources: {
      tavily: number;
      playwright: number;
    };
  }> {
    const { city, country, preferTavily = true, includeFood, includeTrends } = params;

    logger.info('🚀 Starting hybrid crawl (Tavily AI + Playwright)', { city, country, preferTavily });

    try {
      const results = await this.hybridCrawler.crawl(city, country, {
        preferTavily,
        includeFood,
        includeTrends
      });

      const sources = {
        tavily: results.filter(r => r.source === 'tavily').length,
        playwright: results.filter(r => r.source !== 'tavily').length
      };

      logger.info('✅ Hybrid crawl completed', {
        city,
        country,
        total: results.length,
        tavilyResults: sources.tavily,
        playwrightResults: sources.playwright
      });

      // Log sample results
      if (results.length > 0) {
        logger.info('📋 Sample Hybrid Results:');
        results.slice(0, 3).forEach((item, index) => {
          logger.info(`  [${index + 1}] ${item.data.name} (${item.source})`, {
            type: item.data.type,
            category: item.data.category,
            url: item.url
          });
        });
      }

      return {
        results,
        total: results.length,
        sources
      };

    } catch (error: any) {
      logger.error('Hybrid crawl failed:', {
        city,
        country,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Save crawl results to database
   */
  async saveCrawlResults(results: CrawlResult[]): Promise<number> {
    let savedCount = 0;
    let updatedCount = 0;
    let newCount = 0;

    try {
      logger.info('💾 Saving crawl results to database', { count: results.length });

      for (const result of results) {
        try {
          // Transform crawl result to match Place schema
          const placeData = {
            type: result.data.type || 'event',
            title: result.data.name,
            description: result.data.description || 'No description available',
            location: {
              city: result.data.city,
              country: result.data.country,
              area: result.data.address || undefined,
              venue: result.data.address || undefined,
              coordinates: result.data.coordinates || [77.2090, 28.6139] // Default to Delhi coords
            },
            dates: result.data.startDate ? {
              start: new Date(result.data.startDate),
              end: result.data.endDate ? new Date(result.data.endDate) : new Date(result.data.startDate),
              flexible: false
            } : undefined,
            metadata: {
              category: [result.data.category || 'general'],
              tags: result.data.tags || [],
              popularity: 0.5,
              cost: result.data.price || 'Free',
              duration: undefined,
              crowdLevel: undefined,
              openingHours: result.data.openingHours || undefined,
              bestTimeToVisit: undefined
            },
            media: {
              images: result.data.image ? [result.data.image] : [],
              videos: [],
              virtualTour: undefined
            },
            source: {
              url: result.url,
              domain: new URL(result.url).hostname,
              crawledAt: new Date(),
              lastUpdated: new Date()
            },
            confidence: 0.8, // Set reasonable confidence for crawled data
            embedding: undefined
          };

          // Check if place already exists
          const existing = await Place.findOne({
            title: placeData.title,
            'location.city': placeData.location.city,
            type: placeData.type
          });

          if (existing) {
            // Update existing place
            await Place.updateOne(
              { _id: existing._id },
              {
                $set: placeData
              }
            );
            logger.debug(`♻️  Updated: ${placeData.title}`, { 
              source: result.source,
              type: placeData.type
            });
            updatedCount++;
          } else {
            // Create new place
            const created = await Place.create(placeData);
            logger.info(`✨ New: ${placeData.title}`, {
              id: created._id,
              source: result.source,
              type: placeData.type,
              category: placeData.metadata.category
            });
            newCount++;
          }

          savedCount++;
        } catch (error: any) {
          logger.error('❌ Failed to save:', {
            name: result.data.name,
            error: error.message
          });
        }
      }

      logger.info('✅ Database save completed', {
        total: results.length,
        saved: savedCount,
        new: newCount,
        updated: updatedCount,
        failed: results.length - savedCount
      });

      return savedCount;
    } catch (error: any) {
      logger.error('Failed to save crawl results:', error);
      throw error;
    }
  }

  /**
   * Crawl and save in one operation
   */
  async crawlAndSave(params: {
    city: string;
    country: string;
    types?: ('events' | 'attractions')[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    crawled: number;
    saved: number;
  }> {
    try {
      // Crawl data
      const crawlResults = await this.crawlCity(params);
      const allResults = [...crawlResults.events, ...crawlResults.attractions];

      // Save to database
      const saved = await this.saveCrawlResults(allResults);

      return {
        crawled: allResults.length,
        saved
      };
    } catch (error: any) {
      logger.error('Crawl and save operation failed:', error);
      throw error;
    }
  }

  /**
   * Crawl multiple cities in batch
   */
  async crawlMultipleCities(
    cities: Array<{ city: string; country: string }>,
    types?: ('events' | 'attractions')[]
  ): Promise<{
    totalCrawled: number;
    totalSaved: number;
    results: Array<{
      city: string;
      crawled: number;
      saved: number;
    }>;
  }> {
    const results: Array<{ city: string; crawled: number; saved: number }> = [];
    let totalCrawled = 0;
    let totalSaved = 0;

    for (const { city, country } of cities) {
      try {
        logger.info('Starting batch crawl for city', { city, country });

        const result = await this.crawlAndSave({
          city,
          country,
          types
        });

        results.push({
          city,
          crawled: result.crawled,
          saved: result.saved
        });

        totalCrawled += result.crawled;
        totalSaved += result.saved;

        // Wait between cities to avoid rate limiting
        await this.sleep(5000);
      } catch (error: any) {
        logger.error('Batch crawl failed for city:', {
          city,
          country,
          error: error.message
        });

        results.push({
          city,
          crawled: 0,
          saved: 0
        });
      }
    }

    logger.info('Batch crawl completed', {
      cities: cities.length,
      totalCrawled,
      totalSaved
    });

    return {
      totalCrawled,
      totalSaved,
      results
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get crawler statistics
   */
  async getStatistics(): Promise<{
    totalPlaces: number;
    byType: Record<string, number>;
    byCity: Record<string, number>;
    bySources: Record<string, number>;
    recentlyCrawled: number;
  }> {
    try {
      const [totalPlaces, byType, byCity, bySources, recentlyCrawled] = await Promise.all([
        Place.countDocuments(),
        Place.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Place.aggregate([
          { $group: { _id: '$city', count: { $sum: 1 } } }
        ]),
        Place.aggregate([
          { $unwind: '$sources' },
          { $group: { _id: '$sources', count: { $sum: 1 } } }
        ]),
        Place.countDocuments({
          updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      ]);

      return {
        totalPlaces,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        byCity: byCity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        bySources: bySources.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        recentlyCrawled
      };
    } catch (error: any) {
      logger.error('Failed to get crawler statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance (lazy initialization)
let _crawlerManagerInstance: CrawlerManager | null = null;

export const getCrawlerManager = (): CrawlerManager => {
  if (!_crawlerManagerInstance) {
    _crawlerManagerInstance = new CrawlerManager();
  }
  return _crawlerManagerInstance;
};

// For backward compatibility
export const crawlerManager = new Proxy({} as CrawlerManager, {
  get(target, prop) {
    return getCrawlerManager()[prop as keyof CrawlerManager];
  }
});
