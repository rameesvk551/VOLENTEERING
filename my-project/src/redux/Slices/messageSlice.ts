// src/redux/slices/messageSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadMessages, sendMessage } from "../thunks/messageThunk";

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  selectedUserId:string | null;
}


const initialState: MessageState = {
    selectedUserId:null,
  messages: [],
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
      console.log(state.messages);
      
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.messages.push(action.payload);
      });
  },
});

export const { addMessage } = messageSlice.actions;
export default messageSlice.reducer;
