import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api2.jsx";

/* ============================
   THUNKS
============================ */

export const generateWorkout = createAsyncThunk(
  "workout/generate",
  async (workoutType, { rejectWithValue }) => {
    try {
      const res = await api.post("/workout/generate/", {
        workout_type: workoutType,
      });
      return res.data; // EXPECTED: workout plan
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to generate workout"
      );
    }
  }
);

export const fetchCurrentWorkout = createAsyncThunk(
  "workout/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/workout/current/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "No workout found"
      );
    }
  }
);

export const logWorkoutExercise = createAsyncThunk(
  "workout/logExercise",
  async (
    { exercise_name, duration_sec = 0, intensity, status },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/workout/log/", {
        exercise_name,
        duration_sec,
        intensity,
        status, // "completed" | "skipped"
      });

      return {
        exercise_name,
        status,
        calories_burnt: res.data.calories_burnt,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to log exercise"
      );
    }
  }
);

export const fetchTodayWorkoutLogs = createAsyncThunk(
  "workout/fetchTodayLogs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/workout/logs/today/");
      return res.data; // { [exercise_name]: "completed" | "skipped" }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to fetch workout logs"
      );
    }
  }
);

/* ============================
   STATE
============================ */

const initialState = {
  plan: null,              // current workout plan
  loading: false,          // fetching plan
  generating: false,       // generating plan
  logging: false,          // logging exercise

  loggedExercises: {},     // { exercise_name: "completed" | "skipped" }

  error: null,
};

/* ============================
   SLICE
============================ */

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    clearWorkoutError(state) {
      state.error = null;
    },
    resetWorkoutState() {
      return {
        ...initialState,
        loggedExercises: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- GENERATE WORKOUT ---------- */
      .addCase(generateWorkout.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateWorkout.fulfilled, (state, action) => {
        state.generating = false;
        state.plan = action.payload; // ✅ STORE GENERATED PLAN
        state.loggedExercises = {};  // new plan → reset logs
      })
      .addCase(generateWorkout.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      /* ---------- FETCH CURRENT WORKOUT ---------- */
      .addCase(fetchCurrentWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.plan = action.payload;
      })
      .addCase(fetchCurrentWorkout.rejected, (state, action) => {
        state.loading = false;
        state.plan = null;
        state.error = action.payload;
      })

      /* ---------- FETCH TODAY LOGS ---------- */
      .addCase(fetchTodayWorkoutLogs.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTodayWorkoutLogs.fulfilled, (state, action) => {
        state.loggedExercises = action.payload || {};
      })
      .addCase(fetchTodayWorkoutLogs.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ---------- LOG EXERCISE ---------- */
      .addCase(logWorkoutExercise.pending, (state) => {
        state.logging = true;
        state.error = null;
      })
      .addCase(logWorkoutExercise.fulfilled, (state, action) => {
        state.logging = false;

        const { exercise_name, status } = action.payload;
        state.loggedExercises[exercise_name] = status;
      })
      .addCase(logWorkoutExercise.rejected, (state, action) => {
        state.logging = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearWorkoutError,
  resetWorkoutState,
} = workoutSlice.actions;

export default workoutSlice.reducer;
