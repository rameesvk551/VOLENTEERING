/**
 * Zustand Store for Hotel Booking
 */

import { create } from 'zustand';
import type { Hotel, SearchQuery, Reservation, Room } from '../types';

interface HotelStore {
  // Search state
  searchQuery: SearchQuery | null;
  searchResults: Hotel[];
  isSearching: boolean;
  searchError: string | null;
  totalResults: number;
  
  // Selected hotel state
  selectedHotel: Hotel | null;
  selectedHotelRooms: Room[];
  isLoadingHotel: boolean;
  
  // Reservation state
  reservations: Reservation[];
  isLoadingReservations: boolean;
  
  // Actions
  setSearchQuery: (query: SearchQuery) => void;
  setSearchResults: (results: Hotel[], total: number) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setSelectedHotelRooms: (rooms: Room[]) => void;
  setIsLoadingHotel: (isLoading: boolean) => void;
  setReservations: (reservations: Reservation[]) => void;
  setIsLoadingReservations: (isLoading: boolean) => void;
  clearSearch: () => void;
}

export const useHotelStore = create<HotelStore>((set) => ({
  // Initial state
  searchQuery: null,
  searchResults: [],
  isSearching: false,
  searchError: null,
  totalResults: 0,
  selectedHotel: null,
  selectedHotelRooms: [],
  isLoadingHotel: false,
  reservations: [],
  isLoadingReservations: false,
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results, total) => set({ 
    searchResults: results, 
    totalResults: total,
    isSearching: false,
    searchError: null
  }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchError: (error) => set({ searchError: error, isSearching: false }),
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  setSelectedHotelRooms: (rooms) => set({ selectedHotelRooms: rooms }),
  setIsLoadingHotel: (isLoading) => set({ isLoadingHotel: isLoading }),
  setReservations: (reservations) => set({ reservations }),
  setIsLoadingReservations: (isLoading) => set({ isLoadingReservations: isLoading }),
  clearSearch: () => set({ 
    searchQuery: null,
    searchResults: [],
    isSearching: false,
    searchError: null,
    totalResults: 0
  }),
}));
