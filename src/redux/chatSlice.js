import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    conversations: [],
  },
  reducers: {
    setMessage: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setConversation: (state, action) => {
      state.conversations = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessage, addMessage, setConversation, clearMessages } =
  chatSlice.actions;

export default chatSlice.reducer;
