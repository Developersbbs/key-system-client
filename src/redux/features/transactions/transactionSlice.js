import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/transactions/all', { params }); 
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

export const rejectTransaction = createAsyncThunk(
  'transactions/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/transactions/${id}/reject`, { reason });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject transaction');
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
    allTransactions: [],
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
    },
    resetTransactionState: (state) => {
      state.pending = [];
      state.userTransactions = [];
      state.allTransactions = [];
      state.error = null;
      state.currentTransaction = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.userTransactions.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Pending Transactions
      .addCase(fetchPendingTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingTransactions.fulfilled, (state, action) => {
        state.pending = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPendingTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.userTransactions = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve Transaction
      .addCase(approveTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        // Remove from pending transactions
        state.pending = state.pending.filter(tx => tx._id !== action.payload._id);
        // Update in userTransactions if it exists
        const userTxIndex = state.userTransactions.findIndex(tx => tx._id === action.payload._id);
        if (userTxIndex !== -1) {
          state.userTransactions[userTxIndex] = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(approveTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reject Transaction
      .addCase(rejectTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectTransaction.fulfilled, (state, action) => {
        // Remove from pending transactions
        state.pending = state.pending.filter(tx => tx._id !== action.payload._id);
        // Update in userTransactions if it exists
        const userTxIndex = state.userTransactions.findIndex(tx => tx._id === action.payload._id);
        if (userTxIndex !== -1) {
          state.userTransactions[userTxIndex] = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(rejectTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Transactions (Admin)
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        // Handle both paginated and non-paginated responses
        if (action.payload.transactions) {
          state.allTransactions = action.payload.transactions;
          state.pending = action.payload.transactions; // For admin view compatibility
        } else {
          state.allTransactions = action.payload;
          state.pending = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentTransaction, resetTransactionState } = transactionSlice.actions;
export default transactionSlice.reducer;