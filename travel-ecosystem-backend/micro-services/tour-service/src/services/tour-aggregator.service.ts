import CircuitBreaker from 'opossum';
import { ITourProvider, ProviderResponse } from '../adapters/base-provider.adapter.js';
import { Tour, TourSearchQuery, TourSearchResponse } from '../models/tour.model.js';
import { GetYourGuideAdapter } from '../adapters/getyourguide.adapter.js';
import { ViatorAdapter } from '../adapters/viator.adapter.js';
import { KlookAdapter } from '../adapters/klook.adapter.js';
import { CacheService } from './cache.service.js';
import { AnalyticsService } from './analytics.service.js';
import { 
  POPULARITY_RATING_WEIGHT, 
  POPULARITY_REVIEW_WEIGHT, 
  MAX_REVIEW_COUNT_FOR_NORMALIZATION 
} from '../config/constants.js';

/**
 * Tour Aggregator Service
 * Orchestrates multiple tour providers, handles failover, and aggregates results
 */
export class TourAggregatorService {
  private providers: Map<string, ITourProvider> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private cacheService: CacheService;
  private analyticsService: AnalyticsService;

  constructor(cacheService: CacheService, analyticsService: AnalyticsService) {
    this.cacheService = cacheService;
    this.analyticsService = analyticsService;
    this.initializeProviders();
  }

  /**
   * Initialize all tour providers
   */
  private initializeProviders(): void {
    // GetYourGuide
    const gygAdapter = new GetYourGuideAdapter(
      process.env.GETYOURGUIDE_API_KEY,
      process.env.GETYOURGUIDE_API_URL,
      process.env.GETYOURGUIDE_AFFILIATE_ID
    );
    this.providers.set('getyourguide', gygAdapter);
    this.setupCircuitBreaker('getyourguide', gygAdapter);

    // Viator
    const viatorAdapter = new ViatorAdapter(
      process.env.VIATOR_API_KEY,
      process.env.VIATOR_API_URL,
      process.env.VIATOR_AFFILIATE_ID
    );
    this.providers.set('viator', viatorAdapter);
    this.setupCircuitBreaker('viator', viatorAdapter);

    // Klook (future-ready)
    const klookAdapter = new KlookAdapter(
      process.env.KLOOK_API_KEY,
      process.env.KLOOK_API_URL,
      process.env.KLOOK_AFFILIATE_ID
    );
    this.providers.set('klook', klookAdapter);
    this.setupCircuitBreaker('klook', klookAdapter);
  }

