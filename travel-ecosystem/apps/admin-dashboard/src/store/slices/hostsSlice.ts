import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { Host, PaginatedResponse } from '@/types';

interface HostsState {
  hosts: Host[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: HostsState = {
  hosts: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchHosts = createAsyncThunk('hosts/fetchHosts', async (params?: any) => {
  const response = await api.get<PaginatedResponse<Host>>('/hosts', { params });
  return response.data;
});

export const updateHost = createAsyncThunk(
  'hosts/updateHost',
  async ({ id, data }: { id: string; data: Partial<Host> }) => {
    const response = await api.put<Host>(`/hosts/${id}`, data);
    return response.data;
  }
);

export const verifyHost = createAsyncThunk('hosts/verifyHost', async (id: string) => {
  const response = await api.post<Host>(`/hosts/${id}/verify`);
  return response.data;
});

const hostsSlice = createSlice({
  name: 'hosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHosts.fulfilled, (state, action) => {
        state.loading = false;
        state.hosts = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchHosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hosts';
      })
      .addCase(updateHost.fulfilled, (state, action) => {
        const index = state.hosts.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hosts[index] = action.payload;
        }
      })
      .addCase(verifyHost.fulfilled, (state, action) => {
        const index = state.hosts.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hosts[index] = action.payload;
        }
      });
  },
});

export default hostsSlice.reducer;
