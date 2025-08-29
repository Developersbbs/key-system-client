import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllLevels = createAsyncThunk('levels/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/levels');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addLevel = createAsyncThunk('levels/add', async (levelData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/levels', levelData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const editLevel = createAsyncThunk('levels/edit', async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/levels/${id}`, updatedData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeLevel = createAsyncThunk('levels/remove', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/levels/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const levelSlice = createSlice({
  name: 'levels',
  initialState: {
    levels: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLevels.fulfilled, (state, action) => {
        state.levels = action.payload;
      })
      .addCase(addLevel.fulfilled, (state, action) => {
        state.levels.push(action.payload);
      })
      .addCase(editLevel.fulfilled, (state, action) => {
        const index = state.levels.findIndex(l => l._id === action.payload._id);
        if (index !== -1) state.levels[index] = action.payload;
      })
      .addCase(removeLevel.fulfilled, (state, action) => {
        state.levels = state.levels.filter(l => l._id !== action.payload);
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

export default levelSlice.reducer;