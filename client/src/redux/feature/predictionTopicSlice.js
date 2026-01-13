// src/redux/topicSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  selected: null,
};

const topicSlice = createSlice({
  name: "topic",
  initialState,
  reducers: {
    setTopics(state, action) {
      state.list = action.payload;

      // auto-select the first topic if available
      if (action.payload.length > 0) {
        state.selected = action.payload[0];
      }
    },
    setSelectedTopic(state, action) {
      state.selected = action.payload;
    },
    addTopic(state, action) {
      state.list.push(action.payload);
    },
  },
});

export const { setTopics, setSelectedTopic, addTopic } = topicSlice.actions;
export default topicSlice.reducer;
