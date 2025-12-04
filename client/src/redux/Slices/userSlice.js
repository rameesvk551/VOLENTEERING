// volenteerSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { loadVolenteer } from "../thunks/volenteerThunk";
const initialState = {
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
        updateOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
            console.log("online users", state.onlineUsers);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadVolenteer.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(loadVolenteer.fulfilled, (state, action) => {
            state.loading = false;
            state.volenteerData = action.payload;
            state.isAuthenticated = true;
        })
            .addCase(loadVolenteer.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { updateOnlineUsers } = volenteerSlice.actions;
export default volenteerSlice.reducer;
