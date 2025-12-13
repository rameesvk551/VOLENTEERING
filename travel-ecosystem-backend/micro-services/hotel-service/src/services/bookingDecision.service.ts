/**
 * Booking Decision Engine
 * Determines whether a hotel can be booked internally or requires external redirect
 */

import { Hotel, BookingDecision, HotelSource } from '../types/index.js';

export class BookingDecisionEngine {
  /**
   * Determine booking strategy for a hotel
   */
  static decide(hotel: Hotel): BookingDecision {
    if (hotel.source === HotelSource.INTERNAL) {
      return {
        canBookInternally: true,
        message: 'This hotel can be booked directly through our platform',
        hotelSource: HotelSource.INTERNAL
      };
    }

    // External hotel - return redirect URL
    return {
      canBookInternally: false,
      redirectUrl: hotel.externalBookingUrl || hotel.url,
      message: 'This hotel requires booking through our partner site',
      hotelSource: HotelSource.EXTERNAL
    };
  }

  /**
   * Check if booking is allowed for the hotel
   */
  static canBook(hotel: Hotel): boolean {
    return hotel.source === HotelSource.INTERNAL && hotel.availability === true;
  }

  /**
   * Get booking instructions for the hotel
   */
  static getBookingInstructions(hotel: Hotel): string {
    if (hotel.source === HotelSource.INTERNAL) {
      return 'Click "Book Now" to proceed with your reservation';
    }
    return 'You will be redirected to our partner site to complete your booking';
  }
}
