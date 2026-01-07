import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api3"

/*
|--------------------------------------------------------------------------
| Thunks (Proxy → User Service)
|--------------------------------------------------------------------------
*/

export const startCall = createAsyncThunk(
  "trainerCall/startCall",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.post(`calls/start/${roomId}/`);
      return res.data;
    } catch (err) {
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
      state.activeCall = null;
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
