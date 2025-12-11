// src/redux/user_slices/profileSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api2 from "../../api2";

// Keep this in sync with Django serializer REQUIRED_FIELDS
const REQUIRED_FIELDS = [
  "dob",
  "gender",
  "height_cm",
  "weight_kg",
  "goal",
  "activity_level",
  "exercise_experience",
];

const initialState = {
  data: null,              // profile object from backend (always exists)
  loading: false,          // used for fetch + save
  error: null,             // string or object from backend
  missingFields: [],       // backend ValidationError.missing_fields
  needsProfileSetup: false,// true if profile_completed is false

  // choices state (new)
  choices: null,           // { gender: [...], goal: [...], ... }
  choicesLoading: false,
  choicesError: null,
};

// GET /profile/
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api2.get("profile/");
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Unable to fetch profile." });
    }
  }
);

// GET /profile/choices/
export const fetchProfileChoices = createAsyncThunk(
  "profile/fetchProfileChoices",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api2.get("choices/");
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Unable to fetch profile choices." });
    }
  }
);

// PATCH /profile/
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api2.patch("profile/", payload);
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Unable to update profile." });
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
      state.missingFields = [];
    },
    clearChoicesError(state) {
      state.choicesError = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH PROFILE
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.missingFields = [];
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        const profile = action.payload;
        state.loading = false;
        state.data = profile;

        // backend must provide profile_completed boolean
        const completed = Boolean(profile.profile_completed);
        state.needsProfileSetup = !completed;

        state.missingFields = []; // GET won't include missing_fields
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.error = payload.detail || action.error.message || "Unable to fetch profile.";
        // do not set needsProfileSetup here; keep as-is
      });

    // FETCH CHOICES (new)
    builder
      .addCase(fetchProfileChoices.pending, (state) => {
        state.choicesLoading = true;
        state.choicesError = null;
      })
      .addCase(fetchProfileChoices.fulfilled, (state, action) => {
        state.choicesLoading = false;
        state.choices = action.payload;
      })
      .addCase(fetchProfileChoices.rejected, (state, action) => {
        state.choicesLoading = false;
        const payload = action.payload || {};
        state.choicesError = payload.detail || action.error.message || "Unable to fetch profile choices.";
      });

    // UPDATE PROFILE
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.missingFields = [];
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const profile = action.payload;
        state.loading = false;
        state.data = profile;

        const completed = Boolean(profile.profile_completed);
        state.needsProfileSetup = !completed;

        state.missingFields = profile.missing_fields || [];
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.error = payload.detail || action.error.message || "Unable to update profile.";
        state.missingFields = payload.missing_fields || [];
      });
  },
});

export const { clearProfileError, clearChoicesError } = profileSlice.actions;
export default profileSlice.reducer;
