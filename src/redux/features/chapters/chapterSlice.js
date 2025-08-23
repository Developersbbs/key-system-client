import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from '../../../api/apiClient'; // Adjust path if needed

// Helper function to handle API errors
const handleApiError = (err) => {
  return err.response?.data?.message || err.message || 'An unexpected error occurred';
};

// --- Async Thunks ---

export const createChapter = createAsyncThunk(
  "chapters/createChapter",
  async ({ courseId, chapterData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/courses/${courseId}/chapters`, chapterData);
      return res.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const getAllChapters = createAsyncThunk(
  "chapters/getAllChapters",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/chapters`);
      return res.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const fetchChapterById = createAsyncThunk(
  "chapters/fetchById",
  async ({ courseId, chapterId }, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/chapters/${chapterId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const updateChapter = createAsyncThunk(
  "chapters/updateChapter",
  async ({ courseId, chapterId, updatedData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/courses/${courseId}/chapters/${chapterId}`, updatedData);
      return res.data;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const deleteChapter = createAsyncThunk(
  "chapters/deleteChapter",
  async ({ courseId, chapterId }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/courses/${courseId}/chapters/${chapterId}`);
      return chapterId;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// --- Slice Definition ---
const chapterSlice = createSlice({
  name: "chapters",
  initialState: {
    chapters: [],
    selectedChapter: null,
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
      // Fulfilled Handlers
      .addCase(getAllChapters.fulfilled, (state, action) => {
        state.chapters = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.chapters.unshift(action.payload);
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        const index = state.chapters.findIndex(chap => chap._id === action.payload._id);
        if (index !== -1) {
          state.chapters[index] = action.payload;
        }
      })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        state.chapters = state.chapters.filter(chap => chap._id !== action.payload);
      })
      .addCase(fetchChapterById.fulfilled, (state, action) => {
        state.selectedChapter = action.payload;
      })
      // Generic Matchers for pending/rejected
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
  },
});

export const { clearError } = chapterSlice.actions;
export default chapterSlice.reducer;