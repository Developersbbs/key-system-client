import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from '../../../api/apiClient';

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

// ✅ UPDATED: Submit MCQs with proper endpoint based on your backend routes
export const submitMcqs = createAsyncThunk(
  'chapters/submitMcqs',
  async ({ chapterId, answers }, { rejectWithValue }) => {
    try {
      // ✅ Using the correct endpoint based on your backend mcq routes
      const res = await apiClient.post(`/chapters/${chapterId}/mcqs/submit`, { answers });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit results');
    }
  }
);

// ✅ NEW: Get course progress for a specific course
export const getCourseProgress = createAsyncThunk(
  'chapters/getCourseProgress',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/chapters/progress/${courseId}`);
      return res.data;
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
    courseProgress: null,
    loading: false,
    error: null,
    mcqSubmission: {
      loading: false,
      error: null,
      result: null
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.mcqSubmission.error = null;
    },
    clearMcqResult: (state) => {
      state.mcqSubmission.result = null;
    },
    // ✅ NEW: Update chapter completion status
    updateChapterCompletion: (state, action) => {
      const { chapterId, isCompleted, score } = action.payload;
      const chapterIndex = state.chapters.findIndex(ch => ch._id === chapterId);
      if (chapterIndex !== -1) {
        state.chapters[chapterIndex].isCompleted = isCompleted;
        state.chapters[chapterIndex].userScore = score;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled Handlers
      .addCase(getAllChapters.fulfilled, (state, action) => {
        state.chapters = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.chapters.unshift(action.payload);
        state.loading = false;
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        const index = state.chapters.findIndex(chap => chap._id === action.payload._id);
        if (index !== -1) {
          state.chapters[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        state.chapters = state.chapters.filter(chap => chap._id !== action.payload);
        state.loading = false;
      })
      .addCase(fetchChapterById.fulfilled, (state, action) => {
        state.selectedChapter = action.payload;
        state.loading = false;
      })
      
      // ✅ ENHANCED: MCQ submission with completion tracking
      .addCase(submitMcqs.pending, (state) => {
        state.mcqSubmission.loading = true;
        state.mcqSubmission.error = null;
      })
      .addCase(submitMcqs.fulfilled, (state, action) => {
        state.mcqSubmission.loading = false;
        state.mcqSubmission.result = action.payload;
        
        // ✅ Update chapter completion status if available
        if (action.payload.result && action.payload.result.chapterId) {
          const chapterIndex = state.chapters.findIndex(
            ch => ch._id === action.payload.result.chapterId
          );
          if (chapterIndex !== -1) {
            state.chapters[chapterIndex].isCompleted = true;
            state.chapters[chapterIndex].userScore = action.payload.result.score;
          }
        }
      })
      .addCase(submitMcqs.rejected, (state, action) => {
        state.mcqSubmission.loading = false;
        state.mcqSubmission.error = action.payload;
      })
      
      // ✅ NEW: Course progress handler
      .addCase(getCourseProgress.fulfilled, (state, action) => {
        state.courseProgress = action.payload;
      })
      
      // Generic Matchers for pending/rejected
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.includes('submitMcqs'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && !action.type.includes('submitMcqs'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError, clearMcqResult, updateChapterCompletion } = chapterSlice.actions;
export default chapterSlice.reducer;