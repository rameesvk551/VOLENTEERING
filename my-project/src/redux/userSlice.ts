import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AuthState, User } from "../redux/type";

const initialState: AuthState = {
    user: null,
    loading: true,
};

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
    const { data } = await axios.get("/api/auth/me");
    return data.user;
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.loading = false;
        },
        logoutUser: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.loading = false;
        });
    },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
