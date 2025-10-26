import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { GearRental, PaginatedResponse } from '@/types';

interface GearState {
  items: GearRental[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: GearState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchGear = createAsyncThunk('gear/fetchGear', async (params?: any) => {
  const response = await api.get<PaginatedResponse<GearRental>>('/gear', { params });
  return response.data;
});

export const createGear = createAsyncThunk('gear/createGear', async (gear: Partial<GearRental>) => {
  const response = await api.post<GearRental>('/gear', gear);
  return response.data;
});

export const updateGear = createAsyncThunk(
  'gear/updateGear',
  async ({ id, data }: { id: string; data: Partial<GearRental> }) => {
    const response = await api.put<GearRental>(`/gear/${id}`, data);
    return response.data;
  }
);

export const deleteGear = createAsyncThunk('gear/deleteGear', async (id: string) => {
  await api.delete(`/gear/${id}`);
  return id;
});

const gearSlice = createSlice({
  name: 'gear',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGear.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGear.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchGear.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch gear';
      })
      .addCase(createGear.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateGear.fulfilled, (state, action) => {
        const index = state.items.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteGear.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g.id !== action.payload);
      });
  },
});

export default gearSlice.reducer;
