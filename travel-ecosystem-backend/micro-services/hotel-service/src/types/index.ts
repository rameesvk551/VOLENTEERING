/**
 * Core Types for Hotel Discovery & Booking Service
 */

export enum HotelSource {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
  PRESIDENTIAL = 'PRESIDENTIAL'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Price {
  amount: number;
  currency: string;
  perNight: boolean;
}

export interface Room {
  id: string;
  hotelId: string;
  type: RoomType;
  name: string;
  description: string;
  capacity: number;
  price: Price;
  amenities: string[];
  images: string[];
  available: boolean;
  totalRooms: number;
}

export interface Availability {
  roomId: string;
  date: string;
  availableRooms: number;
  price: Price;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  rating: number;
  starRating?: number;
  reviewCount?: number;
  price: Price;
  images: string[];
  amenities: string[];
  roomTypes?: string[];
  url: string;
  availability?: boolean;
  distanceFromCenter?: number;
  source: HotelSource;
  externalBookingUrl?: string;
}

export interface Reservation {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  currency: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  guestDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface SearchQuery {
  location: string;
  city?: string;
  country?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  starRating?: number;
  amenities?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  hotels: Hotel[];
  total: number;
  offset: number;
  limit: number;
}

export interface BookingDecision {
  canBookInternally: boolean;
  redirectUrl?: string;
  message: string;
  hotelSource: HotelSource;
}

export interface CreateReservationRequest {
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  guestDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ReservationEvent {
  eventType: 'RESERVATION_CREATED' | 'RESERVATION_CONFIRMED' | 'RESERVATION_CANCELLED';
  reservationId: string;
  userId: string;
  hotelId: string;
  timestamp: string;
  data: Reservation;
}