  /**
   * Setup circuit breaker for a provider
   */
  private setupCircuitBreaker(providerId: string, provider: ITourProvider): void {
    const options = {
      timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '5000'),
      errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD || '50'),
      resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000')
    };

    const breaker = new CircuitBreaker(
      async (query: TourSearchQuery) => provider.search(query),
      options
    );

    // Circuit breaker event handlers
    breaker.on('open', () => {
      console.warn(`[Circuit Breaker] ${providerId} circuit opened - failing fast`);
    });

    breaker.on('halfOpen', () => {
      console.log(`[Circuit Breaker] ${providerId} circuit half-open - testing`);
    });

    breaker.on('close', () => {
      console.log(`[Circuit Breaker] ${providerId} circuit closed - normal operation`);
    });

    this.circuitBreakers.set(providerId, breaker);
  }

  /**
   * Search tours across all providers
   */
  async search(query: TourSearchQuery, userId?: string): Promise<TourSearchResponse> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.cacheService.generateSearchCacheKey(query);
    const cachedResult = this.cacheService.get<TourSearchResponse>(cacheKey);
    
    if (cachedResult) {
      console.log('[Cache] Search cache hit');
      
      // Track analytics
      this.analyticsService.trackEvent({
        eventType: 'search',
        timestamp: new Date(),
        userId,
        metadata: { query, cacheHit: true }
      });

      return {
        ...cachedResult,
        metadata: {
          ...cachedResult.metadata,
          cacheHit: true,
          responseTime: Date.now() - startTime
        }
      };
    }

    console.log('[Cache] Search cache miss - querying providers');

    // Query all providers in parallel
    const providerResults = await this.queryAllProviders(query);

    // Aggregate and deduplicate results
    const aggregatedTours = this.aggregateResults(providerResults);

    // Rank and sort
    const rankedTours = this.rankAndSort(aggregatedTours, query);

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const paginatedTours = rankedTours.slice(offset, offset + limit);

    // Build response
    const response: TourSearchResponse = {
      success: true,
      data: {
        tours: paginatedTours,
        total: rankedTours.length,
        limit,
        offset,
        aggregations: this.buildAggregations(rankedTours)
      },
      metadata: {
        searchQuery: query,
        providersQueried: Array.from(this.providers.keys()),
        providersSucceeded: providerResults.filter(r => r.success).map(r => r.provider),
        providersFailed: providerResults.filter(r => !r.success).map(r => r.provider),
        cacheHit: false,
        responseTime: Date.now() - startTime
      }
    };

    // Cache the response
    this.cacheService.set(cacheKey, response, 'search');

    // Track analytics
    this.analyticsService.trackEvent({
      eventType: 'search',
      timestamp: new Date(),
      userId,
      metadata: { 
        query, 
        resultsCount: rankedTours.length,
        cacheHit: false,
        responseTime: response.metadata.responseTime
      }
    });

    return response;
  }

  /**
   * Query all providers in parallel with circuit breaker protection
   */
  private async queryAllProviders(query: TourSearchQuery): Promise<ProviderResponse<Tour[]>[]> {
    const promises = Array.from(this.providers.entries()).map(async ([id, provider]) => {
      const startTime = Date.now();
      const breaker = this.circuitBreakers.get(id);

      try {
        const data = breaker ? await breaker.fire(query) : await provider.search(query);
        
        return {
          success: true,
          data,
          provider: id,
          responseTime: Date.now() - startTime,
          fromCache: false
        } as ProviderResponse<Tour[]>;
      } catch (error: any) {
        console.error(`[Provider Error] ${id}:`, error.message);
        
        return {
          success: false,
          error,
          provider: id,
          responseTime: Date.now() - startTime,
          fromCache: false
        } as ProviderResponse<Tour[]>;
      }
    });

    return Promise.all(promises);
  }

  /**
   * Aggregate results from multiple providers and deduplicate
   */
  private aggregateResults(responses: ProviderResponse<Tour[]>[]): Tour[] {
    const allTours: Tour[] = [];
    const seen = new Set<string>();

    for (const response of responses) {
      if (!response.success || !response.data) continue;

      for (const tour of response.data) {
        // Deduplicate based on title + location similarity
        const dedupKey = this.generateDeduplicationKey(tour);
        
        if (!seen.has(dedupKey)) {
          seen.add(dedupKey);
          allTours.push(tour);
        }
      }
    }

    return allTours;
  }

  /**
   * Generate deduplication key for a tour
   */
  private generateDeduplicationKey(tour: Tour): string {
    const normalized = `${tour.title.toLowerCase().trim()}_${tour.location.city.toLowerCase().trim()}`;
    return normalized.replace(/\s+/g, '_');
  }

  /**
   * Rank and sort tours based on query and popularity
   */
  private rankAndSort(tours: Tour[], query: TourSearchQuery): Tour[] {
    // Calculate popularity score if not present
    tours.forEach(tour => {
      if (!tour.popularityScore) {
        tour.popularityScore = this.calculatePopularityScore(tour);
      }
    });

    // Sort based on query
    const sortBy = query.sortBy || 'popularity';
    const sortOrder = query.sortOrder || 'desc';

    return tours.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.price.amount - b.price.amount;
          break;
        case 'rating':
          comparison = a.rating.average - b.rating.average;
          break;
        case 'duration':
          const aDuration = this.normalizeDuration(a.duration);
          const bDuration = this.normalizeDuration(b.duration);
          comparison = aDuration - bDuration;
          break;
        case 'popularity':
        default:
          comparison = (a.popularityScore || 0) - (b.popularityScore || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Calculate popularity score based on rating and review count
   */
  private calculatePopularityScore(tour: Tour): number {
    const normalizedRating = (tour.rating.average / 5) * 100;
    const normalizedReviews = Math.min((tour.rating.count / MAX_REVIEW_COUNT_FOR_NORMALIZATION) * 100, 100);
    
    return (normalizedRating * POPULARITY_RATING_WEIGHT) + (normalizedReviews * POPULARITY_REVIEW_WEIGHT);
  }

  /**
   * Normalize duration to hours for comparison
   */
  private normalizeDuration(duration: Tour['duration']): number {
    switch (duration.unit) {
      case 'minutes':
        return duration.value / 60;
      case 'days':
        return duration.value * 24;
      case 'hours':
      default:
        return duration.value;
    }
  }

  /**
   * Build aggregations for faceted search
   */
  private buildAggregations(tours: Tour[]) {
    const providers: { [key: string]: number } = {};
    const categories: { [key: string]: number } = {};
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (const tour of tours) {
      // Provider aggregation
      providers[tour.provider.id] = (providers[tour.provider.id] || 0) + 1;

      // Category aggregation
      categories[tour.category.primary] = (categories[tour.category.primary] || 0) + 1;

      // Price range
      minPrice = Math.min(minPrice, tour.price.amount);
      maxPrice = Math.max(maxPrice, tour.price.amount);
    }

    return {
      providers,
      categories,
      priceRange: { min: minPrice, max: maxPrice }
    };
  }

  /**
   * Get tour details from specific provider
   */
  async getTourDetails(providerId: string, productId: string, userId?: string): Promise<Tour | null> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // Check cache
    const cacheKey = `tour_${providerId}_${productId}`;
    const cached = this.cacheService.get<Tour>(cacheKey);
    if (cached) {
      // Track analytics
      this.analyticsService.trackEvent({
        eventType: 'view',
        timestamp: new Date(),
        userId,
        tourId: cached.id,
        provider: providerId,
        metadata: { cacheHit: true }
      });
      return cached;
    }

    // Fetch from provider
    const tour = await provider.getDetails(productId);
    if (tour) {
      this.cacheService.set(cacheKey, tour, 'details');
      
      // Track analytics
      this.analyticsService.trackEvent({
        eventType: 'view',
        timestamp: new Date(),
        userId,
        tourId: tour.id,
        provider: providerId,
        metadata: { cacheHit: false }
      });
    }

    return tour;
  }

  /**
   * Generate redirect URL with tracking
   */
  generateRedirectUrl(
    providerId: string,
    productId: string,
    userId?: string,
    sessionId?: string
  ): { intentId: string; redirectUrl: string } {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const intentId = this.analyticsService.createRedirectIntent(
      userId,
      providerId,
      productId,
      sessionId
    );

    const redirectUrl = provider.generateRedirectUrl(productId, {
      userId,
      intentId,
      sessionId
    });

    // Track redirect event
    this.analyticsService.trackEvent({
      eventType: 'redirect',
      timestamp: new Date(),
      userId,
      provider: providerId,
      metadata: { intentId, productId }
    });

    return { intentId, redirectUrl };
  }
}
