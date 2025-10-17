import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { loadHost } from '../thunks/hostThunk';

interface HostState {
  hostData: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: HostState = {
  hostData: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const hostSlice = createSlice({
  name: 'host',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<HostState>) => {
    builder
      .addCase(loadHost.pending, (state: HostState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHost.fulfilled, (state: HostState, action: PayloadAction<any>) => {
        state.loading = false;
        state.hostData = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadHost.rejected, (state: HostState, action: PayloadAction<string | null | undefined>) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unable to load host';
      });
  },
});

export default hostSlice.reducer;
