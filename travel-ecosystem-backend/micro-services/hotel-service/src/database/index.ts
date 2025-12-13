/**
 * In-Memory Database for Hotel Discovery & Booking Service
 * This provides a simple data store for demonstration
 * In production, this would be replaced with PostgreSQL/MongoDB
 */

import { Hotel, Room, Reservation, Availability, HotelSource, RoomType, ReservationStatus } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

class HotelDatabase {
  private hotels: Map<string, Hotel> = new Map();
  private rooms: Map<string, Room> = new Map();
  private reservations: Map<string, Reservation> = new Map();
  private availability: Map<string, Availability[]> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Internal Hotels
    const hotel1: Hotel = {
      id: 'hotel-internal-001',
      name: 'The Grand Plaza Hotel',
      description: 'Luxury hotel in the heart of the city with world-class amenities',
      address: '123 Main Street, Downtown',
      city: 'New York',
      country: 'USA',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      rating: 4.8,
      starRating: 5,
      reviewCount: 2345,
      price: { amount: 299, currency: 'USD', perNight: true },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Room Service', 'Concierge'],
      roomTypes: ['Single', 'Double', 'Suite', 'Presidential Suite'],
      url: 'https://grandplaza.example.com',
      availability: true,
      distanceFromCenter: 0.5,
      source: HotelSource.INTERNAL
    };

    const hotel2: Hotel = {
      id: 'hotel-internal-002',
      name: 'Seaside Resort & Spa',
      description: 'Beachfront resort with stunning ocean views',
      address: '456 Ocean Drive, Beach District',
      city: 'Miami',
      country: 'USA',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      rating: 4.6,
      starRating: 4,
      reviewCount: 1876,
      price: { amount: 199, currency: 'USD', perNight: true },
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
      ],
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Bar'],
      roomTypes: ['Double', 'Suite'],
      url: 'https://seasideresort.example.com',
      availability: true,
      distanceFromCenter: 5.2,
      source: HotelSource.INTERNAL
    };

    this.hotels.set(hotel1.id, hotel1);
    this.hotels.set(hotel2.id, hotel2);

    // Rooms for Hotel 1
    const room1: Room = {
      id: 'room-001',
      hotelId: hotel1.id,
      type: RoomType.DELUXE,
      name: 'Deluxe King Room',
      description: 'Spacious room with king bed and city view',
      capacity: 2,
      price: { amount: 299, currency: 'USD', perNight: true },
      amenities: ['King Bed', 'WiFi', 'Mini Bar', 'Coffee Maker'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      available: true,
      totalRooms: 20
    };

    const room2: Room = {
      id: 'room-002',
      hotelId: hotel1.id,
      type: RoomType.SUITE,
      name: 'Executive Suite',
      description: 'Luxury suite with separate living area',
      capacity: 4,
      price: { amount: 499, currency: 'USD', perNight: true },
      amenities: ['King Bed', 'Living Area', 'WiFi', 'Mini Bar', 'Coffee Maker', 'City View'],
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
      available: true,
      totalRooms: 10
    };

    this.rooms.set(room1.id, room1);
    this.rooms.set(room2.id, room2);
  }

  // Hotel Operations
  getAllHotels(): Hotel[] {
    return Array.from(this.hotels.values());
  }

  getHotelById(id: string): Hotel | undefined {
    return this.hotels.get(id);
  }

  searchHotels(city?: string, country?: string): Hotel[] {
    return Array.from(this.hotels.values()).filter(hotel => {
      if (city && hotel.city.toLowerCase() !== city.toLowerCase()) return false;
      if (country && hotel.country.toLowerCase() !== country.toLowerCase()) return false;
      return true;
    });
  }

  // Room Operations
  getRoomsByHotelId(hotelId: string): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.hotelId === hotelId);
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  // Reservation Operations
  createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Reservation {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newReservation: Reservation = {
      ...reservation,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  getReservationById(id: string): Reservation | undefined {
    return this.reservations.get(id);
  }

  getReservationsByUserId(userId: string): Reservation[] {
    return Array.from(this.reservations.values()).filter(r => r.userId === userId);
  }

  updateReservationStatus(id: string, status: ReservationStatus): Reservation | undefined {
    const reservation = this.reservations.get(id);
    if (reservation) {
      reservation.status = status;
      reservation.updatedAt = new Date().toISOString();
      this.reservations.set(id, reservation);
    }
    return reservation;
  }

  cancelReservation(id: string): Reservation | undefined {
    return this.updateReservationStatus(id, ReservationStatus.CANCELLED);
  }

  // Availability check
  checkAvailability(roomId: string, checkInDate: string, checkOutDate: string): boolean {
    // Simplified availability check - in production, check against bookings
    const room = this.rooms.get(roomId);
    return room?.available ?? false;
  }
}

export const db = new HotelDatabase();
