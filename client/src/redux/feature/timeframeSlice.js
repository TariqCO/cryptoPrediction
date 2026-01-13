// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  timeframe: "24", 
};

const timeframeSlice = createSlice({
  name: "timeframe",
  initialState,
  reducers: {
    setTF: (state, action) => {
      state.tf = action.payload; 
    },

  },
});

export const { setTF, } = timeframeSlice.actions;
export default timeframeSlice.reducer;
