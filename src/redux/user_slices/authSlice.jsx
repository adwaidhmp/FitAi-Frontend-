// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// ---- Helpers ----
const makeErr = (err) => {
  // try to return API error object/message, fallback to message, fallback to string
  return err?.response?.data || err?.message || "Request failed";
};

const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
  // ensure axios instance has the header for subsequent requests
  if (access) api.defaults.headers.common.Authorization = `Bearer ${access}`;
};

const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  delete api.defaults.headers.common.Authorization;
};

// ---- Thunks ----

// 1. Request OTP (generic, existing)
export const requestOtp = createAsyncThunk(
  "auth/requestOtp",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post(`request-otp/`, { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 1b. Request OTP for password reset (new backend URL)
export const requestPasswordResetOtp = createAsyncThunk(
  "auth/requestPasswordResetOtp",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post(`reset-password/request-otp/`, {
        email,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 2. Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(`register/`, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 3. Register Trainer
export const registerTrainer = createAsyncThunk(
  "auth/registerTrainer",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(`register/trainer/`, payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 4. Login with Email + Password
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(`login/`, payload);
      const { access, refresh, user } = res.data;
      console.log(user);
      saveTokens(access, refresh);
      return { user, access, refresh };
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 5. Google login (id_token from client)
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(`google/`, payload);
      const { access, refresh, user } = res.data;
      saveTokens(access, refresh);
      return { user, access, refresh };
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 6. Fetch profile
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      // api interceptor will attach access token
      const res = await api.get(`info/`);
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// 6b. Edit profile (new backend URL)
export const editProfile = createAsyncThunk(
  "auth/editProfile",
  // payload should be a FormData or plain object depending on backend; caller decides
  async (payload, { rejectWithValue }) => {
    try {
      // Use PATCH to partially update, falling back to PUT if needed.
      const res = await api.put(`info/edit/`, payload);
      return res.data;
    } catch (err) {
      // Some backends expect PUT; try PUT on 405/patch not allowed would require caller,
      // but we'll just return the error here.
      return rejectWithValue(makeErr(err));
    }
  },
);

// 7. Logout user (calls backend, sends refresh if backend expects it)
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem("refresh");
      // call backend so it can blacklist refresh token if implemented
      await api.post(`logout/`, { refresh });
      await clearTokens();
      return true;
    } catch (err) {
      // clear tokens regardless
      clearTokens();
      return rejectWithValue(makeErr(err));
    }
  },
);

export const requestPasswordChangeOtp = createAsyncThunk(
  "auth/requestPasswordChangeOtp",
  // payload is the email string or an object like { email }
  async (payload, { rejectWithValue }) => {
    try {
      const body = typeof payload === "string" ? { email: payload } : payload;
      const res = await api.post(`reset-password/request-otp/`, body);
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  // payload expected: { email, otp, new_password } or whatever backend expects
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(`reset-password/confirm/`, payload);
      // if backend returns tokens on success, caller may want to save them here
      return res.data;
    } catch (err) {
      return rejectWithValue(makeErr(err));
    }
  },
);

// ---- Slice ----
const initialState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("access"),
  passwordResetSuccess: false, // flag set when confirmPasswordReset succeeds
  passwordResetOtpRequested: false, // set true when OTP request succeeds
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // immediate client-only logout (no backend call)
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.error = null;
      clearTokens();
    },
    // set user manually (useful after registration or other flows)
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!localStorage.getItem("access");
    },
    clearError(state) {
      state.error = null;
    },
    clearPasswordResetSuccess(state) {
      state.passwordResetSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // requestOtp
      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // requestPasswordResetOtp (new)
      .addCase(requestPasswordResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(requestPasswordResetOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // backend may or may not return user; keep flexible
        state.user = action.payload.user || state.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // registerTrainer
      .addCase(registerTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerTrainer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || state.user;
      })
      .addCase(registerTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // googleLogin
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchProfile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
  state.loading = false;
  state.profile = action.payload;
  state.user = action.payload;   // ✅ CRITICAL
})
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        // if 401/invalid token, you might prefer to clear auth here
        state.error = action.payload;
      })

      // editProfile (new)
      .addCase(editProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.loading = false;
        // backend returns updated profile
        state.profile = action.payload;
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // requestPasswordChangeOtp
      .addCase(requestPasswordChangeOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetOtpRequested = false;
      })
      .addCase(requestPasswordChangeOtp.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetOtpRequested = true;
        // action.payload may include a message. store if you want:
        // state.lastMessage = action.payload?.detail || null;
      })
      .addCase(requestPasswordChangeOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.passwordResetOtpRequested = false;
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.passwordResetSuccess = false;
      });
  },
});

export const { clearAuth, setUser, clearError, clearPasswordResetSuccess } =
  authSlice.actions;

export default authSlice.reducer;
