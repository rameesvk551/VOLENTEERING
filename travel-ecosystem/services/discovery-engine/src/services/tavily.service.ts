/**
 * Tavily AI Search Service
 * Real-time web search for travel information
 */

import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
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
}

export class TavilyService {
  private searchTool: TavilySearchResults | null = null;
  private enabled: boolean = false;

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

      const results = await this.searchTool.invoke(query);
      
      // Parse the results (Tavily returns a string with JSON)
      const parsedResults: TavilySearchResult[] = typeof results === 'string' 
        ? JSON.parse(results) 
        : results;

      // Transform to our format
      const travelResults: TravelSearchResult[] = parsedResults.map(result => ({
        name: result.title,
        description: result.content,
        url: result.url,
        source: 'tavily',
        relevanceScore: result.score || 0.5,
        category: this.inferCategory(result.title, result.content)
      }));

      logger.info('Tavily search completed', {
        query,
        resultsCount: travelResults.length
      });

      return travelResults;

    } catch (error: any) {
      logger.error('Tavily search failed:', {
        query,
        error: error.message
      });
      return [];
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
