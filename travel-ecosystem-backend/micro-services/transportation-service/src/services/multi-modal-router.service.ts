/**
 * Multi-Modal Router Service
 * Integrates OSRM, Google Directions, Transit APIs for comprehensive routing
 */

import axios from 'axios';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import type { Leg, TransportMode, RouteStep } from '@/types/gtfs.types';
import { raptorRouter } from './raptor-router.service';
import { gtfsService } from './gtfs.service';
import { gtfsRtService } from './gtfs-rt.service';

export interface RouteRequest {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  departureTime?: string;
  preferences?: {
    modes?: TransportMode[];
    maxWalkDistance?: number;
    maxTransfers?: number;
    budget?: 'budget' | 'balanced' | 'premium';
  };
}

export interface RouteOptions {
  totalDistance: number;
  totalDuration: number;
  estimatedCost: number;
  steps: RouteStep[];
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  provider: string;
}

class MultiModalRouterService {
  private readonly OSRM_BASE_URL = 'http://router.project-osrm.org';
  private readonly MAPBOX_API_KEY = process.env.MAPBOX_API_KEY || '';
  private readonly HERE_API_KEY = process.env.HERE_API_KEY || '';
  private readonly TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || '';

  /**
   * Get multimodal route options for a single leg
   */
  async route(request: RouteRequest): Promise<RouteOptions[]> {
    const { origin, destination, departureTime, preferences } = request;
    const modes = preferences?.modes || ['transit', 'walking', 'driving'];
    
    logger.info({ origin, destination, modes }, 'Computing multimodal routes');

    const routeOptions: RouteOptions[] = [];

    // Run all routing modes in parallel
    const promises: Promise<RouteOptions | null>[] = [];

    if (modes.includes('transit')) {
      promises.push(this.getTransitRoute(origin, destination, departureTime, preferences));
    }

    if (modes.includes('walking')) {
      promises.push(this.getWalkingRoute(origin, destination));
    }

    if (modes.includes('cycling')) {
      promises.push(this.getCyclingRoute(origin, destination));
    }

    if (modes.includes('driving')) {
      promises.push(this.getDrivingRoute(origin, destination));
    }

    if (modes.includes('escooter')) {
      promises.push(this.getEScooterRoute(origin, destination));
    }

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        routeOptions.push(result.value);
      } else if (result.status === 'rejected') {
        logger.warn({ error: result.reason }, `Route option ${index} failed`);
      }
    });

    if (routeOptions.length === 0) {
      logger.warn('No route options found, using fallback haversine estimate');
      routeOptions.push(this.createFallbackRoute(origin, destination));
    }

    // Sort by preferences
    return this.sortRoutesByPreference(routeOptions, preferences?.budget);
  }

  /**
   * Get transit route using RAPTOR algorithm + real-time data
   */
  private async getTransitRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number },
    departureTime?: string,
    preferences?: RouteRequest['preferences']
  ): Promise<RouteOptions | null> {
    try {
      const departureDate = departureTime ? new Date(departureTime) : new Date();
      
      // Use RAPTOR algorithm for transit routing
      const raptorResult = await raptorRouter.findRoute({
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        departureTime: departureDate,
        maxTransfers: preferences?.maxTransfers || 3,
        maxWalkDistance: preferences?.maxWalkDistance || 800
      });

      if (!raptorResult || raptorResult.legs.length === 0) {
        logger.debug('RAPTOR found no transit routes');
        return null;
      }

      // Enrich with real-time data
      const enrichedSteps = await this.enrichStepsWithRealtime(raptorResult.legs);

      return {
        origin,
        destination,
        totalDistance: raptorResult.totalDistance,
        totalDuration: raptorResult.totalDuration,
        estimatedCost: this.calculateTransitCost(raptorResult.legs),
        steps: enrichedSteps,
        provider: 'gtfs-raptor'
      };
    } catch (error) {
      logger.error({ error }, 'Transit routing failed');
      return null;
    }
  }

  /**
   * Get walking route via OSRM
   */
  private async getWalkingRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number }
  ): Promise<RouteOptions | null> {
    try {
      const url = `${this.OSRM_BASE_URL}/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
      
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data?.code !== 'Ok' || !response.data?.routes?.[0]) {
        return null;
      }

      const route = response.data.routes[0];

      return {
        origin,
        destination,
        totalDistance: route.distance,
        totalDuration: route.duration,
        estimatedCost: 0,
        steps: [
          {
            mode: 'walking',
            from: origin.name,
            to: destination.name,
            distance: route.distance,
            duration: route.duration,
            polyline: route.geometry
          }
        ],
        provider: 'osrm-foot'
      };
    } catch (error) {
      logger.error({ error }, 'Walking route failed');
      return null;
    }
  }

  /**
   * Get cycling route via OSRM
   */
  private async getCyclingRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number }
  ): Promise<RouteOptions | null> {
    try {
      const url = `${this.OSRM_BASE_URL}/route/v1/bike/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
      
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data?.code !== 'Ok' || !response.data?.routes?.[0]) {
        return null;
      }

      const route = response.data.routes[0];

      return {
        origin,
        destination,
        totalDistance: route.distance,
        totalDuration: route.duration,
        estimatedCost: 0,
        steps: [
          {
            mode: 'cycling',
            from: origin.name,
            to: destination.name,
            distance: route.distance,
            duration: route.duration,
            polyline: route.geometry
          }
        ],
        provider: 'osrm-bike'
      };
    } catch (error) {
      logger.error({ error }, 'Cycling route failed');
      return null;
    }
  }

  /**
   * Get driving route via OSRM or Google Maps
   */
  private async getDrivingRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number }
  ): Promise<RouteOptions | null> {
    try {
      // Try Google Maps first if API key available
      if (config.googleMapsApiKey) {
        return await this.getGoogleDirections(origin, destination, 'driving');
      }

      // Fallback to OSRM
      const url = `${this.OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
      
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data?.code !== 'Ok' || !response.data?.routes?.[0]) {
        return null;
      }

      const route = response.data.routes[0];
      const fuelCost = this.estimateFuelCost(route.distance);

      return {
        origin,
        destination,
        totalDistance: route.distance,
        totalDuration: route.duration,
        estimatedCost: fuelCost,
        steps: [
          {
            mode: 'driving',
            from: origin.name,
            to: destination.name,
            distance: route.distance,
            duration: route.duration,
            polyline: route.geometry
          }
        ],
        provider: 'osrm-car'
      };
    } catch (error) {
      logger.error({ error }, 'Driving route failed');
      return null;
    }
  }

  /**
   * Get e-scooter route (similar to cycling but with speed adjustment)
   */
  private async getEScooterRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number }
  ): Promise<RouteOptions | null> {
    try {
      // Use cycling route as base
      const cyclingRoute = await this.getCyclingRoute(origin, destination);
      
      if (!cyclingRoute) {
        return null;
      }

      // E-scooters are ~20% faster than cycling
      const adjustedDuration = cyclingRoute.totalDuration * 0.8;
      const rentalCost = this.estimateEScooterCost(cyclingRoute.totalDistance, adjustedDuration);

      return {
        ...cyclingRoute,
        totalDuration: adjustedDuration,
        estimatedCost: rentalCost,
        steps: cyclingRoute.steps.map(step => ({
          ...step,
          mode: 'escooter',
          duration: step.duration * 0.8
        })),
        provider: 'osrm-escooter'
      };
    } catch (error) {
      logger.error({ error }, 'E-scooter route failed');
      return null;
    }
  }

  /**
   * Google Directions API integration
   */
  private async getGoogleDirections(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit'
  ): Promise<RouteOptions | null> {
    try {
      const url = 'https://maps.googleapis.com/maps/api/directions/json';
      
      const response = await axios.get(url, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          mode,
          key: config.googleMapsApiKey,
          alternatives: false
        },
        timeout: 5000
      });

      if (response.data?.status !== 'OK' || !response.data?.routes?.[0]) {
        return null;
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      const steps: RouteStep[] = leg.steps.map((step: any) => ({
        mode: mode,
        from: step.start_location ? `${step.start_location.lat},${step.start_location.lng}` : origin.name,
        to: step.end_location ? `${step.end_location.lat},${step.end_location.lng}` : destination.name,
        distance: step.distance.value,
        duration: step.duration.value,
        instructions: step.html_instructions,
        polyline: step.polyline?.points
      }));

      return {
        origin,
        destination,
        totalDistance: leg.distance.value,
        totalDuration: leg.duration.value,
        estimatedCost: mode === 'driving' ? this.estimateFuelCost(leg.distance.value) : 0,
        steps,
        provider: 'google-directions'
      };
    } catch (error) {
      logger.error({ error }, 'Google Directions API failed');
      return null;
    }
  }

  /**
   * Enrich transit steps with real-time data (delays, cancellations)
   */
  private async enrichStepsWithRealtime(legs: any[]): Promise<RouteStep[]> {
    const enrichedSteps: RouteStep[] = [];

    for (const leg of legs) {
      if (leg.mode === 'transit' && leg.tripId) {
        // Get real-time trip update
        const tripUpdate = await gtfsRtService.getTripUpdate(leg.tripId);
        const delay = tripUpdate?.delay || 0;

        enrichedSteps.push({
          mode: 'transit',
          from: leg.from,
          to: leg.to,
          distance: leg.distance,
          duration: leg.duration + delay,
          route: leg.routeShortName,
          routeColor: leg.routeColor,
          departureTime: leg.departureTime,
          arrivalTime: leg.arrivalTime,
          stops: leg.numStops,
          delay,
          tripId: leg.tripId
        });
      } else {
        enrichedSteps.push(leg);
      }
    }

    return enrichedSteps;
  }

  /**
   * Create fallback route using haversine distance
   */
  private createFallbackRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number }
  ): RouteOptions {
    const distance = this.haversineDistance(origin, destination);
    const walkingSpeed = 1.4; // m/s
    const duration = distance / walkingSpeed;

    return {
      origin,
      destination,
      totalDistance: distance,
      totalDuration: duration,
      estimatedCost: 0,
      steps: [
        {
          mode: 'walking',
          from: origin.name,
          to: destination.name,
          distance,
          duration
        }
      ],
      provider: 'haversine-fallback'
    };
  }

  /**
   * Calculate haversine distance between two points
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

  /**
   * Calculate transit cost based on legs
   */
  private calculateTransitCost(legs: any[]): number {
    let cost = 0;
    let hasTransit = false;

    for (const leg of legs) {
      if (leg.mode === 'transit') {
        hasTransit = true;
        // Base fare + distance-based pricing
        cost += 1.5 + (leg.distance / 1000) * 0.15;
      }
    }

    return hasTransit ? Math.max(cost, 2.0) : 0;
  }

  /**
   * Estimate fuel cost for driving
   */
  private estimateFuelCost(distanceMeters: number): number {
    const distanceKm = distanceMeters / 1000;
    const fuelConsumptionPer100km = 8; // liters
    const fuelPricePerLiter = 1.5; // USD
    return (distanceKm / 100) * fuelConsumptionPer100km * fuelPricePerLiter;
  }

  /**
   * Estimate e-scooter rental cost
   */
  private estimateEScooterCost(distanceMeters: number, durationSeconds: number): number {
    const unlockFee = 1.0;
    const perMinuteCost = 0.15;
    const minutes = durationSeconds / 60;
    return unlockFee + minutes * perMinuteCost;
  }

  /**
   * Sort routes by budget preference
   */
  private sortRoutesByPreference(
    routes: RouteOptions[],
    budget?: 'budget' | 'balanced' | 'premium'
  ): RouteOptions[] {
    if (budget === 'budget') {
      // Prioritize cost, then duration
      return routes.sort((a, b) => {
        if (Math.abs(a.estimatedCost - b.estimatedCost) > 1) {
          return a.estimatedCost - b.estimatedCost;
        }
        return a.totalDuration - b.totalDuration;
      });
    } else if (budget === 'premium') {
      // Prioritize duration, ignore cost
      return routes.sort((a, b) => a.totalDuration - b.totalDuration);
    } else {
      // Balanced: score based on cost and time
      return routes.sort((a, b) => {
        const scoreA = a.totalDuration / 60 + a.estimatedCost * 10;
        const scoreB = b.totalDuration / 60 + b.estimatedCost * 10;
        return scoreA - scoreB;
      });
    }
  }
}

export const multiModalRouter = new MultiModalRouterService();
