import axios from 'axios';
import { findHotels, type Hotel } from './hotelCatalog.js';

interface SearchOptions {
  city: string;
  country?: string;
  limit?: number;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export class HotelProvider {
  private readonly rapidKey: string;
  private readonly baseUrl = 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination';

  constructor() {
    this.rapidKey = process.env.RAPIDAPI_KEY || '';
  }

  async search(options: SearchOptions): Promise<Hotel[]> {
    const fallback = findHotels(options.city);

    if (!this.rapidKey || this.rapidKey === 'your_rapidapi_key_here') {
      return this.limit(fallback, options.limit);
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: { query: options.city },
        headers: {
          'X-RapidAPI-Key': this.rapidKey,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!Array.isArray(response.data?.data)) {
        return this.limit(fallback, options.limit);
      }

      const hotels: Hotel[] = response.data.data.map((item: any, index: number) => ({
        id: item.search_id ?? `rapid-${index}`,
        name: item.label ?? 'Hotel',
        description: item.description ?? '',
        address: item.full_tag ?? '',
        city: options.city,
        country: options.country ?? '',
        coordinates: {
          lat: item.latitude ?? 0,
          lng: item.longitude ?? 0
        },
        rating: Number(item.rating ?? 0),
        price: {
          amount: Number(item.price ?? 0),
          currency: item.currency ?? 'USD',
          perNight: true
        },
        images: item.imageUrl ? [item.imageUrl] : [],
        amenities: [],
        url: item.url ?? ''
      }));

      return this.limit(hotels.length > 0 ? hotels : fallback, options.limit);
    } catch (error) {
      return this.limit(fallback, options.limit);
    }
  }

  private limit(hotels: Hotel[], limit?: number): Hotel[] {
    if (!limit) {
      return hotels;
    }

    return hotels.slice(0, limit);
  }
}
