import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api"; // user-service endpoints (trainer basic info)
import api3 from "../../api3"; // trainer service endpoints (profile, multipart)

/* ========= Helpers ========= */

function parseCompletedFlag(payload) {
  if (!payload) return false;

  const v =
    payload?.profile_completed ??
    payload?.is_completed ??
    payload?.completed ??
    payload?.profileComplete ??
    payload?.is_complete ??
    null;

  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v === null) return false;

  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }

  return Boolean(v);
}

/* ========= Thunks ========= */

// GET trainer profile (includes certificates)
export const fetchTrainerProfile = createAsyncThunk(
  "trainer/fetchTrainerProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api3.get("profile/");
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Failed to fetch trainer profile." });
    }
  }
);

// PATCH trainer profile (multipart for certificates)
// Issue PATCH then GET fresh profile to avoid empty-body issues
export const updateTrainerProfile = createAsyncThunk(
  "trainer/updateTrainerProfile",
  async (formData, { rejectWithValue }) => {
    try {
      await api3.patch("profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // fetch fresh profile to guarantee a consistent payload
      const fresh = await api3.get("profile/");
      return fresh.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Failed to update trainer profile." });
    }
  }
);

// GET trainer info (basic info from user service)
export const fetchTrainerInfo = createAsyncThunk(
  "trainer/fetchTrainerInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/trainer/info/");
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Failed to load trainer info." });
    }
  }
);

// PATCH trainer info (basic editable fields)
export const updateTrainerInfo = createAsyncThunk(
  "trainer/updateTrainerInfo",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.patch("/trainer/info/edit/", payload);
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue(data || { detail: "Failed to update trainer info." });
    }
  }
);

/* ========= Slice ========= */

const initialState = {
  profile: null,
  trainerInfo: null,
  loadingProfile: false,
  loadingTrainerInfo: false,
  trainerNeedsSetup: false,
  missingFields: [],
  error: null,
};

const trainerProfileSlice = createSlice({
  name: "trainerProfile",
  initialState,
  reducers: {
    clearTrainerErrors(state) {
      state.error = null;
      state.missingFields = [];
    },
    setTrainerNeedsSetup(state, action) {
      state.trainerNeedsSetup = Boolean(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch trainer profile
      .addCase(fetchTrainerProfile.pending, (state) => {
        state.loadingProfile = true;
        state.error = null;
      })
      .addCase(fetchTrainerProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload;

        const completed = parseCompletedFlag(action.payload);
        state.trainerNeedsSetup = !completed;

        state.missingFields = action.payload?.missing_fields || [];
      })
      .addCase(fetchTrainerProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        const payload = action.payload || {};
        state.error = payload.detail || action.error?.message || "Failed to fetch trainer profile.";
      })

      // update trainer profile (multipart + fetch)
      .addCase(updateTrainerProfile.pending, (state) => {
        state.loadingProfile = true;
        state.error = null;
        state.missingFields = [];
      })
      .addCase(updateTrainerProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload;

        const completed = parseCompletedFlag(action.payload);
        state.trainerNeedsSetup = !completed;

        state.missingFields = action.payload?.missing_fields || [];
      })
      .addCase(updateTrainerProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        const payload = action.payload || {};
        state.error = payload.detail || action.error?.message || "Failed to update trainer profile.";
        state.missingFields = payload.missing_fields || [];
      })

      // fetch trainer info (basic)
      .addCase(fetchTrainerInfo.pending, (state) => {
        state.loadingTrainerInfo = true;
        state.error = null;
      })
      .addCase(fetchTrainerInfo.fulfilled, (state, action) => {
        state.loadingTrainerInfo = false;
        state.trainerInfo = action.payload;
      })
      .addCase(fetchTrainerInfo.rejected, (state, action) => {
        state.loadingTrainerInfo = false;
        const payload = action.payload || {};
        state.error = payload.detail || action.error?.message || "Failed to fetch trainer info.";
      })

      // update trainer info
      .addCase(updateTrainerInfo.pending, (state) => {
        state.loadingTrainerInfo = true;
        state.error = null;
      })
      .addCase(updateTrainerInfo.fulfilled, (state, action) => {
        state.loadingTrainerInfo = false;
        state.trainerInfo = action.payload;
      })
      .addCase(updateTrainerInfo.rejected, (state, action) => {
        state.loadingTrainerInfo = false;
        const payload = action.payload || {};
        state.error = payload.detail || action.error?.message || "Failed to update trainer info.";
      });
  },
});

export const { clearTrainerErrors, setTrainerNeedsSetup } = trainerProfileSlice.actions;
export default trainerProfileSlice.reducer;
