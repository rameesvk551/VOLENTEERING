import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import server from "../../server/app"; // Ensure this is properly defined

export const loadVolenteer = createAsyncThunk(
  "host/loadVolenteer",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Calling API...");
      const response = await axios.get(`${server}/volenteer/load-volenteer`, { withCredentials: true });
      console.log("Response Data:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || "An error occurred");
    }
  }
);
