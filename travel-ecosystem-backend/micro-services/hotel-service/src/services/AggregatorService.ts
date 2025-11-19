import type { Hotel, HotelSearchQuery, PaginatedHotelResponse } from '../domain/Hotel.js';
import type { IHotelProvider } from '../providers/IHotelProvider.js';
import { NormalizerService } from './NormalizerService.js';
import { DeduplicatorService } from './DeduplicatorService.js';
import { RankingService } from './RankingService.js';
import { PaginationService } from './PaginationService.js';

/**
 * Hotel Aggregation Service (SOLID: Single Responsibility)
 * 
 * Orchestrates the entire hotel search workflow:
 * 1. Fetch from multiple providers in parallel
 * 2. Normalize each provider's results
 * 3. Merge all results
 * 4. Remove duplicates
 * 5. Rank by price and rating
 * 6. Paginate results
 * 
 * This is the main business logic coordinator.
 * 
 * 🚀 SCALABILITY NOTES:
 * - In production, this service would be enhanced with:
 *   - Worker queue system (Bull/BullMQ) for distributed fetching
 *   - Redis caching layer (cache search results for 5-15 minutes)
 *   - Circuit breaker per provider (using Hystrix or similar)
 *   - Rate limiting per provider
 *   - Timeout handling with graceful degradation
 *   - Fallback to cached data if providers fail
 *   - Monitoring and alerting (DataDog, New Relic)
 *   - Request tracing (OpenTelemetry)
 *   - Error budgets and SLA tracking
 *   - Progressive results (return as providers respond)
 *   - Server-Sent Events (SSE) for streaming results
 *   - ElasticSearch for advanced filtering and search
 * 
 * Example production architecture:
 * ```
 * User Request
 *    ↓
 * API Gateway (rate limiting, auth)
 *    ↓
 * Redis Cache (check cache first)
 *    ↓ (cache miss)
 * Aggregator Service
 *    ↓
 * Message Queue (Kafka/Redis) → Provider Workers (100+ providers)
 *    ↓
 * Results Stream → Normalize → Dedupe → Rank
 *    ↓
 * Redis Cache (store results)
 *    ↓
 * ElasticSearch (index for filtering)
 *    ↓
 * Return to User
 * ```
 */
export class AggregatorService {
  private readonly providers: IHotelProvider[];
  private readonly normalizer: NormalizerService;
  private readonly deduplicator: DeduplicatorService;
  private readonly ranker: RankingService;
  private readonly paginator: PaginationService;

  constructor(providers: IHotelProvider[]) {
    this.providers = providers;
    this.normalizer = new NormalizerService();
    this.deduplicator = new DeduplicatorService();
    this.ranker = new RankingService();
    this.paginator = new PaginationService();
  }

  /**
   * Main aggregation method
   * 
   * @param query - User's search parameters
   * @returns Paginated, ranked, deduplicated hotel results
   */
  async search(query: HotelSearchQuery): Promise<PaginatedHotelResponse> {
    try {
      // Step 1: Fetch from all providers in parallel (FAST!)
      console.log(`🔍 Fetching hotels from ${this.providers.length} providers...`);
      const providerResults = await this.fetchFromProviders(query);

      // Step 2: Normalize results from each provider
      console.log('🔄 Normalizing results...');
      const normalizedResults = this.normalizeResults(providerResults);

      // Step 3: Merge all results into a single array
      console.log('🔗 Merging results...');
      const mergedResults = this.mergeResults(normalizedResults);
      console.log(`📊 Total hotels before deduplication: ${mergedResults.length}`);

      // Step 4: Remove duplicates
      console.log('🗑️  Removing duplicates...');
      const deduplicatedResults = this.deduplicator.deduplicate(mergedResults);
      console.log(`📊 Total hotels after deduplication: ${deduplicatedResults.length}`);

      // Step 5: Rank by price (ASC) and rating (DESC)
      console.log('📈 Ranking results...');
      const rankedResults = this.ranker.rank(deduplicatedResults);

      // Step 6: Paginate results
      console.log('📄 Paginating results...');
      const paginatedResults = this.paginator.paginate(
        rankedResults,
        query.cursor,
        query.limit
      );

      console.log(`✅ Returning ${paginatedResults.hotels.length} hotels (page)`);
      return paginatedResults;

    } catch (error) {
      console.error('❌ Error in aggregation service:', error);
      
      // In production, we'd return cached results or partial results
      // For MVP, we return empty results
      return {
        hotels: [],
        cursor: 0,
        hasMore: false,
        total: 0,
      };
    }
  }

