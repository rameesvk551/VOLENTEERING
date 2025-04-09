// redux/Slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  firstName: string;
  profileImage?: string;
  // Add any more fields as needed
}

interface ChatState {
  selectedUser: User | null;
}

const initialState: ChatState = {
  selectedUser: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;

    },
  },
});

export const { setSelectedUser } = chatSlice.actions;
export default chatSlice.reducer;
