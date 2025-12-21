import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api2";

/* -------------------------------------------
   THUNKS
------------------------------------------- */

// fetch all approved trainers (for booking UI)
export const fetchApprovedTrainers = createAsyncThunk(
  "trainerBooking/fetchApproved",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("trainers/approved/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch approved trainers"
      );
    }
  }
);

// book a trainer
export const bookTrainer = createAsyncThunk(
  "trainerBooking/book",
  async (trainerUserId, { rejectWithValue }) => {
    try {
      const res = await api.post(`trainers/${trainerUserId}/book/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to book trainer"
      );
    }
  }
);

// fetch all trainers user ever booked
export const fetchMyTrainers = createAsyncThunk(
  "trainerBooking/fetchMyTrainers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("my-trainers/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch my trainers"
      );
    }
  }
);

// remove current trainer
export const removeTrainer = createAsyncThunk(
  "trainerBooking/remove",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete("trainers/remove/");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to remove trainer"
      );
    }
  }
);

/* -------------------------------------------
   SLICE
------------------------------------------- */

const trainerBookingSlice = createSlice({
  name: "trainerBooking",
  initialState: {
    approvedTrainers: [],
    myTrainers: [],
    loading: false,
    error: null,
    actionSuccess: null,
  },
  reducers: {
    clearTrainerState(state) {
      state.error = null;
      state.actionSuccess = null;
    },
    clearApprovedTrainers(state) {
      state.approvedTrainers = [];
    },
  },
  extraReducers: (builder) => {
    builder

      // FETCH APPROVED TRAINERS
      .addCase(fetchApprovedTrainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedTrainers.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedTrainers = action.payload;
      })
      .addCase(fetchApprovedTrainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // BOOK TRAINER
      .addCase(bookTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(bookTrainer.fulfilled, (state) => {
        state.loading = false;
        state.actionSuccess = "Trainer booked successfully";
      })
      .addCase(bookTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.detail ||
          action.payload ||
          "Booking failed";
      })

      // FETCH MY TRAINERS
      .addCase(fetchMyTrainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTrainers.fulfilled, (state, action) => {
        state.loading = false;
        state.myTrainers = action.payload;
      })
      .addCase(fetchMyTrainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REMOVE TRAINER
      .addCase(removeTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(removeTrainer.fulfilled, (state) => {
        state.loading = false;
        state.actionSuccess = "Trainer removed";
      })
      .addCase(removeTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearTrainerState,
  clearApprovedTrainers,
} = trainerBookingSlice.actions;

export default trainerBookingSlice.reducer;
