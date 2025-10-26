import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { FinanceRecord, PaginatedResponse } from '@/types';

interface FinanceState {
  records: FinanceRecord[];
  loading: boolean;
  error: string | null;
  total: number;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
}

const initialState: FinanceState = {
  records: [],
  loading: false,
  error: null,
  total: 0,
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
  },
};

export const fetchFinanceRecords = createAsyncThunk('finance/fetchRecords', async (params?: any) => {
  const response = await api.get<PaginatedResponse<FinanceRecord>>('/finance/records', { params });
  return response.data;
});

export const fetchFinanceSummary = createAsyncThunk('finance/fetchSummary', async (params?: any) => {
  const response = await api.get('/finance/summary', { params });
  return response.data;
});

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFinanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchFinanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch finance records';
      })
      .addCase(fetchFinanceSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export default financeSlice.reducer;
