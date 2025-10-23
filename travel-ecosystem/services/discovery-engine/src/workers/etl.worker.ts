// ETL Worker - Extract, Transform, Load Worker for Data Processing

import { Worker, Job, Queue } from 'bullmq';
import { Place } from '@/database/models';
import { OpenAIEmbeddings } from '@langchain/openai';
import { logger } from '@/utils/logger';
import { dbManager } from '@/database/connection';

interface ETLJobData {
  operation: 'generate-embeddings' | 'enrich-data' | 'deduplicate' | 'sync-weaviate';
  placeIds?: string[];
  batchSize?: number;
}

// Redis connection
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined
};

// Create queue
export const etlQueue = new Queue<ETLJobData>('etl-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    },
    removeOnComplete: 50,
    removeOnFail: 25
  }
});

// Embeddings generator
const embeddings = new OpenAIEmbeddings({
  modelName: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY
});

// Create worker
export const etlWorker = new Worker<ETLJobData>(
  'etl-jobs',
  async (job: Job<ETLJobData>) => {
    const { data } = job;

    logger.info('Processing ETL job', {
      jobId: job.id,
      operation: data.operation
    });

    try {
      switch (data.operation) {
        case 'generate-embeddings':
          return await generateEmbeddings(job, data);

        case 'enrich-data':
          return await enrichData(job, data);

        case 'deduplicate':
          return await deduplicatePlaces(job, data);

        case 'sync-weaviate':
          return await syncToWeaviate(job, data);

        default:
          throw new Error(`Unknown operation: ${data.operation}`);
      }
    } catch (error: any) {
      logger.error('ETL job failed', {
        jobId: job.id,
        operation: data.operation,
        error: error.message
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.ETL_WORKER_CONCURRENCY || '3')
  }
);

/**
 * Generate embeddings for places
 */
async function generateEmbeddings(
  job: Job<ETLJobData>,
  data: ETLJobData
): Promise<{ processed: number; failed: number }> {
  const batchSize = data.batchSize || 50;
  let processed = 0;
  let failed = 0;

  try {
    // Get places without embeddings
    const query = data.placeIds
      ? { _id: { $in: data.placeIds }, embedding: { $exists: false } }
      : { embedding: { $exists: false } };

    const totalPlaces = await Place.countDocuments(query);
    const places = await Place.find(query).limit(batchSize);

    logger.info('Generating embeddings', {
      total: totalPlaces,
      batchSize,
      selected: places.length
    });

    for (let i = 0; i < places.length; i++) {
      try {
        const place = places[i];

        // Create text representation
        const text = [
          place.name,
          place.description,
          place.category,
          place.city,
          place.country,
          ...(place.tags || [])
        ]
          .filter(Boolean)
          .join(' ');

        // Generate embedding
        const [embedding] = await embeddings.embedDocuments([text]);

        // Save to database
        await Place.updateOne(
          { _id: place._id },
          {
            $set: {
              embedding,
              embeddingGeneratedAt: new Date()
            }
          }
        );

        processed++;

        // Update progress
        await job.updateProgress({
          current: i + 1,
          total: places.length,
          percentage: Math.round(((i + 1) / places.length) * 100)
        });
      } catch (error: any) {
        logger.error('Failed to generate embedding', {
          placeId: places[i]._id,
          error: error.message
        });
        failed++;
      }
    }

    logger.info('Embeddings generated', { processed, failed });

    return { processed, failed };
  } catch (error: any) {
    logger.error('Embedding generation failed', error);
    throw error;
  }
}

/**
 * Enrich place data with additional information
 */
async function enrichData(
  job: Job<ETLJobData>,
  data: ETLJobData
): Promise<{ enriched: number }> {
  let enriched = 0;

  try {
    // Get places needing enrichment
    const query = data.placeIds
      ? { _id: { $in: data.placeIds } }
      : { enrichedAt: { $exists: false } };

    const places = await Place.find(query).limit(data.batchSize || 100);

    logger.info('Enriching place data', { count: places.length });

    for (const place of places) {
      try {
        const updates: any = {};

        // Calculate popularity score
        if (place.rating && place.reviewCount) {
          updates.popularityScore = calculatePopularityScore(
            place.rating,
            place.reviewCount
          );
        }

        // Normalize price range
        if (place.price !== null && place.price !== undefined) {
          updates.priceRange = normalizePriceRange(place.price);
        }

        // Extract season from dates
        if (place.startDate) {
          updates.season = extractSeason(new Date(place.startDate));
        }

        // Mark as enriched
        updates.enrichedAt = new Date();

        await Place.updateOne({ _id: place._id }, { $set: updates });
        enriched++;
      } catch (error: any) {
        logger.error('Failed to enrich place', {
          placeId: place._id,
          error: error.message
        });
      }
    }

    logger.info('Data enrichment completed', { enriched });

    return { enriched };
  } catch (error: any) {
    logger.error('Data enrichment failed', error);
    throw error;
  }
}

/**
 * Deduplicate places in database
 */
async function deduplicatePlaces(
  job: Job<ETLJobData>,
  data: ETLJobData
): Promise<{ removed: number }> {
  let removed = 0;

  try {
    logger.info('Starting deduplication');

    // Find duplicates by name, city, and type
    const duplicates = await Place.aggregate([
      {
        $group: {
          _id: {
            name: { $toLower: '$name' },
            city: '$city',
            type: '$type'
          },
          ids: { $push: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    logger.info('Duplicates found', { groups: duplicates.length });

    for (const duplicate of duplicates) {
      try {
        // Keep the first one, remove others
        const [keepId, ...removeIds] = duplicate.ids;

        // Merge sources from duplicates
        const duplicatePlaces = await Place.find({ _id: { $in: duplicate.ids } });
        const allSources = new Set<string>();
        
        duplicatePlaces.forEach((p) => {
          (p.sources || []).forEach((s: string) => allSources.add(s));
        });

        // Update the kept record with merged sources
        await Place.updateOne(
          { _id: keepId },
          { $set: { sources: Array.from(allSources) } }
        );

        // Remove duplicates
        await Place.deleteMany({ _id: { $in: removeIds } });
        removed += removeIds.length;

        logger.debug('Removed duplicates', {
          name: duplicate._id.name,
          removed: removeIds.length
        });
      } catch (error: any) {
        logger.error('Failed to remove duplicate', error);
      }
    }

    logger.info('Deduplication completed', { removed });

    return { removed };
  } catch (error: any) {
    logger.error('Deduplication failed', error);
    throw error;
  }
}

/**
 * Sync places to Weaviate vector database
 */
async function syncToWeaviate(
  job: Job<ETLJobData>,
  data: ETLJobData
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    const weaviate = dbManager.getWeaviate();

    // Get places with embeddings but not synced to Weaviate
    const query = data.placeIds
      ? { _id: { $in: data.placeIds }, embedding: { $exists: true } }
      : {
          embedding: { $exists: true },
          $or: [
            { syncedToWeaviate: { $exists: false } },
            { syncedToWeaviate: false }
          ]
        };

    const places = await Place.find(query).limit(data.batchSize || 100);

    logger.info('Syncing to Weaviate', { count: places.length });

    for (const place of places) {
      try {
        // Prepare Weaviate object
        const weaviateObject = {
          class: 'Place',
          properties: {
            placeId: place._id.toString(),
            name: place.name,
            description: place.description || '',
            type: place.type,
            category: place.category,
            city: place.city,
            country: place.country,
            rating: place.rating || 0,
            reviewCount: place.reviewCount || 0,
            price: place.price || 0,
            tags: place.tags || [],
            popularityScore: place.popularityScore || 0
          },
          vector: place.embedding
        };

        // Add to Weaviate
        await weaviate.data.creator().withClassName('Place').withProperties(weaviateObject.properties).withVector(weaviateObject.vector).do();

        // Mark as synced
        await Place.updateOne(
          { _id: place._id },
          { $set: { syncedToWeaviate: true, syncedAt: new Date() } }
        );

        synced++;
      } catch (error: any) {
        logger.error('Failed to sync to Weaviate', {
          placeId: place._id,
          error: error.message
        });
        failed++;
      }
    }

    logger.info('Weaviate sync completed', { synced, failed });

    return { synced, failed };
  } catch (error: any) {
    logger.error('Weaviate sync failed', error);
    throw error;
  }
}

/**
 * Calculate popularity score
 */
function calculatePopularityScore(rating: number, reviewCount: number): number {
  // Wilson score interval
  const z = 1.96; // 95% confidence
  const n = reviewCount;
  const p = rating / 5; // Normalize to 0-1

  if (n === 0) return 0;

  const left = p + (z * z) / (2 * n);
  const right = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  const under = 1 + (z * z) / n;

  return Math.round(((left - right) / under) * 100);
}

/**
 * Normalize price to range (1-4: $, $$, $$$, $$$$)
 */
function normalizePriceRange(price: number): number {
  if (price === 0) return 0;
  if (price < 20) return 1;
  if (price < 50) return 2;
  if (price < 100) return 3;
  return 4;
}

/**
 * Extract season from date
 */
function extractSeason(date: Date): string {
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

// Worker event handlers
etlWorker.on('completed', (job: any) => {
  logger.info('ETL job completed', {
    jobId: job.id,
    result: job.returnvalue
  });
});

etlWorker.on('failed', (job: any, err: any) => {
  logger.error('ETL job failed', {
    jobId: job?.id,
    error: err.message
  });
});

// Queue helper functions
export async function addETLJob(data: ETLJobData): Promise<Job<ETLJobData>> {
  return etlQueue.add('etl', data);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing ETL worker...');
  await etlWorker.close();
  await etlQueue.close();
  process.exit(0);
});

// Start worker if run directly
if (require.main === module) {
  logger.info('Starting ETL worker...');
}
