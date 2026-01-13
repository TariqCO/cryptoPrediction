// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, 
};

const userSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.user = action.payload; 
    },
    clearCurrentUser: (state) => {
      state.user = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
