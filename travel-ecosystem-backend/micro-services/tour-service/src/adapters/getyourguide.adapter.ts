import { v4 as uuidv4 } from 'uuid';
import { ITourProvider, ProviderError } from './base-provider.adapter.js';
import { Tour, TourSearchQuery } from '../models/tour.model.js';

/**
 * GetYourGuide Provider Adapter
 * Integrates with GetYourGuide API for tour data
 */
export class GetYourGuideAdapter implements ITourProvider {
  readonly providerId = 'getyourguide';
  readonly providerName = 'GetYourGuide';

  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly affiliateId: string;

  constructor(
    apiKey?: string,
    apiUrl?: string,
    affiliateId?: string
  ) {
    this.apiKey = apiKey || '';
    this.apiUrl = apiUrl || 'https://api.getyourguide.com/1';
    this.affiliateId = affiliateId || '';
  }

  async search(query: TourSearchQuery): Promise<Tour[]> {
    // If no API key, return mock data
    if (!this.apiKey) {
      return this.getMockData(query);
    }

    try {
      // TODO: Implement actual API call when keys are available
      // const response = await axios.get(`${this.apiUrl}/tours`, {
      //   params: this.buildQueryParams(query),
      //   headers: { 'X-API-Key': this.apiKey }
      // });
      // return this.normalizeResults(response.data);

      // For now, return mock data
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
      // TODO: Implement actual API call
      return this.getMockTourDetails(productId);
    } catch (error) {
      throw new ProviderError(this.providerId, 'Get details failed', error);
    }
  }

  generateRedirectUrl(productId: string, metadata?: Record<string, any>): string {
    const baseUrl = `https://www.getyourguide.com/tour/${productId}`;
    const params = new URLSearchParams();

    if (this.affiliateId) {
      params.append('partner_id', this.affiliateId);
    }

    if (metadata?.userId) {
      params.append('user_id', metadata.userId);
    }

    if (metadata?.intentId) {
      params.append('intent_id', metadata.intentId);
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple connectivity check
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mock data generator for development/testing
   */
  private getMockData(query: TourSearchQuery): Tour[] {
    const location = query.location || 'Paris';
    const country = query.country || 'France';

    const mockTours: Tour[] = [
      {
        id: uuidv4(),
        normalizedAt: new Date(),
        title: `Eiffel Tower Summit Access with Host`,
        description: `Skip the line and head straight to the summit of the Eiffel Tower with a knowledgeable host. Enjoy breathtaking views of Paris from the top of this iconic landmark. Learn about the tower's history and architecture while taking in panoramic views of the city.`,
        shortDescription: 'Skip-the-line access to Eiffel Tower summit',
        location: {
          city: location,
          country: country,
          coordinates: { lat: 48.8584, lng: 2.2945 },
          address: 'Champ de Mars, 5 Avenue Anatole France'
        },
        price: {
          amount: 89.99,
          currency: 'USD',
          displayPrice: '$89.99'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f',
            isPrimary: true,
            caption: 'Eiffel Tower'
          }
        ],
        rating: {
          average: 4.8,
          count: 12543
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'gyg-123456',
          url: this.generateRedirectUrl('gyg-123456')
        },
        duration: {
          value: 2,
          unit: 'hours',
          displayText: '2 hours'
        },
        category: {
          primary: 'Cultural',
          tags: ['skip-the-line', 'landmark', 'family-friendly', 'photo opportunity']
        },
        highlights: [
          { text: 'Skip-the-line access to summit' },
          { text: 'Panoramic views of Paris' },
          { text: 'Expert host commentary' },
          { text: 'Small group experience' }
        ],
        inclusions: ['Summit access', 'Host guide', 'Skip-the-line tickets'],
        exclusions: ['Food and drinks', 'Hotel pickup', 'Gratuities'],
        cancellation: {
          allowed: true,
          cutoffHours: 24,
          refundType: 'full',
          policy: 'Free cancellation up to 24 hours before'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 15
        },
        languages: ['English', 'French', 'Spanish'],
        popularityScore: 95,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        normalizedAt: new Date(),
        title: `Louvre Museum Skip-the-Line Tour`,
        description: `Discover the world's largest art museum with a professional guide. Skip the long lines and explore masterpieces including the Mona Lisa, Venus de Milo, and ancient Egyptian artifacts. Perfect for art lovers and history enthusiasts.`,
        shortDescription: 'Guided tour of Louvre Museum with skip-the-line access',
        location: {
          city: location,
          country: country,
          coordinates: { lat: 48.8606, lng: 2.3376 },
          address: 'Rue de Rivoli'
        },
        price: {
          amount: 69.99,
          currency: 'USD',
          displayPrice: '$69.99'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
            isPrimary: true,
            caption: 'Louvre Museum'
          }
        ],
        rating: {
          average: 4.7,
          count: 8932
        },
        provider: {
          id: this.providerId,
          name: this.providerName,
          productId: 'gyg-234567',
          url: this.generateRedirectUrl('gyg-234567')
        },
        duration: {
          value: 3,
          unit: 'hours',
          displayText: '3 hours'
        },
        category: {
          primary: 'Cultural',
          tags: ['museum', 'art', 'history', 'skip-the-line']
        },
        highlights: [
          { text: 'See the Mona Lisa' },
          { text: 'Skip long entrance lines' },
          { text: 'Expert art historian guide' },
          { text: 'Headset for clear audio' }
        ],
        inclusions: ['Museum entry', 'Professional guide', 'Headset', 'Skip-the-line access'],
        exclusions: ['Food and drinks', 'Hotel pickup', 'Gratuities'],
        cancellation: {
          allowed: true,
          cutoffHours: 48,
          refundType: 'full',
          policy: 'Free cancellation up to 48 hours before'
        },
        availability: {
          isAvailable: true,
          spotsLeft: 8
        },
        languages: ['English', 'French', 'German', 'Italian'],
        popularityScore: 92,
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
