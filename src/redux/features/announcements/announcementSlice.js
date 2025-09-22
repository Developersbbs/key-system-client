import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllAnnouncements = createAsyncThunk('announcements/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/announcements');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addAnnouncement = createAsyncThunk('announcements/add', async (announcementData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/announcements', announcementData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// Add this async thunk for deleting an announcement
export const deleteAnnouncement = createAsyncThunk(
  'announcements/deleteAnnouncement',
  async (announcementId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/announcements/${announcementId}`);
      return announcementId; // Return the ID of the deleted announcement
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete announcement');
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcements',
  initialState: {
    announcements: [],
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
      .addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })
      .addCase(addAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        // Remove the deleted announcement from the state
        state.announcements = state.announcements.filter(
          announcement => announcement._id !== action.payload
        );
      })
      // Add generic matchers for pending/rejected/fulfilled
      .addMatcher(
        (action) => action.type.startsWith('announcements/') && 
                   (action.type.endsWith('/pending') || 
                    action.type.endsWith('/fulfilled') || 
                    action.type.endsWith('/rejected')),
        (state, action) => {
          if (action.type.endsWith('/pending')) {
            state.loading = true;
            state.error = null;
          } else if (action.type.endsWith('/fulfilled')) {
            state.loading = false;
          } else if (action.type.endsWith('/rejected')) {
            state.loading = false;
            state.error = action.payload;
          }
        }
      );
  },
});

export const { clearError } = announcementSlice.actions;
export default announcementSlice.reducer;