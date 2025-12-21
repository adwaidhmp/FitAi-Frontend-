import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api4.jsx";

/* -------------------- USERS -------------------- */

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("users/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch users");
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ userId, is_active }, { rejectWithValue }) => {
    try {
      const res = await api.post(`users/${userId}/status/`, {
        is_active,
      });
      return { userId, is_active, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Status update failed");
    }
  }
);

/* -------------------- TRAINERS -------------------- */

export const fetchTrainers = createAsyncThunk(
  "admin/fetchTrainers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("trainers/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch trainers");
    }
  }
);

export const fetchTrainerDetail = createAsyncThunk(
  "admin/fetchTrainerDetail",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`trainers/${userId}/`);
      return res.data; // { basic, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch trainer");
    }
  }
);

export const approveTrainer = createAsyncThunk(
  "admin/approveTrainer",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.post(`trainers/${userId}/approve/`);
      return { userId, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Approval failed");
    }
  }
);

/* -------------------- SLICE -------------------- */

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    trainers: [],
    trainerDetail: null,

    loadingUsers: false,
    loadingTrainers: false,
    loadingTrainerDetail: false,

    error: null,
  },
  reducers: {
    clearTrainerDetail(state) {
      state.trainerDetail = null;
    },
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* USERS */
      .addCase(fetchUsers.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, is_active } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) user.is_active = is_active;
      })

      /* TRAINERS */
      .addCase(fetchTrainers.pending, (state) => {
        state.loadingTrainers = true;
        state.error = null;
      })
      .addCase(fetchTrainers.fulfilled, (state, action) => {
        state.loadingTrainers = false;
        state.trainers = action.payload;
      })
      .addCase(fetchTrainers.rejected, (state, action) => {
        state.loadingTrainers = false;
        state.error = action.payload;
      })

      .addCase(fetchTrainerDetail.pending, (state) => {
        state.loadingTrainerDetail = true;
        state.error = null;
      })
      .addCase(fetchTrainerDetail.fulfilled, (state, action) => {
        state.loadingTrainerDetail = false;
        state.trainerDetail = action.payload;
      })
      .addCase(fetchTrainerDetail.rejected, (state, action) => {
        state.loadingTrainerDetail = false;
        state.error = action.payload;
      })

      .addCase(approveTrainer.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const trainer = state.trainers.find((t) => t.id === userId);
        if (trainer) trainer.is_approved = true;
      });
  },
});

export const { clearTrainerDetail, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;