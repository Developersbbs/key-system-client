import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient'; // Adjust path if needed

const handleApiError = (err) => {
  return err.response?.data?.message || err.message || 'An unexpected error occurred';
};

// --- Thunks ---

export const fetchAllMembers = createAsyncThunk('members/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/members');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const fetchAllAdmins = createAsyncThunk('members/fetchAllAdmins', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/admins');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const updateUserRole = createAsyncThunk('members/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

// ✅ NEW: This is the correct thunk for your new multi-level access system
export const updateUserLevels = createAsyncThunk(
  'members/updateLevels',
  async ({ userId, levels }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/admin/users/${userId}/levels`, { levels });
      return res.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);


const memberSlice = createSlice({
  name: 'members',
  initialState: {
    members: [],
    admins: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- FULFILLED HANDLERS ---
      .addCase(fetchAllMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.admins = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        state.members = state.members.filter(m => m._id !== updatedUser._id);
        state.admins = state.admins.filter(a => a._id !== updatedUser._id);
        if (updatedUser.role === 'admin') {
          state.admins.push(updatedUser);
        } else {
          state.members.push(updatedUser);
        }
      })
      // ✅ CORRECTED: Handler for updating user levels
      .addCase(updateUserLevels.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.members.findIndex(m => m._id === updatedUser._id);
        if (index !== -1) {
          state.members[index] = updatedUser;
        }
      })
      
      // --- GENERIC MATCHERS (Must come last) ---
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = memberSlice.actions;
export default memberSlice.reducer;