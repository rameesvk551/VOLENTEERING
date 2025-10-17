import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadHost } from "../thunks/hostTunk";

interface HostState {
  hostData: any | null; // Replace 'any' with a proper type
  loading: boolean;
  error: string | null;
  isAuthenticated:boolean
}

const initialState: HostState = {
  hostData: null,
  loading: false,
  error: null,
  isAuthenticated:false
};

const hostSlice = createSlice({
  name: "host",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHost.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        console.log("Action Payload:", action.payload);
        state.hostData = action.payload;
      })
      .addCase(loadHost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export default hostSlice.reducer;
