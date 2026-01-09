import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api4"

// ==============================
// Thunks
// ==============================

// Fetch all premium plans (admin)
export const fetchPremiumPlans = createAsyncThunk(
  "adminPremium/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/premium/plan/");
      return res.data.plans;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch premium plans"
      );
    }
  }
);

// Create or update premium plan
export const upsertPremiumPlan = createAsyncThunk(
  "adminPremium/upsertPlan",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/premium/plan/", payload);
      return res.data.plan;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to save premium plan"
      );
    }
  }
);

// ==============================
// Slice
// ==============================

const premiumPlanSlice = createSlice({
  name: "adminPremium",
  initialState: {
    plans: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPremiumPlanError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // -------- Fetch Plans --------
      .addCase(fetchPremiumPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPremiumPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPremiumPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // -------- Create / Update Plan --------
      .addCase(upsertPremiumPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertPremiumPlan.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.plans.findIndex(
          (p) => p.code === action.payload.code
        );

        if (index !== -1) {
          state.plans[index] = action.payload;
        } else {
          state.plans.push(action.payload);
        }
      })
      .addCase(upsertPremiumPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==============================
// Exports
// ==============================

export const { clearPremiumPlanError } = premiumPlanSlice.actions;
export default premiumPlanSlice.reducer;
