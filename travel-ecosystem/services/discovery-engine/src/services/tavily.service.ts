/**
 * Tavily AI Search Service
 * Real-time web search for travel information
 */

import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import Readability from '@mozilla/readability';
import { logger } from '../utils/logger';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TravelSearchResult {
  name: string;
  description: string;
  url: string;
  source: string;
  relevanceScore: number;
  category?: string;
  location?: {
    city: string;
    country: string;
  };
  // Optional representative image URL extracted from the page (og:image / twitter:image)
  image?: string;
  // Optional coordinates extracted or geocoded for the page (lat, lon)
  coordinates?: { lat: number; lon: number };
}

export class TavilyService {
  private searchTool: TavilySearchResults | null = null;
  private enabled: boolean = false;
  // Simple in-memory cache for page images: url -> { image, expires }
  private imageCache: Map<string, { image?: string; coordinates?: { lat: number; lon: number }; expiresAt: number }> = new Map();

  constructor() {
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (apiKey && apiKey !== 'your_tavily_api_key_here') {
      this.searchTool = new TavilySearchResults({
        maxResults: 10,
        apiKey: apiKey,
      });
      this.enabled = true;
      logger.info('Tavily AI service initialized');
    } else {
      logger.warn('Tavily API key not configured. Real-time search disabled.');
    }
  }

  /**
   * Check if Tavily is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Search for travel-related information
   */
  async searchTravel(query: string): Promise<TravelSearchResult[]> {
    if (!this.enabled || !this.searchTool) {
      logger.warn('Tavily search attempted but service is disabled');
      return [];
    }

    try {
  logger.info('Tavily search started', { query });

  // Use invokeWithRetries to reduce transient failures and provide detailed logs
  const results = await this.invokeWithRetries(query, 3, 800);
      
      // Parse the results (Tavily returns a string with JSON)
      const parsedResults: TavilySearchResult[] = typeof results === 'string'
        ? JSON.parse(results)
        : results;

      // Transform and enrich with representative image (async)
      const travelResults: TravelSearchResult[] = await Promise.all(parsedResults.map(async (result) => {
        const image = await this.extractImageFromUrl(result.url).catch(err => {
          logger.debug('Failed to extract image for url', { url: result.url, err: err?.message });
          return undefined;
        });
          const coordinates = await this.extractCoordinatesFromUrl(result.url).catch(err => {
            logger.debug('Failed to extract coordinates for url', { url: result.url, err: err?.message });
            return undefined;
          });

        return {
          name: result.title,
          description: result.content,
          url: result.url,
          source: 'tavily',
          relevanceScore: result.score || 0.5,
          category: this.inferCategory(result.title, result.content),
          image,
          coordinates
        } as TravelSearchResult;
      }));

      logger.info('Tavily search completed', {
        query,
        resultsCount: travelResults.length
      });

      return travelResults;

    } catch (error: any) {
      // Log full error object and stack for debugging
      logger.error('Tavily search failed:', {
        query,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        details: error
      });
      return [];
    }
  }

  /**
   * Invoke the Tavily search tool with retries and exponential backoff.
   * Returns the raw result from the Tavily tool or throws the last error.
   */
  private async invokeWithRetries(query: string, maxAttempts = 3, baseDelayMs = 500) {
    let attempt = 0;
    let lastError: any;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        logger.debug('Tavily invoke attempt', { query, attempt });
        // @ts-ignore - searchTool is typed by langchain community tool
        const res = await (this.searchTool as any).invoke(query);
        return res;
      } catch (err: any) {
        lastError = err;
        logger.warn('Tavily invoke error, will retry if attempts remain', {
          query,
          attempt,
          message: err?.message,
          code: err?.code || undefined,
          details: err
        });

        // exponential backoff
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }

