import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api5.jsx";

/* =========================
   THUNKS
========================= */

// User starts a call
export const startCall = createAsyncThunk(
  "userCall/startCall",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.post(`calls/start/${roomId}/`);
      return res.data; // must contain call_id, room_id
    } catch (err) {
      return rejectWithValue(err.response?.data || "Start call failed");
    }
  }
);

// User accepts a call
export const acceptCall = createAsyncThunk(
  "userCall/acceptCall",
  async (callId, { rejectWithValue }) => {
    try {
      const res = await api.post(`calls/${callId}/accept/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Accept call failed");
    }
  }
);

// User ends a call
export const endCall = createAsyncThunk(
  "userCall/endCall",
  async (callId, { rejectWithValue }) => {
    try {
      const res = await api.post(`calls/${callId}/end/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "End call failed");
    }
  }
);

/* =========================
   SLICE
========================= */

const userCallSlice = createSlice({
  name: "userCall",
  initialState: {
    incomingCall: null, // ringing incoming call
    activeCall: null,   // outgoing or accepted call
  },
  reducers: {
    // 🔔 WS EVENT
    addIncomingCall(state, action) {
      state.incomingCall = action.payload;
    },

    // ✅ WS EVENT
    callAccepted(state, action) {
      state.activeCall = {
        ...action.payload,
        status: "accepted",
      };
      state.incomingCall = null;
    },

    // ❌ WS EVENT
    callEnded(state) {
      state.incomingCall = null;
      state.activeCall = null;
    },

    clearUserCall(state) {
      state.incomingCall = null;
      state.activeCall = null;
    },
  },
  extraReducers: (builder) => {
    // 🟡 HTTP START CALL (ringing state only)
    builder.addCase(startCall.fulfilled, (state, action) => {
      state.activeCall = {
        ...action.payload,
        status: "ringing",
      };
    });

    // 🟥 HTTP END CALL (safety)
    builder.addCase(endCall.fulfilled, (state) => {
      state.incomingCall = null;
      state.activeCall = null;
    });
  },
});

export const {
  addIncomingCall,
  callAccepted,
  callEnded,
  clearUserCall,
} = userCallSlice.actions;

export default userCallSlice.reducer;
