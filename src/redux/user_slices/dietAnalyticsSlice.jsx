import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api2 from "../../api2";

/* ======================================================
   THUNKS
====================================================== */

export const fetchDailyProgress = createAsyncThunk(
  "progress/fetchDaily",
  async (date = null, { rejectWithValue }) => {
    try {
      const params = date ? { date } : {};
      const res = await api2.get("progress/daily/", { params });
      return res.data.data; // ✅ unwrap
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to load daily progress"
      );
    }
  }
);

export const fetchWeeklyProgress = createAsyncThunk(
  "progress/fetchWeekly",
  async (weekStart = null, { rejectWithValue }) => {
    try {
      const params = weekStart ? { week_start: weekStart } : {};
      const res = await api2.get("progress/weekly/", { params });
      return res.data.data; // ✅ unwrap
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to load weekly progress"
      );
    }
  }
);

export const fetchMonthlyProgress = createAsyncThunk(
  "progress/fetchMonthly",
  async ({ year, month } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;

      const res = await api2.get("progress/monthly/", { params });
      return res.data.data; // ✅ unwrap
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to load monthly progress"
      );
    }
  }
);

/* ======================================================
   SLICE
====================================================== */

const initialState = {
  daily: null,
  weekly: null,
  monthly: null,

  loading: {
    daily: false,
    weekly: false,
    monthly: false,
  },

  error: {
    daily: null,
    weekly: null,
    monthly: null,
  },
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    clearProgress(state) {
      state.daily = null;
      state.weekly = null;
      state.monthly = null;

      state.error.daily = null;
      state.error.weekly = null;
      state.error.monthly = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------------- DAILY ---------------- */
      .addCase(fetchDailyProgress.pending, (state) => {
        state.loading.daily = true;
        state.error.daily = null;
      })
      .addCase(fetchDailyProgress.fulfilled, (state, action) => {
        state.loading.daily = false;
        state.daily = action.payload;
      })
      .addCase(fetchDailyProgress.rejected, (state, action) => {
        state.loading.daily = false;
        state.error.daily = action.payload;
      })

      /* ---------------- WEEKLY ---------------- */
      .addCase(fetchWeeklyProgress.pending, (state) => {
        state.loading.weekly = true;
        state.error.weekly = null;
      })
      .addCase(fetchWeeklyProgress.fulfilled, (state, action) => {
        state.loading.weekly = false;
        state.weekly = action.payload;
      })
      .addCase(fetchWeeklyProgress.rejected, (state, action) => {
        state.loading.weekly = false;
        state.error.weekly = action.payload;
      })

      /* ---------------- MONTHLY ---------------- */
      .addCase(fetchMonthlyProgress.pending, (state) => {
        state.loading.monthly = true;
        state.error.monthly = null;
      })
      .addCase(fetchMonthlyProgress.fulfilled, (state, action) => {
        state.loading.monthly = false;
        state.monthly = action.payload;
      })
      .addCase(fetchMonthlyProgress.rejected, (state, action) => {
        state.loading.monthly = false;
        state.error.monthly = action.payload;
      });
  },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
