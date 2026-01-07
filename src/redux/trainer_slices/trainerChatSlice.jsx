import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api3";

/* ============================
   FETCH TRAINER CHAT ROOMS
============================ */
export const fetchTrainerChatRooms = createAsyncThunk(
  "trainerChat/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/chat/rooms/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ============================
   FETCH CHAT HISTORY (CURSOR)
============================ */
export const fetchTrainerChatMessages = createAsyncThunk(
  "trainerChat/fetchMessages",
  async ({ roomId, cursor = null }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages/`, {
        params: cursor ? { cursor } : {},
      });

      return {
        roomId,
        results: res.data.results, // oldest → newest
        next: res.data.next,
        previous: res.data.previous,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ============================
   SEND TEXT MESSAGE (HTTP)
============================ */
export const sendTrainerTextMessage = createAsyncThunk(
  "trainerChat/sendText",
  async ({ roomId, text }, { rejectWithValue }) => {
    try {
      const res = await api.post("/chat/send/text/", {
        room_id: roomId,
        text,
      });
      return res.data; // DB-confirmed message
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ============================
   SEND MEDIA MESSAGE (HTTP)
============================ */
export const sendTrainerMediaMessage = createAsyncThunk(
  "trainerChat/sendMedia",
  async ({ roomId, file, type, durationSec = null }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("room_id", roomId);
      formData.append("type", type); // "image" | "audio"
      formData.append("file", file);

      if (durationSec) {
        formData.append("duration_sec", durationSec);
      }

      const res = await api.post("/chat/send/media/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data; // DB-confirmed message
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ============================
   INITIAL STATE
============================ */
const initialState = {
  rooms: [],
  activeRoomId: null,

  messagesByRoom: {}, // { roomId: Message[] }
  paginationByRoom: {}, // { roomId: { next, previous } }

  loadingRooms: false,
  loadingMessages: false,
  sending: false,

  error: null,
};

/* ============================
   SLICE
============================ */
const trainerChatSlice = createSlice({
  name: "trainerChat",
  initialState,
  reducers: {
    setActiveRoom(state, action) {
      state.activeRoomId = action.payload;
    },

    clearActiveRoom(state) {
      state.activeRoomId = null;
    },

    /* ============================
       WS: RECEIVE MESSAGE
       (append only, deduped)
    ============================ */
    receiveSocketMessage(state, action) {
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

  // 🔥 enforce order for text + media
  state.messagesByRoom[roomId].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
},

    /* ============================
       MARK ROOM READ (LOCAL)
    ============================ */
    markRoomRead(state, action) {
      const roomId = action.payload;
      const msgs = state.messagesByRoom[roomId] || [];

      msgs.forEach((m) => {
        if (!m.read_at) {
          m.read_at = new Date().toISOString();
        }
      });
    },
  },

  extraReducers: (builder) => {
    builder

      /* ============================
         ROOMS
      ============================ */
      .addCase(fetchTrainerChatRooms.pending, (state) => {
        state.loadingRooms = true;
        state.error = null;
      })
      .addCase(fetchTrainerChatRooms.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload;
      })
      .addCase(fetchTrainerChatRooms.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error = action.payload;
      })

      /* ============================
         MESSAGE HISTORY
      ============================ */
      .addCase(fetchTrainerChatMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchTrainerChatMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;

        const { roomId, results, next, previous } = action.payload;

        const existing = state.messagesByRoom[roomId] || [];
        const merged = [...existing, ...results];

        // hard guarantee: oldest → newest
        const ordered = merged
          .filter((v, i, arr) => arr.findIndex((m) => m.id === v.id) === i)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        state.messagesByRoom[roomId] = ordered;
        state.paginationByRoom[roomId] = { next, previous };
      })
      .addCase(fetchTrainerChatMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
      })

      /* ============================
         SEND TEXT (HTTP CONFIRMED)
      ============================ */
      .addCase(sendTrainerTextMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendTrainerTextMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const roomId = msg.room_id;

        if (!state.messagesByRoom[roomId]) {
          state.messagesByRoom[roomId] = [];
        }

        const exists = state.messagesByRoom[roomId].some(
          (m) => m.id === msg.id
        );

        if (!exists) {
          state.messagesByRoom[roomId].push(msg);
        }

        state.sending = false;
      })
      .addCase(sendTrainerTextMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      /* ============================
         SEND MEDIA (HTTP CONFIRMED)
      ============================ */
      .addCase(sendTrainerMediaMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendTrainerMediaMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const roomId = msg.room_id;

        if (!state.messagesByRoom[roomId]) {
          state.messagesByRoom[roomId] = [];
        }

        const exists = state.messagesByRoom[roomId].some(
          (m) => m.id === msg.id
        );

        if (!exists) {
          state.messagesByRoom[roomId].push(msg);
        }

        state.sending = false;
      })
      .addCase(sendTrainerMediaMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

/* ============================
   EXPORTS
============================ */
export const {
  setActiveRoom,
  clearActiveRoom,
  receiveSocketMessage,
  markRoomRead,
} = trainerChatSlice.actions;

export default trainerChatSlice.reducer;
