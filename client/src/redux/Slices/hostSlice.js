import { createSlice } from "@reduxjs/toolkit";
import { loadHost } from "../thunks/hostTunk";
const initialState = {
    hostData: null,
    loading: false,
    error: null,
    isAuthenticated: false
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
            .addCase(loadHost.fulfilled, (state, action) => {
            state.loading = false;
            console.log("Action Payload:", action.payload);
            state.hostData = action.payload;
        })
            .addCase(loadHost.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export default hostSlice.reducer;
