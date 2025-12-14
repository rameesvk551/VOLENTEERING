/**
 * Hotel Service Routes
 * RESTful API endpoints for hotel discovery and booking
 */

import { FastifyInstance } from 'fastify';
import { MetaSearchService } from '../services/metaSearch.service.js';
import { ReservationService } from '../services/reservation.service.js';
import { BookingDecisionEngine } from '../services/bookingDecision.service.js';
import { CacheService } from '../services/cache.service.js';
import { EventEmitter } from '../services/eventEmitter.service.js';
import { db } from '../database/index.js';
import { authenticateUser, optionalAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function registerRoutes(
  fastify: FastifyInstance,
  metaSearch: MetaSearchService,
  reservationService: ReservationService,
  cache: CacheService
): Promise<void> {
  
  // ============================================
  // SEARCH & DISCOVERY ENDPOINTS
  // ============================================

  /**
   * Unified meta-search endpoint
   * GET /api/hotels/search
   */
  fastify.get('/api/hotels/search', {
    preHandler: optionalAuth
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const query = request.query as any;
      
      // Generate cache key
      const cacheKey = cache.generateSearchCacheKey(query);
      
      // Try cache first
      const cached = await cache.getSearchResults(cacheKey);
      if (cached) {
        return reply.send({
          success: true,
          data: cached,
          cached: true
        });
      }

      // Perform meta-search
      const results = await metaSearch.search({
        location: query.location || query.city,
        city: query.city,
        country: query.country,
        checkInDate: query.checkInDate,
        checkOutDate: query.checkOutDate,
        guests: query.guests ? parseInt(query.guests) : undefined,
        rooms: query.rooms ? parseInt(query.rooms) : undefined,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        minRating: query.minRating ? parseFloat(query.minRating) : undefined,
        starRating: query.starRating ? parseInt(query.starRating) : undefined,
        amenities: query.amenities ? query.amenities.split(',') : undefined,
        limit: query.limit ? parseInt(query.limit) : 20,
        offset: query.offset ? parseInt(query.offset) : 0
      });

      // Cache results
      await cache.setSearchResults(cacheKey, results, 300); // 5 minutes

      return reply.send({
        success: true,
        data: results,
        cached: false
      });
    } catch (error: any) {
      fastify.log.error('Search error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Search failed',
        message: error.message
      });
    }
  });

  /**
   * Get hotel details
   * GET /api/hotels/:hotelId
   */
  fastify.get('/api/hotels/:hotelId', {
    preHandler: optionalAuth
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { hotelId } = request.params as { hotelId: string };

      // Try cache
      const cached = await cache.getHotel(hotelId);
      if (cached) {
        return reply.send({
          success: true,
          data: { hotel: cached },
          cached: true
        });
      }

      // Get from service
      const hotel = await metaSearch.getHotelDetails(hotelId);
      
      if (!hotel) {
        return reply.code(404).send({
          success: false,
          error: 'Hotel not found'
        });
      }

      // Cache it
      await cache.setHotel(hotelId, hotel, 600); // 10 minutes

      return reply.send({
        success: true,
        data: { hotel },
        cached: false
      });
    } catch (error: any) {
      fastify.log.error('Get hotel error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get hotel details',
        message: error.message
      });
    }
  });

  /**
   * Get rooms for a hotel
   * GET /api/hotels/:hotelId/rooms
   */
  fastify.get('/api/hotels/:hotelId/rooms', async (request, reply) => {
    try {
      const { hotelId } = request.params as { hotelId: string };
      const rooms = db.getRoomsByHotelId(hotelId);

      return reply.send({
        success: true,
        data: { rooms }
      });
    } catch (error: any) {
      fastify.log.error('Get rooms error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get rooms',
        message: error.message
      });
    }
  });

  /**
   * Get booking decision for a hotel
   * GET /api/hotels/:hotelId/booking-decision
   */
  fastify.get('/api/hotels/:hotelId/booking-decision', async (request, reply) => {
    try {
      const { hotelId } = request.params as { hotelId: string };
      
      const hotel = await metaSearch.getHotelDetails(hotelId);
      if (!hotel) {
        return reply.code(404).send({
          success: false,
          error: 'Hotel not found'
        });
      }

      const decision = BookingDecisionEngine.decide(hotel);

      return reply.send({
        success: true,
        data: { decision }
      });
    } catch (error: any) {
      fastify.log.error('Booking decision error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get booking decision',
        message: error.message
      });
    }
  });

  // ============================================
  // RESERVATION ENDPOINTS (Protected)
  // ============================================

  /**
   * Create a reservation (internal hotels only)
   * POST /api/reservations
   */
  fastify.post('/api/reservations', {
    preHandler: authenticateUser
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const userId = request.user!.id;
      const body = request.body as any;

      const reservation = await reservationService.createReservation(userId, {
        hotelId: body.hotelId,
        roomId: body.roomId,
        checkInDate: body.checkInDate,
        checkOutDate: body.checkOutDate,
        guests: body.guests,
        guestDetails: body.guestDetails
      });

      return reply.code(201).send({
        success: true,
        data: { reservation },
        message: 'Reservation created successfully'
      });
    } catch (error: any) {
      fastify.log.error('Create reservation error:', error);
      return reply.code(400).send({
        success: false,
        error: 'Failed to create reservation',
        message: error.message
      });
    }
  });

  /**
   * Get user's reservations
   * GET /api/reservations
   */
  fastify.get('/api/reservations', {
    preHandler: authenticateUser
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const userId = request.user!.id;
      const reservations = await reservationService.getUserReservations(userId);

      return reply.send({
        success: true,
        data: { reservations }
      });
    } catch (error: any) {
      fastify.log.error('Get reservations error:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to get reservations',
        message: error.message
      });
    }
  });

  /**
   * Get specific reservation
   * GET /api/reservations/:reservationId
   */
  fastify.get('/api/reservations/:reservationId', {
    preHandler: authenticateUser
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const userId = request.user!.id;
      const { reservationId } = request.params as { reservationId: string };

      const reservation = await reservationService.getReservation(reservationId, userId);

      return reply.send({
        success: true,
        data: { reservation }
      });
    } catch (error: any) {
      fastify.log.error('Get reservation error:', error);
      
      if (error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: 'Reservation not found',
          message: error.message
        });
      }

      if (error.message.includes('Unauthorized')) {
        return reply.code(403).send({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to get reservation',
        message: error.message
      });
    }
  });

  /**
   * Confirm a reservation
   * POST /api/reservations/:reservationId/confirm
   */
  fastify.post('/api/reservations/:reservationId/confirm', {
    preHandler: authenticateUser
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const { reservationId } = request.params as { reservationId: string };
      const reservation = await reservationService.confirmReservation(reservationId);

      return reply.send({
        success: true,
        data: { reservation },
        message: 'Reservation confirmed successfully'
      });
    } catch (error: any) {
      fastify.log.error('Confirm reservation error:', error);
      return reply.code(400).send({
        success: false,
        error: 'Failed to confirm reservation',
        message: error.message
      });
    }
  });

  /**
   * Cancel a reservation
   * POST /api/reservations/:reservationId/cancel
   */
  fastify.post('/api/reservations/:reservationId/cancel', {
    preHandler: authenticateUser
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const userId = request.user!.id;
      const { reservationId } = request.params as { reservationId: string };

      const reservation = await reservationService.cancelReservation(reservationId, userId);

      return reply.send({
        success: true,
        data: { reservation },
        message: 'Reservation cancelled successfully'
      });
    } catch (error: any) {
      fastify.log.error('Cancel reservation error:', error);
      
      if (error.message.includes('Unauthorized')) {
        return reply.code(403).send({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
      }

      return reply.code(400).send({
        success: false,
        error: 'Failed to cancel reservation',
        message: error.message
      });
    }
  });
}
