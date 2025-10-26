import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { AnalyticsMetric } from '@/types';

interface AnalyticsState {
  metrics: AnalyticsMetric[];
  loading: boolean;
  error: string | null;
  chartData: any[];
}

const initialState: AnalyticsState = {
  metrics: [],
  loading: false,
  error: null,
  chartData: [],
};

export const fetchAnalytics = createAsyncThunk('analytics/fetchAnalytics', async (params?: any) => {
  const response = await api.get('/analytics', { params: params || {} });
  return response.data;
});

export const fetchChartData = createAsyncThunk('analytics/fetchChartData', async (type: string) => {
  const response = await api.get(`/analytics/charts/${type}`);
  return response.data;
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload.metrics;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
