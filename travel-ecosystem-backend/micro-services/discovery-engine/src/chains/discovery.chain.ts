// LangChain Discovery Pipeline

import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser, JsonOutputParser } from '@langchain/core/output_parsers';
import { dbManager } from '@/database/connection';
import { Place } from '@/database/models';
import { logger } from '@/utils/logger';
import crypto from 'crypto-js';
import type {
  QueryEntities,
  DiscoveryResponse,
  Summary,
  StructuredData,
  Recommendation
} from '@/types';

export class DiscoveryChain {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;
  private redis;
  private weaviate;

  constructor() {
 


    

  }


  /**
   * Step 2: Generate cache key from entities
   */
  generateCacheKey(entities: QueryEntities): string {
    const normalized = {
      city: entities.city?.toLowerCase(),
      country: entities.country?.toLowerCase(),
      month: entities.month?.toLowerCase(),
      interests: entities.interests?.sort(),
      eventType: entities.eventType?.sort()
    };
    return crypto.SHA256(JSON.stringify(normalized)).toString();
  }

  /**
   * Step 3: Check cache for existing results
   */
  async checkCache(cacheKey: string): Promise<DiscoveryResponse | null> {
    if (process.env.ENABLE_CACHING !== 'true') {
      return null;
    }

    try {
      const cached = await this.redis.get(`query:${cacheKey}:v1`);
      if (cached) {
        logger.info('Cache hit', { cacheKey });
        const result = JSON.parse(cached);
        result.metadata.cached = true;
        return result;
      }
      return null;
    } catch (error) {
      logger.warn('Cache check failed:', error);
      return null;
    }
  }

 
  /**
   * Keyword search using MongoDB
   */
  private async keywordSearch(entities: QueryEntities): Promise<StructuredData[]> {
    try {
      const query: any = {
        'location.city': new RegExp(entities.city, 'i')
      };

      // Add month filter
      if (entities.month && entities.year) {
        const monthNum = new Date(`${entities.month} 1, ${entities.year}`).getMonth() + 1;
        const startDate = new Date(entities.year, monthNum - 1, 1);
        const endDate = new Date(entities.year, monthNum, 0);

        query['dates.start'] = { $gte: startDate };
        query['dates.end'] = { $lte: endDate };
      }

      // Add interests filter - check both interests and categories
      if (entities.interests.length > 0) {
        query.$or = query.$or || [];
        query.$or.push({ 'metadata.category': { $in: entities.interests } });
        query.$or.push({ 'metadata.tags': { $in: entities.interests } });
      }

      // Add event type filter - but make it flexible
      // Don't filter if no specific type, or if it's too restrictive
      if (entities.eventType.length > 0 && entities.eventType.length < 3) {
        // Only apply type filter if it's specific (not too many types)
        const typeQuery = { type: { $in: entities.eventType } };
        if (query.$or) {
          query.$or.push(typeQuery);
        } else {
          query.type = { $in: entities.eventType };
        }
      }

      const documents = await Place.find(query)
        .sort({ 'metadata.popularity': -1 })
        .limit(30)
        .lean();

      // If no results with strict filters, try a broader search with just city
      if (documents.length === 0) {
        logger.info('🔍 No results with filters, trying broader city search', { city: entities.city });
        const broadQuery = {
          'location.city': new RegExp(entities.city, 'i')
        };
        
        const broadDocs = await Place.find(broadQuery)
          .sort({ 'metadata.popularity': -1 })
          .limit(30)
          .lean();
          
        logger.info(`📊 Broad search found ${broadDocs.length} results`, { city: entities.city });
        
        return broadDocs.map((doc: any) => ({
          id: doc._id.toString(),
          type: doc.type,
          title: doc.title,
          description: doc.description,
          location: doc.location,
          dates: doc.dates,
          metadata: doc.metadata,
          media: doc.media,
          source: doc.source,
          confidence: doc.confidence
        }));
      }

      return documents.map((doc: any) => ({
        id: doc._id.toString(),
        type: doc.type,
        title: doc.title,
        description: doc.description,
        location: doc.location,
        dates: doc.dates,
        metadata: doc.metadata,
        media: doc.media,
        source: doc.source,
        confidence: doc.confidence
      }));
    } catch (error) {
      logger.error('Keyword search failed:', error);
      return [];
    }
  }

