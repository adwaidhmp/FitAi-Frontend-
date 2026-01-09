import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api2"

// ==============================
// Thunks
// ==============================

// 1️⃣ Fetch premium plans (user view)
export const fetchPremiumPlans = createAsyncThunk(
  "premium/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("premium/plans/");
      return res.data.plans;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to load premium plans"
      );
    }
  }
);

// 2️⃣ Create Razorpay order
export const createPremiumOrder = createAsyncThunk(
  "premium/createOrder",
  async ({ plan }, { rejectWithValue }) => {
    try {
      const res = await api.post("premium/create-order/", { plan });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create order"
      );
    }
  }
);

// 3️⃣ Verify payment
export const verifyPremiumPayment = createAsyncThunk(
  "premium/verifyPayment",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("premium/verify/", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Payment verification failed"
      );
    }
  }
);

// ==============================
// Slice
// ==============================

const premiumSlice = createSlice({
  name: "premium",
  initialState: {
    plans: [],
    order: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetPremiumState(state) {
      state.order = null;
      state.success = false;
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

      // -------- Create Order --------
      .addCase(createPremiumOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPremiumOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createPremiumOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // -------- Verify Payment --------
      .addCase(verifyPremiumPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPremiumPayment.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(verifyPremiumPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==============================
// Exports
// ==============================

export const { resetPremiumState } = premiumSlice.actions;
export default premiumSlice.reducer;
