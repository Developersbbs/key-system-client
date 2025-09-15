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

const announcementSlice = createSlice({
  name: 'announcements',
  initialState: {
    announcements: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })
      .addCase(addAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      // Add generic matchers for pending/rejected/fulfilled
      .addMatcher((action) => action.type.startsWith('announcements/'), (state, action) => {
        if (action.type.endsWith('/pending')) state.loading = true;
        if (action.type.endsWith('/fulfilled')) state.loading = false;
        if (action.type.endsWith('/rejected')) {
          state.loading = false;
          state.error = action.payload;
        }
      });
  },
});

export default announcementSlice.reducer;