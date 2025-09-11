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

const listingSlice = createSlice({
  name: 'listings',
  initialState: {
    listings: [],
    loading: false,
    error: null,
  },
  reducers: {},
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

export default listingSlice.reducer;