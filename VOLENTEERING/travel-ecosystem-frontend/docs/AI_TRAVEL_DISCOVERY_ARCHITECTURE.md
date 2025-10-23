# AI-Driven Travel Discovery Platform - Complete Architecture

## Executive Summary

An intelligent, self-improving AI-powered travel discovery and recommendation engine that automatically crawls, analyzes, and recommends the best places, festivals, attractions, and events for any city and time period using **LangChain**, **LangGraph**, and modern semantic retrieval techniques.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Trip Planner Micro Frontend (React + TypeScript + Zustand)        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │ │
│  │  │   Discovery  │  │  Trip Plan   │  │  Collab View │            │ │
│  │  │   Search UI  │  │  Management  │  │   & Share    │            │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API / WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Express.js / Fastify API Server                                   │ │
│  │  • Authentication & Rate Limiting                                  │ │
│  │  • Request Validation & Sanitization                              │ │
│  │  • Response Caching (Redis)                                        │ │
│  │  • WebSocket for Real-time Streaming                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│   AI PROCESSING LAYER           │  │   DATA INGESTION LAYER          │
│  ┌───────────────────────────┐  │  │  ┌───────────────────────────┐ │
│  │  LangChain Pipeline       │  │  │  │  Web Crawlers/Scrapers    │ │
│  │  ┌─────────────────────┐  │  │  │  │  • Blog Crawler           │ │
│  │  │ Entity Extraction   │  │  │  │  │  • Event Scraper          │ │
│  │  │ Query Understanding │  │  │  │  │  • Tourism API Fetcher    │ │
│  │  └─────────────────────┘  │  │  │  │  • News Aggregator        │ │
│  │  ┌─────────────────────┐  │  │  │  └───────────────────────────┘ │
│  │  │ Semantic Retrieval  │  │  │  │  ┌───────────────────────────┐ │
│  │  │ Vector Search       │  │  │  │  │  ETL Pipeline             │ │
│  │  └─────────────────────┘  │  │  │  │  • Data Normalization     │ │
│  │  ┌─────────────────────┐  │  │  │  │  • Duplicate Detection    │ │
│  │  │ Summarization       │  │  │  │  │  • Entity Extraction      │ │
│  │  │ Ranking & Scoring   │  │  │  │  │  • Embedding Generation   │ │
│  │  └─────────────────────┘  │  │  │  └───────────────────────────┘ │
│  └───────────────────────────┘  │  └─────────────────────────────────┘
│  ┌───────────────────────────┐  │
│  │  LangGraph Knowledge      │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ Entity Relations    │  │  │
│  │  │ Graph Queries       │  │  │
│  │  │ Path Finding        │  │  │
│  │  │ Recommendations     │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  MongoDB/    │  │   Vector     │  │    Redis     │  │  Message   │ │
│  │  PostgreSQL  │  │   Store      │  │    Cache     │  │   Queue    │ │
│  │              │  │  (Pinecone/  │  │              │  │  (Bull/    │ │
│  │  • Places    │  │   Weaviate/  │  │  • Query     │  │   Kafka)   │ │
│  │  • Events    │  │   FAISS)     │  │    Cache     │  │            │ │
│  │  • Articles  │  │              │  │  • Result    │  │  • Crawl   │ │
│  │  • Crawl Log │  │  • Semantic  │  │    Cache     │  │    Jobs    │ │
│  │              │  │    Search    │  │  • Session   │  │  • ETL     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core System Components

### 1. Data Ingestion Layer

#### 1.1 Web Crawlers & Scrapers

**Purpose:** Automatically discover and extract travel content from multiple sources

**Components:**

```typescript
interface CrawlerConfig {
  source: 'blog' | 'event' | 'tourism' | 'news';
  url: string;
  schedule: string; // Cron expression
  selectors: {
    title: string;
    content: string;
    date: string;
    location: string;
    images: string;
  };
  rateLimit: number; // requests per minute
}
```

**Crawler Targets:**
- **Travel Blogs**: Medium, TripAdvisor blogs, Lonely Planet
- **Event Sites**: Eventbrite, local event calendars, Meetup
- **Tourism Boards**: Official city/country tourism websites
- **News Portals**: Travel sections of major news sites
- **Social Media**: Instagram location tags, Twitter trends (via API)

**Implementation Stack:**
- **Playwright**: Browser automation for dynamic content
- **Cheerio**: Lightweight HTML parsing
- **Sitemap Parser**: Auto-discovery of new URLs
- **Robots.txt Parser**: Respectful crawling

**Example Crawler:**

```typescript
// travel-ecosystem/services/discovery-engine/src/crawlers/base.crawler.ts
class BaseCrawler {
  async crawl(config: CrawlerConfig): Promise<RawData[]> {
    // 1. Fetch URL with rate limiting
    // 2. Parse HTML with selectors
    // 3. Extract structured data
    // 4. Queue for ETL processing
  }
}
```

#### 1.2 ETL Pipeline

**Purpose:** Clean, normalize, and enrich raw crawled data

**Pipeline Stages:**

```typescript
interface ETLStage {
  stage: 'extract' | 'transform' | 'load';
  input: RawData;
  output: StructuredData;
}

// Transform Stage
class DataTransformer {
  async transform(raw: RawData): Promise<StructuredData> {
    // 1. Validate required fields
    // 2. Normalize dates (ISO 8601)
    // 3. Geocode locations (lat/lng)
    // 4. Detect duplicates (fuzzy matching)
    // 5. Extract entities (NER)
    // 6. Generate embeddings
    // 7. Assign confidence scores
    return structuredData;
  }
}
```

**Data Normalization Schema:**

