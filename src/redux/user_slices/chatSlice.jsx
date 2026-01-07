// src/redux/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api5.jsx";

/* =========================
   FETCH USER CHAT ROOMS
========================= */
export const fetchChatRooms = createAsyncThunk(
  "chat/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("rooms/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =========================
   FETCH CHAT HISTORY
========================= */
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.get(`rooms/${roomId}/messages/`);
      return { roomId, messages: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =========================
   SEND TEXT MESSAGE (HTTP)
========================= */
export const sendTextMessage = createAsyncThunk(
  "chat/sendTextMessage",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("send/text/", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =========================
   SEND MEDIA MESSAGE (HTTP)
========================= */
export const sendMediaMessage = createAsyncThunk(
  "chat/sendMediaMessage",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("send/media/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =========================
   INITIAL STATE
========================= */
const initialState = {
  rooms: [],
  activeRoomId: null,
  messagesByRoom: {}, // ALWAYS flat array per room
  loadingRooms: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
};

/* =========================
   SLICE
========================= */
const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setActiveRoom(state, action) {
      state.activeRoomId = action.payload;
    },

    /* =========================
       SOCKET RECEIVE ONLY
    ========================= */
    receiveSocketMessage(state, action) {
  const msg = action.payload;

  // 🔥 SOCKET MESSAGES ALWAYS USE room_id
  const roomId = String(msg.room_id);

  if (!state.messagesByRoom[roomId]) {
    state.messagesByRoom[roomId] = [];
  }

  const exists = state.messagesByRoom[roomId].some(
    (m) => m.id === msg.id
  );

  if (!exists) {
    state.messagesByRoom[roomId].push(msg);
  }

  // enforce oldest → newest
  state.messagesByRoom[roomId].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
},
    clearChatState() {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------- ROOMS -------- */
      .addCase(fetchChatRooms.pending, (state) => {
        state.loadingRooms = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error = action.payload;
      })

      /* -------- MESSAGES -------- */
      .addCase(fetchChatMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;

        const { roomId, messages } = action.payload;

        const list = Array.isArray(messages)
          ? messages
          : Array.isArray(messages?.results)
          ? messages.results
          : [];

        const existing = state.messagesByRoom[roomId] || [];

        const merged = [...existing, ...list];

        // 🔥 dedupe + enforce oldest → newest
        state.messagesByRoom[roomId] = merged
          .filter(
            (v, i, arr) =>
              arr.findIndex((m) => m.id === v.id) === i
          )
          .sort(
            (a, b) =>
              new Date(a.created_at) - new Date(b.created_at)
          );
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
      })

      /* -------- SEND TEXT -------- */
      .addCase(sendTextMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendTextMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;

        const msg = action.payload;
        const roomId = String(msg.room_id);

        if (!state.messagesByRoom[roomId]) {
          state.messagesByRoom[roomId] = [];
        }

        const exists = state.messagesByRoom[roomId].some(
          (m) => m.id === msg.id
        );

        if (!exists) {
          state.messagesByRoom[roomId].push(msg);
        }

        state.messagesByRoom[roomId].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      })

      /* -------- SEND MEDIA -------- */
      .addCase(sendMediaMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMediaMessage.fulfilled, (state, action) => {
  state.sendingMessage = false;

  const msg = action.payload;
  const roomId = String(msg.room_id);

  if (!state.messagesByRoom[roomId]) {
    state.messagesByRoom[roomId] = [];
  }

  const exists = state.messagesByRoom[roomId].some(
    (m) => m.id === msg.id
  );

  if (!exists) {
    state.messagesByRoom[roomId].push(msg);
  }

  state.messagesByRoom[roomId].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
})
      .addCase(sendTextMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })
      .addCase(sendMediaMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveRoom,
  receiveSocketMessage,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
