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
  
  // Cache for reverse geocoding results to avoid repeated API calls
  private geocodeCache: Map<string, string> = new Map();

  /**
   * Reverse geocode coordinates to a place name using Google Geocoding API
   */
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    if (this.geocodeCache.has(cacheKey)) {
      return this.geocodeCache.get(cacheKey)!;
    }

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return `Near ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=locality|sublocality|route|bus_station|train_station|transit_station`;
      
      const response = await axios.get(url, { timeout: 3000 });
      
      if (response.data.status === 'OK' && response.data.results?.length > 0) {
        const result = response.data.results[0];
        // Get a short, meaningful name
        const components = result.address_components || [];
        
        // Try to find a good name in order of preference
        const sublocality = components.find((c: any) => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'));
        const locality = components.find((c: any) => c.types.includes('locality'));
        const route = components.find((c: any) => c.types.includes('route'));
        const neighborhood = components.find((c: any) => c.types.includes('neighborhood'));
        
        let placeName = '';
        if (sublocality) {
          placeName = sublocality.long_name;
        } else if (neighborhood) {
          placeName = neighborhood.long_name;
        } else if (route) {
          placeName = route.long_name;
        } else if (locality) {
          placeName = locality.long_name;
        } else {
          // Use formatted address but shorten it
          placeName = result.formatted_address?.split(',').slice(0, 2).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        
        // Cache the result
        this.geocodeCache.set(cacheKey, placeName);
        return placeName;
      }
    } catch (error) {
      logger.warn({ lat, lng, error }, 'Reverse geocoding failed');
    }
    
    // Fallback: return a formatted coordinate description
    return `Near ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
  }

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

    // Always include driving as a fallback option for long distances
    // This ensures users can get to their destination even if transit/walking isn't practical
    const alwaysIncludeDriving = !modes.includes('driving');
    if (alwaysIncludeDriving) {
      promises.push(this.getDrivingRoute(origin, destination));
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
        logger.debug('RAPTOR found no transit routes, trying Google Directions API');
        
        // Fallback to Google Directions API for transit
        if (config.googleMapsApiKey) {
          return await this.getGoogleDirections(origin, destination, 'transit');
        }
        
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
      
      // Fallback to Google Directions API for transit
      if (config.googleMapsApiKey) {
        try {
          return await this.getGoogleDirections(origin, destination, 'transit');
        } catch (googleError) {
          logger.error({ error: googleError }, 'Google Directions transit fallback also failed');
        }
      }
      
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
          alternatives: false,
          departure_time: mode === 'transit' ? 'now' : undefined
        },
        timeout: 10000
      });

      if (response.data?.status !== 'OK' || !response.data?.routes?.[0]) {
        logger.warn({ status: response.data?.status }, 'Google Directions API returned non-OK status');
        return null;
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      // Parse steps with enhanced transit details and reverse geocoding
      const stepsPromises = leg.steps.map(async (step: any) => {
        // Get place names for start and end locations
        let fromName = origin.name;
        let toName = destination.name;
        
        try {
          if (step.start_location) {
            fromName = await this.reverseGeocode(step.start_location.lat, step.start_location.lng);
          }
          if (step.end_location) {
            toName = await this.reverseGeocode(step.end_location.lat, step.end_location.lng);
          }
        } catch (geocodeError) {
          logger.warn({ error: geocodeError }, 'Failed to geocode step locations, using defaults');
        }

        const baseStep = {
          from: fromName,
          to: toName,
          distance: step.distance.value,
          duration: step.duration.value,
          instructions: step.html_instructions?.replace(/<[^>]*>/g, ''), // Strip HTML tags
          polyline: step.polyline?.points
        };

        // Enhanced transit step parsing
        if (step.travel_mode === 'TRANSIT' && step.transit_details) {
          const transit = step.transit_details;
          const vehicleType = transit.line?.vehicle?.type || 'TRANSIT';
          
          // Use station/stop names from Google if available, otherwise use geocoded names
          const departureStopName = transit.departure_stop?.name || fromName;
          const arrivalStopName = transit.arrival_stop?.name || toName;
          
          return {
            ...baseStep,
            from: departureStopName,
            to: arrivalStopName,
            mode: this.mapGoogleVehicleType(vehicleType),
            route: transit.line?.short_name || transit.line?.name,
            routeColor: transit.line?.color,
            departureTime: transit.departure_time?.text,
            arrivalTime: transit.arrival_time?.text,
            stops: transit.num_stops,
            departureStop: departureStopName,
            arrivalStop: arrivalStopName,
            headsign: transit.headsign,
            agency: transit.line?.agencies?.[0]?.name
          };
        }

        return {
          ...baseStep,
          mode: step.travel_mode?.toLowerCase() || mode
        };
      });

      // Wait for all step promises to resolve
      const steps: RouteStep[] = await Promise.all(stepsPromises);

      // Calculate transit cost estimate
      let estimatedCost = 0;
      if (mode === 'driving') {
        estimatedCost = this.estimateFuelCost(leg.distance.value);
      } else if (mode === 'transit') {
        // Estimate transit fare based on distance and number of transit legs
        const transitLegs = steps.filter(s => ['bus', 'metro', 'rail', 'subway', 'train', 'tram'].includes(s.mode));
        estimatedCost = this.estimateTransitFare(leg.distance.value, transitLegs.length);
      }

      return {
        origin,
        destination,
        totalDistance: leg.distance.value,
        totalDuration: leg.duration.value,
        estimatedCost,
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
   * Maximum realistic distances for each transport mode (in meters)
   */
  private readonly MAX_DISTANCES = {
    walking: 5000,     // 5 km max for walking
    cycling: 30000,    // 30 km max for cycling  
    escooter: 20000,   // 20 km max for e-scooter
    driving: 2000000,  // 2000 km max for driving in a day
    transit: 500000    // 500 km max for a single transit journey
  };

  /**
   * Create fallback route using haversine distance
   * NOW WITH VALIDATION: Rejects impossible routes
   */
  private createFallbackRoute(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number }
  ): RouteOptions {
    const distance = this.haversineDistance(origin, destination);
    
    // VALIDATION: Determine appropriate mode based on distance
    let mode: string;
    let duration: number;
    let estimatedCost: number;
    let isRealistic = true;
    let warning: string | undefined;

    if (distance <= this.MAX_DISTANCES.walking) {
      // Walking is realistic
      mode = 'walking';
      duration = distance / 1.4; // 5 km/h walking speed
      estimatedCost = 0;
    } else if (distance <= this.MAX_DISTANCES.cycling) {
      // Cycling is realistic, walking is not
      mode = 'cycling';
      duration = distance / 4.2; // 15 km/h cycling speed
      estimatedCost = 0;
      warning = `Distance ${(distance/1000).toFixed(1)}km too far to walk, suggesting cycling`;
    } else if (distance <= this.MAX_DISTANCES.driving) {
      // Driving is realistic for longer distances
      mode = 'driving';
      duration = distance / 11.1; // 40 km/h average with traffic
      estimatedCost = this.estimateFuelCost(distance);
      warning = `Distance ${(distance/1000).toFixed(1)}km requires motorized transport`;
    } else {
      // Even driving is impractical for this distance in a single day
      mode = 'driving';
      duration = distance / 11.1;
      estimatedCost = this.estimateFuelCost(distance);
      isRealistic = false;
      warning = `⚠️ UNREALISTIC: ${(distance/1000).toFixed(1)}km cannot be traveled in a day`;
    }

    logger.info({ 
      distance: `${(distance/1000).toFixed(1)}km`, 
      mode, 
      duration: `${Math.round(duration/60)} min`,
      isRealistic,
      warning 
    }, 'Fallback route created with validation');

    return {
      origin,
      destination,
      totalDistance: distance,
      totalDuration: duration,
      estimatedCost,
      steps: [
        {
          mode,
          from: origin.name,
          to: destination.name,
          distance,
          duration,
          warning,
          isRealistic
        }
      ],
      provider: isRealistic ? 'haversine-fallback' : 'haversine-fallback-UNREALISTIC'
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
   * Estimate transit fare based on distance and number of legs
   */
  private estimateTransitFare(distanceMeters: number, transitLegs: number): number {
    const distanceKm = distanceMeters / 1000;
    
    // Base fare for Indian public transport (in USD, approximately)
    const baseFare = 0.25; // ~20 INR
    const perKmRate = 0.02; // ~1.5 INR per km
    const transferPenalty = 0.15; // Additional cost per transfer
    
    const fare = baseFare + (distanceKm * perKmRate) + (Math.max(0, transitLegs - 1) * transferPenalty);
    return Math.round(fare * 100) / 100;
  }

  /**
   * Map Google vehicle types to our transport modes
   */
  private mapGoogleVehicleType(vehicleType: string): string {
    const mapping: Record<string, string> = {
      'BUS': 'bus',
      'INTERCITY_BUS': 'bus',
      'TROLLEYBUS': 'bus',
      'METRO_RAIL': 'metro',
      'SUBWAY': 'metro',
      'RAIL': 'train',
      'HEAVY_RAIL': 'train',
      'COMMUTER_TRAIN': 'train',
      'HIGH_SPEED_TRAIN': 'train',
      'LONG_DISTANCE_TRAIN': 'train',
      'TRAM': 'tram',
      'MONORAIL': 'metro',
      'CABLE_CAR': 'cable_car',
      'GONDOLA_LIFT': 'gondola',
      'FUNICULAR': 'funicular',
      'FERRY': 'ferry',
      'SHARE_TAXI': 'shared_taxi',
      'OTHER': 'transit'
    };
    
    return mapping[vehicleType] || 'transit';
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
