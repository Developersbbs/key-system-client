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

// Worksheet Fields Thunks
export const fetchActiveFields = createAsyncThunk(
    'worksheets/fetchActiveFields',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/worksheet-fields/active');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch active fields');
        }
    }
);

export const fetchAdminFields = createAsyncThunk(
    'worksheets/fetchAdminFields',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/worksheet-fields/admin/all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin fields');
        }
    }
);

export const createWorksheetField = createAsyncThunk(
    'worksheets/createField',
    async (fieldData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/worksheet-fields', fieldData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create field');
        }
    }
);

export const updateWorksheetField = createAsyncThunk(
    'worksheets/updateField',
    async ({ id, fieldData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/worksheet-fields/${id}`, fieldData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update field');
        }
    }
);

export const deleteWorksheetField = createAsyncThunk(
    'worksheets/deleteField',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/worksheet-fields/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete field');
        }
    }
);

const worksheetSlice = createSlice({
    name: 'worksheets',
    initialState: {
        worksheets: [],
        fields: [], // Current active fields for form
        adminFields: [], // All fields for admin management
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
            })

            // Fetch Fields
            .addCase(fetchActiveFields.fulfilled, (state, action) => {
                state.fields = action.payload;
            })
            .addCase(fetchAdminFields.fulfilled, (state, action) => {
                state.adminFields = action.payload;
                state.loading = false;
            })
            .addCase(fetchAdminFields.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminFields.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Field
            .addCase(createWorksheetField.fulfilled, (state, action) => {
                state.adminFields.push(action.payload);
                state.success = true;
                state.loading = false;
            })
            .addCase(createWorksheetField.pending, (state) => {
                state.loading = true;
            })

            // Update Field
            .addCase(updateWorksheetField.fulfilled, (state, action) => {
                const index = state.adminFields.findIndex(f => f._id === action.payload._id);
                if (index !== -1) {
                    state.adminFields[index] = action.payload;
                }
                state.success = true;
                state.loading = false;
            })

            // Delete Field
            .addCase(deleteWorksheetField.fulfilled, (state, action) => {
                state.adminFields = state.adminFields.filter(f => f._id !== action.payload);
                state.loading = false;
            });
    }
});

export const { clearWorksheetState } = worksheetSlice.actions;
export default worksheetSlice.reducer;
