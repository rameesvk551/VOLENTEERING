/**
 * URL Scraper - Extract place names and images from any URL
 * 
 * Usage:
 *   import { scrapeUrl } from './utils/url-scraper';
 *   const data = await scrapeUrl('https://example.com/places');
 */

import { chromium, Browser, Page } from 'playwright';
import { logger } from './logger';

export interface ScrapedPlace {
  name: string;
  url: string;
  image: string;
  description?: string;
  additionalImages?: string[];
}

export class UrlScraper {
  private browser: Browser | null = null;

  /**
   * Initialize browser
   */
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    logger.info('Browser initialized for URL scraping');
  }

  /**
   * Scrape a URL to extract place names and images
   */
  async scrapeUrl(url: string): Promise<ScrapedPlace[]> {
    const results: ScrapedPlace[] = [];
    let page: any = null;
    
    try {
      await this.initialize();
      page = await this.browser!.newPage();

      console.log(`\n🌐 Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', // Changed from networkidle for faster loading
        timeout: 60000 
      });

      // Wait for content to load
      await page.waitForTimeout(2000);
      console.log('✅ Page loaded successfully');

      // Extract places with images
      console.log('\n🔍 Extracting places and images...\n');
      const places = await page.evaluate(() => {
        const extracted: any[] = [];

        // Strategy 1: Find articles/cards with images and headings
        const containers = document.querySelectorAll('article, [class*="card"], [class*="item"], [class*="place"]');
        
        containers.forEach((container, index) => {
          if (index >= 50) return; // Limit to 50 items

          const heading = container.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
          const img = container.querySelector('img');
          const link = container.querySelector('a') || (container.closest('a'));
          const description = container.querySelector('p, [class*="description"], [class*="excerpt"]');

          if (heading && img) {
            // Get all images in this container
            const allImages = Array.from(container.querySelectorAll('img')).map(
              i => i.getAttribute('src') || i.getAttribute('data-src') || ''
            ).filter(Boolean);

            extracted.push({
              name: heading.textContent?.trim() || '',
              url: link?.getAttribute('href') || window.location.href,
              image: img.getAttribute('src') || img.getAttribute('data-src') || '',
              description: description?.textContent?.trim() || '',
              additionalImages: allImages.slice(1) // All images except the first
            });
          }
        });

        // Strategy 2: If no results, find all images with nearby text
        if (extracted.length === 0) {
          const allImages = document.querySelectorAll('img');
          
          allImages.forEach((img, index) => {
            if (index >= 30) return;

            // Get alt text or nearby heading
            const alt = img.getAttribute('alt') || '';
            const parent = img.closest('div, article, section, li');
            const nearbyHeading = parent?.querySelector('h1, h2, h3, h4, h5, h6');
            const nearbyLink = parent?.querySelector('a') || img.closest('a');
            
            const name = alt || nearbyHeading?.textContent?.trim() || `Place ${index + 1}`;
            
            if (name && name.length > 3) {
              extracted.push({
                name,
                url: nearbyLink?.getAttribute('href') || window.location.href,
                image: img.getAttribute('src') || img.getAttribute('data-src') || '',
                description: '',
                additionalImages: []
              });
            }
          });
        }

        return extracted;
      });

      console.log(`📦 Found ${places.length} potential places`);

      // Process and clean results
      for (const place of places) {
        // Make URLs absolute
        const absoluteUrl = place.url.startsWith('http') 
          ? place.url 
          : new URL(place.url, url).href;

        const absoluteImage = place.image.startsWith('http')
          ? place.image
          : place.image.startsWith('//')
          ? `https:${place.image}`
          : new URL(place.image, url).href;

        results.push({
          name: place.name,
          url: absoluteUrl,
          image: absoluteImage,
          description: place.description,
          additionalImages: place.additionalImages
            .map((img: string) => {
              if (img.startsWith('http')) return img;
              if (img.startsWith('//')) return `https:${img}`;
              try {
                return new URL(img, url).href;
              } catch {
                return '';
              }
            })
            .filter(Boolean)
        });
      }

      console.log(`✅ Successfully extracted ${results.length} places with images\n`);

      // Log detailed results
      if (results.length > 0) {
        console.log('📋 Extracted Details:');
        console.log('─'.repeat(70));
        
        results.slice(0, 5).forEach((place, index) => {
          console.log(`\n${index + 1}. 📍 ${place.name}`);
          console.log(`   🖼️  Image: ${place.image.substring(0, 60)}${place.image.length > 60 ? '...' : ''}`);
          console.log(`   🔗 URL: ${place.url.substring(0, 60)}${place.url.length > 60 ? '...' : ''}`);
          if (place.description) {
            console.log(`   📝 Description: ${place.description.substring(0, 80)}${place.description.length > 80 ? '...' : ''}`);
          }
          if (place.additionalImages && place.additionalImages.length > 0) {
            console.log(`   🎨 Additional Images: ${place.additionalImages.length}`);
          }
        });
        
        if (results.length > 5) {
          console.log(`\n... and ${results.length - 5} more places`);
        }
        console.log('\n' + '─'.repeat(70));
      }

      logger.info(`✅ Scraped ${results.length} places from ${url}`);

      // Log sample results to file
      if (results.length > 0) {
        logger.info('📝 Sample scraped places:', {
          total: results.length,
          sample: results.slice(0, 3).map(r => ({
            name: r.name,
            hasImage: !!r.image,
            imageCount: (r.additionalImages?.length || 0) + 1
          }))
        });
      }

      await page.close();
      return results;

    } catch (error: any) {
      logger.error('Failed to scrape URL:', { url, error: error.message });
      if (page) await page.close();
      return results;
    }
  }

  /**
   * Scrape multiple URLs
   */
  async scrapeMultipleUrls(urls: string[]): Promise<Map<string, ScrapedPlace[]>> {
    const results = new Map<string, ScrapedPlace[]>();

    for (const url of urls) {
      try {
        const places = await this.scrapeUrl(url);
        results.set(url, places);
      } catch (error: any) {
        logger.error(`Failed to scrape ${url}:`, error.message);
        results.set(url, []);
      }
    }

    return results;
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
}

/**
 * Helper function to scrape a single URL
 */
export async function scrapeUrl(url: string): Promise<ScrapedPlace[]> {
  const scraper = new UrlScraper();
  try {
    const results = await scraper.scrapeUrl(url);
    await scraper.cleanup();
    return results;
  } catch (error) {
    await scraper.cleanup();
    throw error;
  }
}

/**
 * Helper function to scrape multiple URLs
 */
export async function scrapeUrls(urls: string[]): Promise<Map<string, ScrapedPlace[]>> {
  const scraper = new UrlScraper();
  try {
    const results = await scraper.scrapeMultipleUrls(urls);
    await scraper.cleanup();
    return results;
  } catch (error) {
    await scraper.cleanup();
    throw error;
  }
}
