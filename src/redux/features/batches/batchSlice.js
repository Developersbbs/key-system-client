import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

const handleApiError = (err) => {
  return err.response?.data?.message || err.message || 'An unexpected error occurred';
};

// --- Async Thunks ---
export const fetchAllBatches = createAsyncThunk('batches/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/batches');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const createBatch = createAsyncThunk('batches/create', async (batchData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/batches', batchData);
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const updateBatch = createAsyncThunk('batches/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/batches/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const addMembersToBatch = createAsyncThunk('batches/addMembers', async ({ batchId, memberIds }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/batches/${batchId}/members`, { memberIds });
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const removeMemberFromBatch = createAsyncThunk('batches/removeMember', async ({ batchId, memberId }, { rejectWithValue }) => {
  try {
    const res = await apiClient.delete(`/batches/${batchId}/members/${memberId}`);
    return { batchId, memberId, updatedBatch: res.data };
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const deleteBatch = createAsyncThunk('batches/delete', async (batchId, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/batches/${batchId}`);
    return batchId;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

const batchSlice = createSlice({
  name: 'batches',
  initialState: {
    batches: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.batches.unshift(action.payload);
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        const index = state.batches.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.batches[index] = action.payload;
      })
      .addCase(addMembersToBatch.fulfilled, (state, action) => {
        const index = state.batches.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.batches[index] = action.payload;
      })
      .addCase(removeMemberFromBatch.fulfilled, (state, action) => {
        const index = state.batches.findIndex(b => b._id === action.payload.batchId);
        if (index !== -1) state.batches[index] = action.payload.updatedBatch;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.batches = state.batches.filter(b => b._id !== action.payload);
      })
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state) => {
        state.loading = false;
      });
  },
});

export const { clearError } = batchSlice.actions;
export default batchSlice.reducer;