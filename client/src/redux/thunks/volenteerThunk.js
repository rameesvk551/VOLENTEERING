// volenteerThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import server from "@/server/app";
export const loadVolenteer = createAsyncThunk("host/loadVolenteer", async (_, { rejectWithValue }) => {
    try {
        console.log("Calling API...");
        const response = await axios.get(`${server}/user/load-volenteer`, {
            withCredentials: true,
        });
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || error.message || "An error occurred");
    }
});
