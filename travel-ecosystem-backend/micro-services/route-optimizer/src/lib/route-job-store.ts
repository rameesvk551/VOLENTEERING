import { OptimizationResponse } from '../services/route-optimizer-v2.service.js';

export type StoredOptimizationJob = OptimizationResponse & {
  storedAt: number;
  processingTimeMs: number;
};

class RouteJobStore {
  private store = new Map<string, StoredOptimizationJob>();
  private readonly ttlMs = Number(process.env.ROUTE_JOB_TTL_MS || 1000 * 60 * 60); // 1 hour default

  save(jobId: string, payload: OptimizationResponse, processingTimeMs: number) {
    this.store.set(jobId, {
      ...payload,
      storedAt: Date.now(),
      processingTimeMs,
    });
    this.evictExpired();
  }

  get(jobId: string): StoredOptimizationJob | undefined {
    this.evictExpired();
    return this.store.get(jobId);
  }

  private evictExpired() {
    const now = Date.now();
    for (const [jobId, job] of this.store.entries()) {
      if (now - job.storedAt > this.ttlMs) {
        this.store.delete(jobId);
      }
    }
  }
}

export const routeJobStore = new RouteJobStore();
