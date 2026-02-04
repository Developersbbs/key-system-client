import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

// Async thunks

// Fetch all founders (public)
// Fetch all founders (public)
export const fetchFounders = createAsyncThunk(
    'founders/fetchFounders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/founders');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch founders');
        }
    }
);

// Fetch all founders admin (includes inactive)
export const fetchAdminFounders = createAsyncThunk(
    'founders/fetchAdminFounders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/founders/admin/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin founders');
        }
    }
);

// Fetch users for linking (Admin)
export const fetchUsersToLink = createAsyncThunk(
    'founders/fetchUsersToLink',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/admin/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Create founder
export const createFounder = createAsyncThunk(
    'founders/createFounder',
    async (founderData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/founders', founderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create founder');
        }
    }
);

// Update founder
export const updateFounder = createAsyncThunk(
    'founders/updateFounder',
    async ({ id, founderData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/founders/${id}`, founderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update founder');
        }
    }
);

// Delete founder
export const deleteFounder = createAsyncThunk(
    'founders/deleteFounder',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/founders/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete founder');
        }
    }
);

const founderSlice = createSlice({
    name: 'founders',
    initialState: {
        founders: [],
        users: [], // List of registered users for dropdown
        loading: false,
        error: null,
        success: false,
        message: ''
    },
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch public
            .addCase(fetchFounders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFounders.fulfilled, (state, action) => {
                state.loading = false;
                state.founders = action.payload;
            })
            .addCase(fetchFounders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch admin
            .addCase(fetchAdminFounders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminFounders.fulfilled, (state, action) => {
                state.loading = false;
                state.founders = action.payload;
            })
            .addCase(fetchAdminFounders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createFounder.pending, (state) => {
                state.loading = true;
            })
            .addCase(createFounder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.founders.push(action.payload);
                state.message = 'Founder created successfully';
            })
            .addCase(createFounder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateFounder.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateFounder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.founders = state.founders.map((founder) =>
                    founder._id === action.payload._id ? action.payload : founder
                );
                state.message = 'Founder updated successfully';
            })
            .addCase(updateFounder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteFounder.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteFounder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.founders = state.founders.filter((founder) => founder._id !== action.payload);
                state.message = 'Founder deleted successfully';
            })
            .addCase(deleteFounder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Users to Link
            .addCase(fetchUsersToLink.pending, (state) => {
                // state.loading = true; // Optional: don't block entire UI
            })
            .addCase(fetchUsersToLink.fulfilled, (state, action) => {
                state.users = action.payload;
            })
            .addCase(fetchUsersToLink.rejected, (state, action) => {
                console.error('Failed to fetch users:', action.payload);
            });
    },
});

export const { resetState } = founderSlice.actions;
export default founderSlice.reducer;
