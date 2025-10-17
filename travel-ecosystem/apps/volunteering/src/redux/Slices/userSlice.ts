import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { loadVolenteer } from '../thunks/volenteerThunk';

interface VolenteerState {
  volenteerData: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  onlineUsers: string[];
}

const initialState: VolenteerState = {
  volenteerData: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  onlineUsers: [],
};

const volenteerSlice = createSlice({
  name: 'volenteer',
  initialState,
  reducers: {
    updateOnlineUsers: (state: VolenteerState, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<VolenteerState>) => {
    builder
      .addCase(loadVolenteer.pending, (state: VolenteerState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVolenteer.fulfilled, (state: VolenteerState, action: PayloadAction<any>) => {
        state.loading = false;
        state.volenteerData = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadVolenteer.rejected, (state: VolenteerState, action: PayloadAction<string | null | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to load volunteer';
      });
  },
});

export const { updateOnlineUsers } = volenteerSlice.actions;
export default volenteerSlice.reducer;
