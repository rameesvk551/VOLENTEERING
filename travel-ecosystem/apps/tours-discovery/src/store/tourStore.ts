import { create } from 'zustand';
import { Tour, TourSearchFilters } from '../types/tour.types';

interface TourState {
  // Search state
  tours: Tour[];
  total: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  
  // Filters
  filters: TourSearchFilters;
  
  // Selected tour for details
  selectedTour: Tour | null;
  
  // Actions
  setTours: (tours: Tour[], total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<TourSearchFilters>) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  setSelectedTour: (tour: Tour | null) => void;
}

const defaultFilters: TourSearchFilters = {
  location: '',
  sortBy: 'popularity',
  sortOrder: 'desc',
};

export const useTourStore = create<TourState>((set) => ({
  // Initial state
  tours: [],
  total: 0,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 20,
  filters: defaultFilters,
  selectedTour: null,

  // Actions
  setTours: (tours, total) => set({ tours, total, error: null }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false }),
  
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),
  
  resetFilters: () =>
    set({
      filters: defaultFilters,
      currentPage: 1,
    }),
  
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  setSelectedTour: (selectedTour) => set({ selectedTour }),
}));
