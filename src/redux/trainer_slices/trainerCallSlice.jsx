import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ⚠️ FIX: Use Chat Service directly (8001) like User does, avoiding Proxy (8002) issues
import api from "../../api5"

/*
|--------------------------------------------------------------------------
| Thunks (Proxy → User Service)
|--------------------------------------------------------------------------
*/

export const startCall = createAsyncThunk(
  "trainerCall/startCall",
  async (roomId, { rejectWithValue }) => {
    try {
      console.log("🚀 TRAINER STARTING CALL...", roomId);
      const res = await api.post(`calls/start/${roomId}/`);
      console.log("✅ TRAINER START CALL SUCCESS:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ TRAINER START CALL FAILED:", err.response || err);
      return rejectWithValue(err.response?.data || "Start call failed");
    }
  }
);

export const acceptCall = createAsyncThunk(
  "trainerCall/acceptCall",
  async (callId, { rejectWithValue }) => {
    try {
      const res = await api.post(`calls/${callId}/accept/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Accept call failed");
    }
  }
);

export const endCall = createAsyncThunk(
  "trainerCall/endCall",
  async (callId, { rejectWithValue }) => {
    try {
      const res = await api.post(`calls/${callId}/end/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "End call failed");
    }
  }
);

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const trainerCallSlice = createSlice({
  name: "trainerCall",
  initialState: {
    incomingCall: null,
    activeCall: null,
  },
  reducers: {
    // 🔔 WS EVENT
    addIncomingCall(state, action) {
      state.incomingCall = action.payload;
    },

    // ✅ WS EVENT
    callAccepted(state, action) {
      state.activeCall = action.payload;
      state.incomingCall = null;
    },

    // ❌ WS EVENT
    callEnded(state) {
      state.incomingCall = null;
      if (state.activeCall) {
        state.activeCall.status = "ended";
      }
    },

    clearTrainerCall(state) {
      state.incomingCall = null;
      state.activeCall = null;
    },
  },
});

export const {
  addIncomingCall,
  callAccepted,
  callEnded,
  clearTrainerCall,
} = trainerCallSlice.actions;

export default trainerCallSlice.reducer;
