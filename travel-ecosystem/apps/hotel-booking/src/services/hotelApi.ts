/**
 * Hotel API Service
 * Communicates with Hotel Discovery & Booking Service
 */

import axios from 'axios';
import type {
  Hotel,
  Room,
  Reservation,
  SearchQuery,
  SearchResult,
  BookingDecision,
  CreateReservationRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const HOTEL_API_URL = `${API_BASE_URL}/api/hotels`;

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('token') || localStorage.getItem('auth_token');
}

/**
 * Create axios instance with auth headers
 */
function createAxiosInstance() {
  const token = getAuthToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

/**
 * Search hotels
 */
export async function searchHotels(query: SearchQuery): Promise<SearchResult> {
  const api = createAxiosInstance();
  const params: any = {};
  
  if (query.location) params.location = query.location;
  if (query.checkInDate) params.checkInDate = query.checkInDate;
  if (query.checkOutDate) params.checkOutDate = query.checkOutDate;
  if (query.guests) params.guests = query.guests;
  if (query.rooms) params.rooms = query.rooms;
  if (query.minPrice) params.minPrice = query.minPrice;
  if (query.maxPrice) params.maxPrice = query.maxPrice;
  if (query.minRating) params.minRating = query.minRating;
  if (query.starRating) params.starRating = query.starRating;
  if (query.amenities && query.amenities.length > 0) {
    params.amenities = query.amenities.join(',');
  }
  if (query.limit) params.limit = query.limit;
  if (query.offset) params.offset = query.offset;

  const response = await api.get(`${HOTEL_API_URL}/search`, { params });
  return response.data.data;
}

/**
 * Get hotel details by ID
 */
export async function getHotelDetails(hotelId: string): Promise<Hotel> {
  const api = createAxiosInstance();
  const response = await api.get(`${HOTEL_API_URL}/${hotelId}`);
  return response.data.data.hotel;
}

/**
 * Get rooms for a hotel
 */
export async function getHotelRooms(hotelId: string): Promise<Room[]> {
  const api = createAxiosInstance();
  const response = await api.get(`${HOTEL_API_URL}/${hotelId}/rooms`);
  return response.data.data.rooms;
}

/**
 * Get booking decision for a hotel
 */
export async function getBookingDecision(hotelId: string): Promise<BookingDecision> {
  const api = createAxiosInstance();
  const response = await api.get(`${HOTEL_API_URL}/${hotelId}/booking-decision`);
  return response.data.data.decision;
}

/**
 * Create a reservation
 */
export async function createReservation(request: CreateReservationRequest): Promise<Reservation> {
  const api = createAxiosInstance();
  const response = await api.post(`${API_BASE_URL}/api/reservations`, request);
  return response.data.data.reservation;
}

/**
 * Get user's reservations
 */
export async function getUserReservations(): Promise<Reservation[]> {
  const api = createAxiosInstance();
  const response = await api.get(`${API_BASE_URL}/api/reservations`);
  return response.data.data.reservations;
}

/**
 * Get specific reservation
 */
export async function getReservation(reservationId: string): Promise<Reservation> {
  const api = createAxiosInstance();
  const response = await api.get(`${API_BASE_URL}/api/reservations/${reservationId}`);
  return response.data.data.reservation;
}

/**
 * Confirm a reservation
 */
export async function confirmReservation(reservationId: string): Promise<Reservation> {
  const api = createAxiosInstance();
  const response = await api.post(`${API_BASE_URL}/api/reservations/${reservationId}/confirm`);
  return response.data.data.reservation;
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(reservationId: string): Promise<Reservation> {
  const api = createAxiosInstance();
  const response = await api.post(`${API_BASE_URL}/api/reservations/${reservationId}/cancel`);
  return response.data.data.reservation;
}
