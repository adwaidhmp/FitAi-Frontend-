import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./user_slices/authSlice.jsx";
import profileReducer from "./user_slices/profileSlice.jsx";
import trainerProfileReducer from "./trainer_slices/trainerProfileSlice.jsx";
import adminReducer from "./admin_slices/admin_user_trainer_approve.jsx";
import trainerBookingReducer from "./user_slices/trainerBookingSlice.jsx";
import trainerBookingApprovalReducer from "./trainer_slices/trainerBookingApprovalSlice.jsx";
import dietActionsReducer from "./user_slices/dietActionsSlice.jsx";
import progressReducer from "./user_slices/dietAnalyticsSlice.jsx";
import workoutSliceReducer from "./user_slices/workoutSlice.jsx";
import chatReducer from "./user_slices/chatSlice.jsx";
import trainerChatReducer from "./trainer_slices/trainerChatSlice.jsx";
import userCallReducer from "./user_slices/userCallSlice.jsx";
import trainerCallReducer from "./trainer_slices/trainerCallSlice.jsx";
import trainerUserOverviewReducer from "./trainer_slices/trainerUserOverviewSlice.jsx";

/* -------------------------------------------------------
   Combine all reducers
------------------------------------------------------- */
const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  trainerProfile: trainerProfileReducer,
  admin: adminReducer,
  trainerBooking: trainerBookingReducer,
  trainerBookingApproval: trainerBookingApprovalReducer,
  dietActions: dietActionsReducer,
  progress: progressReducer,
  workout: workoutSliceReducer,
  chat: chatReducer,
  trainerChat: trainerChatReducer,
  userCall: userCallReducer,
  trainerCall: trainerCallReducer,
  trainerUserOverview: trainerUserOverviewReducer,
});

/* -------------------------------------------------------
   Root reducer with GLOBAL RESET on logout
------------------------------------------------------- */

const rootReducer = (state, action) => {
  // 🔥 Reset entire Redux store on logout (success or failure)
  if (
    action.type === "auth/logoutUser/fulfilled" ||
    action.type === "auth/logoutUser/rejected"
  ) {
    state = undefined;
  }

  return appReducer(state, action);
};

/* -------------------------------------------------------
   Configure and export the store
------------------------------------------------------- */
export const store = configureStore({
  reducer: rootReducer,
});

export default store;
