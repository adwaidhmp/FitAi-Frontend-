import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api3"

/**
 * Fetch user overview for trainer
 * Calls trainer_service proxy endpoint
 */
export const fetchTrainerUserOverview = createAsyncThunk(
  "trainerUserOverview/fetch",
  async (userId, { rejectWithValue }) => {
    try {
    const res = await api.get(`users/${userId}/overview/`);

    console.log("Trainer User Overview Data:", res.data);

    return res.data;
      
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch user overview"
      );
    }
  }
);

const trainerUserOverviewSlice = createSlice({
  name: "trainerUserOverview",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTrainerUserOverview(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainerUserOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainerUserOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTrainerUserOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTrainerUserOverview } =
  trainerUserOverviewSlice.actions;

export default trainerUserOverviewSlice.reducer;
