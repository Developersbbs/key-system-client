import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllEvents = createAsyncThunk('events/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/events');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addEvent = createAsyncThunk('events/add', async (eventData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/events', eventData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addMatcher((action) => action.type.startsWith('events/'), (state, action) => {
        if (action.type.endsWith('/pending')) {
          state.loading = true;
          state.error = null;
        } else if (action.type.endsWith('/fulfilled')) {
          state.loading = false;
        } else if (action.type.endsWith('/rejected')) {
          state.loading = false;
          state.error = action.payload;
        }
      });
  },
});

export default eventSlice.reducer;