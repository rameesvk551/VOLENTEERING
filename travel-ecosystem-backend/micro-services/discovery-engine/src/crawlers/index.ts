interface CrawlInput {
  city: string;
  country: string;
  types?: ('events' | 'attractions')[];
}

const stats = {
  totalRuns: 0,
  lastRunAt: null as string | null,
  totals: {
    events: 0,
    attractions: 0
  }
};

export const crawlerManager = {
  async crawlAndSave(input: CrawlInput): Promise<{ crawled: number; saved: number }> {
    stats.totalRuns += 1;
    stats.lastRunAt = new Date().toISOString();
    if (input.types) {
      for (const type of input.types) {
        stats.totals[type] += 5;
      }
    }
    return { crawled: 5, saved: 5 };
  },

  async getStatistics(): Promise<{ totalRuns: number; lastRunAt: string | null; totals: typeof stats.totals }> {
    return {
      totalRuns: stats.totalRuns,
      lastRunAt: stats.lastRunAt,
      totals: { ...stats.totals }
    };
  }
};
