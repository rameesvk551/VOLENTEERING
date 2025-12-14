/**
 * Optimization Job Repository
 * CRUD operations for persisted optimization results
 */

import { OptimizationResponse } from '../services/route-optimizer-v2.service';
import { getDB } from './connection';

export interface OptimizationJobDocument extends OptimizationResponse {
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  processingTimeMs: number;
  requestPayload?: any;
}

const COLLECTION_NAME = 'optimization_jobs';

export class OptimizationJobRepository {
  /**
   * Save optimization result
   */
  async save(
    jobId: string,
    userId: string | undefined,
    result: OptimizationResponse,
    processingTimeMs: number,
    requestPayload?: any
  ): Promise<OptimizationJobDocument> {
    const db = await getDB();
    const collection = db.collection<OptimizationJobDocument>(COLLECTION_NAME);

    const now = new Date();
    const document: OptimizationJobDocument = {
      ...result,
      userId,
      createdAt: now,
      updatedAt: now,
      processingTimeMs,
      requestPayload,
    };

    await collection.insertOne(document as any);
    return document;
  }

  /**
   * Find job by ID
   */
  async findById(jobId: string): Promise<OptimizationJobDocument | null> {
    const db = await getDB();
    const collection = db.collection<OptimizationJobDocument>(COLLECTION_NAME);
    return collection.findOne({ jobId });
  }

  /**
   * Find all jobs by userId
   */
  async findByUserId(userId: string, limit = 20): Promise<OptimizationJobDocument[]> {
    const db = await getDB();
    const collection = db.collection<OptimizationJobDocument>(COLLECTION_NAME);
    
    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find recent jobs (for anonymous/all users)
   */
  async findRecent(limit = 10): Promise<OptimizationJobDocument[]> {
    const db = await getDB();
    const collection = db.collection<OptimizationJobDocument>(COLLECTION_NAME);
    
    return collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Delete job by ID
   */
  async deleteById(jobId: string, userId?: string): Promise<boolean> {
    const db = await getDB();
    const collection = db.collection<OptimizationJobDocument>(COLLECTION_NAME);
    
    const filter: any = { jobId };
    if (userId) {
      filter.userId = userId; // Only allow deletion if user owns it
    }
    
    const result = await collection.deleteOne(filter);
    return result.deletedCount === 1;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const db = await getDB();
    const collection = db.collection<OptimizationJobDocument>(COLLECTION_NAME);

    const [totalJobs, avgDistance, avgDuration] = await Promise.all([
      collection.countDocuments({ userId }),
      collection
        .aggregate([
          { $match: { userId } },
          { $group: { _id: null, avgDistance: { $avg: '$totalDistanceMeters' } } },
        ])
        .toArray(),
      collection
        .aggregate([
          { $match: { userId } },
          { $group: { _id: null, avgDuration: { $avg: '$estimatedDurationMinutes' } } },
        ])
        .toArray(),
    ]);

    return {
      totalOptimizations: totalJobs,
      avgDistanceMeters: avgDistance[0]?.avgDistance || 0,
      avgDurationMinutes: avgDuration[0]?.avgDuration || 0,
    };
  }
}

export const optimizationJobRepository = new OptimizationJobRepository();
