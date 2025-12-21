import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./user_slices/authSlice.jsx";
import profileReducer from "./user_slices/profileSlice.jsx";
import trainerProfileReducer from "./trainer_slices/trainerProfileSlice.jsx";
import adminReducer from "./admin_slices/admin_user_trainer_approve.jsx";
import trainerBookingReducer  from "./user_slices/trainerBookingSlice.jsx";
import trainerBookingApprovalReducer from "./trainer_slices/trainerBookingApprovalSlice.jsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    trainerProfile: trainerProfileReducer,
    admin: adminReducer,
    trainerBooking: trainerBookingReducer,
    trainerBookingApproval: trainerBookingApprovalReducer,
  },
});
