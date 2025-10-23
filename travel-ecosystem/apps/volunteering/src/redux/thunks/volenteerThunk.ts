import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import server from '@server/app';

interface VolenteerResponse {
  user?: unknown;
  [key: string]: unknown;
}

export const loadVolenteer = createAsyncThunk<VolenteerResponse, void, { rejectValue: string }>(
  'volenteer/loadVolenteer',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await axios.get<VolenteerResponse>(`${server}/user/load-volenteer`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An error occurred');
    }
  }
);
