import { v4 as uuidv4 } from 'uuid';
import { ITourProvider, ProviderError } from './base-provider.adapter.js';
import { Tour, TourSearchQuery } from '../models/tour.model.js';

/**
 * Viator Provider Adapter
 * Integrates with Viator API for tour data
 */
export class ViatorAdapter implements ITourProvider {
  readonly providerId = 'viator';
  readonly providerName = 'Viator';

  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly affiliateId: string;

  constructor(
    apiKey?: string,
    apiUrl?: string,
    affiliateId?: string
  ) {
    this.apiKey = apiKey || '';
    this.apiUrl = apiUrl || 'https://api.viator.com';
    this.affiliateId = affiliateId || '';
  }

  async search(query: TourSearchQuery): Promise<Tour[]> {
    if (!this.apiKey) {
      return this.getMockData(query);
    }

    try {
      // TODO: Implement actual Viator API call
      return this.getMockData(query);
    } catch (error) {
      throw new ProviderError(this.providerId, 'Search failed', error);
    }
  }

  async getDetails(productId: string): Promise<Tour | null> {
    if (!this.apiKey) {
      return this.getMockTourDetails(productId);
    }

    try {
      return this.getMockTourDetails(productId);
    } catch (error) {
      throw new ProviderError(this.providerId, 'Get details failed', error);
    }
  }

