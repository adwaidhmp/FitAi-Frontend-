import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api2.jsx";
import { loginUser, googleLogin, logoutUser } from "./authSlice";

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
  status: "idle",          // "idle" | "pending" | "ready" | "failed"
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
        state.status = "pending"; // backend returns { status: "queued" } or similar
        state.plan = null;        // clear old plan while new one builds
        state.loggedExercises = {};
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
        // Backend returns: { status: "...", plan: { ... } } (if ready)
        // or { status: "..." } (if idle/pending/failed)
        const { status, plan } = action.payload;
        state.status = status;

        if (status === "ready") {
          state.plan = plan;
        } else {
          state.plan = null;
        }
      })
      .addCase(fetchCurrentWorkout.rejected, (state, action) => {
        state.loading = false;
        state.plan = null;
        // If 404/etc, assume idle
        state.status = "idle";
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
      })

      // Clear workout data on login/logout to prevent showing previous user's data
      .addCase(loginUser.fulfilled, (state) => {
        state.plan = null;
        state.loggedExercises = {};
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state) => {
        state.plan = null;
        state.loggedExercises = {};
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.plan = null;
        state.loggedExercises = {};
        state.error = null;
      });
  },
});

export const {
  clearWorkoutError,
  resetWorkoutState,
} = workoutSlice.actions;

export default workoutSlice.reducer;
