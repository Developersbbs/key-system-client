import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllMembers = createAsyncThunk('members/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/members');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch members');
  }
});

export const fetchAllAdmins = createAsyncThunk('members/fetchAllAdmins', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/admin/admins');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch admins');
  }
});

export const updateUserRole = createAsyncThunk('members/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update role');
  }
});

// ✅ ADD THIS THUNK to update course access
export const updateCourseAccess = createAsyncThunk(
  'members/updateCourseAccess',
  async ({ userId, courseId, hasAccess }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/admin/users/${userId}/access`, { courseId, hasAccess });
      return res.data; // Return the updated user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update access');
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
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      // ✅ ADD THIS HANDLER to update the user in the state
      .addCase(updateCourseAccess.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.members.findIndex(m => m._id === updatedUser._id);
        if (index !== -1) {
          state.members[index] = updatedUser;
        }
      })
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

export default memberSlice.reducer;