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
    this.llm = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1500,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    this.embeddings = new OpenAIEmbeddings({
      modelName: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    this.redis = dbManager.getRedis();
    this.weaviate = dbManager.getWeaviate();
  }

  /**
   * Step 1: Extract entities from natural language query
   */
  async extractEntities(query: string): Promise<QueryEntities> {
    const startTime = Date.now();

    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        logger.warn('OpenAI API key not configured, using fallback entity extraction');
        return this.fallbackEntityExtraction(query);
      }

      logger.info('🤖 AI Entity Extraction - Input', { 
        query,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
      });

      const extractionPrompt = PromptTemplate.fromTemplate(`
You are a travel query analyzer. Extract structured entities from the user's query.

Query: {query}

Return ONLY a valid JSON object with these fields:
- city: string (city name)
- country: string (country name if mentioned, otherwise infer from city)
- month: string (month name if mentioned)
- year: number (year if mentioned, otherwise current year: 2025)
- interests: string[] (categories like "culture", "food", "adventure", "history", "nature")
- eventType: string[] (types like "festival", "attraction", "nightlife", "museum")
- duration: number (days if mentioned, otherwise null)

Examples:
Query: "Delhi in October"
Output: {{"city": "Delhi", "country": "India", "month": "October", "year": 2025, "interests": [], "eventType": [], "duration": null}}

Query: "Best food festivals in Paris during spring"
Output: {{"city": "Paris", "country": "France", "month": "March", "year": 2025, "interests": ["food"], "eventType": ["festival"], "duration": null}}

Query: "3 day trip to Tokyo for history lovers"
Output: {{"city": "Tokyo", "country": "Japan", "month": null, "year": 2025, "interests": ["history"], "eventType": [], "duration": 3}}

Now extract from: {query}
`);

      const extractionChain = RunnableSequence.from([
        extractionPrompt,
        this.llm,
        new JsonOutputParser<QueryEntities>()
      ]);

      const entities = await extractionChain.invoke({ query });

      logger.info('✅ AI Entity Extraction - Output', {
        query,
        entities,
        duration: Date.now() - startTime
      });

      return entities;
    } catch (error) {
      logger.error('Entity extraction failed, using fallback:', error);
      return this.fallbackEntityExtraction(query);
    }
  }

  /**
   * Fallback entity extraction using simple regex patterns
   */
  private fallbackEntityExtraction(query: string): QueryEntities {
    const lowerQuery = query.toLowerCase();
    
    // Common city mappings
    const cityMappings: Record<string, { city: string; country: string }> = {
      'delhi': { city: 'Delhi', country: 'India' },
      'mumbai': { city: 'Mumbai', country: 'India' },
      'bangalore': { city: 'Bangalore', country: 'India' },
      'paris': { city: 'Paris', country: 'France' },
      'london': { city: 'London', country: 'United Kingdom' },
      'tokyo': { city: 'Tokyo', country: 'Japan' },
      'new york': { city: 'New York', country: 'United States' },
      'bali': { city: 'Bali', country: 'Indonesia' },
      'rome': { city: 'Rome', country: 'Italy' },
      'barcelona': { city: 'Barcelona', country: 'Spain' },
    };

    // Extract city
    let city = '';
    let country = '';
    for (const [key, value] of Object.entries(cityMappings)) {
      if (lowerQuery.includes(key)) {
        city = value.city;
        country = value.country;
        break;
      }
    }

    // Extract month
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    let month: string | null = null;
    for (const m of months) {
      if (lowerQuery.includes(m)) {
        month = m.charAt(0).toUpperCase() + m.slice(1);
        break;
      }
    }

    // Extract interests
    const interests: string[] = [];
    if (lowerQuery.includes('food') || lowerQuery.includes('culinary')) interests.push('food');
    if (lowerQuery.includes('culture') || lowerQuery.includes('cultural')) interests.push('culture');
    if (lowerQuery.includes('history') || lowerQuery.includes('historical')) interests.push('history');
    if (lowerQuery.includes('adventure') || lowerQuery.includes('outdoor')) interests.push('adventure');
    if (lowerQuery.includes('nature') || lowerQuery.includes('beach')) interests.push('nature');
    if (lowerQuery.includes('art') || lowerQuery.includes('museum')) interests.push('art');

    // Extract event types
    const eventType: string[] = [];
    if (lowerQuery.includes('festival')) eventType.push('festival');
    if (lowerQuery.includes('attraction') || lowerQuery.includes('monument')) eventType.push('attraction');
    if (lowerQuery.includes('event')) eventType.push('event');
    if (lowerQuery.includes('museum')) eventType.push('museum');

    // Extract duration
    const durationMatch = lowerQuery.match(/(\d+)\s*(day|days)/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : null;

    const entities: QueryEntities = {
      city: city || 'Delhi',
      country: country || 'India',
      month: month || undefined,
      year: 2025,
      interests,
      eventType,
      duration: duration || undefined
    };

    logger.info('📝 Fallback Entity Extraction - Output', { query, entities });
    return entities;
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
   * Step 4: Generate embeddings for semantic search
   */
  async embedQuery(query: string): Promise<number[]> {
    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        logger.warn('⚠️ OpenAI API key not configured, using zero vector (skipping semantic search)');
        // Return a zero vector (will skip vector search)
        return new Array(1536).fill(0);
      }

      logger.info('🔢 Generating embeddings', { 
        query: query.substring(0, 100),
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
      });

      const result = await this.embeddings.embedQuery(query);
      
      logger.info('✅ Embeddings generated', { 
        vectorLength: result.length,
        sampleValues: result.slice(0, 5)
      });
      
      return result;
    } catch (error) {
      logger.error('❌ Embedding generation failed, using zero vector:', error);
      return new Array(1536).fill(0);
    }
  }

  /**
   * Step 5: Hybrid search (Vector + Keyword + Filters)
   */
  async retrieveRelevantContent(
    entities: QueryEntities,
    embeddings: number[]
  ): Promise<StructuredData[]> {
    const startTime = Date.now();

    try {
      // Vector search in Weaviate
      const vectorResults = await this.vectorSearch(entities, embeddings);

      // Keyword search in MongoDB
      const keywordResults = await this.keywordSearch(entities);

      // Merge and deduplicate
      const merged = this.mergeResults(vectorResults, keywordResults);

      logger.info('📊 Content Retrieved', {
        vectorCount: vectorResults.length,
        keywordCount: keywordResults.length,
        mergedCount: merged.length,
        duration: Date.now() - startTime,
        types: merged.reduce((acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      return merged;
    } catch (error) {
      logger.error('Content retrieval failed:', error);
      throw new Error('Failed to retrieve content');
    }
  }

  /**
   * Vector search using Weaviate
   */
  private async vectorSearch(
    entities: QueryEntities,
    embeddings: number[]
  ): Promise<StructuredData[]> {
    try {
      const whereFilter: any = {
        operator: 'And',
        operands: [
          {
            path: ['city'],
            operator: 'Equal',
            valueString: entities.city
          }
        ]
      };

      // Add date filter if month is specified
      if (entities.month && entities.year) {
        const monthNum = new Date(`${entities.month} 1, ${entities.year}`).getMonth() + 1;
        const startDate = new Date(entities.year, monthNum - 1, 1);
        const endDate = new Date(entities.year, monthNum, 0);

        whereFilter.operands.push({
          path: ['startDate'],
          operator: 'GreaterThanEqual',
          valueDate: startDate.toISOString()
        });
        whereFilter.operands.push({
          path: ['endDate'],
          operator: 'LessThanEqual',
          valueDate: endDate.toISOString()
        });
      }

      const result = await this.weaviate.graphql
        .get()
        .withClassName('TravelContent')
        .withFields('title description city country type category tags popularity sourceUrl mongoId')
        .withNearVector({ vector: embeddings })
        .withWhere(whereFilter)
        .withLimit(30)
        .do();

      const items = result.data?.Get?.TravelContent || [];

      // Fetch full documents from MongoDB
      const mongoIds = items.map((item: any) => item.mongoId);
      const documents = await Place.find({ _id: { $in: mongoIds } }).lean();

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
      logger.error('Vector search failed:', error);
      return [];
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

      // Add interests filter
      if (entities.interests.length > 0) {
        query['metadata.category'] = { $in: entities.interests };
      }

      // Add event type filter
      if (entities.eventType.length > 0) {
        query.type = { $in: entities.eventType };
      }

      const documents = await Place.find(query)
        .sort({ 'metadata.popularity': -1 })
        .limit(30)
        .lean();

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
   * Step 7: Generate summary using LLM
   */
  async summarizeResults(
    query: string,
    documents: StructuredData[]
  ): Promise<Summary> {
    try {
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        logger.warn('⚠️ OpenAI API key not configured, using fallback summary');
        return this.generateFallbackSummary(query, documents);
      }

      const contentForSummary = this.formatDocumentsForSummary(documents.slice(0, 10));
      
      logger.info('🤖 AI Summary Generation - Input', {
        query,
        documentCount: documents.length,
        topDocumentsUsed: 10,
        contentPreview: contentForSummary.substring(0, 200) + '...',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
      });

      const summaryPrompt = PromptTemplate.fromTemplate(`
You are an expert travel writer. Create a compelling summary for the user's query.

Query: {query}

Top Content:
{content}

Return a JSON object with:
- headline: string (catchy, engaging title 5-10 words)
- overview: string (compelling 2-3 sentence description)
- highlights: string[] (5 top must-see/do items)
- bestTime: string (optional, best time to visit)
- tips: string[] (3-5 local insights and practical tips)

Make it engaging, informative, and actionable.
Focus on unique experiences and cultural authenticity.
Use vivid, descriptive language.
`);

      const summaryChain = RunnableSequence.from([
        summaryPrompt,
        this.llm,
        new JsonOutputParser<Summary>()
      ]);

      const summary = await summaryChain.invoke({
        query,
        content: contentForSummary
      });

      logger.info('✅ AI Summary Generation - Output', {
        headline: summary.headline,
        highlightCount: summary.highlights?.length || 0,
        tipCount: summary.tips?.length || 0,
        hasBestTime: !!summary.bestTime
      });

      return summary;
    } catch (error) {
      logger.error('Summarization failed, using fallback:', error);
      return this.generateFallbackSummary(query, documents);
    }
  }

  /**
   * Generate fallback summary without AI
   */
  private generateFallbackSummary(query: string, documents: StructuredData[]): Summary {
    const city = documents[0]?.location.city || 'this destination';
    const festivalCount = documents.filter(d => d.type === 'festival').length;
    const attractionCount = documents.filter(d => d.type === 'attraction').length;
    
    const summary = {
      headline: `Discover ${city}: Your Ultimate Travel Guide`,
      overview: `Explore ${city} with ${documents.length} amazing experiences including ${festivalCount} festivals and ${attractionCount} attractions. Find the perfect blend of culture, history, and adventure in this vibrant destination.`,
      highlights: documents.slice(0, 5).map(d => d.title),
      bestTime: 'Year-round destination with seasonal highlights',
      tips: [
        'Book accommodations in advance during peak season',
        'Try local cuisine and street food',
        'Use public transportation to save money',
        'Respect local customs and traditions',
        'Stay hydrated and carry essentials'
      ]
    };

    logger.info('📝 Fallback Summary Generated', {
      city,
      documentCount: documents.length,
      festivalCount,
      attractionCount
    });

    return summary;
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
        return {
          query,
          entities,
          summary: {
            headline: `No results found for ${entities.city}`,
            overview: 'Try adjusting your search or explore nearby cities.',
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
