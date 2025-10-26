import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { Trip, PaginatedResponse } from '@/types';

interface TripsState {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: TripsState = {
  trips: [],
  currentTrip: null,
  loading: false,
  error: null,
  total: 0,
};

export const fetchTrips = createAsyncThunk('trips/fetchTrips', async (params?: any) => {
  const response = await api.get<PaginatedResponse<Trip>>('/trips', { params });
  return response.data;
});

export const createTrip = createAsyncThunk('trips/createTrip', async (trip: Partial<Trip>) => {
  const response = await api.post<Trip>('/trips', trip);
  return response.data;
});

export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ id, data }: { id: string; data: Partial<Trip> }) => {
    const response = await api.put<Trip>(`/trips/${id}`, data);
    return response.data;
  }
);

export const deleteTrip = createAsyncThunk('trips/deleteTrip', async (id: string) => {
  await api.delete(`/trips/${id}`);
  return id;
});

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trips';
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.trips.unshift(action.payload);
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        const index = state.trips.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.trips = state.trips.filter((t) => t.id !== action.payload);
      });
  },
});

export default tripsSlice.reducer;
