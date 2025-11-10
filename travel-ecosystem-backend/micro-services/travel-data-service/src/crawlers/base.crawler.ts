// Base Crawler Class with Rate Limiting and Error Handling

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { logger } from '@/utils/logger';
import { dbManager } from '@/database/connection';
import type { CrawlResult, CrawlerConfig } from '@/types';

export abstract class BaseCrawler {
  protected browser: Browser | null = null;
  protected context: BrowserContext | null = null;
  protected config: CrawlerConfig;
  protected redis;
  protected requestCount: number = 0;
  protected startTime: number = Date.now();

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      userAgent: process.env.CRAWLER_USER_AGENT || 'TravelDiscoveryBot/1.0',
      rateLimit: parseInt(process.env.CRAWLER_RATE_LIMIT || '10'),
      concurrentRequests: parseInt(process.env.CRAWLER_CONCURRENT_REQUESTS || '5'),
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 2000,
      respectRobotsTxt: true,
      ...config
    };

    this.redis = dbManager.getRedis();
  }

  /**
   * Initialize browser and context
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing crawler', { crawler: this.constructor.name });

      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });

      this.context = await this.browser.newContext({
        userAgent: this.config.userAgent,
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York'
      });

      // Add stealth measures
      await this.context.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });
      });

      logger.info('Crawler initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize crawler:', error);
      throw error;
    }
  }

  /**
   * Close browser and cleanup
   */
  async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      logger.info('Crawler cleanup completed', {
        totalRequests: this.requestCount,
        duration: Date.now() - this.startTime
      });
    } catch (error) {
      logger.error('Error during crawler cleanup:', error);
    }
  }

  /**
   * Create a new page with configured settings
   */
  protected async createPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Crawler not initialized. Call initialize() first.');
    }

    const page = await this.context.newPage();

    // Set default timeout
    page.setDefaultTimeout(this.config.timeout);

    // Block unnecessary resources for faster loading
    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    return page;
  }

  /**
   * Rate limiting: Wait if necessary
   */
  protected async rateLimit(): Promise<void> {
    const elapsed = Date.now() - this.startTime;
    const requestsPerSecond = this.requestCount / (elapsed / 1000);

    if (requestsPerSecond > this.config.rateLimit) {
      const waitTime = 1000 - (elapsed % 1000);
      logger.debug('Rate limit reached, waiting', { waitTime });
      await this.sleep(waitTime);
    }

    this.requestCount++;
  }

  /**
   * Navigate to URL with retry logic
   */
  protected async navigateWithRetry(
    page: Page,
    url: string,
    attempts: number = 0
  ): Promise<void> {
    try {
      await this.rateLimit();

      logger.debug('Navigating to URL', { url, attempt: attempts + 1 });

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout
      });

      // Wait for network to be idle
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        logger.debug('Network idle timeout, continuing anyway');
      });

    } catch (error: any) {
      if (attempts < this.config.retryAttempts) {
        logger.warn('Navigation failed, retrying', {
          url,
          attempt: attempts + 1,
          error: error.message
        });

        await this.sleep(this.config.retryDelay * (attempts + 1));
        return this.navigateWithRetry(page, url, attempts + 1);
      }

      logger.error('Navigation failed after retries', { url, error: error.message });
      throw error;
    }
  }

  /**
   * Check if URL has been crawled recently (caching)
   */
  protected async isCached(url: string, ttl: number = 86400): Promise<boolean> {
    try {
      const cacheKey = `crawler:cache:${this.getCacheKey(url)}`;
      const cached = await this.redis.get(cacheKey);
      return cached !== null;
    } catch (error) {
      logger.error('Cache check failed:', error);
      return false;
    }
  }

  /**
   * Mark URL as crawled
   */
  protected async markAsCrawled(url: string, ttl: number = 86400): Promise<void> {
    try {
      const cacheKey = `crawler:cache:${this.getCacheKey(url)}`;
      await this.redis.setex(cacheKey, ttl, Date.now().toString());
    } catch (error) {
      logger.error('Failed to mark URL as crawled:', error);
    }
  }

  /**
   * Generate cache key from URL
   */
  protected getCacheKey(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 64);
  }

  /**
   * Extract structured data from page
   */
  protected async extractStructuredData(page: Page): Promise<any[]> {
    try {
      return await page.evaluate(() => {
        const scripts = Array.from(
          document.querySelectorAll('script[type="application/ld+json"]')
        );
        return scripts
          .map((script) => {
            try {
              return JSON.parse(script.textContent || '');
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      });
    } catch (error) {
      logger.debug('No structured data found');
      return [];
    }
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Extract text content safely
   */
  protected async safeExtractText(
    page: Page,
    selector: string,
    defaultValue: string = ''
  ): Promise<string> {
    try {
      const element = await page.$(selector);
      if (!element) return defaultValue;
      return (await element.textContent())?.trim() || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Extract attribute safely
   */
  protected async safeExtractAttribute(
    page: Page,
    selector: string,
    attribute: string,
    defaultValue: string = ''
  ): Promise<string> {
    try {
      const element = await page.$(selector);
      if (!element) return defaultValue;
      return (await element.getAttribute(attribute)) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Batch process URLs with concurrency control
   */
  protected async batchProcess<T>(
    urls: string[],
    processor: (url: string) => Promise<T>,
    concurrency: number = this.config.concurrentRequests
  ): Promise<T[]> {
    const results: T[] = [];
    const chunks: string[][] = [];

    // Split into chunks
    for (let i = 0; i < urls.length; i += concurrency) {
      chunks.push(urls.slice(i, i + concurrency));
    }

    // Process each chunk
    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map((url) => processor(url))
      );

      for (const result of chunkResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          logger.error('Batch processing failed for URL:', result.reason);
        }
      }
    }

    return results;
  }

  /**
   * Abstract method: Must be implemented by child classes
   */
  abstract crawl(params: any): Promise<CrawlResult[]>;

  /**
   * Abstract method: Get crawler name
   */
  abstract getName(): string;
}
