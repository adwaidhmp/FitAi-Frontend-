import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./user_slices/authSlice.jsx";
import profileReducer from "./user_slices/profileSlice.jsx";
import trainerProfileReducer from "./trainer_slices/trainerProfileSlice.jsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    trainerProfile: trainerProfileReducer,
  },
});
