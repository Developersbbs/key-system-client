import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

// Thunks
export const submitWorksheet = createAsyncThunk(
    'worksheets/submit',
    async (worksheetData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/worksheets/submit', worksheetData);
            return response.data.worksheet;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit worksheet');
        }
    }
);

export const updateWorksheet = createAsyncThunk(
    'worksheets/update',
    async ({ id, worksheetData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/worksheets/${id}`, worksheetData);
            return response.data.worksheet;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update worksheet');
        }
    }
);

export const deleteWorksheet = createAsyncThunk(
    'worksheets/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiClient.delete(`/worksheets/${id}`);
            return response.data.id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete worksheet');
        }
    }
);

export const fetchMyWorksheets = createAsyncThunk(
    'worksheets/fetchMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/worksheets/my');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your worksheets');
        }
    }
);

export const fetchAllWorksheets = createAsyncThunk(
    'worksheets/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/worksheets/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all worksheets');
        }
    }
);

const worksheetSlice = createSlice({
    name: 'worksheets',
    initialState: {
        worksheets: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearWorksheetState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Submit Worksheet
            .addCase(submitWorksheet.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitWorksheet.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Optionally insert at the start of the list if we're showing them
                state.worksheets.unshift(action.payload);
            })
            .addCase(submitWorksheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Fetch My Worksheets
            .addCase(fetchMyWorksheets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyWorksheets.fulfilled, (state, action) => {
                state.loading = false;
                state.worksheets = action.payload;
            })
            .addCase(fetchMyWorksheets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch All Worksheets
            .addCase(fetchAllWorksheets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllWorksheets.fulfilled, (state, action) => {
                state.loading = false;
                state.worksheets = action.payload;
            })
            .addCase(fetchAllWorksheets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Worksheet
            .addCase(updateWorksheet.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateWorksheet.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.worksheets.findIndex(ws => ws._id === action.payload._id);
                if (index !== -1) {
                    state.worksheets[index] = action.payload;
                }
            })
            .addCase(updateWorksheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Delete Worksheet
            .addCase(deleteWorksheet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteWorksheet.fulfilled, (state, action) => {
                state.loading = false;
                state.worksheets = state.worksheets.filter(ws => ws._id !== action.payload);
            })
            .addCase(deleteWorksheet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearWorksheetState } = worksheetSlice.actions;
export default worksheetSlice.reducer;
