// src/redux/thunks/messageThunk.ts
import server from "@/server/app";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loadMessages = createAsyncThunk(
  "messages/loadMessages",
  async ({ userId, receiverId }: { userId: string; receiverId: string }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${server}/message/messages/${receiverId}`, {
        withCredentials: true,
      });
      return res.data.allmessagesBetweenThem
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ content, receiverId }: { content: string; receiverId: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${server}/message/send-message/${receiverId}`,
        { content, receiverId },
        { withCredentials: true }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
