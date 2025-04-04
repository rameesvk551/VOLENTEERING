import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadHost } from "../thunks/hostTunk";
import { loadVolenteer } from "../thunks/volenteerThunk";

interface VolenteerState {
  volenteerData: any | null;
  loading: boolean;
  error: string | null;
  isAuthenticated:boolean
}

const initialState: VolenteerState = {
  volenteerData: null,
  loading: false,
  error: null,
  isAuthenticated:false
};

const volenteerSlice = createSlice({
  name: "volenteer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadVolenteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVolenteer.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        console.log("Action Payload:", action.payload);
        state.volenteerData = action.payload;
        state.isAuthenticated=true
      })
      .addCase(loadVolenteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export default volenteerSlice.reducer;
