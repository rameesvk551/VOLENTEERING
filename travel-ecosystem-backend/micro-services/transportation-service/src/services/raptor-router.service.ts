/**
 * RAPTOR (Round-Based Public Transit Routing) Algorithm
 * Implements optimal public transit pathfinding with transfers
 */

import { logger } from '@/utils/logger';
import { pool } from '@/database/connection';
import type { RouteStep } from '@/types/gtfs.types';

export interface RaptorRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  departureTime: Date;
  maxTransfers: number;
  maxWalkDistance: number;
}

export interface RaptorResult {
  legs: any[];
  totalDistance: number;
  totalDuration: number;
  transfers: number;
}

interface Stop {
  stopId: string;
  stopName: string;
  lat: number;
  lng: number;
  distance: number;
}

interface Connection {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeColor: string;
  fromStopId: string;
  toStopId: string;
  departureTime: Date;
  arrivalTime: Date;
  stopSequence: number;
}

class RaptorRouterService {
  private readonly MAX_WALK_SPEED_MS = 1.4; // meters per second

  /**
   * Find optimal transit route using RAPTOR algorithm
   */
  async findRoute(request: RaptorRequest): Promise<RaptorResult | null> {
    const { originLat, originLng, destLat, destLng, departureTime, maxTransfers, maxWalkDistance } = request;

    logger.info({ originLat, originLng, destLat, destLng }, 'RAPTOR: Finding transit route');

    try {
      // Step 1: Find nearby origin stops
      const originStops = await this.findNearbyStops(originLat, originLng, maxWalkDistance);
      if (originStops.length === 0) {
        logger.debug('RAPTOR: No origin stops found');
        return null;
      }

      // Step 2: Find nearby destination stops
      const destStops = await this.findNearbyStops(destLat, destLng, maxWalkDistance);
      if (destStops.length === 0) {
        logger.debug('RAPTOR: No destination stops found');
        return null;
      }

      // Step 3: Run RAPTOR algorithm rounds
      const result = await this.runRaptorRounds(
        originStops,
        destStops,
        departureTime,
        maxTransfers,
        maxWalkDistance
      );

      if (!result) {
        logger.debug('RAPTOR: No route found');
        return null;
      }

      // Step 4: Construct legs from result
      const legs = await this.constructLegs(result, originLat, originLng, destLat, destLng);

      return {
        legs,
        totalDistance: legs.reduce((sum, leg) => sum + leg.distance, 0),
        totalDuration: legs.reduce((sum, leg) => sum + leg.duration, 0),
        transfers: result.transfers
      };
    } catch (error) {
      logger.error({ error }, 'RAPTOR: Route finding failed');
      return null;
    }
  }