```json
{
  "id": "uuid-v4",
  "type": "festival|attraction|event|place|experience",
  "title": "Dussehra Festival 2025",
  "description": "Major cultural celebration...",
  "location": {
    "city": "Delhi",
    "country": "India",
    "coordinates": [28.6139, 77.2090]
  },
  "dates": {
    "start": "2025-10-10T00:00:00Z",
    "end": "2025-10-20T23:59:59Z",
    "flexible": false
  },
  "metadata": {
    "category": ["cultural", "religious", "outdoor"],
    "tags": ["festival", "traditional", "family-friendly"],
    "popularity": 0.95,
    "cost": "free",
    "duration": "10 days"
  },
  "media": {
    "images": ["https://..."],
    "videos": ["https://..."]
  },
  "source": {
    "url": "https://example.com/dussehra",
    "domain": "example.com",
    "crawledAt": "2025-10-15T10:30:00Z",
    "lastUpdated": "2025-10-15T10:30:00Z"
  },
  "embedding": [0.123, -0.456, ...], // 1536-dim vector
  "confidence": 0.92
}
```

---

### 2. Data Storage Layer

#### 2.1 Structured Database (MongoDB)

**Purpose:** Store normalized, queryable travel data

**Collections:**

```javascript
// Places Collection
{
  _id: ObjectId,
  type: String,
  title: String,
  description: String,
  location: {
    type: "Point",
    coordinates: [lng, lat]
  },
  dates: Object,
  metadata: Object,
  media: Object,
  source: Object,
  createdAt: Date,
  updatedAt: Date,
  searchableText: String // for full-text search
}

// Index Strategy
db.places.createIndex({ "location": "2dsphere" });
db.places.createIndex({ "dates.start": 1, "dates.end": 1 });
db.places.createIndex({ "metadata.category": 1 });
db.places.createIndex({ searchableText: "text" });
db.places.createIndex({ "source.crawledAt": -1 });

// Query Cache Collection
{
  _id: ObjectId,
  queryHash: String, // SHA-256 of normalized query
  query: {
    city: String,
    month: String,
    filters: Object
  },
  results: Array,
  metadata: {
    totalResults: Number,
    processingTime: Number,
    sources: Array
  },
  expiresAt: Date,
  createdAt: Date,
  hitCount: Number
}

// Crawl Logs Collection
{
  _id: ObjectId,
  source: String,
  url: String,
  status: "success|failed|partial",
  itemsExtracted: Number,
  errors: Array,
  duration: Number,
  startedAt: Date,
  completedAt: Date
}
```

#### 2.2 Vector Database

**Purpose:** Semantic similarity search and retrieval

**Options Comparison:**

| Feature | Pinecone | Weaviate | FAISS |
|---------|----------|----------|-------|
| **Hosted** | ✅ Cloud | ✅ Cloud/Self-hosted | ❌ Local only |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cost** | $$ | $ | Free |
| **Metadata Filtering** | ✅ | ✅ | Limited |
| **Setup Complexity** | Low | Medium | High |

**Recommended:** **Weaviate** (balanced cost, features, self-hosting option)

**Schema Design:**

```graphql
# Weaviate Schema
{
  class: "TravelContent",
  vectorizer: "text2vec-openai",
  properties: [
    { name: "title", dataType: ["string"] },
    { name: "description", dataType: ["string"] },
    { name: "city", dataType: ["string"] },
    { name: "country", dataType: ["string"] },
    { name: "type", dataType: ["string"] },
    { name: "startDate", dataType: ["date"] },
    { name: "endDate", dataType: ["date"] },
    { name: "category", dataType: ["string[]"] },
    { name: "tags", dataType: ["string[]"] },
    { name: "popularity", dataType: ["number"] },
    { name: "sourceUrl", dataType: ["string"] },
    { name: "mongoId", dataType: ["string"] } // Reference to MongoDB
  ]
}
```

**Query Example:**

```typescript
// Semantic search: "festivals in Delhi during October"
const results = await weaviateClient.graphql
  .get()
  .withClassName('TravelContent')
  .withNearText({ concepts: ["festivals Delhi October"] })
  .withWhere({
    operator: "And",
    operands: [
      { path: ["city"], operator: "Equal", valueString: "Delhi" },
      { path: ["startDate"], operator: "GreaterThanEqual", valueDate: "2025-10-01" },
      { path: ["endDate"], operator: "LessThanEqual", valueDate: "2025-10-31" }
    ]
  })
  .withLimit(20)
  .do();
```

#### 2.3 Redis Cache Layer

**Purpose:** High-speed query result caching and session management

**Cache Strategy:**

```typescript
interface CacheConfig {
  key: string;
  ttl: number; // seconds
  strategy: 'LRU' | 'LFU' | 'TTL';
}

// Cache Key Patterns
const cacheKeys = {
  queryResult: `query:${queryHash}:v1`,
  entityDetail: `entity:${entityId}:v1`,
  recommendations: `rec:${userId}:${context}:v1`,
  trending: `trending:${city}:${date}:v1`
};

// TTL Strategy
const ttlConfig = {
  queryResult: 3600,        // 1 hour
  entityDetail: 86400,      // 24 hours
  recommendations: 1800,    // 30 minutes
  trending: 7200            // 2 hours
};
```

---

### 3. AI Processing Layer

#### 3.1 LangChain Pipeline Architecture

**Purpose:** Orchestrate AI-powered query understanding, retrieval, and summarization

**Pipeline Flow:**

```
User Query → Entity Extraction → Cache Check → Vector Search →
Reranking → Summarization → Relationship Mapping → Response
```

**Chain Implementation:**

