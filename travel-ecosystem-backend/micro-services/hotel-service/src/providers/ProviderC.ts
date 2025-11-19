import type { Hotel, HotelSearchQuery } from '../domain/Hotel.js';
import type { IHotelProvider } from './IHotelProvider.js';

/**
 * ProviderC Mock Implementation
 * 
 * Simulates a third provider with unique hotels plus one duplicate.
 */
export class ProviderC implements IHotelProvider {
  getName(): string {
    return 'ProviderC';
  }

  async search(query: HotelSearchQuery): Promise<Hotel[]> {
    // Simulate API latency
    await this.delay(100);

    // Mock data with mostly unique hotels
    const mockHotels: Hotel[] = [
      {
        id: 'providerC-501',
        name: 'Luxury Suites', // DUPLICATE with ProviderA-3
        lat: 28.6145,
        lng: 77.2088,
        price: 245, // Different price
        currency: 'USD',
        rating: 4.9, // Different rating
        provider: 'ProviderC',
        address: '789 Elite Blvd',
        city: query.location,
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Concierge'],
        images: ['https://example.com/imgC1.jpg'],
      },
      {
        id: 'providerC-502',
        name: 'Heritage Palace',
        lat: 28.6267,
        lng: 77.2151,
        price: 300,
        currency: 'USD',
        rating: 4.9,
        provider: 'ProviderC',
        address: '555 Royal Avenue',
        city: query.location,
        amenities: ['WiFi', 'Pool', 'Spa', 'Museum', 'Restaurant'],
        images: ['https://example.com/imgC2.jpg'],
      },
      {
        id: 'providerC-503',
        name: 'City Center Express',
        lat: 28.6150,
        lng: 77.2250,
        price: 95,
        currency: 'USD',
        rating: 3.8,
        provider: 'ProviderC',
        address: '77 Commerce Street',
        city: query.location,
        amenities: ['WiFi', 'Breakfast'],
        images: ['https://example.com/imgC3.jpg'],
      },
      {
        id: 'providerC-504',
        name: 'Boutique Hotel Elegance',
        lat: 28.6180,
        lng: 77.2120,
        price: 175,
        currency: 'USD',
        rating: 4.6,
        provider: 'ProviderC',
        address: '22 Fashion District',
        city: query.location,
        amenities: ['WiFi', 'Restaurant', 'Rooftop Bar', 'Art Gallery'],
        images: ['https://example.com/imgC4.jpg'],
      },
      {
        id: 'providerC-505',
        name: 'Airport Inn',
        lat: 28.5562,
        lng: 77.1000,
        price: 70,
        currency: 'USD',
        rating: 3.9,
        provider: 'ProviderC',
        address: '1 Airport Road',
        city: query.location,
        amenities: ['WiFi', 'Shuttle', 'Parking'],
        images: ['https://example.com/imgC5.jpg'],
      },
    ];

    return mockHotels;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
