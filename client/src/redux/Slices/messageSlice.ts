// src/redux/slices/messageSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loadMessages, sendMessage } from "../thunks/messageThunk";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}interface User {
  _id: string;
  firstName: string;
  profileImage?: string;
  // Add any more fields as needed
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  selectedUser:User | null;
}


const initialState: MessageState = {
    selectedUser:null,
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
      console.log("messagessssssssssss",state.messages);
      
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;

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
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<{ newMessage: Message }>) => {
        const message = action.payload.newMessage;
        state.messages.push(message);
      });
      
    
 
        
     
  },
});

export const { addMessage,setSelectedUser} = messageSlice.actions;
export default messageSlice.reducer;