```typescript
// services/discovery-engine/src/chains/discovery.chain.ts

import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

class DiscoveryChain {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini", // Cost-optimized
      temperature: 0.3,
      maxTokens: 1000
    });
  }

  // Step 1: Entity Extraction Chain
  async extractEntities(query: string): Promise<QueryEntities> {
    const extractionPrompt = PromptTemplate.fromTemplate(`
      Extract travel entities from the user query.
      Query: {query}

      Return JSON with:
      - city: string
      - country: string (if mentioned)
      - month: string (if mentioned)
      - year: number (if mentioned, else current year)
      - interests: string[] (categories like culture, food, adventure)
      - eventType: string[] (festival, attraction, nightlife)
      - duration: number (days, if mentioned)

      Examples:
      Query: "Delhi in October"
      Output: {{"city": "Delhi", "country": "India", "month": "October", "year": 2025, "interests": [], "eventType": [], "duration": null}}

      Query: "Best food festivals in Paris during spring"
      Output: {{"city": "Paris", "country": "France", "month": "March", "interests": ["food"], "eventType": ["festival"], "duration": null}}
    `);

    const extractionChain = RunnableSequence.from([
      extractionPrompt,
      this.llm,
      (output) => JSON.parse(output.content as string)
    ]);

    return await extractionChain.invoke({ query });
  }

  // Step 2: Semantic Retrieval Chain
  async retrieveRelevantContent(
    entities: QueryEntities,
    embeddings: number[]
  ): Promise<Document[]> {
    // Hybrid search: Vector + Keyword + Filters
    const vectorResults = await this.vectorSearch(embeddings, entities);
    const keywordResults = await this.keywordSearch(entities);

    // Merge and deduplicate
    return this.mergeResults(vectorResults, keywordResults);
  }

  // Step 3: Reranking Chain
  async rerankResults(
    query: string,
    documents: Document[]
  ): Promise<Document[]> {
    // Use LLM to rerank based on relevance
    const rerankPrompt = PromptTemplate.fromTemplate(`
      Rank these travel recommendations by relevance to the query.
      Query: {query}

      Documents:
      {documents}

      Return array of document IDs in order of relevance.
      Consider: temporal match, popularity, uniqueness, cultural significance.
    `);

    const rerankChain = RunnableSequence.from([
      rerankPrompt,
      this.llm,
      (output) => this.reorderDocuments(output, documents)
    ]);

    return await rerankChain.invoke({
      query,
      documents: JSON.stringify(documents)
    });
  }

  // Step 4: Summarization Chain
  async summarizeResults(
    query: string,
    documents: Document[]
  ): Promise<SummarizedResponse> {
    const summaryPrompt = PromptTemplate.fromTemplate(`
      Create a compelling travel summary for the user.
      Query: {query}

      Content:
      {content}

      Return JSON with:
      - headline: string (catchy title)
      - overview: string (2-3 sentences)
      - highlights: string[] (top 5 must-see items)
      - seasons: object (best time to visit)
      - tips: string[] (local insights)

      Make it engaging, informative, and actionable.
      Focus on unique experiences and cultural authenticity.
    `);

    const summaryChain = RunnableSequence.from([
      summaryPrompt,
      this.llm,
      (output) => JSON.parse(output.content as string)
    ]);

    return await summaryChain.invoke({
      query,
      content: this.formatDocumentsForSummary(documents)
    });
  }

  // Master Chain: Orchestrate all steps
  async execute(query: string): Promise<DiscoveryResponse> {
    const startTime = Date.now();

    // 1. Extract entities
    const entities = await this.extractEntities(query);

    // 2. Check cache
    const cacheKey = this.generateCacheKey(entities);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true, processingTime: Date.now() - startTime };
    }

    // 3. Generate embeddings
    const embeddings = await this.embedQuery(query);

    // 4. Retrieve relevant content
    const documents = await this.retrieveRelevantContent(entities, embeddings);

    // 5. Rerank results
    const rankedDocs = await this.rerankResults(query, documents);

    // 6. Summarize
    const summary = await this.summarizeResults(query, rankedDocs);

    // 7. Build response
    const response: DiscoveryResponse = {
      query,
      entities,
      summary,
      places: this.categorizeResults(rankedDocs, 'place'),
      festivals: this.categorizeResults(rankedDocs, 'festival'),
      events: this.categorizeResults(rankedDocs, 'event'),
      attractions: this.categorizeResults(rankedDocs, 'attraction'),
      metadata: {
        totalResults: documents.length,
        processingTime: Date.now() - startTime,
        sources: this.extractSources(documents)
      }
    };

    // 8. Cache result
    await this.cache.set(cacheKey, response, 3600);

    return response;
  }
}
```

**Cost Optimization Strategies:**

1. **Model Selection:**
   - Use `gpt-4o-mini` for extraction/summarization ($0.15/1M input tokens)
   - Use `text-embedding-3-small` for embeddings ($0.02/1M tokens)
   - Reserve `gpt-4o` only for complex reasoning

2. **Token Management:**
   - Truncate document context to 500 tokens per doc
   - Use sliding window for long content
   - Batch API calls where possible

3. **Caching:**
   - Cache entity extraction results (1 hour TTL)
   - Cache embeddings permanently
   - Cache final responses (1-4 hours based on query type)

4. **Prompt Engineering:**
   - Use structured JSON output format
   - Minimize instruction tokens
   - Use few-shot examples sparingly

**Expected Cost per Query:**
- Entity extraction: ~$0.0001
- Embeddings: ~$0.00001
- Summarization: ~$0.0002
- Reranking: ~$0.00015
- **Total: ~$0.00045 per query**
- With 90% cache hit rate: **~$0.000045 per query**

---

#### 3.2 LangGraph Knowledge Graph

**Purpose:** Model relationships between entities for contextual recommendations

**Graph Schema:**

```typescript
// Node Types
type GraphNode = {
  id: string;
  type: 'city' | 'place' | 'event' | 'category' | 'month' | 'tag';
  properties: Record<string, any>;
};

// Edge Types
type GraphEdge = {
  source: string;
  target: string;
  type: 'located_in' | 'happens_during' | 'related_to' | 'nearby' | 'similar_to';
  weight: number; // 0-1 relevance score
};

// Example Graph
const graph = {
  nodes: [
    { id: 'delhi', type: 'city', properties: { name: 'Delhi', country: 'India' } },
    { id: 'october', type: 'month', properties: { name: 'October', season: 'autumn' } },
    { id: 'dussehra', type: 'event', properties: { name: 'Dussehra Festival', type: 'festival' } },
    { id: 'red-fort', type: 'place', properties: { name: 'Red Fort', category: 'historical' } }
  ],
  edges: [
    { source: 'dussehra', target: 'delhi', type: 'located_in', weight: 1.0 },
    { source: 'dussehra', target: 'october', type: 'happens_during', weight: 1.0 },
    { source: 'red-fort', target: 'delhi', type: 'located_in', weight: 1.0 },
    { source: 'red-fort', target: 'dussehra', type: 'nearby', weight: 0.85 }
  ]
};
```

**LangGraph Implementation:**

