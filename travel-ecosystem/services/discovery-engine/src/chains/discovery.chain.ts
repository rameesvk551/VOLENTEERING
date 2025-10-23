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

      logger.info('Entities extracted', {
        query,
        entities,
        duration: Date.now() - startTime
      });

      return entities;
    } catch (error) {
      logger.error('Entity extraction failed:', error);
      throw new Error('Failed to extract entities from query');
    }
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
      const result = await this.embeddings.embedQuery(query);
      return result;
    } catch (error) {
      logger.error('Embedding generation failed:', error);
      throw new Error('Failed to generate embeddings');
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

      logger.info('Content retrieved', {
        vectorCount: vectorResults.length,
        keywordCount: keywordResults.length,
        mergedCount: merged.length,
        duration: Date.now() - startTime
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
        content: this.formatDocumentsForSummary(documents.slice(0, 10))
      });

      return summary;
    } catch (error) {
      logger.error('Summarization failed:', error);
      return {
        headline: `Discover ${documents[0]?.location.city || 'Amazing Places'}`,
        overview: `Explore the best experiences and attractions.`,
        highlights: documents.slice(0, 5).map(d => d.title)
      };
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
      logger.info('Discovery pipeline started', { query });

      // 1. Extract entities
      const entities = await this.extractEntities(query);

      // 2. Check cache
      const cacheKey = this.generateCacheKey(entities);
      const cached = await this.checkCache(cacheKey);
      if (cached) {
        cached.metadata.processingTime = Date.now() - startTime;
        return cached;
      }

      // 3. Generate embeddings
      const embeddings = await this.embedQuery(query);

      // 4. Retrieve relevant content
      const documents = await this.retrieveRelevantContent(entities, embeddings);

      if (documents.length === 0) {
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
      const rankedDocs = await this.rerankResults(query, documents);

      // 6. Generate summary
      const summary = await this.summarizeResults(query, rankedDocs);

      // 7. Categorize results
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

      logger.info('Discovery pipeline completed', {
        query,
        resultCount: documents.length,
        duration: Date.now() - startTime
      });

      return response;
    } catch (error) {
      logger.error('Discovery pipeline failed:', error);
      throw error;
    }
  }
}
