// src/redux/features/user/userProfileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

// ✅ Get current user's profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/users/profile');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// ✅ Update payment details (for seller/member)
export const updatePaymentDetails = createAsyncThunk(
  'user/updatePaymentDetails',
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await apiClient.put('/users/payment-details', paymentData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update payment details');
    }
  }
);

// ✅ Update profile settings
export const updateProfileSettings = createAsyncThunk(
  'user/updateProfileSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const res = await apiClient.put('/users/profile-settings', settings);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile settings');
    }
  }
);

// ✅ Update profile image
export const updateProfileImage = createAsyncThunk(
  'user/updateProfileImage',
  async (imageUrl, { rejectWithValue }) => {
    try {
      const res = await apiClient.put('/users/profile-image', { imageUrl });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile image');
    }
  }
);

// ✅ Get seller payment details (for buyer before purchase)
export const fetchSellerPaymentDetails = createAsyncThunk(
  'user/fetchSellerPaymentDetails',
  async (sellerId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/users/${sellerId}/payment-details`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch seller payment details');
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: {
    profile: null,
    sellerPayment: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSellerPayment: (state) => {
      state.sellerPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 updatePaymentDetails
      .addCase(updatePaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentDetails.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = action.payload.user;
        }
        state.loading = false;
      })
      .addCase(updatePaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 updateProfileSettings
      .addCase(updateProfileSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileSettings.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = action.payload.user;
        }
        state.loading = false;
      })
      .addCase(updateProfileSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 updateProfileImage
      .addCase(updateProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = action.payload.user;
        }
        state.loading = false;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 fetchSellerPaymentDetails
      .addCase(fetchSellerPaymentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerPaymentDetails.fulfilled, (state, action) => {
        state.sellerPayment = action.payload;
        state.loading = false;
      })
      .addCase(fetchSellerPaymentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSellerPayment } = userProfileSlice.actions;
export default userProfileSlice.reducer;