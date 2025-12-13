import { Request, Response } from 'express';
import { TourAggregatorService } from '../services/tour-aggregator.service.js';
import { TourSearchQuery } from '../models/tour.model.js';
import { CacheService } from '../services/cache.service.js';
import { AnalyticsService } from '../services/analytics.service.js';

/**
 * Tour Controller
 * Handles HTTP requests for tour search and booking redirects
 */
export class TourController {
  private tourAggregator: TourAggregatorService;
  private cacheService: CacheService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.cacheService = new CacheService();
    this.analyticsService = new AnalyticsService();
    this.tourAggregator = new TourAggregatorService(
      this.cacheService,
      this.analyticsService
    );
  }

  /**
   * Search tours
   * GET /api/tours/search
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string | undefined;
      
      // Build search query from request
      const query: TourSearchQuery = {
        location: req.query.location as string,
        country: req.query.country as string,
        date: req.query.date as string,
        category: req.query.category as string,
        duration: this.parseDurationQuery(req.query),
        price: this.parsePriceQuery(req.query),
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        sortBy: (req.query.sortBy as any) || 'popularity',
        sortOrder: (req.query.sortOrder as any) || 'desc'
      };

      const result = await this.tourAggregator.search(query, userId);
      
      res.json(result);
    } catch (error: any) {
      console.error('[TourController] Search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search tours',
        error: error.message
      });
    }
  };

  /**
   * Get tour details
   * GET /api/tours/:provider/:productId
   */
  getDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider, productId } = req.params;
      const userId = req.headers['x-user-id'] as string | undefined;

      const tour = await this.tourAggregator.getTourDetails(provider, productId, userId);

      if (!tour) {
        res.status(404).json({
          success: false,
          message: 'Tour not found'
        });
        return;
      }

      res.json({
        success: true,
        data: tour
      });
    } catch (error: any) {
      console.error('[TourController] Get details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tour details',
        error: error.message
      });
    }
  };

  /**
   * Generate redirect URL for booking
   * POST /api/tours/redirect
   */
  generateRedirect = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provider, productId } = req.body;
      const userId = req.headers['x-user-id'] as string | undefined;
      const sessionId = req.headers['x-session-id'] as string | undefined;

      if (!provider || !productId) {
        res.status(400).json({
          success: false,
          message: 'Provider and productId are required'
        });
        return;
      }

      const result = this.tourAggregator.generateRedirectUrl(
        provider,
        productId,
        userId,
        sessionId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[TourController] Redirect error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate redirect URL',
        error: error.message
      });
    }
  };

  /**
   * Track conversion (callback from provider)
   * POST /api/tours/conversion
   */
  trackConversion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { intentId, ...metadata } = req.body;

      if (!intentId) {
        res.status(400).json({
          success: false,
          message: 'intentId is required'
        });
        return;
      }

      this.analyticsService.trackConversion(intentId, metadata);

      res.json({
        success: true,
        message: 'Conversion tracked'
      });
    } catch (error: any) {
      console.error('[TourController] Track conversion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track conversion',
        error: error.message
      });
    }
  };

  /**
   * Get service health and statistics
   * GET /api/tours/health
   */
  getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const cacheStats = this.cacheService.getStats();
      const analyticsStats = this.analyticsService.getStats();

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: cacheStats,
        analytics: analyticsStats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  };

  /**
   * Clear cache (admin operation - protected by middleware)
   * POST /api/tours/cache/clear
   */
  clearCache = async (req: Request, res: Response): Promise<void> => {
    try {
      this.cacheService.clear();
      
      res.json({
        success: true,
        message: 'Cache cleared'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error.message
      });
    }
  };

  /**
   * Parse duration query parameters
   */
  private parseDurationQuery(query: any) {
    if (!query.durationMin && !query.durationMax) {
      return undefined;
    }

    return {
      min: query.durationMin ? parseInt(query.durationMin) : undefined,
      max: query.durationMax ? parseInt(query.durationMax) : undefined,
      unit: (query.durationUnit as any) || 'hours'
    };
  }

  /**
   * Parse price query parameters
   */
  private parsePriceQuery(query: any) {
    if (!query.priceMin && !query.priceMax) {
      return undefined;
    }

    return {
      min: query.priceMin ? parseFloat(query.priceMin) : undefined,
      max: query.priceMax ? parseFloat(query.priceMax) : undefined,
      currency: query.currency || 'USD'
    };
  }
}
