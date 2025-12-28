import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./user_slices/authSlice";
import profileReducer from "./user_slices/profileSlice";

// add other reducers here when needed

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  
  //  etc later
});

const rootReducer = (state, action) => {
  // 🔥 THIS IS THE FIX
  if (action.type === "auth/logoutUser/fulfilled" || action.type === "auth/logoutUser/rejected") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
