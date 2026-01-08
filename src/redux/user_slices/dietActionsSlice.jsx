import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api2.jsx";

/* ============================
   THUNKS
============================ */

/* ---- CURRENT PLAN ---- */
export const fetchCurrentDietPlan = createAsyncThunk(
  "dietActions/fetchCurrentDietPlan",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("diet-plan/");
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // backend-safe fallback
        return {
          has_plan: false,
          can_generate: true,
          can_update_weight: false,
        };
      }
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

/* ---- TODAY MEAL STATUS ---- */
export const fetchTodayMealStatus = createAsyncThunk(
  "dietActions/fetchTodayMealStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("diet/today/");
      return res.data.meals;
    } catch {
      return rejectWithValue("Failed to fetch today meal status");
    }
  }
);

/* ---- GENERATE PLAN ---- */
export const generateDietPlan = createAsyncThunk(
  "dietActions/generateDietPlan",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("diet/generate/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

/* ---- MEAL ACTIONS ---- */
export const followMealFromPlan = createAsyncThunk(
  "dietActions/followMealFromPlan",
  async ({ meal_type }, { rejectWithValue }) => {
    try {
      const res = await api.post("diet/follow-meal/", { meal_type });
      return { ...res.data, meal_type, source: "planned" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

export const logCustomMeal = createAsyncThunk(
  "dietActions/logCustomMeal",
  async ({ meal_type, food_text }, { rejectWithValue }) => {
    try {
      const res = await api.post("diet/log-custom-meal/", {
        meal_type,
        food_text,
      });
      return { ...res.data, meal_type, source: "custom" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

export const skipMeal = createAsyncThunk(
  "dietActions/skipMeal",
  async ({ meal_type }, { rejectWithValue }) => {
    try {
      const res = await api.post("diet/skip-meal/", { meal_type });
      return { ...res.data, meal_type, source: "skipped" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

/* ---- EXTRA MEAL ---- */
export const logExtraMeal = createAsyncThunk(
  "dietActions/logExtraMeal",
  async ({ food_text }, { rejectWithValue }) => {
    try {
      const res = await api.post("diet/extra-meal/", { food_text });
      return res.data;
    } catch {
      return rejectWithValue("Failed to log extra meal");
    }
  }
);

/* ---- WEIGHT ---- */
export const updateWeight = createAsyncThunk(
  "dietActions/updateWeight",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("diet/update-weight/", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

/* ============================
   SLICE
============================ */

const initialState = {
  loading: false,
  error: null,

  // 🔥 MUST always hold backend response
  currentPlan: null,

  mealStatus: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },

  lastResponse: null,
};

const dietActionsSlice = createSlice({
  name: "dietActions",
  initialState,
  reducers: {
    clearDietActionState(state) {
      state.loading = false;
      state.error = null;
      state.lastResponse = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- CURRENT PLAN ---------- */
      .addCase(fetchCurrentDietPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentDietPlan.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ FIX: NEVER nullify backend response
        state.currentPlan = action.payload;
      })
      .addCase(fetchCurrentDietPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- TODAY STATUS ---------- */
      .addCase(fetchTodayMealStatus.fulfilled, (state, action) => {
        state.mealStatus = action.payload;
      })

      /* ---------- GENERATE PLAN ---------- */
      .addCase(generateDietPlan.pending, (state) => {
  state.loading = true;
  state.error = null;
})

.addCase(generateDietPlan.fulfilled, (state, action) => {
  state.loading = false;

  // 🔥 DO NOT overwrite currentPlan with "processing" response
  state.lastResponse = action.payload;

  // Optional UX: mark existing plan as pending
  if (state.currentPlan) {
    state.currentPlan.status = "pending";
  }

  // Reset meal UI (safe)
  state.mealStatus = {
    breakfast: null,
    lunch: null,
    dinner: null,
  };
})

.addCase(generateDietPlan.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

      /* ---------- WEIGHT ---------- */
      .addCase(updateWeight.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;

        if (action.payload?.new_plan) {
          state.currentPlan = {
            ...state.currentPlan,
            ...action.payload.new_plan,
            has_plan: true,
            can_generate: false,
            can_update_weight: false,
          };

          state.mealStatus = {
            breakfast: null,
            lunch: null,
            dinner: null,
          };
        }
      })

      /* ---------- EXTRA MEAL ---------- */
      .addCase(logExtraMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResponse = action.payload;
      })

      /* ---------- MEAL ACTIONS ---------- */
      .addMatcher(
        (action) =>
          [
            followMealFromPlan.fulfilled.type,
            logCustomMeal.fulfilled.type,
            skipMeal.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          const { meal_type, source } = action.payload;
          state.mealStatus[meal_type] = source;
          state.lastResponse = action.payload;
        }
      )

      /* ---------- ERRORS ---------- */
      .addMatcher(
  (action) =>
    action.type.startsWith("dietActions/") &&
    action.type.endsWith("/rejected"),
  (state, action) => {
    state.loading = false;
    state.error = action.payload || "Something went wrong";
  }
);
  },
});

export const { clearDietActionState } = dietActionsSlice.actions;
export default dietActionsSlice.reducer;
