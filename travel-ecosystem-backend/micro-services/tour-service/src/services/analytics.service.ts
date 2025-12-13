import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, RedirectIntent } from '../models/tour.model.js';

/**
 * Analytics Service
 * Tracks user interactions and emits events for analytics processing
 */
export class AnalyticsService {
  private redirectIntents: Map<string, RedirectIntent> = new Map();
  private enableAnalytics: boolean;
  private analyticsServiceUrl?: string;

  constructor() {
    this.enableAnalytics = process.env.ENABLE_ANALYTICS === 'true';
    this.analyticsServiceUrl = process.env.ANALYTICS_SERVICE_URL;

    // Clean up old intents periodically (older than 24 hours)
    setInterval(() => {
      this.cleanupOldIntents();
    }, 3600000); // Every hour
  }

  /**
   * Track an analytics event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.enableAnalytics) {
      return;
    }

    // Log event locally
    console.log('[Analytics Event]', {
      type: event.eventType,
      timestamp: event.timestamp,
      userId: event.userId,
      tourId: event.tourId,
      provider: event.provider
    });

    // TODO: Send to analytics service if URL is configured
    // This would typically send to a message queue or analytics platform
    // Example: Kafka, RabbitMQ, Google Analytics, Mixpanel, etc.
    if (this.analyticsServiceUrl) {
      this.sendToAnalyticsService(event).catch(error => {
        console.error('[Analytics] Failed to send event:', error.message);
      });
    }
  }

  /**
   * Create a redirect intent for tracking
   */
  createRedirectIntent(
    userId: string | undefined,
    provider: string,
    productId: string,
    sessionId?: string
  ): string {
    const intentId = uuidv4();
    
    const intent: RedirectIntent = {
      intentId,
      userId,
      tourId: productId,
      provider,
      redirectUrl: '', // Will be set by the caller
      timestamp: new Date(),
      metadata: { sessionId }
    };

    this.redirectIntents.set(intentId, intent);
    
    return intentId;
  }

  /**
   * Get redirect intent
   */
  getRedirectIntent(intentId: string): RedirectIntent | undefined {
    return this.redirectIntents.get(intentId);
  }

  /**
   * Track conversion (if provider supports callback)
   */
  trackConversion(intentId: string, metadata?: Record<string, any>): void {
    const intent = this.redirectIntents.get(intentId);
    
    if (!intent) {
      console.warn('[Analytics] Intent not found for conversion:', intentId);
      return;
    }

    this.trackEvent({
      eventType: 'conversion',
      timestamp: new Date(),
      userId: intent.userId,
      tourId: intent.tourId,
      provider: intent.provider,
      metadata: {
        intentId,
        ...metadata
      }
    });

    // Remove intent after tracking conversion
    this.redirectIntents.delete(intentId);
  }

  /**
   * Send event to external analytics service
   */
  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    if (!this.analyticsServiceUrl) {
      return;
    }

    try {
      // TODO: Implement actual HTTP call to analytics service
      // Example using axios:
      // await axios.post(`${this.analyticsServiceUrl}/events`, event);
      
      // For now, just log
      console.log('[Analytics] Would send to:', this.analyticsServiceUrl);
    } catch (error: any) {
      throw new Error(`Analytics service error: ${error.message}`);
    }
  }

  /**
   * Clean up old redirect intents
   */
  private cleanupOldIntents(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [intentId, intent] of this.redirectIntents.entries()) {
      if (intent.timestamp < oneDayAgo) {
        this.redirectIntents.delete(intentId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Analytics] Cleaned up ${cleaned} old redirect intents`);
    }
  }

  /**
   * Get analytics statistics
   */
  getStats() {
    return {
      activeIntents: this.redirectIntents.size,
      analyticsEnabled: this.enableAnalytics,
      analyticsServiceUrl: this.analyticsServiceUrl
    };
  }
}
