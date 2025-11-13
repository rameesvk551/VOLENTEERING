interface SearchOptions {
  limit?: number;
}

interface HotelSummary {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  photos: string[];
  location: {
    lat: number;
    lng: number;
  };
}

export class HotelService {
  async searchHotels(city: string, country: string, options: SearchOptions = {}): Promise<HotelSummary[]> {
    const limit = options.limit ?? 10;
    return Array.from({ length: limit }).map((_, index) => ({
      id: `${city.toLowerCase()}-hotel-${index + 1}`,
      name: `${city} Comfort Stay ${index + 1}`,
      address: `${index + 10} ${city} Central Avenue, ${country}`,
      rating: 4.2,
      priceLevel: 2,
      photos: [
        'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80'
      ],
      location: {
        lat: 28.6139 + index * 0.001,
        lng: 77.209 + index * 0.001
      }
    }));
  }
}
