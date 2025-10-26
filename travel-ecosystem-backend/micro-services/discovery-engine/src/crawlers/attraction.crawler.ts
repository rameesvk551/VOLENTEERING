// Attraction & Tourist Destination Crawler

import { BaseCrawler } from './base.crawler';
import { Page } from 'playwright';
import { logger } from '@/utils/logger';
import type { CrawlResult } from '@/types';

export class AttractionCrawler extends BaseCrawler {
  getName(): string {
    return 'AttractionCrawler';
  }

  /**
   * Main crawl method
   */
  async crawl(params: {
    city: string;
    country: string;
    categories?: string[];
  }): Promise<CrawlResult[]> {
    const { city, country, categories } = params;
    const results: CrawlResult[] = [];

    try {
      await this.initialize();

      logger.info('Starting attraction crawl', { city, country });

      // Crawl multiple sources
      const sources = [
        () => this.crawlGoogleAttractions(city, country),
        () => this.crawlLonelyPlanet(city, country),
        () => this.crawlAtlasObscura(city, country),
      ];

      for (const source of sources) {
        try {
          const sourceResults = await source();
          results.push(...sourceResults);
        } catch (error: any) {
          logger.error('Attraction source crawl failed:', {
            source: source.name,
            error: error.message
          });
        }
      }

      logger.info('Attraction crawl completed', {
        city,
        totalResults: results.length
      });

      return results;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Crawl Google Maps/Search for attractions
   */
  private async crawlGoogleAttractions(city: string, country: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const query = encodeURIComponent(`tourist attractions in ${city}, ${country}`);
    const baseUrl = `https://www.google.com/search?q=${query}`;

    try {
      logger.info('Crawling Google for attractions', { city });

      const page = await this.createPage();

      if (await this.isCached(baseUrl, 86400)) {
        await page.close();
        return results;
      }

      await this.navigateWithRetry(page, baseUrl);

      // Wait for search results
      await page.waitForSelector('.g, [data-attrid]', { timeout: 10000 }).catch(() => {
        logger.warn('Google search results not found');
      });

      // Extract attractions from knowledge panel and search results
      const attractions = await page.evaluate(() => {
        const extracted: any[] = [];

        // Try knowledge panel attractions
        const panelItems = document.querySelectorAll('[data-attrid*="kc:/location"] a, .klitem');
        panelItems.forEach((item) => {
          const title = item.textContent?.trim();
          const link = item.getAttribute('href');
          if (title && link) {
            extracted.push({
              title,
              url: link,
              source: 'knowledge-panel'
            });
          }
        });

        // Try regular search results
        const searchResults = document.querySelectorAll('.g');
        searchResults.forEach((result) => {
          const titleEl = result.querySelector('h3');
          const linkEl = result.querySelector('a');
          const snippetEl = result.querySelector('.VwiC3b, [data-content-feature="1"]');

          if (titleEl && linkEl) {
            extracted.push({
              title: titleEl.textContent?.trim() || '',
              url: linkEl.getAttribute('href') || '',
              description: snippetEl?.textContent?.trim() || '',
              source: 'search-result'
            });
          }
        });

        return extracted;
      });

      for (const attraction of attractions) {
        results.push({
          source: 'google',
          url: attraction.url,
          data: {
            name: attraction.title,
            description: attraction.description || '',
            type: 'attraction',
            category: this.categorizeAttraction(attraction.title, attraction.description),
            city,
            country,
            startDate: null,
            endDate: null,
            price: null,
            image: null,
            tags: this.extractTags(attraction.title, attraction.description),
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

      await this.markAsCrawled(baseUrl, 86400);
      await page.close();

      logger.info('Google attractions crawl completed', { attractionsFound: results.length });
    } catch (error: any) {
      logger.error('Google attractions crawl failed:', error.message);
    }

    return results;
  }

  /**
   * Crawl Lonely Planet for attractions
   */
  private async crawlLonelyPlanet(city: string, country: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const countrySlug = country.toLowerCase().replace(/\s+/g, '-');
    const baseUrl = `https://www.lonelyplanet.com/${countrySlug}/${citySlug}/attractions`;

    try {
      logger.info('Crawling Lonely Planet', { city, url: baseUrl });

      const page = await this.createPage();

      if (await this.isCached(baseUrl, 86400)) {
        await page.close();
        return results;
      }

      await this.navigateWithRetry(page, baseUrl);

      // Wait for attraction cards
      await page.waitForSelector('[data-testid="poi-card"], .card, article', {
        timeout: 10000
      }).catch(() => {
        logger.warn('Lonely Planet attraction cards not found');
      });

      // Extract attractions
      const attractions = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="poi-card"], .card, article');
        const extracted: any[] = [];

        cards.forEach((card) => {
          try {
            const titleEl = card.querySelector('h2, h3, [class*="title"]');
            const descEl = card.querySelector('p, [class*="description"]');
            const linkEl = card.querySelector('a');
            const imageEl = card.querySelector('img');
            const categoryEl = card.querySelector('[class*="category"], [class*="type"]');
            const ratingEl = card.querySelector('[class*="rating"]');

            if (titleEl && linkEl) {
              extracted.push({
                title: titleEl.textContent?.trim() || '',
                description: descEl?.textContent?.trim() || '',
                url: linkEl.getAttribute('href') || '',
                image: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '',
                category: categoryEl?.textContent?.trim() || '',
                rating: ratingEl?.textContent?.trim() || ''
              });
            }
          } catch (error) {
            // Skip
          }
        });

        return extracted;
      });

      for (const attraction of attractions) {
        const url = attraction.url.startsWith('http')
          ? attraction.url
          : `https://www.lonelyplanet.com${attraction.url}`;

        results.push({
          source: 'lonelyplanet',
          url,
          data: {
            name: attraction.title,
            description: attraction.description,
            type: 'attraction',
            category: attraction.category || this.categorizeAttraction(attraction.title, attraction.description),
            city,
            country,
            startDate: null,
            endDate: null,
            price: null,
            image: attraction.image,
            tags: this.extractTags(attraction.title, attraction.description),
            rating: this.parseRating(attraction.rating),
            reviewCount: null,
            coordinates: null,
            address: null,
            website: url,
            phone: null,
            openingHours: null,
            features: [],
            accessibility: []
          }
        });
      }

      await this.markAsCrawled(baseUrl, 86400);
      await page.close();

      logger.info('Lonely Planet crawl completed', { attractionsFound: results.length });
    } catch (error: any) {
      logger.error('Lonely Planet crawl failed:', error.message);
    }

    return results;
  }

  /**
   * Crawl Atlas Obscura for unique attractions
   */
  private async crawlAtlasObscura(city: string, country: string): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const baseUrl = `https://www.atlasobscura.com/things-to-do/${city.toLowerCase().replace(/\s+/g, '-')}`;

    try {
      logger.info('Crawling Atlas Obscura', { city, url: baseUrl });

      const page = await this.createPage();

      if (await this.isCached(baseUrl, 86400)) {
        await page.close();
        return results;
      }

      await this.navigateWithRetry(page, baseUrl);

      // Wait for content
      await page.waitForSelector('[class*="place"], [class*="item-"], article', {
        timeout: 10000
      }).catch(() => {
        logger.warn('Atlas Obscura content not found');
      });

      // Extract places
      const places = await page.evaluate(() => {
        const items = document.querySelectorAll('[class*="place"], [class*="item-"], article');
        const extracted: any[] = [];

        items.forEach((item) => {
          try {
            const titleEl = item.querySelector('h3, h2, [class*="title"]');
            const descEl = item.querySelector('p, [class*="desc"]');
            const linkEl = item.querySelector('a');
            const imageEl = item.querySelector('img');
            const typeEl = item.querySelector('[class*="type"], [class*="category"]');

            if (titleEl && linkEl) {
              extracted.push({
                title: titleEl.textContent?.trim() || '',
                description: descEl?.textContent?.trim() || '',
                url: linkEl.getAttribute('href') || '',
                image: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '',
                type: typeEl?.textContent?.trim() || 'attraction'
              });
            }
          } catch (error) {
            // Skip
          }
        });

        return extracted;
      });

      for (const place of places) {
        const url = place.url.startsWith('http')
          ? place.url
          : `https://www.atlasobscura.com${place.url}`;

        results.push({
          source: 'atlasobscura',
          url,
          data: {
            name: place.title,
            description: place.description,
            type: 'attraction',
            category: this.categorizeAttraction(place.title, place.description),
            city,
            country,
            startDate: null,
            endDate: null,
            price: null,
            image: place.image,
            tags: ['unique', 'hidden-gem', ...this.extractTags(place.title, place.description)],
            rating: null,
            reviewCount: null,
            coordinates: null,
            address: null,
            website: url,
            phone: null,
            openingHours: null,
            features: [],
            accessibility: []
          }
        });
      }

      await this.markAsCrawled(baseUrl, 86400);
      await page.close();

      logger.info('Atlas Obscura crawl completed', { placesFound: results.length });
    } catch (error: any) {
      logger.error('Atlas Obscura crawl failed:', error.message);
    }

    return results;
  }

  /**
   * Categorize attraction based on title and description
   */
  private categorizeAttraction(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    const categories = {
      museum: ['museum', 'gallery', 'exhibition', 'art'],
      historical: ['historical', 'historic', 'monument', 'heritage', 'ancient', 'castle', 'palace'],
      religious: ['temple', 'church', 'mosque', 'shrine', 'cathedral', 'monastery'],
      nature: ['park', 'garden', 'beach', 'lake', 'mountain', 'forest', 'nature', 'reserve'],
      architecture: ['building', 'tower', 'bridge', 'architecture', 'landmark'],
      entertainment: ['zoo', 'aquarium', 'theme park', 'amusement', 'entertainment'],
      shopping: ['market', 'bazaar', 'shopping', 'mall', 'souk'],
      viewpoint: ['viewpoint', 'observation', 'lookout', 'panorama', 'view'],
      cultural: ['cultural', 'culture', 'traditional', 'local']
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
      'famous', 'iconic', 'popular', 'must-see', 'top', 'best',
      'free', 'paid', 'indoor', 'outdoor', 'family-friendly',
      'historic', 'modern', 'traditional', 'contemporary',
      'scenic', 'beautiful', 'stunning', 'unique', 'hidden'
    ];

    for (const keyword of tagKeywords) {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    }

    return [...new Set(tags)].slice(0, 5);
  }

  /**
   * Parse rating from text
   */
  private parseRating(ratingString: string): number | null {
    if (!ratingString) return null;

    const match = ratingString.match(/[\d.]+/);
    if (match) {
      const rating = parseFloat(match[0]);
      return rating <= 5 ? rating : rating / 2; // Normalize to 5-star scale
    }

    return null;
  }
}
