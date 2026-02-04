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

export const joinMeeting = createAsyncThunk('meetings/join', async (id, { rejectWithValue }) => {
  try {
    await apiClient.post(`/meetings/${id}/join`);
    return id;
  } catch (err) {
    // Fail silently or just return error, we don't want to block joining
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMeetingLogs = createAsyncThunk('meetings/fetchLogs', async (id, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/meetings/${id}/logs`);
    return { meetingId: id, logs: res.data.logs };
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
    logs: {}, // Store logs by meetingId: { [meetingId]: [logs] }
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
      .addCase(fetchMeetingLogs.fulfilled, (state, action) => {
        state.logs[action.payload.meetingId] = action.payload.logs;
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