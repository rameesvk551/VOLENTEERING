/**
 * GTFS-RT Service for realtime transit data
 */

import axios from 'axios';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { pool } from '@/database/connection';
import { redis, setCache } from '@/cache/redis';
import type { VehiclePosition, TripUpdate } from '@/types/gtfs.types';

export class GTFSRTService {
  private vehiclePositionsInterval: NodeJS.Timeout | null = null;
  private tripUpdatesInterval: NodeJS.Timeout | null = null;

  /**
   * Start polling GTFS-RT feeds
   */
  async startPolling(): Promise<void> {
    if (config.gtfsRtVehiclePositionsUrl) {
      await this.fetchVehiclePositions();
      this.vehiclePositionsInterval = setInterval(
        () => this.fetchVehiclePositions(),
        config.gtfsRtPollInterval
      );
      logger.info('Started polling vehicle positions');
    }

    if (config.gtfsRtTripUpdatesUrl) {
      await this.fetchTripUpdates();
      this.tripUpdatesInterval = setInterval(
        () => this.fetchTripUpdates(),
        config.gtfsRtPollInterval
      );
      logger.info('Started polling trip updates');
    }
  }

  /**
   * Stop polling GTFS-RT feeds
   */
  stopPolling(): void {
    if (this.vehiclePositionsInterval) {
      clearInterval(this.vehiclePositionsInterval);
      logger.info('Stopped polling vehicle positions');
    }
    if (this.tripUpdatesInterval) {
      clearInterval(this.tripUpdatesInterval);
      logger.info('Stopped polling trip updates');
    }
  }

  /**
   * Fetch and process vehicle positions
   */
  private async fetchVehiclePositions(): Promise<void> {
    try {
      const response = await axios.get(config.gtfsRtVehiclePositionsUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });

      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(response.data)
      );

      const positions: VehiclePosition[] = [];

      for (const entity of feed.entity) {
        if (entity.vehicle) {
          const vehicle = entity.vehicle;
          const position: VehiclePosition = {
            vehicle_id: vehicle.vehicle?.id || entity.id,
            trip_id: vehicle.trip?.tripId,
            route_id: vehicle.trip?.routeId,
            latitude: vehicle.position?.latitude || 0,
            longitude: vehicle.position?.longitude || 0,
            bearing: vehicle.position?.bearing,
            speed: vehicle.position?.speed,
            timestamp: vehicle.timestamp?.toNumber() || Date.now() / 1000,
            current_stop_sequence: vehicle.currentStopSequence,
            current_status: vehicle.currentStatus?.toString()
          };
          positions.push(position);
        }
      }

      // Bulk insert to database
      if (positions.length > 0) {
        await this.saveVehiclePositions(positions);
        
        // Cache for quick access
        await setCache(
          'gtfs-rt:vehicle-positions',
          positions,
          config.redisCacheTtlRealtime
        );
        
        logger.info({ count: positions.length }, 'Updated vehicle positions');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to fetch vehicle positions');
    }
  }

  /**
   * Fetch and process trip updates
   */
  private async fetchTripUpdates(): Promise<void> {
    try {
      const response = await axios.get(config.gtfsRtTripUpdatesUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });

      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(response.data)
      );

      const updates: TripUpdate[] = [];

      for (const entity of feed.entity) {
        if (entity.tripUpdate) {
          const tripUpdate = entity.tripUpdate;
          const update: TripUpdate = {
            trip_id: tripUpdate.trip?.tripId || '',
            route_id: tripUpdate.trip?.routeId,
            start_date: tripUpdate.trip?.startDate,
            schedule_relationship: tripUpdate.trip?.scheduleRelationship?.toString(),
            stop_time_updates: tripUpdate.stopTimeUpdate?.map(stu => ({
              stop_sequence: stu.stopSequence,
              stop_id: stu.stopId,
              arrival_delay: stu.arrival?.delay,
              departure_delay: stu.departure?.delay,
              arrival_time: stu.arrival?.time?.toNumber(),
              departure_time: stu.departure?.time?.toNumber()
            })) || []
          };
          updates.push(update);
        }
      }

      // Bulk insert to database
      if (updates.length > 0) {
        await this.saveTripUpdates(updates);
        
        // Cache for quick access
        await setCache(
          'gtfs-rt:trip-updates',
          updates,
          config.redisCacheTtlRealtime
        );
        
        logger.info({ count: updates.length }, 'Updated trip updates');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to fetch trip updates');
    }
  }

  /**
   * Save vehicle positions to database
   */
  private async saveVehiclePositions(positions: VehiclePosition[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Clear old positions (older than 5 minutes)
      await client.query(
        'DELETE FROM vehicle_positions WHERE timestamp < $1',
        [Date.now() / 1000 - 300]
      );

      // Insert new positions
      const values = positions.map(p => 
        `('${p.vehicle_id}', ${p.trip_id ? `'${p.trip_id}'` : 'NULL'}, ${p.route_id ? `'${p.route_id}'` : 'NULL'}, ${p.latitude}, ${p.longitude}, ST_SetSRID(ST_MakePoint(${p.longitude}, ${p.latitude}), 4326)::geography, ${p.bearing || 'NULL'}, ${p.speed || 'NULL'}, ${p.timestamp}, ${p.current_stop_sequence || 'NULL'}, ${p.current_status ? `'${p.current_status}'` : 'NULL'})`
      ).join(',');

      if (values) {
        await client.query(`
          INSERT INTO vehicle_positions 
            (vehicle_id, trip_id, route_id, latitude, longitude, vehicle_location, bearing, speed, timestamp, current_stop_sequence, current_status)
          VALUES ${values}
        `);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Save trip updates to database
   */
  private async saveTripUpdates(updates: TripUpdate[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Clear old updates (older than 1 hour)
      await client.query(
        'DELETE FROM trip_updates WHERE updated_at < NOW() - INTERVAL \'1 hour\''
      );

      // Insert new updates
      for (const update of updates) {
        const result = await client.query(`
          INSERT INTO trip_updates (trip_id, route_id, start_date, schedule_relationship)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [update.trip_id, update.route_id, update.start_date, update.schedule_relationship]);

        const tripUpdateId = result.rows[0].id;

        // Insert stop time updates
        for (const stu of update.stop_time_updates) {
          await client.query(`
            INSERT INTO stop_time_updates 
              (trip_update_id, stop_sequence, stop_id, arrival_delay, departure_delay, arrival_time, departure_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [tripUpdateId, stu.stop_sequence, stu.stop_id, stu.arrival_delay, stu.departure_delay, stu.arrival_time, stu.departure_time]);
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get realtime delays for a trip
   */
  async getTripDelays(tripId: string): Promise<Map<string, number>> {
    const result = await pool.query(`
      SELECT stu.stop_id, stu.arrival_delay
      FROM trip_updates tu
      JOIN stop_time_updates stu ON tu.id = stu.trip_update_id
      WHERE tu.trip_id = $1
      AND tu.updated_at > NOW() - INTERVAL '10 minutes'
      ORDER BY stu.stop_sequence
    `, [tripId]);

    const delays = new Map<string, number>();
    for (const row of result.rows) {
      delays.set(row.stop_id, row.arrival_delay || 0);
    }

    return delays;
  }
}

export const gtfsRtService = new GTFSRTService();