```typescript
// services/discovery-engine/src/graph/knowledge.graph.ts

import { StateGraph } from "@langchain/langgraph";

interface GraphState {
  query: QueryEntities;
  nodes: GraphNode[];
  edges: GraphEdge[];
  recommendations: Recommendation[];
}

class KnowledgeGraph {
  private graph: StateGraph<GraphState>;

  constructor() {
    this.graph = new StateGraph<GraphState>({
      channels: {
        query: null,
        nodes: null,
        edges: null,
        recommendations: null
      }
    });

    this.buildGraph();
  }

  private buildGraph() {
    // Node 1: Load relevant subgraph
    this.graph.addNode("load_subgraph", async (state) => {
      const { query } = state;
      const nodes = await this.loadNodesForQuery(query);
      const edges = await this.loadEdgesForNodes(nodes);
      return { ...state, nodes, edges };
    });

    // Node 2: Find related entities
    this.graph.addNode("find_relations", async (state) => {
      const { nodes, edges, query } = state;

      // Traverse graph to find:
      // - Nearby places
      // - Similar events
      // - Related categories
      const relations = this.traverseGraph(nodes, edges, query);
      return { ...state, recommendations: relations };
    });

    // Node 3: Calculate recommendation scores
    this.graph.addNode("score_recommendations", async (state) => {
      const { recommendations, query } = state;

      // Score based on:
      // - Graph distance (closer = better)
      // - Edge weights
      // - Node popularity
      // - Temporal relevance
      const scored = this.scoreRecommendations(recommendations, query);
      return { ...state, recommendations: scored };
    });

    // Define flow
    this.graph.addEdge("__start__", "load_subgraph");
    this.graph.addEdge("load_subgraph", "find_relations");
    this.graph.addEdge("find_relations", "score_recommendations");
    this.graph.addEdge("score_recommendations", "__end__");
  }

  async query(entities: QueryEntities): Promise<Recommendation[]> {
    const result = await this.graph.invoke({
      query: entities,
      nodes: [],
      edges: [],
      recommendations: []
    });

    return result.recommendations;
  }

  // Graph traversal algorithm
  private traverseGraph(
    nodes: GraphNode[],
    edges: GraphEdge[],
    query: QueryEntities
  ): Recommendation[] {
    // Start from query entities (city, month)
    const startNodes = nodes.filter(n =>
      n.properties.name === query.city ||
      n.properties.name === query.month
    );

    // BFS traversal with depth limit
    const visited = new Set<string>();
    const recommendations: Recommendation[] = [];
    const queue: Array<{ node: GraphNode; depth: number; path: string[] }> =
      startNodes.map(n => ({ node: n, depth: 0, path: [n.id] }));

    while (queue.length > 0) {
      const { node, depth, path } = queue.shift()!;

      if (visited.has(node.id) || depth > 3) continue;
      visited.add(node.id);

      // Find connected nodes
      const connectedEdges = edges.filter(e => e.source === node.id);

      for (const edge of connectedEdges) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!targetNode) continue;

        // If target is a place/event/attraction, add to recommendations
        if (['place', 'event', 'attraction'].includes(targetNode.type)) {
          recommendations.push({
            entity: targetNode,
            reason: this.explainRelationship(path, edge),
            score: edge.weight * (1 - depth * 0.2) // Decay by depth
          });
        }

        queue.push({
          node: targetNode,
          depth: depth + 1,
          path: [...path, edge.type, targetNode.id]
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 20);
  }

  private explainRelationship(path: string[], edge: GraphEdge): string {
    // Generate human-readable explanation
    const relations = {
      located_in: "located in the same area",
      happens_during: "happening at the same time",
      nearby: "nearby",
      similar_to: "similar to",
      related_to: "related to"
    };
    return relations[edge.type] || "connected to";
  }
}
```

**Graph Update Strategy:**

```typescript
// Incremental graph updates
class GraphUpdater {
  async updateGraph(newEntity: StructuredData) {
    // 1. Add new node
    await this.addNode(newEntity);

    // 2. Find potential connections
    const candidates = await this.findCandidates(newEntity);

    // 3. Calculate edge weights using embeddings
    for (const candidate of candidates) {
      const similarity = this.cosineSimilarity(
        newEntity.embedding,
        candidate.embedding
      );

      if (similarity > 0.7) {
        await this.addEdge({
          source: newEntity.id,
          target: candidate.id,
          type: this.inferEdgeType(newEntity, candidate),
          weight: similarity
        });
      }
    }

    // 4. Prune weak edges periodically
    await this.pruneWeakEdges(threshold: 0.5);
  }
}
```

**Graph Query Examples:**

```typescript
// Example 1: Find related attractions
const related = await knowledgeGraph.query({
  startNode: 'red-fort',
  traversalType: 'nearby',
  maxDepth: 2,
  filters: { type: ['place', 'attraction'] }
});
// Returns: [India Gate, Chandni Chowk, Jama Masjid]

// Example 2: Cross-city recommendations
const similar = await knowledgeGraph.query({
  startNode: 'dussehra-delhi',
  traversalType: 'similar_to',
  maxDepth: 3,
  filters: { type: 'festival' }
});
// Returns: [Navratri in Mumbai, Durga Puja in Kolkata]

// Example 3: Contextual itinerary
const itinerary = await knowledgeGraph.buildItinerary({
  city: 'Delhi',
  duration: 3, // days
  interests: ['history', 'food'],
  month: 'October'
});
// Returns optimized route considering:
// - Geographic proximity (nearby edges)
// - Opening hours
// - Event schedules
// - Travel time
```

---

### 4. API Layer Design

#### 4.1 REST API Endpoints

