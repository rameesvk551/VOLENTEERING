import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import server from '@server/app';

interface HostResponse {
  host?: unknown;
  [key: string]: unknown;
}

export const loadHost = createAsyncThunk<HostResponse, void, { rejectValue: string }>(
  'host/loadHost',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await axios.get<HostResponse>(`${server}/host/load-host`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'An error occurred');
    }
  }
);
