/**
 * Reservation Service
 * Handles reservation creation, confirmation, and cancellation
 * Emits events for payment and notification services
 */

import { Reservation, CreateReservationRequest, ReservationStatus, ReservationEvent, HotelSource } from '../types/index.js';
import { db } from '../database/index.js';
import { BookingDecisionEngine } from './bookingDecision.service.js';
import { EventEmitter } from './eventEmitter.service.js';
import { v4 as uuidv4 } from 'uuid';

export class ReservationService {
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Create a new reservation (internal hotels only)
   */
  async createReservation(userId: string, request: CreateReservationRequest): Promise<Reservation> {
    const { hotelId, roomId, checkInDate, checkOutDate, guests, guestDetails } = request;

    // Validate hotel exists and can be booked internally
    const hotel = db.getHotelById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const decision = BookingDecisionEngine.decide(hotel);
    if (!decision.canBookInternally) {
      throw new Error('This hotel cannot be booked internally. Please use the external booking URL.');
    }

    // Validate room exists
    const room = db.getRoomById(roomId);
    if (!room || room.hotelId !== hotelId) {
      throw new Error('Room not found or does not belong to this hotel');
    }

    // Check availability
    const available = db.checkAvailability(roomId, checkInDate, checkOutDate);
    if (!available) {
      throw new Error('Room is not available for the selected dates');
    }

    // Calculate total amount (simplified - just multiply by nights)
    const nights = this.calculateNights(checkInDate, checkOutDate);
    const totalAmount = room.price.amount * nights;

    // Create reservation
    const reservation = db.createReservation({
      userId,
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      currency: room.price.currency,
      status: ReservationStatus.PENDING,
      guestDetails
    });

    // Emit RESERVATION_CREATED event
    await this.eventEmitter.emitReservationEvent({
      eventType: 'RESERVATION_CREATED',
      reservationId: reservation.id,
      userId,
      hotelId,
      timestamp: new Date().toISOString(),
      data: reservation
    });

    return reservation;
  }

  /**
   * Confirm a reservation
   */
  async confirmReservation(reservationId: string): Promise<Reservation> {
    const reservation = db.getReservationById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error(`Cannot confirm reservation with status: ${reservation.status}`);
    }

    const updated = db.updateReservationStatus(reservationId, ReservationStatus.CONFIRMED);
    if (!updated) {
      throw new Error('Failed to update reservation status');
    }

    // Emit RESERVATION_CONFIRMED event
    await this.eventEmitter.emitReservationEvent({
      eventType: 'RESERVATION_CONFIRMED',
      reservationId: updated.id,
      userId: updated.userId,
      hotelId: updated.hotelId,
      timestamp: new Date().toISOString(),
      data: updated
    });

    return updated;
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string, userId: string): Promise<Reservation> {
    const reservation = db.getReservationById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new Error('Unauthorized: You can only cancel your own reservations');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new Error('Reservation is already cancelled');
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed reservation');
    }

    const updated = db.cancelReservation(reservationId);
    if (!updated) {
      throw new Error('Failed to cancel reservation');
    }

    // Emit RESERVATION_CANCELLED event
    await this.eventEmitter.emitReservationEvent({
      eventType: 'RESERVATION_CANCELLED',
      reservationId: updated.id,
      userId: updated.userId,
      hotelId: updated.hotelId,
      timestamp: new Date().toISOString(),
      data: updated
    });

    return updated;
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: string, userId: string): Promise<Reservation> {
    const reservation = db.getReservationById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new Error('Unauthorized: You can only view your own reservations');
    }

    return reservation;
  }

  /**
   * Get all reservations for a user
   */
  async getUserReservations(userId: string): Promise<Reservation[]> {
    return db.getReservationsByUserId(userId);
  }

  /**
   * Calculate number of nights
   */
  private calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