```typescript
// services/discovery-engine/src/api/routes.ts

import { Router } from 'express';

const router = Router();

// Discovery Endpoints

/**
 * POST /api/v1/discover
 * Main discovery endpoint with natural language query
 */
router.post('/api/v1/discover', async (req, res) => {
  /*
    Request Body:
    {
      "query": "Delhi in October",
      "filters": {
        "types": ["festival", "attraction"],
        "budget": "moderate",
        "duration": 3
      },
      "preferences": {
        "interests": ["culture", "food"],
        "pace": "relaxed"
      }
    }

    Response:
    {
      "query": "Delhi in October",
      "entities": { ... },
      "summary": {
        "headline": "Experience Delhi's Festive Spirit This October",
        "overview": "...",
        "highlights": [...]
      },
      "results": {
        "festivals": [...],
        "attractions": [...],
        "places": [...],
        "events": [...]
      },
      "recommendations": [...],
      "metadata": {
        "totalResults": 42,
        "processingTime": 234,
        "cached": false
      }
    }
  */
});

/**
 * GET /api/v1/entity/:id
 * Get detailed information about specific entity
 */
router.get('/api/v1/entity/:id', async (req, res) => {
  // Returns full entity details + related entities from graph
});

/**
 * POST /api/v1/discover/stream
 * Streaming discovery for real-time results
 */
router.post('/api/v1/discover/stream', async (req, res) => {
  // Server-Sent Events for progressive results
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Stream: entities → retrieval → summarization → recommendations
});

/**
 * GET /api/v1/trending/:city
 * Get trending places/events for a city
 */
router.get('/api/v1/trending/:city', async (req, res) => {
  // Based on recent query patterns and crawl frequency
});

/**
 * POST /api/v1/recommendations
 * Get personalized recommendations based on graph relationships
 */
router.post('/api/v1/recommendations', async (req, res) => {
  /*
    Request:
    {
      "baseEntity": "red-fort-delhi",
      "context": {
        "visitedPlaces": ["india-gate", "qutub-minar"],
        "interests": ["history"]
      },
      "limit": 10
    }

    Response:
    {
      "recommendations": [
        {
          "entity": { ... },
          "reason": "Nearby historical site",
          "score": 0.92,
          "distance": "2.3 km"
        }
      ]
    }
  */
});

// Admin Endpoints

/**
 * POST /api/v1/admin/crawl
 * Trigger manual crawl job
 */
router.post('/api/v1/admin/crawl', async (req, res) => {
  // Queue crawl job for specific source
});

/**
 * GET /api/v1/admin/stats
 * System statistics and health
 */
router.get('/api/v1/admin/stats', async (req, res) => {
  /*
    {
      "database": {
        "totalEntities": 12453,
        "entitiesByType": { ... },
        "lastUpdate": "2025-10-20T14:30:00Z"
      },
      "cache": {
        "hitRate": 0.87,
        "size": "245 MB"
      },
      "processing": {
        "avgQueryTime": 234,
        "queriesPerMinute": 45
      }
    }
  */
});

export default router;
```

#### 4.2 WebSocket for Real-time Streaming

```typescript
// services/discovery-engine/src/websocket/discovery.socket.ts

import { Server } from 'socket.io';

class DiscoverySocket {
  private io: Server;

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Progressive discovery stream
      socket.on('discover', async (query: string) => {
        // Stage 1: Entity extraction
        socket.emit('stage', {
          stage: 'extraction',
          message: 'Understanding your query...',
          progress: 0.2
        });
        const entities = await this.extractEntities(query);
        socket.emit('entities', entities);

        // Stage 2: Semantic retrieval
        socket.emit('stage', {
          stage: 'retrieval',
          message: 'Searching travel content...',
          progress: 0.4
        });
        const documents = await this.retrieve(entities);
        socket.emit('documents', { count: documents.length });

        // Stage 3: Summarization (stream tokens)
        socket.emit('stage', {
          stage: 'summarization',
          message: 'Generating summary...',
          progress: 0.6
        });
        await this.streamSummary(socket, documents);

        // Stage 4: Recommendations
        socket.emit('stage', {
          stage: 'recommendations',
          message: 'Finding related experiences...',
          progress: 0.8
        });
        const recommendations = await this.getRecommendations(entities);
        socket.emit('recommendations', recommendations);

        // Complete
        socket.emit('complete', { progress: 1.0 });
      });
    });
  }

  private async streamSummary(socket, documents) {
    // Stream LLM tokens as they're generated
    const stream = await this.llm.stream(prompt);
    for await (const chunk of stream) {
      socket.emit('summary:chunk', chunk.content);
    }
    socket.emit('summary:complete');
  }
}
```

---

### 5. Frontend Integration

#### 5.1 New Discovery UI Components

**Component Structure:**

```
apps/trip-planner/src/
├── components/
│   ├── discovery/
│   │   ├── DiscoverySearch.tsx           # Main search interface
│   │   ├── SearchBar.tsx                 # Natural language input
│   │   ├── EntityChips.tsx               # Extracted entity display
│   │   ├── ResultsGrid.tsx               # Card grid layout
│   │   ├── ResultCard.tsx                # Individual result card
│   │   ├── DetailModal.tsx               # Entity detail view
│   │   ├── RecommendationCarousel.tsx    # Related recommendations
│   │   ├── StreamingIndicator.tsx        # Progressive loading UI
│   │   └── SaveToTrip.tsx                # Add to trip planner button
├── pages/
│   └── DiscoveryPage.tsx                 # Main discovery page
├── hooks/
│   ├── useDiscovery.ts                   # Discovery API hook
│   ├── useStreamingSearch.ts             # WebSocket streaming hook
│   └── useRecommendations.ts             # Recommendations hook
└── store/
    └── discoveryStore.ts                 # Discovery state management
```

#### 5.2 Discovery Search Component

