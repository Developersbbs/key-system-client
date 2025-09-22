import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from '../../../api/apiClient'; // Adjust path if needed

const initialState = {
  user: null,
  isLoggedIn: false,
  loading: true, // Start in a loading state to check for a session
  error: null,
};

// --- ASYNC THUNKS ---

// Checks for an active session when the app loads
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data.user;
    } catch (err) {
      return rejectWithValue('No active session');
    }
  }
);

// Handles login
export const loginWithOTP = createAsyncThunk(
  "auth/loginWithOTP",
  async (loginData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/auth/login', loginData);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Handles registration
export const registerWithOTP = createAsyncThunk(
  "auth/registerWithOTP",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/auth/register', userData);
      return res.data.user;
    } catch (err)      {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// ✅ This is the function that needs to be exported
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth/logout');
      // No data is returned on successful logout
    } catch (err) {
      // Proceed with frontend logout even if backend call fails
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

// --- SLICE DEFINITION ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled: Any of these actions mean the user is now logged in
      .addMatcher(
        (action) => [loginWithOTP.fulfilled.type, registerWithOTP.fulfilled.type, fetchUserProfile.fulfilled.type].includes(action.type),
        (state, action) => {
          state.user = action.payload;
          state.isLoggedIn = true;
          state.loading = false;
          state.error = null;
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      )
      // Rejected: Session check failed or user logged out
      .addMatcher(
        (action) => [fetchUserProfile.rejected.type, logoutUser.fulfilled.type].includes(action.type),
        (state) => {
          state.user = null;
          state.isLoggedIn = false;
          state.loading = false;
          localStorage.removeItem("user");
        }
      )
      // Any action is pending
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      // Any action is rejected (except for fetchUserProfile, which is handled above)
      .addMatcher((action) => action.type.endsWith('/rejected') && action.type !== fetchUserProfile.rejected.type,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;