  /**
   * Fetch hotels from all providers in parallel
   * Uses Promise.allSettled to continue even if some providers fail
   */
  private async fetchFromProviders(
    query: HotelSearchQuery
  ): Promise<Array<{ provider: string; hotels: Hotel[] }>> {
    // Parallel fetch (Promise.allSettled allows graceful failure)
    const results = await Promise.allSettled(
      this.providers.map(async (provider) => {
        try {
          const startTime = Date.now();
          const hotels = await provider.search(query);
          const duration = Date.now() - startTime;
          
          console.log(
            `  ✓ ${provider.getName()}: ${hotels.length} hotels (${duration}ms)`
          );

          return {
            provider: provider.getName(),
            hotels,
          };
        } catch (error) {
          console.error(`  ✗ ${provider.getName()} failed:`, error);
          return {
            provider: provider.getName(),
            hotels: [],
          };
        }
      })
    );

    // Extract successful results
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  }

  /**
   * Normalize results from each provider
   */
  private normalizeResults(
    providerResults: Array<{ provider: string; hotels: Hotel[] }>
  ): Array<{ provider: string; hotels: Hotel[] }> {
    return providerResults.map(({ provider, hotels }) => ({
      provider,
      hotels: this.normalizer.normalize(hotels, provider),
    }));
  }

  /**
   * Merge results from all providers into a single array
   */
  private mergeResults(
    normalizedResults: Array<{ provider: string; hotels: Hotel[] }>
  ): Hotel[] {
    return normalizedResults.flatMap(({ hotels }) => hotels);
  }

  /**
   * Future: Fetch providers using a worker queue (Kafka/Redis)
   * 
   * async fetchFromProvidersDistributed(query: HotelSearchQuery): Promise<Hotel[]> {
   *   const correlationId = uuid();
   *   
   *   // Publish search request to queue
   *   await this.queue.publish('hotel.search.requests', {
   *     correlationId,
   *     query,
   *     providers: this.providers.map(p => p.getName())
   *   });
   *   
   *   // Wait for results with timeout
   *   const results = await this.queue.subscribe(
   *     `hotel.search.results.${correlationId}`,
   *     { timeout: 5000 }
   *   );
   *   
   *   return results;
   * }
   */

  /**
   * Future: Cache search results in Redis
   * 
   * async getCachedResults(query: HotelSearchQuery): Promise<PaginatedHotelResponse | null> {
   *   const cacheKey = this.generateCacheKey(query);
   *   const cached = await this.redis.get(cacheKey);
   *   
   *   if (cached) {
   *     console.log('🎯 Cache hit!');
   *     return JSON.parse(cached);
   *   }
   *   
   *   return null;
   * }
   * 
   * async setCachedResults(query: HotelSearchQuery, results: PaginatedHotelResponse): Promise<void> {
   *   const cacheKey = this.generateCacheKey(query);
   *   await this.redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 min TTL
   * }
   */

  /**
   * Future: Stream results as they arrive (Server-Sent Events)
   * 
   * async *searchStreaming(query: HotelSearchQuery): AsyncGenerator<Hotel[]> {
   *   for (const provider of this.providers) {
   *     try {
   *       const hotels = await provider.search(query);
   *       const normalized = this.normalizer.normalize(hotels, provider.getName());
   *       yield normalized;
   *     } catch (error) {
   *       console.error(`Provider ${provider.getName()} failed:`, error);
   *     }
   *   }
   * }
   */

  /**
   * Future: Circuit breaker per provider
   * 
   * async fetchWithCircuitBreaker(provider: IHotelProvider, query: HotelSearchQuery): Promise<Hotel[]> {
   *   const breaker = this.circuitBreakers.get(provider.getName());
   *   
   *   if (breaker.isOpen()) {
   *     console.log(`⚡ Circuit breaker open for ${provider.getName()}, using fallback`);
   *     return this.getFallbackResults(query);
   *   }
   *   
   *   try {
   *     const results = await breaker.execute(() => provider.search(query));
   *     breaker.recordSuccess();
   *     return results;
   *   } catch (error) {
   *     breaker.recordFailure();
   *     throw error;
   *   }
   * }
   */
}