```typescript
// apps/trip-planner/src/components/discovery/DiscoverySearch.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, MapPin, Calendar, Filter } from 'lucide-react';
import { useDiscovery } from '@/hooks/useDiscovery';

interface DiscoverySearchProps {
  onResultSelect?: (result: any) => void;
}

export const DiscoverySearch: React.FC<DiscoverySearchProps> = ({
  onResultSelect
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const {
    results,
    entities,
    summary,
    recommendations,
    isLoading,
    error,
    search
  } = useDiscovery();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    await search(query);
    setIsSearching(false);
  };

  return (
    <div className="discovery-search-container">
      {/* Hero Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section glass p-8 rounded-3xl mb-8"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Discover Your Next Adventure
            </h1>
          </motion.div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ask anything like "Delhi in October" or "Best food festivals in Paris"
          </p>

          {/* Search Bar */}
          <div className="search-bar-container relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Where do you want to go?"
              className="w-full px-6 py-4 pr-14 rounded-2xl glass-border text-lg
                focus:ring-2 focus:ring-cyan-500 focus:outline-none
                transition-all duration-300"
            />

            <motion.button
              onClick={handleSearch}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-2 p-3 bg-gradient-to-r from-cyan-500 to-purple-500
                rounded-xl text-white disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {['Delhi in October', 'Paris food tours', 'Bali beaches'].map((suggestion) => (
              <motion.button
                key={suggestion}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setQuery(suggestion);
                  search(suggestion);
                }}
                className="px-4 py-2 rounded-full glass-border text-sm hover:bg-white/20
                  transition-all duration-300"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Entity Chips */}
      <AnimatePresence>
        {entities && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="entity-chips mb-6"
          >
            <div className="flex gap-2 flex-wrap">
              {entities.city && (
                <EntityChip icon={<MapPin />} label={entities.city} type="city" />
              )}
              {entities.month && (
                <EntityChip icon={<Calendar />} label={entities.month} type="month" />
              )}
              {entities.interests?.map((interest) => (
                <EntityChip key={interest} label={interest} type="interest" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Section */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="summary-section glass p-6 rounded-2xl mb-8"
          >
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-500 to-purple-500
              bg-clip-text text-transparent">
              {summary.headline}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {summary.overview}
            </p>

            {summary.highlights && (
              <div className="highlights">
                <h3 className="font-semibold mb-2">Top Highlights:</h3>
                <ul className="space-y-2">
                  {summary.highlights.map((highlight, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-500 mt-1 flex-shrink-0" />
                      <span>{highlight}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <AnimatePresence>
        {results && (
          <ResultsGrid
            results={results}
            onResultSelect={onResultSelect}
          />
        )}
      </AnimatePresence>

      {/* Recommendations Carousel */}
      <AnimatePresence>
        {recommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="recommendations-section mt-8"
          >
            <h3 className="text-xl font-bold mb-4">You might also like</h3>
            <RecommendationCarousel
              recommendations={recommendations}
              onSelect={onResultSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Entity Chip Component
const EntityChip: React.FC<{
  icon?: React.ReactNode;
  label: string;
  type: string;
}> = ({ icon, label, type }) => {
  const colors = {
    city: 'from-cyan-500 to-blue-500',
    month: 'from-purple-500 to-pink-500',
    interest: 'from-amber-500 to-orange-500'
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r ${colors[type]} text-white shadow-lg`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </motion.div>
  );
};
```

#### 5.3 Result Card Component

```typescript
// apps/trip-planner/src/components/discovery/ResultCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Star, Plus, ExternalLink } from 'lucide-react';
import { useTripStore } from '@/store/tripStore';

interface ResultCardProps {
  result: {
    id: string;
    type: 'festival' | 'attraction' | 'place' | 'event';
    title: string;
    description: string;
    location: {
      city: string;
      coordinates: [number, number];
    };
    dates?: {
      start: string;
      end: string;
    };
    metadata: {
      category: string[];
      tags: string[];
      popularity: number;
      cost?: string;
    };
    media: {
      images: string[];
    };
  };
  onSelect?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onSelect }) => {
  const addDestination = useTripStore((state) => state.addDestination);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleAddToTrip = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Convert discovery result to trip destination format
    addDestination({
      id: result.id,
      name: result.title,
      description: result.description,
      location: result.location.city,
      coordinates: result.location.coordinates,
      startDate: result.dates?.start || new Date().toISOString(),
      endDate: result.dates?.end || new Date().toISOString(),
      image: result.media.images[0],
      activities: []
    });

    // Show success toast
    // toast.success('Added to your trip!');
  };

  const typeColors = {
    festival: 'from-purple-500 to-pink-500',
    attraction: 'from-cyan-500 to-blue-500',
    place: 'from-green-500 to-emerald-500',
    event: 'from-amber-500 to-orange-500'
  };

  const typeIcons = {
    festival: '🎉',
    attraction: '🏛️',
    place: '📍',
    event: '🎪'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onSelect}
      className="result-card glass rounded-2xl overflow-hidden cursor-pointer
        hover:shadow-2xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={result.media.images[0] || '/placeholder.jpg'}
          alt={result.title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full
          bg-gradient-to-r ${typeColors[result.type]} text-white text-sm font-medium
          shadow-lg`}>
          {typeIcons[result.type]} {result.type}
        </div>

        {/* Popularity Score */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1
          rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{(result.metadata.popularity * 5).toFixed(1)}</span>
        </div>

        {/* Add to Trip Button (visible on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={handleAddToTrip}
              className="absolute bottom-3 right-3 p-2 bg-white rounded-full
                shadow-lg hover:scale-110 transition-transform"
            >
              <Plus className="w-5 h-5 text-cyan-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          {result.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {result.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-500" />
            <span>{result.location.city}</span>
          </div>

          {/* Dates */}
          {result.dates && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>
                {new Date(result.dates.start).toLocaleDateString()} -
                {new Date(result.dates.end).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Cost */}
          {result.metadata.cost && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-green-600 dark:text-green-400">
                {result.metadata.cost}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {result.metadata.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700
                text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
```

#### 5.4 Custom Hook: useDiscovery

```typescript
// apps/trip-planner/src/hooks/useDiscovery.ts

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_DISCOVERY_API_URL || 'http://localhost:3000/api/v1';

interface DiscoveryResult {
  query: string;
  entities: QueryEntities;
  summary: Summary;
  results: {
    festivals: any[];
    attractions: any[];
    places: any[];
    events: any[];
  };
  recommendations: any[];
  metadata: {
    totalResults: number;
    processingTime: number;
    cached: boolean;
  };
}

export const useDiscovery = () => {
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [entities, setEntities] = useState<QueryEntities | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/discover`, {
        query,
        filters
      });

      const data: DiscoveryResult = response.data;

      setResults(data);
      setEntities(data.entities);
      setSummary(data.summary);
      setRecommendations(data.recommendations);

      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEntityDetails = useCallback(async (entityId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entity/${entityId}`);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch entity details');
    }
  }, []);

  const getRecommendations = useCallback(async (baseEntityId: string, context?: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/recommendations`, {
        baseEntity: baseEntityId,
        context
      });
      return response.data.recommendations;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch recommendations');
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setEntities(null);
    setSummary(null);
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    results,
    entities,
    summary,
    recommendations,
    isLoading,
    error,
    search,
    getEntityDetails,
    getRecommendations,
    clearResults
  };
};
```

---

### 6. Cost Optimization Strategies

#### 6.1 LLM Cost Optimization

| Strategy | Implementation | Savings |
|----------|---------------|---------|
| **Model Selection** | Use gpt-4o-mini for 80% of tasks | 90% cost reduction |
| **Response Caching** | Cache LLM responses for 1-4 hours | 85-95% cache hit rate |
| **Prompt Optimization** | Reduce system prompt tokens by 50% | 30% cost reduction |
| **Batch Processing** | Batch similar queries together | 40% API call reduction |
| **Embedding Reuse** | Store embeddings permanently | 100% embedding cost savings after first gen |
| **Conditional LLM Use** | Skip LLM for exact cache hits | 90% cost elimination on cached queries |

**Cost Calculation (per 1000 queries):**

**Without Optimization:**
- Entity extraction: 1000 × $0.0001 = $0.10
- Summarization: 1000 × $0.0002 = $0.20
- Reranking: 1000 × $0.00015 = $0.15
- **Total: $0.45**

**With Optimization (90% cache hit rate):**
- Cache hits (900 queries): $0 LLM cost
- Cache misses (100 queries): 100 × $0.00045 = $0.045
- **Total: $0.045 (90% savings)**

**Monthly Cost Estimate (100K queries/month):**
- **Without optimization: $45**
- **With optimization: $4.50**

#### 6.2 Infrastructure Cost Optimization

| Component | Free Tier | Paid Tier | Recommendation |
|-----------|-----------|-----------|----------------|
| **MongoDB Atlas** | 512MB (Free) | $57/month (M10) | Start free, scale to M10 at 10K users |
| **Weaviate Cloud** | 1M vectors (Free) | $25/month (Sandbox) | Use free tier, self-host at 100K vectors |
| **Redis Cloud** | 30MB (Free) | $5/month (100MB) | Start free, upgrade as needed |
| **Vercel (Frontend)** | Unlimited (Free) | $0 | Stay on free tier |
| **Railway (Backend)** | $5 credit/month | $10-50/month | Start with free credits |
| **OpenAI API** | Pay-per-use | N/A | Optimize as above |

**Total Infrastructure Cost:**
- **Initial (Free tier)**: $0/month
- **10K users**: ~$15/month
- **100K users**: ~$100/month

---

### 7. Scalability Strategy

#### 7.1 Horizontal Scaling

```yaml
# docker-compose.yml (Production)

