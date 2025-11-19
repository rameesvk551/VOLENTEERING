import type { Hotel, HotelSearchQuery } from '../domain/Hotel.js';
import type { IHotelProvider } from './IHotelProvider.js';

/**
 * ProviderB Mock Implementation
 * 
 * Simulates a second provider with overlapping data (for deduplication testing).
 * Some hotels from ProviderB are duplicates of ProviderA with slight variations.
 */
export class ProviderB implements IHotelProvider {
  getName(): string {
    return 'ProviderB';
  }

  async search(query: HotelSearchQuery): Promise<Hotel[]> {
    // Simulate API latency
    await this.delay(80);

    // Mock data with some duplicates (same location, similar name)
    const mockHotels: Hotel[] = [
      {
        id: 'providerB-101',
        name: 'Grand Plaza Hotel', // DUPLICATE with ProviderA-1
        lat: 28.6139,
        lng: 77.2090,
        price: 155, // Slightly different price
        currency: 'USD',
        rating: 4.6,
        provider: 'ProviderB',
        address: '123 Main St', // Slight variation in address
        city: query.location,
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar'],
        images: ['https://example.com/imgB1.jpg'],
      },
      {
        id: 'providerB-102',
        name: 'Seaside Resort',
        lat: 28.6050,
        lng: 77.2400,
        price: 180,
        currency: 'USD',
        rating: 4.7,
        provider: 'ProviderB',
        address: '999 Beach Road',
        city: query.location,
        amenities: ['WiFi', 'Beach Access', 'Restaurant'],
        images: ['https://example.com/imgB2.jpg'],
      },
      {
        id: 'providerB-103',
        name: 'Comfort Inn Downtown', // DUPLICATE with ProviderA-2
        lat: 28.6129,
        lng: 77.2295,
        price: 80, // Different price
        currency: 'USD',
        rating: 4.1,
        provider: 'ProviderB',
        address: '456 Central Ave',
        city: query.location,
        amenities: ['WiFi', 'Parking', 'Breakfast'],
        images: ['https://example.com/imgB3.jpg'],
      },
      {
        id: 'providerB-104',
        name: 'Mountain View Inn',
        lat: 28.6200,
        lng: 77.2100,
        price: 120,
        currency: 'USD',
        rating: 4.3,
        provider: 'ProviderB',
        address: '111 Hill Station Road',
        city: query.location,
        amenities: ['WiFi', 'Restaurant', 'Parking'],
        images: ['https://example.com/imgB4.jpg'],
      },
    ];

    return mockHotels;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
