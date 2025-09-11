import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllMeetings = createAsyncThunk('meetings/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/meetings');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addMeeting = createAsyncThunk('meetings/add', async (meetingData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/meetings', meetingData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeMeeting = createAsyncThunk('meetings/remove', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/meetings/${id}`);
    return id; // Return the ID of the deleted meeting
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const meetingSlice = createSlice({
  name: 'meetings',
  initialState: {
    meetings: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMeetings.fulfilled, (state, action) => {
        state.meetings = action.payload;
      })
      .addCase(addMeeting.fulfilled, (state, action) => {
        state.meetings.unshift(action.payload);
      })
       .addCase(removeMeeting.fulfilled, (state, action) => {
        state.meetings = state.meetings.filter(m => m._id !== action.payload);
      })
      .addMatcher((action) => action.type.startsWith('meetings/'), (state, action) => {
        if (action.type.endsWith('/pending')) {
          state.loading = true;
          state.error = null;
        } else if (action.type.endsWith('/fulfilled')) {
          state.loading = false;
        } else if (action.type.endsWith('/rejected')) {
          state.loading = false;
          state.error = action.payload;
        }
      })
     
  },
});

export default meetingSlice.reducer;