    // no attempts left — throw last error
    throw lastError;
  }

  /**
   * Fetch a URL and try to extract a representative image (og:image, twitter:image, link rel=image_src).
   * Uses a small in-memory cache to avoid repeated fetches.
   */
  private async extractImageFromUrl(url?: string): Promise<string | undefined> {
    if (!url) return undefined;

    try {
      // Check cache (ttl 24h)
      const cached = this.imageCache.get(url);
      const now = Date.now();
      if (cached && cached.expiresAt > now) {
        return cached.image;
      }

      const resp = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': process.env.SCRAPER_USER_AGENT || 'TravelDiscoveryBot/1.0 (+https://example.com)'
        },
        responseType: 'text'
      });

  const html = resp.data as string;
  const $ = cheerio.load(html);

  // 1) Try common meta tags in order of preference (og:image, twitter:image)
      const selectors = [
        'meta[property="og:image"]',
        'meta[name="og:image"]',
        'meta[name="twitter:image"]',
        'link[rel="image_src"]',
        'meta[itemprop="image"]'
      ];

      let found: string | undefined;
      for (const sel of selectors) {
        const el = $(sel).attr('content') || $(sel).attr('href');
        if (el && typeof el === 'string' && el.trim()) {
          found = el.trim();
          break;
        }
      }

      // 2) Try JSON-LD schema.org (image)
      if (!found) {
        const jsonLd = $('script[type="application/ld+json"]').map((i, el) => $(el).html()).get();
        for (const block of jsonLd) {
          try {
            const parsed = JSON.parse(block || '{}');
            // support array or single
            const candidates: any[] = Array.isArray(parsed) ? parsed : [parsed];
            for (const c of candidates) {
              if (c?.image) {
                if (typeof c.image === 'string') {
                  found = c.image;
                  break;
                } else if (Array.isArray(c.image) && c.image.length > 0) {
                  found = c.image[0];
                  break;
                } else if (c.image?.url) {
                  found = c.image.url;
                  break;
                }
              }
            }
            if (found) break;
          } catch (e) {
            // ignore JSON parse errors
          }
        }
      }

      // 3) Use Readability to extract the article content and find the first image inside the main article
      if (!found) {
        try {
          const dom = new JSDOM(html, { url });
          const reader = new Readability(dom.window.document as any);
          const article = reader.parse();
          if (article && article.content) {
            const $article = cheerio.load(article.content || '');
            const firstImg = $article('img').first().attr('src') || $article('img').first().attr('data-src');
            if (firstImg) found = firstImg;
          }
        } catch (e) {
          // ignore readability errors
        }
      }

      // 4) If still not found, try to find the largest <img> on the page (best-effort)
      if (!found) {
        let maxArea = 0;
        $('img').each((i, img) => {
          const src = $(img).attr('src') || $(img).attr('data-src');
          const width = parseInt($(img).attr('width') || '0', 10) || 0;
          const height = parseInt($(img).attr('height') || '0', 10) || 0;
          const area = width * height;
          if (src && area >= maxArea) {
            maxArea = area;
            found = src as string;
          }
        });
      }

      if (found && found.startsWith('//')) {
        // protocol-relative URL
        found = 'https:' + found;
      }

      // Normalize relative URLs
      if (found && !found.match(/^https?:\/\//i)) {
        try {
          const base = new URL(url);
          found = new URL(found, base).toString();
        } catch (e) {
          // if URL parsing fails, keep as-is
        }
      }

      // Cache for 24 hours
      this.imageCache.set(url, { image: found, expiresAt: now + 24 * 60 * 60 * 1000 });

      return found;
    } catch (error: any) {
      logger.debug('extractImageFromUrl error', { url, message: error?.message });
      // Cache negative result for a short time to avoid repeated failing requests
      this.imageCache.set(url, { image: undefined, expiresAt: Date.now() + 5 * 60 * 1000 });
      return undefined;
    }
  }

  /**
   * Search for events in a specific city
   */
  async searchEvents(city: string, country: string, month?: string): Promise<TravelSearchResult[]> {
    const monthStr = month ? ` in ${month}` : '';
    const query = `events and festivals in ${city} ${country}${monthStr} 2025`;
    
    const results = await this.searchTravel(query);
    
    // Add location metadata
    return results.map(result => ({
      ...result,
      category: 'event',
      location: { city, country }
    }));
  }

  /**
   * Search for attractions in a specific city
   */
  async searchAttractions(city: string, country: string, interests?: string[]): Promise<TravelSearchResult[]> {
    const interestsStr = interests && interests.length > 0 
      ? ` ${interests.join(' ')} ` 
      : '';
    
    const query = `best${interestsStr}attractions and things to do in ${city} ${country}`;
    
    const results = await this.searchTravel(query);
    
    return results.map(result => ({
      ...result,
      category: 'attraction',
      location: { city, country }
    }));
  }

  /**
   * Search for restaurants and food experiences
   */
  async searchFood(city: string, country: string, cuisine?: string): Promise<TravelSearchResult[]> {
    const cuisineStr = cuisine ? `${cuisine} ` : '';
    const query = `best ${cuisineStr}restaurants and food experiences in ${city} ${country}`;
    
    const results = await this.searchTravel(query);
    
    return results.map(result => ({
      ...result,
      category: 'food',
      location: { city, country }
    }));
  }

  /**
   * Search for current travel trends and news
   */
  async searchTrends(city: string, country: string): Promise<TravelSearchResult[]> {
    const query = `latest travel trends and what's new in ${city} ${country} 2025`;
    
    const results = await this.searchTravel(query);
    
    return results.map(result => ({
      ...result,
      category: 'trend',
      location: { city, country }
    }));
  }

  /**
   * Search for specific information (hotels, transportation, etc.)
   */
  async searchSpecific(query: string, city: string, country: string): Promise<TravelSearchResult[]> {
    const fullQuery = `${query} in ${city} ${country}`;
    
    const results = await this.searchTravel(fullQuery);
    
    return results.map(result => ({
      ...result,
      location: { city, country }
    }));
  }

  /**
   * Comprehensive search - combines multiple search types
   */
  async comprehensiveSearch(
    city: string, 
    country: string, 
    options?: {
      month?: string;
      interests?: string[];
      includeFood?: boolean;
      includeTrends?: boolean;
    }
  ): Promise<{
    events: TravelSearchResult[];
    attractions: TravelSearchResult[];
    food: TravelSearchResult[];
    trends: TravelSearchResult[];
  }> {
    try {
      const [events, attractions, food, trends] = await Promise.all([
        this.searchEvents(city, country, options?.month),
        this.searchAttractions(city, country, options?.interests),
        options?.includeFood ? this.searchFood(city, country) : Promise.resolve([]),
        options?.includeTrends ? this.searchTrends(city, country) : Promise.resolve([])
      ]);

      return { events, attractions, food, trends };

    } catch (error: any) {
      logger.error('Comprehensive search failed:', {
        city,
        country,
        error: error.message
      });
      
      return {
        events: [],
        attractions: [],
        food: [],
        trends: []
      };
    }
  }

  /**
   * Infer category from title and content
   */
  private inferCategory(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();

    if (text.match(/festival|event|concert|celebration|parade/)) {
      return 'event';
    } else if (text.match(/restaurant|food|dining|cafe|cuisine|culinary/)) {
      return 'food';
    } else if (text.match(/museum|temple|monument|attraction|park|garden/)) {
      return 'attraction';
    } else if (text.match(/hotel|accommodation|stay|resort/)) {
      return 'accommodation';
    } else if (text.match(/nightlife|bar|club|entertainment/)) {
      return 'nightlife';
    } else if (text.match(/shopping|market|mall|bazaar/)) {
      return 'shopping';
    } else if (text.match(/nature|hiking|adventure|outdoor/)) {
      return 'nature';
    }

    return 'general';
  }
}

// Singleton instance
export const tavilyService = new TavilyService();
