// Crawler Worker - BullMQ Worker for Background Crawling

import { Worker, Job, Queue } from 'bullmq';
import { crawlerManager } from '@/crawlers';
import { logger } from '@/utils/logger';
import { dbManager } from '@/database/connection';

interface CrawlerJobData {
  type: 'city' | 'batch';
  city?: string;
  country?: string;
  cities?: Array<{ city: string; country: string }>;
  types?: ('events' | 'attractions')[];
  startDate?: string;
  endDate?: string;
}

// Redis connection for BullMQ
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined
};

// Create queue
export const crawlerQueue = new Queue<CrawlerJobData>('crawler-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

// Create worker
export const crawlerWorker = new Worker<CrawlerJobData>(
  'crawler-jobs',
  async (job: Job<CrawlerJobData>) => {
    const { data } = job;

    logger.info('Processing crawler job', {
      jobId: job.id,
      type: data.type,
      city: data.city,
      cities: data.cities?.length
    });

    try {
      // Connect to database if not connected
      if (!dbManager.isConnected()) {
        await dbManager.connect();
      }

      let result;

      if (data.type === 'city' && data.city && data.country) {
        // Single city crawl
        result = await crawlerManager.crawlAndSave({
          city: data.city,
          country: data.country,
          types: data.types,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined
        });

        logger.info('City crawl completed', {
          jobId: job.id,
          city: data.city,
          crawled: result.crawled,
          saved: result.saved
        });

        // Update job progress
        await job.updateProgress({
          status: 'completed',
          crawled: result.crawled,
          saved: result.saved
        });

        return result;
      } else if (data.type === 'batch' && data.cities) {
        // Batch crawl
        const totalCities = data.cities.length;

        result = await crawlerManager.crawlMultipleCities(data.cities, data.types);

        // Update progress for each city
        for (let i = 0; i < totalCities; i++) {
          await job.updateProgress({
            status: 'processing',
            current: i + 1,
            total: totalCities,
            percentage: Math.round(((i + 1) / totalCities) * 100)
          });
        }

        logger.info('Batch crawl completed', {
          jobId: job.id,
          cities: totalCities,
          totalCrawled: result.totalCrawled,
          totalSaved: result.totalSaved
        });

        return result;
      } else {
        throw new Error('Invalid job data');
      }
    } catch (error: any) {
      logger.error('Crawler job failed', {
        jobId: job.id,
        error: error.message,
        stack: error.stack
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.CRAWLER_WORKER_CONCURRENCY || '2'),
    limiter: {
      max: parseInt(process.env.CRAWLER_RATE_LIMIT || '10'),
      duration: 60000 // per minute
    }
  }
);

// Worker event handlers
crawlerWorker.on('completed', (job) => {
  logger.info('Crawler job completed', {
    jobId: job.id,
    returnValue: job.returnvalue
  });
});

crawlerWorker.on('failed', (job, err) => {
  logger.error('Crawler job failed', {
    jobId: job?.id,
    error: err.message
  });
});

crawlerWorker.on('error', (err) => {
  logger.error('Crawler worker error', { error: err.message });
});

crawlerWorker.on('active', (job) => {
  logger.info('Crawler job started', {
    jobId: job.id,
    data: job.data
  });
});

// Queue helper functions
export async function addCrawlerJob(data: CrawlerJobData): Promise<Job<CrawlerJobData>> {
  return crawlerQueue.add('crawl', data, {
    priority: data.type === 'city' ? 1 : 2
  });
}

export async function scheduleCrawlerJob(
  data: CrawlerJobData,
  cron: string
): Promise<Job<CrawlerJobData>> {
  return crawlerQueue.add('crawl', data, {
    repeat: {
      pattern: cron
    }
  });
}

export async function getCrawlerJobStatus(jobId: string): Promise<any> {
  const job = await crawlerQueue.getJob(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: await job.getState(),
    returnValue: job.returnvalue,
    failedReason: job.failedReason,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn
  };
}

export async function getCrawlerQueueStats(): Promise<any> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    crawlerQueue.getWaitingCount(),
    crawlerQueue.getActiveCount(),
    crawlerQueue.getCompletedCount(),
    crawlerQueue.getFailedCount(),
    crawlerQueue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing crawler worker...');
  await crawlerWorker.close();
  await crawlerQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing crawler worker...');
  await crawlerWorker.close();
  await crawlerQueue.close();
  process.exit(0);
});

// Start worker if run directly
if (require.main === module) {
  logger.info('Starting crawler worker...');
  dbManager.connect().catch((error) => {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  });
}