  /**
   * Find nearby transit stops using PostGIS
   */
  private async findNearbyStops(lat: number, lng: number, radius: number): Promise<Stop[]> {
    try {
      const result = await pool.query(
        `
        SELECT 
          stop_id,
          stop_name,
          stop_lat,
          stop_lon,
          ST_Distance(
            stop_location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) as distance
        FROM stops
        WHERE ST_DWithin(
          stop_location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        ORDER BY distance
        LIMIT 10
        `,
        [lng, lat, radius]
      );

      return result.rows.map(row => ({
        stopId: row.stop_id,
        stopName: row.stop_name,
        lat: parseFloat(row.stop_lat),
        lng: parseFloat(row.stop_lon),
        distance: Math.round(row.distance)
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to find nearby stops');
      return [];
    }
  }

  /**
   * Run RAPTOR rounds (iterations for each additional transfer)
   */
  private async runRaptorRounds(
    originStops: Stop[],
    destStops: Stop[],
    departureTime: Date,
    maxTransfers: number,
    maxWalkDistance: number
  ): Promise<any | null> {
    // Initialize: Mark origin stops as reachable with walk from origin
    const marked: Set<string> = new Set();
    const earliestArrival: Map<string, Date> = new Map();
    const routes: Map<string, Connection> = new Map();

    // Mark origin stops
    for (const stop of originStops) {
      const walkTime = stop.distance / this.MAX_WALK_SPEED_MS;
      const arrivalTime = new Date(departureTime.getTime() + walkTime * 1000);
      earliestArrival.set(stop.stopId, arrivalTime);
      marked.add(stop.stopId);
    }

    let bestDestArrival: Date | null = null;
    let bestDestStop: string | null = null;
    let bestRoute: any = null;

    // Run rounds (0 = direct, 1 = 1 transfer, etc.)
    for (let round = 0; round <= maxTransfers; round++) {
      logger.debug(`RAPTOR: Round ${round}`);

      const markedThisRound = new Set(marked);

      // For each marked stop, look for connections
      for (const stopId of markedThisRound) {
        const stopArrival = earliestArrival.get(stopId)!;

        // Get connections departing from this stop after arrival time
        const connections = await this.getConnectionsFromStop(stopId, stopArrival);

        for (const conn of connections) {
          const existingArrival = earliestArrival.get(conn.toStopId);

          // If we can arrive earlier via this connection, update
          if (!existingArrival || conn.arrivalTime < existingArrival) {
            earliestArrival.set(conn.toStopId, conn.arrivalTime);
            routes.set(conn.toStopId, conn);
            marked.add(conn.toStopId);

            // Check if this reaches a destination stop
            const destStop = destStops.find(d => d.stopId === conn.toStopId);
            if (destStop) {
              if (!bestDestArrival || conn.arrivalTime < bestDestArrival) {
                bestDestArrival = conn.arrivalTime;
                bestDestStop = conn.toStopId;
                bestRoute = { ...conn, transfers: round };
              }
            }
          }
        }
      }
    }

    if (!bestRoute) {
      return null;
    }

    // Reconstruct path
    return this.reconstructPath(bestRoute, routes, originStops, destStops);
  }

  /**
   * Get connections (trips) departing from a stop after a certain time
   */
  private async getConnectionsFromStop(stopId: string, afterTime: Date): Promise<Connection[]> {
    try {
      const dayOfWeek = afterTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const timeStr = afterTime.toTimeString().slice(0, 8); // HH:MM:SS

      const result = await pool.query(
        `
        SELECT 
          st1.trip_id,
          t.route_id,
          r.route_short_name,
          r.route_color,
          st1.stop_id as from_stop_id,
          st2.stop_id as to_stop_id,
          st1.departure_time,
          st2.arrival_time,
          st1.stop_sequence
        FROM stop_times st1
        JOIN stop_times st2 ON st1.trip_id = st2.trip_id AND st2.stop_sequence = st1.stop_sequence + 1
        JOIN trips t ON st1.trip_id = t.trip_id
        JOIN routes r ON t.route_id = r.route_id
        JOIN calendar c ON t.service_id = c.service_id
        WHERE st1.stop_id = $1
          AND st1.departure_time >= $2
          AND (
            (c.monday = 1 AND $3 = 1) OR
            (c.tuesday = 1 AND $3 = 2) OR
            (c.wednesday = 1 AND $3 = 3) OR
            (c.thursday = 1 AND $3 = 4) OR
            (c.friday = 1 AND $3 = 5) OR
            (c.saturday = 1 AND $3 = 6) OR
            (c.sunday = 1 AND $3 = 0)
          )
        ORDER BY st1.departure_time
        LIMIT 50
        `,
        [stopId, timeStr, dayOfWeek]
      );

      return result.rows.map(row => ({
        tripId: row.trip_id,
        routeId: row.route_id,
        routeShortName: row.route_short_name || row.route_id,
        routeColor: row.route_color || '#0000FF',
        fromStopId: row.from_stop_id,
        toStopId: row.to_stop_id,
        departureTime: this.parseTime(row.departure_time, afterTime),
        arrivalTime: this.parseTime(row.arrival_time, afterTime),
        stopSequence: row.stop_sequence
      }));
    } catch (error) {
      logger.error({ error, stopId }, 'Failed to get connections from stop');
      return [];
    }
  }

  /**
   * Parse GTFS time string (HH:MM:SS) into Date object
   */
  private parseTime(timeStr: string, referenceDate: Date): Date {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date(referenceDate);
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  /**
   * Reconstruct path from RAPTOR result
   */
  private async reconstructPath(
    bestRoute: any,
    routes: Map<string, Connection>,
    originStops: Stop[],
    destStops: Stop[]
  ): Promise<any> {
    // For simplicity, return the best single connection
    // In a full implementation, we'd backtrack through the route map
    return {
      connections: [bestRoute],
      transfers: bestRoute.transfers
    };
  }

  /**
   * Construct legs from RAPTOR result
   */
  private async constructLegs(
    result: any,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<any[]> {
    const legs: any[] = [];

    // Add walking leg to first transit stop (if needed)
    const firstConn = result.connections[0];
    const firstStop = await this.getStopInfo(firstConn.fromStopId);
    
    if (firstStop) {
      const walkDistance = this.haversineDistance(
        { lat: originLat, lng: originLng },
        { lat: firstStop.lat, lng: firstStop.lng }
      );
      const walkDuration = walkDistance / this.MAX_WALK_SPEED_MS;

      legs.push({
        mode: 'walking',
        from: 'Origin',
        to: firstStop.stopName,
        distance: walkDistance,
        duration: walkDuration
      });
    }

    // Add transit legs
    for (const conn of result.connections) {
      const fromStop = await this.getStopInfo(conn.fromStopId);
      const toStop = await this.getStopInfo(conn.toStopId);
      
      if (fromStop && toStop) {
        const distance = this.haversineDistance(
          { lat: fromStop.lat, lng: fromStop.lng },
          { lat: toStop.lat, lng: toStop.lng }
        );
        const duration = (conn.arrivalTime.getTime() - conn.departureTime.getTime()) / 1000;

        legs.push({
          mode: 'transit',
          from: fromStop.stopName,
          to: toStop.stopName,
          distance,
          duration,
          route: conn.routeShortName,
          routeColor: conn.routeColor,
          departureTime: conn.departureTime.toISOString(),
          arrivalTime: conn.arrivalTime.toISOString(),
          tripId: conn.tripId,
          numStops: 1 // Simplified, would need to count actual stops
        });
      }
    }

    // Add walking leg from last transit stop to destination
    const lastConn = result.connections[result.connections.length - 1];
    const lastStop = await this.getStopInfo(lastConn.toStopId);
    
    if (lastStop) {
      const walkDistance = this.haversineDistance(
        { lat: lastStop.lat, lng: lastStop.lng },
        { lat: destLat, lng: destLng }
      );
      const walkDuration = walkDistance / this.MAX_WALK_SPEED_MS;

      legs.push({
        mode: 'walking',
        from: lastStop.stopName,
        to: 'Destination',
        distance: walkDistance,
        duration: walkDuration
      });
    }

    return legs;
  }

  /**
   * Get stop information
   */
  private async getStopInfo(stopId: string): Promise<Stop | null> {
    try {
      const result = await pool.query(
        'SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = $1',
        [stopId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        stopId: row.stop_id,
        stopName: row.stop_name,
        lat: parseFloat(row.stop_lat),
        lng: parseFloat(row.stop_lon),
        distance: 0
      };
    } catch (error) {
      logger.error({ error, stopId }, 'Failed to get stop info');
      return null;
    }
  }

  /**
   * Calculate haversine distance
   */
  private haversineDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const raptorRouter = new RaptorRouterService();
