// src/redux/slices/messageSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { loadMessages, sendMessage } from "../thunks/messageThunk";
const initialState = {
    selectedUser: null,
    messages: [],
    loading: false,
    error: null,
};
const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        addMessage(state, action) {
            state.messages.push(action.payload);
            console.log("messagessssssssssss", state.messages);
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadMessages.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(loadMessages.fulfilled, (state, action) => {
            state.loading = false;
            state.messages = action.payload;
        })
            .addCase(loadMessages.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(sendMessage.fulfilled, (state, action) => {
            const message = action.payload.newMessage;
            state.messages.push(message);
        });
    },
});
export const { addMessage, setSelectedUser } = messageSlice.actions;
export default messageSlice.reducer;
