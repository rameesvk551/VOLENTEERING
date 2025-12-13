import { v4 as uuidv4 } from 'uuid';
import { ITourProvider, ProviderError } from './base-provider.adapter.js';
import { Tour, TourSearchQuery } from '../models/tour.model.js';

/**
 * Klook Provider Adapter (Future-ready)
 * Integrates with Klook API for tour data
 */
export class KlookAdapter implements ITourProvider {
  readonly providerId = 'klook';
  readonly providerName = 'Klook';

  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly affiliateId: string;

  constructor(
    apiKey?: string,
    apiUrl?: string,
    affiliateId?: string
  ) {
    this.apiKey = apiKey || '';
    this.apiUrl = apiUrl || 'https://api.klook.com';
    this.affiliateId = affiliateId || '';
  }

  async search(query: TourSearchQuery): Promise<Tour[]> {
    if (!this.apiKey) {
      return this.getMockData(query);
    }

    try {
      // TODO: Implement actual Klook API call when available
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
    const baseUrl = `https://www.klook.com/activity/${productId}`;
    const params = new URLSearchParams();

    if (this.affiliateId) {
      params.append('aid', this.affiliateId);
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
        title: `Paris Hop-On Hop-Off Bus Tour`,
        description: `Explore Paris at your own pace with this flexible hop-on hop-off bus tour. Choose from multiple routes covering all major attractions. Enjoy audio commentary in 15 languages and hop on and off as many times as you like within your ticket validity.`,
        shortDescription: 'Flexible sightseeing bus tour of Paris',
        location: {
          city: location,
          country: country,
          coordinates: { lat: 48.8566, lng: 2.3522 },
          address: 'Multiple stops throughout Paris'
        },
        price: {
          amount: 42.00,
          currency: 'USD',
          displayPrice: '$42.00'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1431274172761-fca41d930114',
            isPrimary: true,
            caption: 'Paris Bus Tour'
          }
        ],
        rating: {
          average: 4.5,
          count: 9876
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'klook-789012',
          url: this.generateRedirectUrl('klook-789012')
        },
        duration: {
          value: 1,
          unit: 'days',
          displayText: '1 day (unlimited hops)'
        },
        category: {
          primary: 'Sightseeing',
          tags: ['hop-on-hop-off', 'bus tour', 'flexible', 'self-guided']
        },
        highlights: [
          { text: 'Unlimited hop-on hop-off access' },
          { text: 'Audio guide in 15 languages' },
          { text: 'See all major attractions' },
          { text: 'Valid for 24 or 48 hours' }
        ],
        inclusions: ['24-hour bus pass', 'Audio commentary', 'Route map'],
        exclusions: ['Attraction entry tickets', 'Food and drinks', 'Hotel pickup'],
        cancellation: {
          allowed: true,
          cutoffHours: 24,
          refundType: 'full',
          policy: 'Free cancellation up to 24 hours before'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 50
        },
        languages: ['English', 'French', 'Spanish', 'German', 'Italian', 'Chinese', 'Japanese'],
        popularityScore: 85,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        normalizedAt: new Date(),
        title: `Disneyland Paris 1-Day Ticket`,
        description: `Experience the magic of Disneyland Paris with this 1-day ticket. Enjoy thrilling rides, meet beloved Disney characters, watch spectacular shows, and explore both Disneyland Park and Walt Disney Studios Park. Perfect for families and Disney fans.`,
        shortDescription: '1-day access to Disneyland Paris',
        location: {
          city: 'Marne-la-Vallée',
          country: country,
          coordinates: { lat: 48.8722, lng: 2.7776 },
          address: 'Bd de Parc, Coupvray'
        },
        price: {
          amount: 89.00,
          currency: 'USD',
          displayPrice: '$89.00'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87',
            isPrimary: true,
            caption: 'Disneyland Paris'
          }
        ],
        rating: {
          average: 4.7,
          count: 15234
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'klook-890123',
          url: this.generateRedirectUrl('klook-890123')
        },
        duration: {
          value: 1,
          unit: 'days',
          displayText: 'Full day'
        },
        category: {
          primary: 'Adventure',
          tags: ['theme park', 'family-friendly', 'disney', 'full-day']
        },
        highlights: [
          { text: 'Access to both parks' },
          { text: 'Thrilling rides and attractions' },
          { text: 'Meet Disney characters' },
          { text: 'Spectacular shows and parades' }
        ],
        inclusions: ['1-day park entry', 'Access to rides and shows'],
        exclusions: ['Food and drinks', 'Transportation', 'FastPass', 'Souvenirs'],
        cancellation: {
          allowed: false,
          refundType: 'none',
          policy: 'Non-refundable'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 100
        },
        languages: ['English', 'French'],
        popularityScore: 93,
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
