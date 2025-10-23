// Event & Festival Crawler

import { BaseCrawler } from './base.crawler';
import { Page } from 'playwright';
import { Place } from '@/database/models';
import { logger } from '@/utils/logger';
import { parse, format, isAfter, isBefore } from 'date-fns';
import type { CrawlResult, EventData } from '@/types';

export class EventCrawler extends BaseCrawler {
  getName(): string {
    return 'EventCrawler';
  }

  /**
   * Main crawl method
   */
  async crawl(params: {
    city: string;
    country: string;
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
  }): Promise<CrawlResult[]> {
    const { city, country, startDate, endDate, categories } = params;
    const results: CrawlResult[] = [];

    try {
      await this.initialize();

      logger.info('Starting event crawl', { city, country });

      // Crawl multiple sources
      const sources = [
        () => this.crawlTimeOut(city, country),
        () => this.crawlEventbrite(city, country),
        () => this.crawlTripAdvisor(city, country),
      ];

      for (const source of sources) {
        try {
          const sourceResults = await source();
          results.push(...sourceResults);
        } catch (error: any) {
          logger.error('Source crawl failed:', {
            source: source.name,
            error: error.message
          });
        }
      }

      // Filter by date if provided
      if (startDate || endDate) {
        return results.filter((result) => {
          if (!result.data.startDate) return false;
          const eventDate = new Date(result.data.startDate);
          
          if (startDate && isBefore(eventDate, startDate)) return false;
          if (endDate && isAfter(eventDate, endDate)) return false;
          
          return true;
        });
      }

      logger.info('Event crawl completed', {
        city,
        totalResults: results.length
      });

      return results;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Crawl TimeOut for events
   */
  private async crawlTimeOut(city: string, country: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const baseUrl = `https://www.timeout.com/${citySlug}/things-to-do/events-in-${citySlug}`;

    try {
      logger.info('Crawling TimeOut', { city, url: baseUrl });

      const page = await this.createPage();
      
      // Check cache
      if (await this.isCached(baseUrl, 43200)) { // 12 hours
        logger.info('URL cached, skipping', { url: baseUrl });
        await page.close();
        return results;
      }

      await this.navigateWithRetry(page, baseUrl);

      // Wait for content to load
      await page.waitForSelector('[class*="event"]', { timeout: 10000 }).catch(() => {
        logger.warn('Event selector not found on TimeOut');
      });

      // Extract events
      const events = await page.evaluate(() => {
        const eventElements = document.querySelectorAll('[class*="card"], [class*="event"]');
        const extractedEvents: any[] = [];

        eventElements.forEach((element) => {
          try {
            const titleEl = element.querySelector('h3, h2, [class*="title"]');
            const descEl = element.querySelector('p, [class*="description"]');
            const dateEl = element.querySelector('[class*="date"], time');
            const linkEl = element.querySelector('a');
            const imageEl = element.querySelector('img');
            const priceEl = element.querySelector('[class*="price"]');

            if (titleEl && linkEl) {
              extractedEvents.push({
                title: titleEl.textContent?.trim() || '',
                description: descEl?.textContent?.trim() || '',
                date: dateEl?.textContent?.trim() || dateEl?.getAttribute('datetime') || '',
                url: linkEl.getAttribute('href') || '',
                image: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '',
                price: priceEl?.textContent?.trim() || 'Free'
              });
            }
          } catch (error) {
            // Skip malformed elements
          }
        });

        return extractedEvents;
      });

      // Process each event
      for (const event of events) {
        try {
          const startDate = this.parseDate(event.date);
          
          results.push({
            source: 'timeout',
            url: event.url.startsWith('http') ? event.url : `https://www.timeout.com${event.url}`,
            data: {
              name: event.title,
              description: event.description,
              type: 'event',
              category: this.categorizeEvent(event.title, event.description),
              city,
              country,
              startDate: startDate?.toISOString() || null,
              endDate: null,
              price: this.parsePrice(event.price),
              image: event.image,
              tags: this.extractTags(event.title, event.description),
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
        } catch (error) {
          logger.debug('Failed to process event:', error);
        }
      }

      await this.markAsCrawled(baseUrl, 43200);
      await page.close();

      logger.info('TimeOut crawl completed', { eventsFound: results.length });
    } catch (error: any) {
      logger.error('TimeOut crawl failed:', error.message);
    }

    return results;
  }

  /**
   * Crawl Eventbrite for events
   */
  private async crawlEventbrite(city: string, country: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const cityQuery = encodeURIComponent(city);
    const baseUrl = `https://www.eventbrite.com/d/${cityQuery.toLowerCase()}/events/`;

    try {
      logger.info('Crawling Eventbrite', { city, url: baseUrl });

      const page = await this.createPage();

      if (await this.isCached(baseUrl, 43200)) {
        await page.close();
        return results;
      }

      await this.navigateWithRetry(page, baseUrl);

      // Wait for events to load
      await page.waitForSelector('[data-event-id], [class*="event"]', { timeout: 10000 }).catch(() => {
        logger.warn('Event selector not found on Eventbrite');
      });

      // Extract events
      const events = await page.evaluate(() => {
        const eventCards = document.querySelectorAll('[data-event-id], [class*="SearchEventCard"]');
        const extractedEvents: any[] = [];

        eventCards.forEach((card) => {
          try {
            const titleEl = card.querySelector('[data-testid="event-title"], h3, h2');
            const dateEl = card.querySelector('[data-testid="event-date"], time');
            const priceEl = card.querySelector('[data-testid="event-price"], [class*="price"]');
            const linkEl = card.querySelector('a');
            const imageEl = card.querySelector('img');

            if (titleEl && linkEl) {
              extractedEvents.push({
                title: titleEl.textContent?.trim() || '',
                date: dateEl?.textContent?.trim() || '',
                price: priceEl?.textContent?.trim() || 'Free',
                url: linkEl.getAttribute('href') || '',
                image: imageEl?.getAttribute('src') || ''
              });
            }
          } catch (error) {
            // Skip
          }
        });

        return extractedEvents;
      });

      for (const event of events) {
        const startDate = this.parseDate(event.date);

        results.push({
          source: 'eventbrite',
          url: event.url,
          data: {
            name: event.title,
            description: '',
            type: 'event',
            category: this.categorizeEvent(event.title, ''),
            city,
            country,
            startDate: startDate?.toISOString() || null,
            endDate: null,
            price: this.parsePrice(event.price),
            image: event.image,
            tags: this.extractTags(event.title, ''),
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

      await this.markAsCrawled(baseUrl, 43200);
      await page.close();

      logger.info('Eventbrite crawl completed', { eventsFound: results.length });
    } catch (error: any) {
      logger.error('Eventbrite crawl failed:', error.message);
    }

    return results;
  }

  /**
   * Crawl TripAdvisor for events and things to do
   */
  private async crawlTripAdvisor(city: string, country: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const cityQuery = encodeURIComponent(city.replace(/\s+/g, '_'));
    const baseUrl = `https://www.tripadvisor.com/Attractions-g-Activities-${cityQuery}.html`;

    try {
      logger.info('Crawling TripAdvisor', { city, url: baseUrl });

      const page = await this.createPage();

      if (await this.isCached(baseUrl, 86400)) { // 24 hours
        await page.close();
        return results;
      }

      await this.navigateWithRetry(page, baseUrl);

      // Wait for attraction cards
      await page.waitForSelector('[data-automation="attractionCard"], [class*="attraction"]', {
        timeout: 10000
      }).catch(() => {
        logger.warn('Attraction selector not found on TripAdvisor');
      });

      // Extract attractions
      const attractions = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-automation="attractionCard"], [class*="listing"]');
        const extracted: any[] = [];

        cards.forEach((card) => {
          try {
            const titleEl = card.querySelector('h3, h2, [class*="title"]');
            const ratingEl = card.querySelector('[class*="rating"]');
            const reviewEl = card.querySelector('[class*="review"]');
            const linkEl = card.querySelector('a');
            const imageEl = card.querySelector('img');
            const categoryEl = card.querySelector('[class*="category"]');

            if (titleEl && linkEl) {
              const ratingText = ratingEl?.textContent || '';
              const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0] || '0');

              extracted.push({
                title: titleEl.textContent?.trim() || '',
                rating,
                reviewCount: reviewEl?.textContent?.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0',
                url: linkEl.getAttribute('href') || '',
                image: imageEl?.getAttribute('src') || '',
                category: categoryEl?.textContent?.trim() || ''
              });
            }
          } catch (error) {
            // Skip
          }
        });

        return extracted;
      });

      for (const attraction of attractions) {
        results.push({
          source: 'tripadvisor',
          url: attraction.url.startsWith('http')
            ? attraction.url
            : `https://www.tripadvisor.com${attraction.url}`,
          data: {
            name: attraction.title,
            description: '',
            type: 'attraction',
            category: attraction.category || 'general',
            city,
            country,
            startDate: null,
            endDate: null,
            price: null,
            image: attraction.image,
            tags: this.extractTags(attraction.title, attraction.category),
            rating: attraction.rating || null,
            reviewCount: parseInt(attraction.reviewCount) || null,
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

      await this.markAsCrawled(baseUrl, 86400);
      await page.close();

      logger.info('TripAdvisor crawl completed', { attractionsFound: results.length });
    } catch (error: any) {
      logger.error('TripAdvisor crawl failed:', error.message);
    }

    return results;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      // Try common date formats
      const formats = [
        'MMM dd, yyyy',
        'MMMM dd, yyyy',
        'dd MMM yyyy',
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy'
      ];

      for (const formatStr of formats) {
        try {
          const parsed = parse(dateString, formatStr, new Date());
          if (parsed && !isNaN(parsed.getTime())) {
            return parsed;
          }
        } catch {
          continue;
        }
      }

      // Try Date constructor as fallback
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Parse price from text
   */
  private parsePrice(priceString: string): number | null {
    if (!priceString || priceString.toLowerCase().includes('free')) {
      return 0;
    }

    const match = priceString.match(/[\d,.]+/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }

    return null;
  }

  /**
   * Categorize event based on title and description
   */
  private categorizeEvent(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    const categories = {
      food: ['food', 'restaurant', 'cuisine', 'dining', 'culinary', 'taste', 'eat'],
      music: ['music', 'concert', 'festival', 'band', 'live', 'performance', 'show'],
      art: ['art', 'gallery', 'exhibition', 'museum', 'culture', 'painting', 'sculpture'],
      sports: ['sports', 'game', 'match', 'tournament', 'race', 'competition'],
      nightlife: ['nightlife', 'club', 'bar', 'party', 'dance', 'dj'],
      outdoor: ['outdoor', 'nature', 'hiking', 'park', 'garden', 'adventure'],
      shopping: ['shopping', 'market', 'bazaar', 'mall', 'store', 'retail'],
      family: ['family', 'kids', 'children', 'playground', 'fun'],
      wellness: ['wellness', 'spa', 'yoga', 'meditation', 'health', 'fitness']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Extract tags from text
   */
  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags: string[] = [];

    const tagKeywords = [
      'free', 'popular', 'trending', 'best', 'top', 'recommended',
      'family-friendly', 'indoor', 'outdoor', 'historic', 'modern',
      'cultural', 'traditional', 'seasonal', 'weekend', 'evening'
    ];

    for (const keyword of tagKeywords) {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return [...new Set(tags)].slice(0, 5);
  }
}
