import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api2";

/* -------------------------------------------------
   API CALL (via user_service)
------------------------------------------------- */

export const askAI = createAsyncThunk(
  "ai/ask",
  async ({ question }, { rejectWithValue }) => {
    try {
      const response = await api.post("ai/ask/", { question });
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "AI request failed"
      );
    }
  }
);

/* -------------------------------------------------
   SLICE
------------------------------------------------- */

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    answer: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAI(state) {
      state.answer = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askAI.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.answer = null; 
      })
      .addCase(askAI.fulfilled, (state, action) => {
        state.loading = false;
        state.answer = action.payload.answer;
      })
      .addCase(askAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAI } = aiSlice.actions;
export default aiSlice.reducer;
