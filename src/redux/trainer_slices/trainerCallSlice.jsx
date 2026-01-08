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
  extraReducers: (builder) => {
    // 🟡 HTTP START CALL
    builder.addCase(startCall.fulfilled, (state, action) => {
      // action.payload should usually contain the call info. 
      // Even if not complete, we must set a placeholder to allow status updates.
      state.activeCall = {
        ...action.payload,
        status: "ringing", // or "started"
      };
    });

    // 🟥 HTTP END CALL
    builder.addCase(endCall.fulfilled, (state) => {
      state.incomingCall = null;
      if (state.activeCall) {
        state.activeCall.status = "ended";
      }
    });

    // ✅ HTTP ACCEPT CALL (Backup if WS is slow)
    builder.addCase(acceptCall.fulfilled, (state, action) => {
        state.activeCall = {
            ...action.payload,
            status: "accepted"
        };
        state.incomingCall = null;
    });
  },
});

export const {
  addIncomingCall,
  callAccepted,
  callEnded,
  clearTrainerCall,
} = trainerCallSlice.actions;

export default trainerCallSlice.reducer;
