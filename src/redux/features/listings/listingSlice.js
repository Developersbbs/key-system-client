import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

export const fetchAllListings = createAsyncThunk('listings/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/listings');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addListing = createAsyncThunk('listings/add', async (listingData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/listings', listingData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeListing = createAsyncThunk('listings/remove', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/listings/${id}`);
    return id; // Return the ID of the deleted listing
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateListingQuantityAPI = createAsyncThunk('listings/updateQuantity', async ({ listingId, purchasedQuantity }, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch('/listings/update-quantity', {
      listingId,
      purchasedQuantity
    });
    return { listingId, purchasedQuantity };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const listingSlice = createSlice({
  name: 'listings',
  initialState: {
    listings: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateListingQuantity(state, action) {
      const { listingId, purchasedQuantity } = action.payload;
      const listingIndex = state.listings.findIndex(listing => listing._id === listingId);
      if (listingIndex !== -1) {
        state.listings[listingIndex].availableQuantity -= purchasedQuantity;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllListings.fulfilled, (state, action) => {
        state.listings = action.payload;
      })
      .addCase(addListing.fulfilled, (state, action) => {
        state.listings.unshift(action.payload);
      })
      .addCase(removeListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter(item => item._id !== action.payload);
      })
      .addCase(updateListingQuantityAPI.fulfilled, (state, action) => {
        const { listingId, purchasedQuantity } = action.payload;
        const listingIndex = state.listings.findIndex(listing => listing._id === listingId);
        if (listingIndex !== -1) {
          state.listings[listingIndex].availableQuantity -= purchasedQuantity;
          if (state.listings[listingIndex].availableQuantity <= 0) {
            state.listings[listingIndex].isSold = true;
          }
        }
      })
      .addMatcher((action) => action.type.startsWith('listings/'), (state, action) => {
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

export const { updateListingQuantity } = listingSlice.actions;

export default listingSlice.reducer;