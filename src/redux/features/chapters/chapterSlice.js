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

// ✅ ENHANCED: Update chapter with better error handling and optimistic updates
export const updateChapter = createAsyncThunk(
  "chapters/updateChapter",
  async ({ courseId, chapterId, updatedData }, { rejectWithValue, getState }) => {
    try {
      // Get current chapter data for optimistic update rollback if needed
      const currentChapter = getState().chapters.selectedChapter;
      
      const res = await apiClient.put(`/courses/${courseId}/chapters/${chapterId}`, updatedData);
      return { 
        updatedChapter: res.data, 
        previousChapter: currentChapter 
      };
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

// ✅ NEW: Update chapter video URL specifically
export const updateChapterVideo = createAsyncThunk(
  'chapters/updateVideo',
  async ({ courseId, chapterId, videoUrl }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/courses/${courseId}/chapters/${chapterId}`, { videoUrl });
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
    courseProgressLoading: false,
    courseProgressError: null,
    loading: false,
    updating: false, // ✅ NEW: Separate loading state for updates
    error: null,
    mcqSubmission: {
      loading: false,
      error: null,
      result: null
    },
    videoUpload: { // ✅ NEW: Video upload state
      loading: false,
      error: null,
      progress: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.mcqSubmission.error = null;
      state.videoUpload.error = null;
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
    },
    // ✅ NEW: Video upload progress
    setVideoUploadProgress: (state, action) => {
      state.videoUpload.progress = action.payload;
    },
    // ✅ NEW: Clear video upload state
    clearVideoUploadState: (state) => {
      state.videoUpload.loading = false;
      state.videoUpload.error = null;
      state.videoUpload.progress = 0;
    },
    // ✅ NEW: Optimistic update for video URL
    updateVideoUrlOptimistic: (state, action) => {
      if (state.selectedChapter) {
        state.selectedChapter.videoUrl = action.payload;
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
      
      // ✅ ENHANCED: Update chapter with better state management
      .addCase(updateChapter.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        const updatedChapter = action.payload.updatedChapter || action.payload;
        
        // Update in chapters array
        const index = state.chapters.findIndex(chap => chap._id === updatedChapter._id);
        if (index !== -1) {
          state.chapters[index] = updatedChapter;
        }
        
        // Update selected chapter if it's the same
        if (state.selectedChapter && state.selectedChapter._id === updatedChapter._id) {
          state.selectedChapter = updatedChapter;
        }
        
        state.updating = false;
        state.error = null;
      })
      .addCase(updateChapter.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
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
      .addCase(getCourseProgress.pending, (state) => {
        state.courseProgressLoading = true;
        state.courseProgressError = null;
      })
      .addCase(getCourseProgress.fulfilled, (state, action) => {
        state.courseProgress = action.payload;
        state.courseProgressLoading = false;
      })
      .addCase(getCourseProgress.rejected, (state, action) => {
        state.courseProgressLoading = false;
        state.courseProgressError = action.payload;
      })
      
      // ✅ NEW: Video update handlers
      .addCase(updateChapterVideo.pending, (state) => {
        state.videoUpload.loading = true;
        state.videoUpload.error = null;
      })
      .addCase(updateChapterVideo.fulfilled, (state, action) => {
        state.videoUpload.loading = false;
        state.videoUpload.progress = 0;
        
        const updatedChapter = action.payload;
        
        // Update selected chapter
        if (state.selectedChapter && state.selectedChapter._id === updatedChapter._id) {
          state.selectedChapter = updatedChapter;
        }
        
        // Update in chapters array
        const index = state.chapters.findIndex(chap => chap._id === updatedChapter._id);
        if (index !== -1) {
          state.chapters[index] = updatedChapter;
        }
      })
      .addCase(updateChapterVideo.rejected, (state, action) => {
        state.videoUpload.loading = false;
        state.videoUpload.error = action.payload;
        state.videoUpload.progress = 0;
      })
      
      // Generic Matchers for pending/rejected
      .addMatcher(
        (action) => action.type.endsWith('/pending') && 
        !action.type.includes('submitMcqs') && 
        !action.type.includes('updateChapter') &&
        !action.type.includes('updateChapterVideo') &&
        !action.type.includes('getCourseProgress'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && 
        !action.type.includes('submitMcqs') && 
        !action.type.includes('updateChapter') &&
        !action.type.includes('updateChapterVideo') &&
        !action.type.includes('getCourseProgress'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { 
  clearError, 
  clearMcqResult, 
  updateChapterCompletion,
  setVideoUploadProgress,
  clearVideoUploadState,
  updateVideoUrlOptimistic
} = chapterSlice.actions;

export default chapterSlice.reducer;