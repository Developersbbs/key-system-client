import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient';

// Async Thunks
// Async Thunks
export const fetchAllTools = createAsyncThunk(
    'tools/fetchAll',
    async (type, { rejectWithValue }) => {
        try {
            const url = type ? `/tools?type=${type}` : `/tools`;
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to fetch tools');
        }
    }
);

export const addTool = createAsyncThunk(
    'tools/add',
    async (toolData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`/tools`, toolData);
            return response.data.tool;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to add tool');
        }
    }
);

export const updateTool = createAsyncThunk(
    'tools/update',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            await apiClient.put(`/tools/${id}`, updatedData);
            return { id, updatedData };
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to update tool');
        }
    }
);

export const removeTool = createAsyncThunk(
    'tools/remove',
    async (id, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/tools/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.msg || 'Failed to delete tool');
        }
    }
);

const toolSlice = createSlice({
    name: 'tools',
    initialState: {
        tools: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllTools.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTools.fulfilled, (state, action) => {
                state.loading = false;
                state.tools = action.payload;
            })
            .addCase(fetchAllTools.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Tool
            .addCase(addTool.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addTool.fulfilled, (state, action) => {
                state.loading = false;
                state.tools.unshift(action.payload);
            })
            .addCase(addTool.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Tool
            .addCase(updateTool.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTool.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.tools.findIndex(t => t._id === action.payload.id);
                if (index !== -1) {
                    state.tools[index] = { ...state.tools[index], ...action.payload.updatedData };
                }
            })
            .addCase(updateTool.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Remove Tool
            .addCase(removeTool.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeTool.fulfilled, (state, action) => {
                state.loading = false;
                state.tools = state.tools.filter(t => t._id !== action.payload);
            })
            .addCase(removeTool.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = toolSlice.actions;
export default toolSlice.reducer;
