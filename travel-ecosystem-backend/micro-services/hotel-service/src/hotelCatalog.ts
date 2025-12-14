import { HotelSource } from './types/index.js';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  starRating?: number;
  reviewCount?: number;
  price: {
    amount: number;
    currency: string;
    perNight: boolean;
  };
  images: string[];
  amenities: string[];
  roomTypes?: string[];
  url: string;
  availability?: boolean;
  distanceFromCenter?: number;
  source: HotelSource;
  externalBookingUrl?: string;
}

const catalog: Record<string, Hotel[]> = {
  delhi: [
    {
      id: 'hotel-delhi-1',
      name: 'The Imperial New Delhi',
      description: 'Luxury heritage hotel in the heart of New Delhi with colonial architecture',
      address: 'Janpath, Connaught Place',
      city: 'Delhi',
      country: 'India',
      coordinates: { lat: 28.6267, lng: 77.2151 },
      rating: 4.7,
      starRating: 5,
      reviewCount: 1245,
      price: { amount: 15000, currency: 'INR', perNight: true },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Gym', 'Room Service'],
      roomTypes: ['Deluxe Room', 'Suite', 'Presidential Suite'],
      url: 'https://theimperialindia.com',
      availability: true,
      distanceFromCenter: 1.2,
      source: HotelSource.INTERNAL
    },
    {
      id: 'hotel-delhi-2',
      name: 'The Leela Palace New Delhi',
      description: 'Award-winning luxury hotel featuring traditional Indian hospitality',
      address: 'Diplomatic Enclave, Chanakyapuri',
      city: 'Delhi',
      country: 'India',
      coordinates: { lat: 28.5945, lng: 77.1869 },
      rating: 4.8,
      starRating: 5,
      reviewCount: 987,
      price: { amount: 18000, currency: 'INR', perNight: true },
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
      ],
      amenities: ['Pool', 'Spa', 'Multiple Restaurants', 'WiFi', 'Gym', 'Butler Service'],
      roomTypes: ['Premier Room', 'Luxury Suite', 'Royal Suite'],
      url: 'https://www.theleela.com',
      availability: true,
      distanceFromCenter: 5.5,
      source: HotelSource.INTERNAL
    }
  ],
  paris: [
    {
      id: 'hotel-paris-1',
      name: 'Le Royal Monceau - Raffles Paris',
      description: 'Art-centric luxury hotel near the Arc de Triomphe',
      address: '37 Avenue Hoche',
      city: 'Paris',
      country: 'France',
      coordinates: { lat: 48.8767, lng: 2.2991 },
      rating: 4.8,
      starRating: 5,
      reviewCount: 876,
      price: { amount: 650, currency: 'EUR', perNight: true },
      images: ['https://images.unsplash.com/photo-1455587734955-081b22074882?w=800'],
      amenities: ['Pool', 'Spa', 'Art Gallery', 'WiFi', 'Restaurant', 'Bar'],
      url: 'https://www.raffles.com',
      availability: true,
      distanceFromCenter: 2.5,
      source: HotelSource.INTERNAL
    }
  ],
  tokyo: [
    {
      id: 'hotel-tokyo-1',
      name: 'The Ritz-Carlton Tokyo',
      description: 'Luxury hotel occupying the top floors of Midtown Tower',
      address: '9-7-1 Akasaka, Minato-ku',
      city: 'Tokyo',
      country: 'Japan',
      coordinates: { lat: 35.6656, lng: 139.7298 },
      rating: 4.7,
      starRating: 5,
      reviewCount: 1123,
      price: { amount: 55000, currency: 'JPY', perNight: true },
      images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
      amenities: ['Sky Pool', 'Spa', 'Multiple Restaurants', 'WiFi', 'Gym'],
      url: 'https://www.ritzcarlton.com',
      availability: true,
      distanceFromCenter: 3.2,
      source: HotelSource.INTERNAL
    }
  ]
};

export function findHotels(city: string): Hotel[] {
  return catalog[city.toLowerCase()] ?? [];
}
