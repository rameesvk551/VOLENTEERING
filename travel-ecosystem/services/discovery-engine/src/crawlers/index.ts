// Crawler Manager - Orchestrates all crawlers

import { EventCrawler } from './event.crawler';
import { AttractionCrawler } from './attraction.crawler';
import { logger } from '@/utils/logger';
import { Place } from '@/database/models';
import type { CrawlResult } from '@/types';

export class CrawlerManager {
  private eventCrawler: EventCrawler;
  private attractionCrawler: AttractionCrawler;

  constructor() {
    this.eventCrawler = new EventCrawler();
    this.attractionCrawler = new AttractionCrawler();
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
        logger.info('Crawling events', { city });
        results.events = await this.eventCrawler.crawl({
          city,
          country,
          startDate,
          endDate
        });
        logger.info('Events crawled', { count: results.events.length });
      }

      // Crawl attractions
      if (types.includes('attractions')) {
        logger.info('Crawling attractions', { city });
        results.attractions = await this.attractionCrawler.crawl({
          city,
          country
        });
        logger.info('Attractions crawled', { count: results.attractions.length });
      }

      results.total = results.events.length + results.attractions.length;

      logger.info('City crawl completed', {
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
   * Save crawl results to database
   */
  async saveCrawlResults(results: CrawlResult[]): Promise<number> {
    let savedCount = 0;

    try {
      logger.info('Saving crawl results', { count: results.length });

      for (const result of results) {
        try {
          // Check if place already exists
          const existing = await Place.findOne({
            name: result.data.name,
            city: result.data.city,
            type: result.data.type
          });

          if (existing) {
            // Update existing place
            await Place.updateOne(
              { _id: existing._id },
              {
                $set: {
                  ...result.data,
                  sources: [...new Set([...(existing.sources || []), result.source])],
                  updatedAt: new Date()
                }
              }
            );
            logger.debug('Updated existing place', { name: result.data.name });
          } else {
            // Create new place
            await Place.create({
              ...result.data,
              sources: [result.source],
              createdAt: new Date(),
              updatedAt: new Date()
            });
            logger.debug('Created new place', { name: result.data.name });
          }

          savedCount++;
        } catch (error: any) {
          logger.error('Failed to save crawl result:', {
            name: result.data.name,
            error: error.message
          });
        }
      }

      logger.info('Crawl results saved', {
        total: results.length,
        saved: savedCount,
        skipped: results.length - savedCount
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

// Export singleton instance
export const crawlerManager = new CrawlerManager();
