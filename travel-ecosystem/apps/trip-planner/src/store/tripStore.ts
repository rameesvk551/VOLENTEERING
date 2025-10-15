import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripDestination {
  id: string;
  name: string;
  country: string;
  coordinates: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  order: number;
  activities: Activity[];
  notes: string;
  estimatedCost: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  duration: number;
  category: 'sightseeing' | 'food' | 'activity' | 'transport' | 'accommodation' | 'other';
  cost?: number;
  completed: boolean;
}

export interface TripState {
  tripId: string;
  tripName: string;
  destinations: TripDestination[];
  currentView: 'map' | 'calendar' | 'summary' | 'collaborate';
  selectedDestinationId: string | null;
  isOffline: boolean;
  collaborators: Collaborator[];
  totalBudget: number;

  // Actions
  setTripName: (name: string) => void;
  addDestination: (destination: Omit<TripDestination, 'id' | 'order'>) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, data: Partial<TripDestination>) => void;
  reorderDestinations: (destinationIds: string[]) => void;
  addActivity: (destinationId: string, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (destinationId: string, activityId: string, data: Partial<Activity>) => void;
  removeActivity: (destinationId: string, activityId: string) => void;
  toggleActivityComplete: (destinationId: string, activityId: string) => void;
  setCurrentView: (view: 'map' | 'calendar' | 'summary' | 'collaborate') => void;
  setSelectedDestination: (id: string | null) => void;
  setIsOffline: (offline: boolean) => void;
  addCollaborator: (collaborator: Collaborator) => void;
  getTotalDays: () => number;
  getTotalCost: () => number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  color: string;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      tripId: crypto.randomUUID(),
      tripName: 'My Dream Trip',
      destinations: [],
      currentView: 'map',
      selectedDestinationId: null,
      isOffline: false,
      collaborators: [],
      totalBudget: 10000,

      setTripName: (name) => set({ tripName: name }),

      addDestination: (destination) => {
        const destinations = get().destinations;
        const newDestination: TripDestination = {
          ...destination,
          id: crypto.randomUUID(),
          order: destinations.length,
          activities: destination.activities || [],
        };
        set({ destinations: [...destinations, newDestination] });
      },

      removeDestination: (id) => {
        const destinations = get().destinations.filter((d) => d.id !== id);
        set({
          destinations: destinations.map((d, index) => ({ ...d, order: index })),
          selectedDestinationId: null
        });
      },

      updateDestination: (id, data) => {
        set({
          destinations: get().destinations.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        });
      },

      reorderDestinations: (destinationIds) => {
        const destinationMap = new Map(
          get().destinations.map((d) => [d.id, d])
        );
        set({
          destinations: destinationIds.map((id, index) => ({
            ...destinationMap.get(id)!,
            order: index,
          })),
        });
      },

      addActivity: (destinationId, activity) => {
        const newActivity: Activity = {
          ...activity,
          id: crypto.randomUUID(),
        };
        set({
          destinations: get().destinations.map((d) =>
            d.id === destinationId
              ? { ...d, activities: [...d.activities, newActivity] }
              : d
          ),
        });
      },

      updateActivity: (destinationId, activityId, data) => {
        set({
          destinations: get().destinations.map((d) =>
            d.id === destinationId
              ? {
                  ...d,
                  activities: d.activities.map((a) =>
                    a.id === activityId ? { ...a, ...data } : a
                  ),
                }
              : d
          ),
        });
      },

      removeActivity: (destinationId, activityId) => {
        set({
          destinations: get().destinations.map((d) =>
            d.id === destinationId
              ? {
                  ...d,
                  activities: d.activities.filter((a) => a.id !== activityId),
                }
              : d
          ),
        });
      },

      toggleActivityComplete: (destinationId, activityId) => {
        set({
          destinations: get().destinations.map((d) =>
            d.id === destinationId
              ? {
                  ...d,
                  activities: d.activities.map((a) =>
                    a.id === activityId ? { ...a, completed: !a.completed } : a
                  ),
                }
              : d
          ),
        });
      },

      setCurrentView: (view) => set({ currentView: view }),

      setSelectedDestination: (id) => set({ selectedDestinationId: id }),

      setIsOffline: (offline) => set({ isOffline: offline }),

      addCollaborator: (collaborator) => {
        set({
          collaborators: [...get().collaborators, collaborator],
        });
      },

      getTotalDays: () => {
        const destinations = get().destinations;
        if (destinations.length === 0) return 0;

        const sortedDests = [...destinations].sort((a, b) => a.order - b.order);
        const firstDate = new Date(sortedDests[0].startDate);
        const lastDate = new Date(sortedDests[sortedDests.length - 1].endDate);

        return Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      },

      getTotalCost: () => {
        return get().destinations.reduce((total, dest) => {
          const activityCost = dest.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
          return total + dest.estimatedCost + activityCost;
        }, 0);
      },
    }),
    {
      name: 'trip-planner-storage',
    }
  )
);
