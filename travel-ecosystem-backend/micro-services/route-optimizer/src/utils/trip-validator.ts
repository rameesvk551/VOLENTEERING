/**
 * Trip Validator Utility
 * Validates attraction visiting hours, travel limits, and trip feasibility
 */

export interface AttractionTimeWindow {
  open?: string; // HH:MM format (e.g., "09:00")
  close?: string; // HH:MM format (e.g., "18:00")
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visitDuration?: number; // minutes
  timeWindow?: AttractionTimeWindow;
  priority?: number;
}

export interface TripSegment {
  day: number;
  date: string;
  places: Place[];
  travelTimeMinutes: number;
  visitTimeMinutes: number;
  totalTimeMinutes: number;
  requiresAccommodation: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Constants for trip planning
 */
const MAX_DAILY_TRAVEL_HOURS = 10; // Maximum 10 hours of travel per day
const MAX_DAILY_TOTAL_HOURS = 14; // Maximum 14 hours total activity per day
const DEFAULT_OPENING_HOUR = 9; // 9 AM
const DEFAULT_CLOSING_HOUR = 18; // 6 PM
const ACCOMMODATION_CHECK_IN_TIME = '15:00'; // 3 PM
const ACCOMMODATION_CHECK_OUT_TIME = '11:00'; // 11 AM
const LONG_DISTANCE_THRESHOLD_KM = 500; // Flights recommended above this

/**
 * Validate if an attraction can be visited at a specific time
 */
export function isAttractionOpenAt(
  attraction: Place,
  visitTime: Date
): { isOpen: boolean; reason?: string } {
  if (!attraction.timeWindow) {
    // No time window specified - assume open during default hours (9 AM - 6 PM)
    const hour = visitTime.getHours();
    if (hour < DEFAULT_OPENING_HOUR || hour >= DEFAULT_CLOSING_HOUR) {
      return {
        isOpen: false,
        reason: `Outside typical visiting hours (${DEFAULT_OPENING_HOUR}:00-${DEFAULT_CLOSING_HOUR}:00). Attraction closes at ${DEFAULT_CLOSING_HOUR}:00.`,
      };
    }
    return { isOpen: true };
  }

  const { open, close } = attraction.timeWindow;
  const [openHour, openMin] = (open || '09:00').split(':').map(Number);
  const [closeHour, closeMin] = (close || '18:00').split(':').map(Number);

  const visitHour = visitTime.getHours();
  const visitMin = visitTime.getMinutes();

  // Check if before opening
  if (visitHour < openHour || (visitHour === openHour && visitMin < openMin)) {
    return {
      isOpen: false,
      reason: `Attraction not yet open. Opens at ${open || '09:00'}.`,
    };
  }

  // Check if after closing (need to finish visit before closing)
  const visitDuration = attraction.visitDuration || 60;
  const departureTime = new Date(visitTime.getTime() + visitDuration * 60000);
  const departHour = departureTime.getHours();
  const departMin = departureTime.getMinutes();

  if (departHour > closeHour || (departHour === closeHour && departMin > closeMin)) {
    return {
      isOpen: false,
      reason: `Not enough time to visit. Attraction closes at ${close || '18:00'}, but visit would end at ${String(departHour).padStart(2, '0')}:${String(departMin).padStart(2, '0')}.`,
    };
  }

  return { isOpen: true };
}

/**
 * Validate trip constraints and return detailed feedback
 */
export function validateTrip(
  places: Place[],
  travelTimeMatrix: number[][], // in seconds
  distanceMatrix: number[][] // in meters
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (places.length < 2) {
    errors.push('At least 2 locations required for a trip');
    return { isValid: false, errors, warnings, suggestions };
  }

  // Calculate total travel time and distance
  let totalTravelTimeSeconds = 0;
  let totalDistanceMeters = 0;
  let longestLegDistanceKm = 0;
  let longestLegIndex = -1;

  for (let i = 0; i < places.length - 1; i++) {
    const travelTime = travelTimeMatrix[i]?.[i + 1] || 0;
    const distance = distanceMatrix[i]?.[i + 1] || 0;
    totalTravelTimeSeconds += travelTime;
    totalDistanceMeters += distance;

    const legDistanceKm = distance / 1000;
    if (legDistanceKm > longestLegDistanceKm) {
      longestLegDistanceKm = legDistanceKm;
      longestLegIndex = i;
    }
  }

  const totalTravelHours = totalTravelTimeSeconds / 3600;
  const totalDistanceKm = totalDistanceMeters / 1000;

  // Check if trip requires multiple days
  const isMultiDayTrip = totalTravelHours > MAX_DAILY_TRAVEL_HOURS;

  if (isMultiDayTrip) {
    suggestions.push(
      `This trip requires ${Math.ceil(totalTravelHours / MAX_DAILY_TRAVEL_HOURS)} days. Overnight accommodation will be needed.`
    );
  }

  // Check for extremely long individual legs
  if (longestLegDistanceKm > LONG_DISTANCE_THRESHOLD_KM && longestLegIndex >= 0) {
    const from = places[longestLegIndex];
    const to = places[longestLegIndex + 1];
    warnings.push(
      `Very long distance between ${from.name} and ${to.name} (${longestLegDistanceKm.toFixed(0)} km). Consider taking a flight instead of bus/train.`
    );
    suggestions.push(
      `Flight recommendation: ${from.name} → ${to.name} would take ~2 hours instead of ${(longestLegDistanceKm / 60).toFixed(1)} hours by road.`
    );
  }

  // Check for unrealistic single-day travel
  if (!isMultiDayTrip && totalTravelHours > 8) {
    warnings.push(
      `Total travel time of ${totalTravelHours.toFixed(1)} hours in one day is very demanding. Consider spreading across multiple days.`
    );
  }

  // Validate attraction opening hours
  const currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM for simulation
  let simulatedTime = new Date(currentTime);

  for (let i = 0; i < places.length; i++) {
    const place = places[i];

    // Add travel time to get to this place
    if (i > 0) {
      const travelTimeMinutes = (travelTimeMatrix[i - 1]?.[i] || 0) / 60;
      simulatedTime = new Date(simulatedTime.getTime() + travelTimeMinutes * 60000);
    }

    // Check if attraction is open
    const openCheck = isAttractionOpenAt(place, simulatedTime);
    if (!openCheck.isOpen) {
      const timeStr = simulatedTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      errors.push(
        `${place.name}: Scheduled visit at ${timeStr} is not possible. ${openCheck.reason}`
      );
    }

    // Add visit duration
    const visitDuration = place.visitDuration || 60;
    simulatedTime = new Date(simulatedTime.getTime() + visitDuration * 60000);

    // Check if day has exceeded reasonable hours
    const hoursIntoDay = (simulatedTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    if (hoursIntoDay > MAX_DAILY_TOTAL_HOURS && i < places.length - 1) {
      warnings.push(
        `Day ${Math.ceil(hoursIntoDay / 24)} exceeds ${MAX_DAILY_TOTAL_HOURS} hours of activity. Consider adding overnight accommodation after ${place.name}.`
      );
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Break trip into logical daily segments with accommodation
 */
export function breakIntoMultiDaySegments(
  places: Place[],
  travelTimeMatrix: number[][], // in seconds
  distanceMatrix: number[][], // in meters
  startDate: Date = new Date()
): TripSegment[] {
  const segments: TripSegment[] = [];
  let currentDay = 1;
  let currentDate = new Date(startDate);
  currentDate.setHours(9, 0, 0, 0); // Start at 9 AM

  let currentSegmentPlaces: Place[] = [];
  let currentSegmentTravelTime = 0; // minutes
  let currentSegmentVisitTime = 0; // minutes
  let simulatedTime = new Date(currentDate);

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const visitDuration = place.visitDuration || 60;

    // Calculate travel time to this place
    let travelTimeToPlace = 0;
    if (i > 0) {
      travelTimeToPlace = (travelTimeMatrix[i - 1]?.[i] || 0) / 60; // convert to minutes
      simulatedTime = new Date(simulatedTime.getTime() + travelTimeToPlace * 60000);
    }

    // Check if adding this place would exceed daily limits
    const timeAfterVisit = new Date(simulatedTime.getTime() + visitDuration * 60000);
    const hoursIntoDay = (timeAfterVisit.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
    const totalSegmentTime = currentSegmentTravelTime + currentSegmentVisitTime + travelTimeToPlace + visitDuration;

    // Check if we need to start a new day
    const needsNewDay =
      hoursIntoDay > MAX_DAILY_TOTAL_HOURS ||
      timeAfterVisit.getHours() >= 20 || // After 8 PM
      totalSegmentTime > MAX_DAILY_TOTAL_HOURS * 60;

    if (needsNewDay && currentSegmentPlaces.length > 0) {
      // Save current segment
      segments.push({
        day: currentDay,
        date: currentDate.toISOString().split('T')[0],
        places: currentSegmentPlaces,
        travelTimeMinutes: currentSegmentTravelTime,
        visitTimeMinutes: currentSegmentVisitTime,
        totalTimeMinutes: currentSegmentTravelTime + currentSegmentVisitTime,
        requiresAccommodation: true,
      });

      // Start new day
      currentDay++;
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      currentDate.setHours(9, 0, 0, 0);
      simulatedTime = new Date(currentDate);

      currentSegmentPlaces = [];
      currentSegmentTravelTime = 0;
      currentSegmentVisitTime = 0;
    }

    // Add place to current segment
    currentSegmentPlaces.push(place);
    currentSegmentTravelTime += travelTimeToPlace;
    currentSegmentVisitTime += visitDuration;
    simulatedTime = new Date(simulatedTime.getTime() + visitDuration * 60000);
  }

  // Add final segment
  if (currentSegmentPlaces.length > 0) {
    segments.push({
      day: currentDay,
      date: currentDate.toISOString().split('T')[0],
      places: currentSegmentPlaces,
      travelTimeMinutes: currentSegmentTravelTime,
      visitTimeMinutes: currentSegmentVisitTime,
      totalTimeMinutes: currentSegmentTravelTime + currentSegmentVisitTime,
      requiresAccommodation: false, // Last day doesn't need accommodation
    });
  }

  return segments;
}

/**
 * Recommend optimal transport mode based on distance
 */
export function recommendTransportMode(distanceKm: number): {
  recommended: string[];
  notRecommended: string[];
  reason: string;
} {
  if (distanceKm < 2) {
    return {
      recommended: ['walking'],
      notRecommended: ['flight', 'train'],
      reason: 'Short distance - walking is most efficient',
    };
  } else if (distanceKm < 15) {
    return {
      recommended: ['cycling', 'escooter', 'metro', 'bus'],
      notRecommended: ['flight', 'long_distance_train'],
      reason: 'Medium distance - local transport or active mobility',
    };
  } else if (distanceKm < 100) {
    return {
      recommended: ['bus', 'train', 'car'],
      notRecommended: ['flight', 'walking'],
      reason: 'Regional distance - ground transport recommended',
    };
  } else if (distanceKm < 500) {
    return {
      recommended: ['train', 'bus', 'car'],
      notRecommended: ['walking', 'cycling'],
      reason: 'Long distance - train or bus for comfort and sustainability',
    };
  } else {
    return {
      recommended: ['flight', 'high_speed_train'],
      notRecommended: ['bus', 'car', 'walking'],
      reason: 'Very long distance - flight strongly recommended to save time',
    };
  }
}

/**
 * Adjust itinerary to respect opening hours
 */
export function adjustItineraryForOpeningHours(
  places: Place[],
  travelTimeMatrix: number[][], // in seconds
  startTime: Date = new Date()
): {
  adjustedPlaces: Place[];
  removedPlaces: Place[];
  adjustments: string[];
} {
  const adjustedPlaces: Place[] = [];
  const removedPlaces: Place[] = [];
  const adjustments: string[] = [];

  let currentTime = new Date(startTime);

  for (let i = 0; i < places.length; i++) {
    const place = places[i];

    // Add travel time
    if (i > 0 && adjustedPlaces.length > 0) {
      const prevIndex = places.indexOf(adjustedPlaces[adjustedPlaces.length - 1]);
      const travelTimeMinutes = (travelTimeMatrix[prevIndex]?.[i] || 0) / 60;
      currentTime = new Date(currentTime.getTime() + travelTimeMinutes * 60000);
    }

    // Always keep starting point (places with visitDuration: 0)
    if (place.visitDuration === 0) {
      adjustedPlaces.push(place);
      adjustments.push(`📍 ${place.name}: Starting point (always included)`);
      continue;
    }

    // Check if place can be visited
    const openCheck = isAttractionOpenAt(place, currentTime);

    if (openCheck.isOpen) {
      adjustedPlaces.push(place);
      const visitDuration = place.visitDuration || 60;
      currentTime = new Date(currentTime.getTime() + visitDuration * 60000);
      adjustments.push(`✅ ${place.name}: Visit at ${currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
    } else {
      // Try to visit at opening time instead
      if (place.timeWindow?.open) {
        const [openHour, openMin] = place.timeWindow.open.split(':').map(Number);
        const openingTime = new Date(currentTime);
        openingTime.setHours(openHour, openMin, 0, 0);

        if (openingTime > currentTime) {
          // We can wait for it to open
          currentTime = openingTime;
          adjustedPlaces.push(place);
          const visitDuration = place.visitDuration || 60;
          currentTime = new Date(currentTime.getTime() + visitDuration * 60000);
          adjustments.push(
            `⏰ ${place.name}: Adjusted to open at ${place.timeWindow.open}`
          );
        } else {
          removedPlaces.push(place);
          adjustments.push(`❌ ${place.name}: Removed - ${openCheck.reason}`);
        }
      } else {
        removedPlaces.push(place);
        adjustments.push(`❌ ${place.name}: Removed - ${openCheck.reason}`);
      }
    }
  }

  return {
    adjustedPlaces,
    removedPlaces,
    adjustments,
  };
}
