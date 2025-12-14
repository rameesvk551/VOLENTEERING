import type { Hotel, HotelSearchQuery } from '../domain/Hotel.js';
import type { IHotelProvider } from './IHotelProvider.js';

/**
 * ProviderA Mock Implementation
 * 
 * Simulates a provider with a different schema that needs normalization.
 * In production, this would make actual HTTP requests to ProviderA's API.
 */
export class ProviderA implements IHotelProvider {
  getName(): string {
    return 'ProviderA';
  }

  async search(query: HotelSearchQuery): Promise<Hotel[]> {
    // Simulate API latency
    await this.delay(50);

    // Mock data with ProviderA's specific schema
    const mockHotels: Hotel[] = [
      {
        id: 'providerA-1',
        name: 'Grand Plaza Hotel',
        lat: 28.6139,
        lng: 77.2090,
        price: 150,
        currency: 'USD',
        rating: 4.5,
        provider: 'ProviderA',
        address: '123 Main Street',
        city: query.location,
        amenities: ['WiFi', 'Pool', 'Restaurant'],
        images: ['https://example.com/img1.jpg'],
      },
      {
        id: 'providerA-2',
        name: 'Comfort Inn Downtown',
        lat: 28.6129,
        lng: 77.2295,
        price: 85,
        currency: 'USD',
        rating: 4.0,
        provider: 'ProviderA',
        address: '456 Central Avenue',
        city: query.location,
        amenities: ['WiFi', 'Parking'],
        images: ['https://example.com/img2.jpg'],
      },
      {
        id: 'providerA-3',
        name: 'Luxury Suites',
        lat: 28.6145,
        lng: 77.2088,
        price: 250,
        currency: 'USD',
        rating: 4.8,
        provider: 'ProviderA',
        address: '789 Elite Boulevard',
        city: query.location,
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant'],
        images: ['https://example.com/img3.jpg'],
      },
      {
        id: 'providerA-4',
        name: 'Budget Stay Hotel',
        lat: 28.6100,
        lng: 77.2300,
        price: 45,
        currency: 'USD',
        rating: 3.5,
        provider: 'ProviderA',
        address: '12 Economy Street',
        city: query.location,
        amenities: ['WiFi'],
        images: ['https://example.com/img4.jpg'],
      },
    ];

    return mockHotels;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
