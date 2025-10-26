import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { Booking, PaginatedResponse } from '@/types';

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchBookings = createAsyncThunk('bookings/fetchBookings', async (params?: any) => {
  const response = await api.get<PaginatedResponse<Booking>>('/bookings', { params });
  return response.data;
});

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await api.put<Booking>(`/bookings/${id}/status`, { status });
    return response.data;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });
  },
});

export default bookingsSlice.reducer;
