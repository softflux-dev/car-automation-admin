import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../api/services/authService";
import { decodeJwt, isTokenExpired } from "../../lib/jwt";
import { TOKEN_KEY } from "../../api/axios";
import { getApiMessage } from "../../lib/apiMessage";

function getInitialAuthState() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isTokenExpired(token)) {
    return { accessToken: null, user: null, isAuthenticated: false };
  }
  return { accessToken: token, user: decodeJwt(token), isAuthenticated: true };
}

function resolveUser(payload, token) {
  if (payload?.user) return payload.user;
  if (token) return decodeJwt(token);
  return null;
}

const initialAuthState = getInitialAuthState();

const initialState = {
  accessToken: initialAuthState.accessToken,
  user: initialAuthState.user,
  isAuthenticated: initialAuthState.isAuthenticated,
  status: "idle",
  error: null,
  message: null,
  resetToken: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (err) {
      return rejectWithValue(
        getApiMessage(err.response?.data, "Login failed")
      );
    }
  }
);



export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(email);
    } catch (err) {
      return rejectWithValue(
        getApiMessage(err.response?.data, "Failed to send verification code")
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.verifyOtp(payload);
    } catch (err) {
      return rejectWithValue(
        getApiMessage(err.response?.data, "Invalid verification code")
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(payload);
    } catch (err) {
      return rejectWithValue(
        getApiMessage(err.response?.data, "Failed to reset password")
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (email, { rejectWithValue }) => {
    try {
      return await authService.resendOtp(email);
    } catch (err) {
      return rejectWithValue(
        getApiMessage(err.response?.data, "Failed to resend code")
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Patch user fields after profile update (name, avatar, email, etc.)
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // Local logout — no API call needed; clears all auth state
    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.accessToken ?? null;
        state.user = resolveUser(action.payload, action.payload.accessToken);
        state.isAuthenticated = Boolean(action.payload.accessToken);
        state.message = action.payload?.message ?? null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.message = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload?.message ?? null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload?.message ?? null;
        state.resetToken = action.payload?.data?.resetToken ?? null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload?.message ?? null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(resendOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload?.message ?? null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