  generateRedirectUrl(productId: string, metadata?: Record<string, any>): string {
    const baseUrl = `https://www.viator.com/tours/${productId}`;
    const params = new URLSearchParams();

    if (this.affiliateId) {
      params.append('pid', this.affiliateId);
    }

    if (metadata?.userId) {
      params.append('uid', metadata.userId);
    }

    if (metadata?.intentId) {
      params.append('intent', metadata.intentId);
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  private getMockData(query: TourSearchQuery): Tour[] {
    const location = query.location || 'Paris';
    const country = query.country || 'France';

    const mockTours: Tour[] = [
      {
        id: uuidv4(),
        normalizedAt: new Date(),
        title: `Seine River Cruise with Wine & Cheese`,
        description: `Experience Paris from the water on this romantic Seine River cruise. Enjoy French wine and cheese as you glide past illuminated monuments including Notre-Dame, the Eiffel Tower, and the Louvre. Perfect for couples and first-time visitors.`,
        shortDescription: 'Romantic river cruise with wine tasting',
        location: {
          city: location,
          country: country,
          coordinates: { lat: 48.8566, lng: 2.3522 },
          address: 'Port de la Bourdonnais'
        },
        price: {
          amount: 55.00,
          currency: 'USD',
          displayPrice: '$55.00'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
            isPrimary: true,
            caption: 'Seine River'
          }
        ],
        rating: {
          average: 4.6,
          count: 5621
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'viator-456789',
          url: this.generateRedirectUrl('viator-456789')
        },
        duration: {
          value: 1.5,
          unit: 'hours',
          displayText: '1.5 hours'
        },
        category: {
          primary: 'Food & Drink',
          tags: ['river cruise', 'wine tasting', 'romantic', 'evening']
        },
        highlights: [
          { text: 'Cruise along the Seine River' },
          { text: 'French wine and cheese tasting' },
          { text: 'See illuminated monuments' },
          { text: 'Audio commentary in multiple languages' }
        ],
        inclusions: ['River cruise', 'Wine and cheese', 'Audio guide'],
        exclusions: ['Hotel pickup', 'Additional food and drinks', 'Gratuities'],
        cancellation: {
          allowed: true,
          cutoffHours: 24,
          refundType: 'full',
          policy: 'Free cancellation up to 24 hours before'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 22
        },
        languages: ['English', 'French', 'Spanish', 'German'],
        popularityScore: 88,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        normalizedAt: new Date(),
        title: `Versailles Palace & Gardens Full-Day Tour`,
        description: `Explore the opulent Palace of Versailles and its magnificent gardens on this full-day tour from Paris. Skip the long lines and discover the Hall of Mirrors, Royal Apartments, and stunning gardens designed by André Le Nôtre. Transportation included.`,
        shortDescription: 'Full-day Versailles tour from Paris',
        location: {
          city: location,
          country: country,
          coordinates: { lat: 48.8049, lng: 2.1204 },
          address: 'Place d\'Armes, Versailles'
        },
        price: {
          amount: 125.00,
          currency: 'USD',
          originalAmount: 149.00,
          displayPrice: '$125.00'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
            isPrimary: true,
            caption: 'Versailles Palace'
          }
        ],
        rating: {
          average: 4.9,
          count: 7834
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'viator-567890',
          url: this.generateRedirectUrl('viator-567890')
        },
        duration: {
          value: 8,
          unit: 'hours',
          displayText: 'Full day (8 hours)'
        },
        category: {
          primary: 'Cultural',
          tags: ['palace', 'history', 'gardens', 'full-day', 'transportation']
        },
        highlights: [
          { text: 'Skip-the-line palace entry' },
          { text: 'Explore Hall of Mirrors' },
          { text: 'Visit the Royal Apartments' },
          { text: 'Stroll through magnificent gardens' },
          { text: 'Round-trip transportation from Paris' }
        ],
        inclusions: ['Transportation', 'Palace entry', 'Professional guide', 'Skip-the-line access'],
        exclusions: ['Lunch', 'Hotel pickup', 'Gratuities'],
        cancellation: {
          allowed: true,
          cutoffHours: 72,
          refundType: 'full',
          policy: 'Free cancellation up to 72 hours before'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 5
        },
        languages: ['English', 'French'],
        popularityScore: 96,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        normalizedAt: new Date(),
        title: `Paris Food Tour: Montmartre Tasting Experience`,
        description: `Discover Parisian cuisine on this guided food tour through charming Montmartre. Sample French cheeses, pastries, wine, and chocolates while learning about local culinary traditions. Visit family-owned shops and hidden gems.`,
        shortDescription: 'Montmartre food tasting walking tour',
        location: {
          city: location,
          country: country,
          coordinates: { lat: 48.8867, lng: 2.3431 },
          address: 'Montmartre, 18th arrondissement'
        },
        price: {
          amount: 95.00,
          currency: 'USD',
          displayPrice: '$95.00'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8',
            isPrimary: true,
            caption: 'Montmartre'
          }
        ],
        rating: {
          average: 4.8,
          count: 3241
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'viator-678901',
          url: this.generateRedirectUrl('viator-678901')
        },
        duration: {
          value: 3,
          unit: 'hours',
          displayText: '3 hours'
        },
        category: {
          primary: 'Food & Drink',
          tags: ['food tour', 'walking tour', 'local cuisine', 'small group']
        },
        highlights: [
          { text: 'Taste 10+ French specialties' },
          { text: 'Visit local artisan shops' },
          { text: 'Learn about French culinary culture' },
          { text: 'Small group (max 12 people)' }
        ],
        inclusions: ['Food tastings', 'Local guide', 'Wine tasting'],
        exclusions: ['Additional food and drinks', 'Gratuities', 'Hotel pickup'],
        cancellation: {
          allowed: true,
          cutoffHours: 48,
          refundType: 'full',
          policy: 'Free cancellation up to 48 hours before'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 10
        },
        languages: ['English', 'French'],
        popularityScore: 90,
        lastUpdated: new Date()
      }
    ];

    return this.filterMockTours(mockTours, query);
  }

  private getMockTourDetails(productId: string): Tour | null {
    const mockData = this.getMockData({});
    return mockData.find(t => t.provider.productId === productId) || mockData[0];
  }

  private filterMockTours(tours: Tour[], query: TourSearchQuery): Tour[] {
    let filtered = [...tours];

    if (query.category) {
      filtered = filtered.filter(t =>
        t.category.primary.toLowerCase() === query.category?.toLowerCase() ||
        t.category.tags.some(tag => tag.toLowerCase().includes(query.category?.toLowerCase() || ''))
      );
    }

    if (query.minRating) {
      filtered = filtered.filter(t => t.rating.average >= query.minRating!);
    }

    if (query.price?.min) {
      filtered = filtered.filter(t => t.price.amount >= query.price!.min!);
    }

    if (query.price?.max) {
      filtered = filtered.filter(t => t.price.amount <= query.price!.max!);
    }

    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered;
  }
}
