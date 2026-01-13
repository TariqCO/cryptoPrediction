import { configureStore } from "@reduxjs/toolkit";
import topicReducer from "../feature/predictionTopicSlice.js";
import userReducer  from "../feature/userSlice.js";
import timeframeReducer  from "../feature/timeframeSlice.js";


export const store = configureStore({
  reducer: {
    topic:       topicReducer,   
    currentUser: userReducer,    
    timeframe: timeframeReducer
  },
});
