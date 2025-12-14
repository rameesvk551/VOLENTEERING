/**
 * GTFS Import Service
 */

import axios from 'axios';
import unzipper from 'unzipper';
import csv from 'csv-parser';
import { pool } from '@/database/connection';
import { logger } from '@/utils/logger';
import type {
  Agency,
  Stop,
  Route,
  Trip,
  StopTime,
  Calendar,
  CalendarDate,
  Shape
} from '@/types/gtfs.types';

export class GTFSService {
  /**
   * Import GTFS feed from URL
   */
  async importFeed(feedUrl: string): Promise<void> {
    logger.info({ feedUrl }, 'Starting GTFS import');

    try {
      // Download and unzip GTFS feed
      const response = await axios.get(feedUrl, {
        responseType: 'stream',
        timeout: 60000
      });

      const directory = await unzipper.Open.buffer(await this.streamToBuffer(response.data));

      // Import files in order (respecting foreign keys)
      await this.importAgencies(directory);
      await this.importStops(directory);
      await this.importRoutes(directory);
      await this.importCalendar(directory);
      await this.importCalendarDates(directory);
      await this.importTrips(directory);
      await this.importStopTimes(directory);
      await this.importShapes(directory);

      logger.info('GTFS import completed successfully');
    } catch (err) {
      logger.error({ err }, 'GTFS import failed');
      throw err;
    }
  }

  /**
   * Import agencies
   */
  private async importAgencies(directory: unzipper.CentralDirectory): Promise<void> {
    const file = directory.files.find(f => f.path === 'agency.txt');
    if (!file) return;

    const agencies: Agency[] = [];
    await new Promise((resolve, reject) => {
      file.stream()
        .pipe(csv())
        .on('data', (row: any) => {
          agencies.push(row as Agency);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Bulk insert
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM agencies');
      
      for (const agency of agencies) {
        await client.query(`
          INSERT INTO agencies (agency_id, agency_name, agency_url, agency_timezone, agency_lang, agency_phone)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (agency_id) DO UPDATE SET
            agency_name = EXCLUDED.agency_name,
            agency_url = EXCLUDED.agency_url,
            agency_timezone = EXCLUDED.agency_timezone,
            agency_lang = EXCLUDED.agency_lang,
            agency_phone = EXCLUDED.agency_phone
        `, [
          agency.agency_id,
          agency.agency_name,
          agency.agency_url,
          agency.agency_timezone,
          agency.agency_lang,
          agency.agency_phone
        ]);
      }

      await client.query('COMMIT');
      logger.info({ count: agencies.length }, 'Imported agencies');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Import stops
   */
  private async importStops(directory: unzipper.CentralDirectory): Promise<void> {
    const file = directory.files.find(f => f.path === 'stops.txt');
    if (!file) return;

    const stops: Stop[] = [];
    await new Promise((resolve, reject) => {
      file.stream()
        .pipe(csv())
        .on('data', (row: any) => {
          stops.push(row as Stop);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM stops');

      for (const stop of stops) {
        await client.query(`
          INSERT INTO stops (
            stop_id, stop_code, stop_name, stop_desc, stop_lat, stop_lon,
            zone_id, stop_url, location_type, parent_station, stop_timezone, wheelchair_boarding
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (stop_id) DO UPDATE SET
            stop_code = EXCLUDED.stop_code,
            stop_name = EXCLUDED.stop_name,
            stop_desc = EXCLUDED.stop_desc,
            stop_lat = EXCLUDED.stop_lat,
            stop_lon = EXCLUDED.stop_lon,
            zone_id = EXCLUDED.zone_id,
            stop_url = EXCLUDED.stop_url,
            location_type = EXCLUDED.location_type,
            parent_station = EXCLUDED.parent_station,
            stop_timezone = EXCLUDED.stop_timezone,
            wheelchair_boarding = EXCLUDED.wheelchair_boarding
        `, [
          stop.stop_id,
          stop.stop_code,
          stop.stop_name,
          stop.stop_desc,
          stop.stop_lat,
          stop.stop_lon,
          stop.zone_id,
          stop.stop_url,
          stop.location_type,
          stop.parent_station,
          stop.stop_timezone,
          stop.wheelchair_boarding
        ]);
      }

      await client.query('COMMIT');
      logger.info({ count: stops.length }, 'Imported stops');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Import routes (implement remaining methods similarly)
   */
  private async importRoutes(directory: unzipper.CentralDirectory): Promise<void> {
    // Similar pattern to importStops
    logger.info('Importing routes (placeholder)');
  }

  private async importCalendar(directory: unzipper.CentralDirectory): Promise<void> {
    logger.info('Importing calendar (placeholder)');
  }

  private async importCalendarDates(directory: unzipper.CentralDirectory): Promise<void> {
    logger.info('Importing calendar dates (placeholder)');
  }

  private async importTrips(directory: unzipper.CentralDirectory): Promise<void> {
    logger.info('Importing trips (placeholder)');
  }

  private async importStopTimes(directory: unzipper.CentralDirectory): Promise<void> {
    logger.info('Importing stop times (placeholder)');
  }

  private async importShapes(directory: unzipper.CentralDirectory): Promise<void> {
    logger.info('Importing shapes (placeholder)');
  }

  /**
   * Helper to convert stream to buffer
   */
  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

export const gtfsService = new GTFSService();