version: '3.8'

services:
  # API Gateway (Load Balanced)
  api:
    image: discovery-api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
    environment:
      - REDIS_URL=redis://cache:6379
      - MONGODB_URL=mongodb://mongo:27017/discovery
      - WEAVIATE_URL=http://weaviate:8080

  # Background Workers
  worker:
    image: discovery-worker:latest
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: '2'
          memory: 1G
    command: ['node', 'src/workers/crawler.worker.js']

  # Redis Cache (Clustered)
  cache:
    image: redis:7-alpine
    deploy:
      replicas: 3
    command: ['redis-server', '--cluster-enabled', 'yes']

  # MongoDB (Replica Set)
  mongo:
    image: mongo:7
    deploy:
      replicas: 3
    command: ['mongod', '--replSet', 'rs0']

  # Weaviate Vector DB
  weaviate:
    image: semitechnologies/weaviate:latest
    environment:
      - CLUSTER_HOSTNAME=weaviate-node-1

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=secret
```

#### 7.2 Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| **Query Latency (cached)** | <100ms | Redis lookup + deserialization |
| **Query Latency (cold)** | <3s | LangChain pipeline optimization |
| **Throughput** | 1000 QPS | Load balanced API servers |
| **Cache Hit Rate** | >85% | Intelligent cache key generation |
| **Crawler Speed** | 10 pages/sec | Distributed workers + rate limiting |
| **Uptime** | 99.9% | Kubernetes auto-healing |

---

### 8. Example Output

**User Query:** `"Delhi in October"`

**API Response:**

```json
{
  "query": "Delhi in October",
  "entities": {
    "city": "Delhi",
    "country": "India",
    "month": "October",
    "year": 2025,
    "interests": [],
    "eventType": [],
    "duration": null
  },
  "summary": {
    "headline": "Experience Delhi's Festive Spirit This October",
    "overview": "October in Delhi brings perfect weather and vibrant celebrations, highlighted by the grand Dussehra festival. The city transforms with cultural events, open-air concerts, and food festivals, making it an ideal time to explore historical monuments and bustling markets under clear autumn skies.",
    "highlights": [
      "Dussehra Festival - Witness the burning of Ravana effigies at Ramlila Ground",
      "Autumn Food Festival - Sample seasonal delicacies at Dilli Haat",
      "Heritage Walks - Explore Red Fort and Qutub Minar in pleasant weather",
      "Chandni Chowk Night Market - Experience the city's oldest bazaar",
      "India International Trade Fair - Asia's largest trade expo (late October)"
    ],
    "bestTime": "Mid-October offers the best balance of weather and festivities",
    "tips": [
      "Book hotels near metro stations for easy access",
      "Try street food at Paranthe Wali Gali",
      "Visit monuments early morning to avoid crowds",
      "Carry light layers as evenings can be cool"
    ]
  },
  "results": {
    "festivals": [
      {
        "id": "dussehra-delhi-2025",
        "type": "festival",
        "title": "Dussehra Festival 2025",
        "description": "One of Delhi's most spectacular celebrations, featuring 10 days of Ramlila performances culminating in the burning of 70-foot effigies at Ramlila Ground. The event attracts over 500,000 visitors and showcases traditional dance, music, and theatrical performances depicting the Ramayana epic.",
        "location": {
          "city": "Delhi",
          "venue": "Ramlila Ground, Ajmeri Gate",
          "coordinates": [28.6371, 77.2177]
        },
        "dates": {
          "start": "2025-10-10T00:00:00Z",
          "end": "2025-10-20T23:59:59Z",
          "flexible": false
        },
        "metadata": {
          "category": ["cultural", "religious", "outdoor"],
          "tags": ["festival", "traditional", "family-friendly", "free"],
          "popularity": 0.95,
          "cost": "free",
          "duration": "10 days",
          "crowdLevel": "very high"
        },
        "media": {
          "images": [
            "https://example.com/dussehra1.jpg",
            "https://example.com/dussehra2.jpg"
          ]
        },
        "source": {
          "url": "https://delhitourism.gov.in/dussehra",
          "domain": "delhitourism.gov.in",
          "crawledAt": "2025-10-15T10:30:00Z"
        }
      }
    ],
    "attractions": [
      {
        "id": "red-fort-delhi",
        "type": "attraction",
        "title": "Red Fort (Lal Qila)",
        "description": "UNESCO World Heritage Site and iconic 17th-century Mughal fortress. Best visited in October's pleasant weather. The sound and light show 'Shan-e-Dilwalon-Ki' runs every evening in Hindi and English.",
        "location": {
          "city": "Delhi",
          "area": "Old Delhi",
          "coordinates": [28.6562, 77.2410]
        },
        "metadata": {
          "category": ["historical", "architecture", "UNESCO"],
          "tags": ["monument", "Mughal", "photography"],
          "popularity": 0.92,
          "cost": "₹50 (Indians), ₹500 (Foreigners)",
          "duration": "2-3 hours",
          "openingHours": "9:30 AM - 4:30 PM (Closed Monday)"
        },
        "media": {
          "images": ["https://example.com/red-fort1.jpg"]
        }
      }
    ],
    "events": [
      {
        "id": "delhi-food-festival-oct-2025",
        "type": "event",
        "title": "Autumn Food Festival at Dilli Haat",
        "description": "Annual celebration of seasonal cuisine featuring regional specialties from across India. Over 60 food stalls, cooking demonstrations, and live cultural performances.",
        "location": {
          "city": "Delhi",
          "venue": "Dilli Haat, INA",
          "coordinates": [28.5676, 77.2127]
        },
        "dates": {
          "start": "2025-10-15T11:00:00Z",
          "end": "2025-10-25T22:00:00Z",
          "flexible": false
        },
        "metadata": {
          "category": ["food", "cultural"],
          "tags": ["festival", "cuisine", "family-friendly"],
          "popularity": 0.78,
          "cost": "₹100 entry",
          "duration": "10 days"
        }
      }
    ],
    "places": [
      {
        "id": "chandni-chowk-delhi",
        "type": "place",
        "title": "Chandni Chowk Market",
        "description": "Delhi's oldest and busiest market, dating back to the 17th century. A labyrinth of narrow lanes offering street food, textiles, jewelry, and electronics. October evenings are perfect for exploring on foot.",
        "location": {
          "city": "Delhi",
          "area": "Old Delhi",
          "coordinates": [28.6506, 77.2303]
        },
        "metadata": {
          "category": ["shopping", "street food", "cultural"],
          "tags": ["market", "historical", "food"],
          "popularity": 0.88,
          "cost": "free (shopping costs vary)",
          "bestTimeToVisit": "Early morning or evening"
        }
      }
    ]
  },
  "recommendations": [
    {
      "entity": {
        "id": "qutub-minar-delhi",
        "title": "Qutub Minar",
        "type": "attraction"
      },
      "reason": "Popular historical site near Red Fort, best visited in October weather",
      "score": 0.89,
      "relationshipType": "similar_to"
    },
    {
      "entity": {
        "id": "paranthe-wali-gali",
        "title": "Paranthe Wali Gali",
        "type": "place"
      },
      "reason": "Famous street food lane in Chandni Chowk area",
      "score": 0.85,
      "relationshipType": "nearby"
    }
  ],
  "metadata": {
    "totalResults": 42,
    "processingTime": 1847,
    "cached": false,
    "sources": [
      "delhitourism.gov.in",
      "incredibleindia.org",
      "lonelyplanet.com/india/delhi"
    ],
    "generatedAt": "2025-10-20T14:35:22Z"
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- ✅ Setup project structure
- ✅ Configure databases (MongoDB, Redis, Weaviate)
- ✅ Implement basic crawler framework
- ✅ Create data normalization pipeline
- ✅ Setup API server skeleton

### Phase 2: AI Pipeline (Weeks 3-4)
- ✅ Integrate LangChain entity extraction
- ✅ Implement vector embeddings
- ✅ Build semantic retrieval chain
- ✅ Add summarization chain
- ✅ Test LLM cost optimization

### Phase 3: Knowledge Graph (Week 5)
- ✅ Design LangGraph schema
- ✅ Implement graph builder
- ✅ Create relationship finder
- ✅ Build recommendation engine

### Phase 4: Frontend (Weeks 6-7)
- ✅ Design discovery UI components
- ✅ Implement search interface
- ✅ Build result cards and visualizations
- ✅ Integrate with existing trip planner
- ✅ Add real-time streaming

### Phase 5: Production (Week 8)
- ✅ Setup Docker containers
- ✅ Configure CI/CD pipeline
- ✅ Load testing and optimization
- ✅ Security hardening
- ✅ Deploy to production

---

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| **API** | Node.js, Express/Fastify, Socket.io, TypeScript |
| **AI/ML** | LangChain, LangGraph, OpenAI GPT-4o-mini, text-embedding-3-small |
| **Databases** | MongoDB (structured), Weaviate (vectors), Redis (cache) |
| **Infrastructure** | Docker, Kubernetes, Vercel (frontend), Railway/Render (backend) |
| **Crawling** | Playwright, Cheerio, Puppeteer, Sitemap Parser |
| **Monitoring** | Prometheus, Grafana, Sentry |

---

This architecture provides a complete blueprint for building a production-ready AI-powered travel discovery platform that is scalable, cost-effective, and delivers exceptional user experiences through intelligent semantic search and graph-based recommendations.