  /**
   * Fetch real attractions from Google Places API
   */
  private async fetchGooglePlacesData(query: string, entities: QueryEntities): Promise<StructuredData[]> {
    try {
      // Import Google Places service
      const { GooglePlacesService } = await import('@/services/google-places.service');
      const placesService = new GooglePlacesService();

      if (!placesService.isEnabled()) {
        logger.warn('⚠️ Google Places API not enabled');
        return [];
      }

      logger.info('🗺️ Fetching REAL attractions from Google Places', { 
        city: entities.city, 
        country: entities.country 
      });

      // Get categorized attractions
      const attractions = await placesService.getPopularAttractions(
        entities.city,
        entities.country || ''
      );

      // Combine all attraction types
      const allAttractions = [
        ...attractions.monuments,
        ...attractions.museums,
        ...attractions.parks,
        ...attractions.religious
      ];

      if (allAttractions.length === 0) {
        logger.warn('No attractions found from Google Places');
        return [];
      }

      logger.info(`✅ Google Places found ${allAttractions.length} REAL attractions with images & coordinates`);

      // Convert to StructuredData format
      const structuredResults: StructuredData[] = allAttractions.map((place, index) => {
        // Determine category based on types
        const category = this.categorizeGooglePlace(place.types);
        
        return {
          id: `google-places-${place.placeId}`,
          type: 'attraction',
          title: place.name,
          description: place.description,
          location: {
            city: entities.city,
            country: entities.country || '',
            venue: place.address,
            // Convert {lat, lng} to [lng, lat] format
            coordinates: [place.coordinates.lng, place.coordinates.lat] as [number, number]
          },
          metadata: {
            category: [category],
            tags: entities.interests,
            popularity: place.rating ? (place.rating / 5) : 0, // Normalize to 0-1
            cost: undefined,
            duration: undefined,
            openingHours: place.openingHours?.weekday_text?.join(', ')
          },
          media: {
            images: place.photos.length > 0 ? place.photos : [this.getPlaceholderImageUrl('attraction', entities.city)]
          },
          source: {
            url: place.url,
            domain: 'google-places',
            crawledAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          confidence: place.rating ? (place.rating / 5) : 0.8
        } as StructuredData;
      });

      logger.info('✅ Google Places data converted to structured format', { 
        count: structuredResults.length,
        sample: structuredResults.slice(0, 2).map(r => ({ 
          title: r.title,
          coordinates: r.location.coordinates,
          images: r.media.images.length,
          rating: r.metadata.popularity
        }))
      });

      return structuredResults;

    } catch (error: any) {
      logger.error('Failed to fetch Google Places data:', error);
      return [];
    }
  }

  /**
   * Categorize Google Place by its types
   */
  private categorizeGooglePlace(types: string[]): string {
    if (types.includes('museum')) return 'museum';
    if (types.includes('park')) return 'park';
    if (types.includes('place_of_worship')) return 'religious';
    if (types.includes('tourist_attraction')) return 'monument';
    if (types.includes('point_of_interest')) return 'attraction';
    return 'place';
  }


  /**
   * Merge and deduplicate search results
   */
  private mergeResults(
    vectorResults: StructuredData[],
    keywordResults: StructuredData[]
  ): StructuredData[] {
    const seen = new Set<string>();
    const merged: StructuredData[] = [];

    // Add vector results first (higher priority)
    for (const item of vectorResults) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }

    // Add keyword results
    for (const item of keywordResults) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }

