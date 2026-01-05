import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api3"; // adjust path if needed

/* ============================
   THUNKS
============================ */

// 1. Fetch pending clients
export const fetchPendingClients = createAsyncThunk(
  "trainer/fetchPendingClients",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("pending-clients/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch pending clients",
      );
    }
  },
);

// 2. Approve a booking
export const decideUserBooking = createAsyncThunk(
  "trainer/decideUserBooking",
  async ({ bookingId, action }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `bookings/${bookingId}/decision/`,
        { action }, // approve | reject
      );

      return { bookingId, action, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Booking decision failed",
      );
    }
  },
);

// 3. Fetch approved users
export const fetchApprovedUsers = createAsyncThunk(
  "trainer/fetchApprovedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("approved-users/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch approved users",
      );
    }
  },
);

/* ============================
   SLICE
============================ */

const trainerBookingApprovalSlice = createSlice({
  name: "trainerBookingApproval",
  initialState: {
    pendingClients: [],
    approvedUsers: [],
    loading: false,
    error: null,
    actionSuccess: false,
  },
  reducers: {
    clearTrainerApprovalState: (state) => {
      state.loading = false;
      state.error = null;
      state.actionSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder

      /* -------- Pending Clients -------- */
      .addCase(fetchPendingClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingClients.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingClients = action.payload;
      })
      .addCase(fetchPendingClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- Decide Booking -------- */
      .addCase(decideUserBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(decideUserBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;

        const { bookingId, action: decision } = action.payload;

        // Always remove from pending list
        state.pendingClients = state.pendingClients.filter(
          (b) => b.booking_id !== bookingId,
        );

        // If approved, optionally push into approvedUsers
        if (decision === "approve") {
          state.approvedUsers.push(action.payload.data);
        }
      })
      .addCase(decideUserBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* -------- Approved Users -------- */
      .addCase(fetchApprovedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedUsers = action.payload;
      })
      .addCase(fetchApprovedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTrainerApprovalState } =
  trainerBookingApprovalSlice.actions;

export default trainerBookingApprovalSlice.reducer;
