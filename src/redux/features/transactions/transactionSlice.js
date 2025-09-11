import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/transactions', { params }); 
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch all transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/transactions', transactionData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const fetchPendingTransactions = createAsyncThunk(
  'transactions/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/transactions/pending');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const approveTransaction = createAsyncThunk(
  'transactions/approve',
  async (transactionId, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/transactions/${transactionId}/approve`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve transaction');
    }
  }
);

export const fetchUserTransactions = createAsyncThunk(
  'transactions/fetchUserTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/transactions/my-transactions');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user transactions');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    pending: [],
    userTransactions: [],
    loading: false,
    error: null,
    currentTransaction: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.userTransactions.unshift(action.payload);
        state.loading = false;
      })
      .addCase(fetchPendingTransactions.fulfilled, (state, action) => {
        state.pending = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.userTransactions = action.payload;
        state.loading = false;
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        state.pending = state.pending.filter(tx => tx._id !== action.payload._id);
        state.loading = false;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
  state.pending = action.payload; // or state.allTransactions = action.payload if you want to separate it
  state.loading = false;
})
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  }
});

export const { clearError, setCurrentTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;