    return merged;
  }

  /**
   * Step 6: Rerank results using LLM
   */
  async rerankResults(
    query: string,
    documents: StructuredData[]
  ): Promise<StructuredData[]> {
    if (documents.length <= 10) {
      return documents; // No need to rerank if few results
    }

    try {
      const rerankPrompt = PromptTemplate.fromTemplate(`
You are a travel recommendation expert. Rank these results by relevance to the user's query.

Query: {query}

Documents:
{documents}

Return a JSON array of document IDs in order of relevance (most relevant first).
Consider: temporal match, popularity, uniqueness, cultural significance, and user intent.

Example output: ["doc1", "doc3", "doc2", ...]
`);

      const rerankChain = RunnableSequence.from([
        rerankPrompt,
        this.llm,
        new JsonOutputParser<string[]>()
      ]);

      const rankedIds = await rerankChain.invoke({
        query,
        documents: JSON.stringify(documents.map(d => ({ id: d.id, title: d.title, type: d.type })))
      });

      // Reorder documents based on ranked IDs
      const ordered: StructuredData[] = [];
      for (const id of rankedIds) {
        const doc = documents.find(d => d.id === id);
        if (doc) ordered.push(doc);
      }

      // Add any remaining documents
      for (const doc of documents) {
        if (!ordered.find(d => d.id === doc.id)) {
          ordered.push(doc);
        }
      }

      return ordered;
    } catch (error) {
      logger.warn('Reranking failed, using original order:', error);
      return documents;
    }
  }


  /**
   * Format documents for summary generation
   */
  private formatDocumentsForSummary(documents: StructuredData[]): string {
    return documents.map((doc, idx) =>
      `${idx + 1}. ${doc.title} (${doc.type})\n   ${doc.description.substring(0, 150)}...`
    ).join('\n\n');
  }

  /**
   * Step 8: Categorize results by type
   */
  private categorizeResults(documents: StructuredData[]): {
    festivals: StructuredData[];
    attractions: StructuredData[];
    places: StructuredData[];
    events: StructuredData[];
  } {
    return {
      festivals: documents.filter(d => d.type === 'festival'),
      attractions: documents.filter(d => d.type === 'attraction'),
      places: documents.filter(d => d.type === 'place'),
      events: documents.filter(d => d.type === 'event')
    };
  }

  /**
   * Step 9: Store result in cache
   */
  async cacheResult(cacheKey: string, result: DiscoveryResponse): Promise<void> {
    if (process.env.ENABLE_CACHING !== 'true') {
      return;
    }

    try {
      const ttl = parseInt(process.env.CACHE_TTL_QUERY_RESULT || '3600');
      await this.redis.setex(
        `query:${cacheKey}:v1`,
        ttl,
        JSON.stringify(result)
      );
      logger.info('Result cached', { cacheKey, ttl });
    } catch (error) {
      logger.warn('Failed to cache result:', error);
    }
  }

  /**
   * Master execute method - orchestrates the entire pipeline
   */
  async execute(query: string): Promise<DiscoveryResponse> {
    const startTime = Date.now();

    try {
      logger.info('🚀 Discovery Pipeline Started', { 
        query,
        timestamp: new Date().toISOString(),
        hasOpenAIKey: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here')
      });

      // 1. Extract entities
      logger.info('📍 Step 1/7: Extracting entities from query...');
      const entities = await this.extractEntities(query);

      // 2. Check cache
      logger.info('💾 Step 2/7: Checking cache...');
      const cacheKey = this.generateCacheKey(entities);
      const cached = await this.checkCache(cacheKey);
      if (cached) {
        cached.metadata.processingTime = Date.now() - startTime;
        logger.info('⚡ Cache hit! Returning cached results', { cacheKey });
        return cached;
      }

      // 3. Generate embeddings
      logger.info('🔢 Step 3/7: Generating embeddings...');
      const embeddings = await this.embedQuery(query);

      // 4. Retrieve relevant content
      logger.info('🔍 Step 4/7: Searching for relevant content...');
      const documents = await this.retrieveRelevantContent(entities, embeddings);

      if (documents.length === 0) {
        logger.warn('⚠️ No documents found for query', { query, entities });
        
        // Try to fetch REAL attractions using Google Places first
        logger.info('🗺️ Attempting to fetch REAL attractions from Google Places API...', { query, entities });
        
        const googlePlacesResults = await this.fetchGooglePlacesData(query, entities);
        
        if (googlePlacesResults.length > 0) {
          logger.info('✅ Google Places found REAL attractions with images & coordinates!', { 
            count: googlePlacesResults.length,
            sample: googlePlacesResults.slice(0, 2).map(r => ({
              name: r.title,
              coordinates: r.location.coordinates,
              rating: r.metadata.popularity,
              images: r.media.images.length
            }))
          });
          
          // Use Google Places results to continue the pipeline
          const rankedDocs = await this.rerankResults(query, googlePlacesResults);
          const summary = await this.summarizeResults(query, rankedDocs);
          const categorized = this.categorizeResults(rankedDocs);
          
          const response: DiscoveryResponse = {
            query,
            entities,
            summary,
            results: categorized,
            recommendations: [],
            metadata: {
              totalResults: googlePlacesResults.length,
              processingTime: Date.now() - startTime,
              cached: false,
              sources: ['google-places'],
              generatedAt: new Date().toISOString()
            }
          };

          await this.cacheResult(cacheKey, response);
          
          return response;
        }
        
        // Fallback to Tavily if Google Places fails or not configured
        logger.info('🌐 Google Places not available, trying Tavily for real-time data...', { query, entities });
        
        const tavilyResults = await this.fetchTavilyData(query, entities);
        
        if (tavilyResults.length > 0) {
          logger.info('✅ Tavily found results, using real-time data', { count: tavilyResults.length });
          
          // Use Tavily results to continue the pipeline
          const rankedDocs = await this.rerankResults(query, tavilyResults);
          const summary = await this.summarizeResults(query, rankedDocs);
          const categorized = this.categorizeResults(rankedDocs);
          
          const response: DiscoveryResponse = {
            query,
            entities,
            summary,
            results: categorized,
            recommendations: [],
            metadata: {
              totalResults: tavilyResults.length,
              processingTime: Date.now() - startTime,
              cached: false,
              sources: ['tavily-realtime'],
              generatedAt: new Date().toISOString()
            }
          };
          
          return response;
        }
        
        // If Tavily also returns nothing, return empty response
        return {
          query,
          entities,
          summary: {
            headline: `No results found for ${entities.city}`,
            overview: 'Try adjusting your search or explore nearby cities. We are continuously adding new destinations.',
            highlights: []
          },
          results: { festivals: [], attractions: [], places: [], events: [] },
          recommendations: [],
          metadata: {
            totalResults: 0,
            processingTime: Date.now() - startTime,
            cached: false,
            sources: [],
            generatedAt: new Date().toISOString()
          }
        };
      }

      // 5. Rerank results
      logger.info('🎯 Step 5/7: Reranking results...');
      const rankedDocs = await this.rerankResults(query, documents);

      // 6. Generate summary
      logger.info('✍️ Step 6/7: Generating summary...');
      const summary = await this.summarizeResults(query, rankedDocs);

      // 7. Categorize results
      logger.info('📂 Step 7/7: Categorizing results...');
      const categorized = this.categorizeResults(rankedDocs);

      // 8. Build response
      const response: DiscoveryResponse = {
        query,
        entities,
        summary,
        results: categorized,
        recommendations: [], // Will be populated by graph layer
        metadata: {
          totalResults: documents.length,
          processingTime: Date.now() - startTime,
          cached: false,
          sources: [...new Set(documents.map(d => d.source.domain))],
          generatedAt: new Date().toISOString()
        }
      };

      // 9. Cache result
      await this.cacheResult(cacheKey, response);

      logger.info('✅ Discovery Pipeline Completed Successfully', {
        query,
        totalResults: documents.length,
        festivals: categorized.festivals.length,
        attractions: categorized.attractions.length,
        places: categorized.places.length,
        events: categorized.events.length,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      logger.error('Discovery pipeline failed:', error);
      throw error;
    }
  }
}
