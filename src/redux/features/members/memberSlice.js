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

// Update user active/inactive status
export const updateUserStatus = createAsyncThunk(
  'members/updateStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/admin/users/${userId}/status`, { isActive });
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
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.admins = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        // Remove user from both arrays first
        state.members = state.members.filter(m => m._id !== updatedUser._id);
        state.admins = state.admins.filter(a => a._id !== updatedUser._id);
        
        // Add to appropriate array based on new role
        if (updatedUser.role === 'admin') {
          state.admins.push(updatedUser);
        } else {
          state.members.push(updatedUser);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        
        // Update in members array
        const memberIndex = state.members.findIndex(m => m._id === updatedUser._id);
        if (memberIndex !== -1) {
          state.members[memberIndex] = updatedUser;
        }
        
        // Update in admins array
        const adminIndex = state.admins.findIndex(a => a._id === updatedUser._id);
        if (adminIndex !== -1) {
          state.admins[adminIndex] = updatedUser;
        }
        
        state.loading = false;
        state.error = null;
      })
      
      // --- PENDING HANDLERS ---
      .addCase(fetchAllMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // --- REJECTED HANDLERS ---
      .addCase(fetchAllMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = memberSlice.actions;
export default memberSlice.reducer;