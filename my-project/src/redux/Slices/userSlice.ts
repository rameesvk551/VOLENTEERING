// volenteerSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadVolenteer } from "../thunks/volenteerThunk";

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
  name: "volenteer",
  initialState,
  reducers: {
    updateOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
      console.log("online users",state.onlineUsers);
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadVolenteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadVolenteer.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.volenteerData = action.payload;
        state.isAuthenticated = true;

      })
      .addCase(loadVolenteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  },
});

export const { updateOnlineUsers } = volenteerSlice.actions;
export default volenteerSlice.reducer;
