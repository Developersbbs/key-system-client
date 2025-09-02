import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/apiClient'; // Adjust path if needed

const handleApiError = (err) => {
  return err.response?.data?.message || err.message || 'An unexpected error occurred';
};

// --- Async Thunks ---

export const fetchAllCourses = createAsyncThunk('courses/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/courses');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

// ✅ UPDATED: Fetch member courses with sequential unlock status
export const fetchMyCourses = createAsyncThunk('courses/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/courses/my-courses');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

// ✅ NEW: Check if user can access a specific course
export const checkCourseAccess = createAsyncThunk('courses/checkAccess', async (courseId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/courses/${courseId}/can-access`);
    return { courseId, ...res.data };
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

// ✅ NEW: Get user's overall progress
export const fetchUserProgress = createAsyncThunk('courses/fetchProgress', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/courses/user-progress');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

// ✅ NEW: Get course-specific progress
export const fetchCourseProgress = createAsyncThunk('courses/fetchCourseProgress', async (courseId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/courses/progress/${courseId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const fetchApprovedCourses = createAsyncThunk('courses/fetchApproved', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/courses/approved');
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const fetchCourseById = createAsyncThunk('courses/fetchById', async (courseId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/courses/${courseId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const addCourse = createAsyncThunk('courses/add', async (courseData, { rejectWithValue }) => {
  try {
    const res = await apiClient.post('/courses', courseData);
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const editCourse = createAsyncThunk('courses/edit', async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/courses/${id}`, updatedData);
    return res.data;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

export const removeCourse = createAsyncThunk('courses/remove', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/courses/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    selectedCourse: null,
    userProgress: null,
    courseAccess: {}, // Store access status for courses
    loading: false,
    error: null,
    progressLoading: false,
    progressError: null,
  },
  reducers: {
    clearError: (state) => { 
      state.error = null; 
      state.progressError = null;
    },
    // ✅ NEW: Update course completion status
    updateCourseCompletion: (state, action) => {
      const { courseId, isCompleted } = action.payload;
      const courseIndex = state.courses.findIndex(c => c._id === courseId);
      if (courseIndex !== -1) {
        state.courses[courseIndex].isCompleted = isCompleted;
      }
    },
    // ✅ NEW: Update course unlock status
    updateCourseUnlock: (state, action) => {
      const { courseId, isUnlocked } = action.payload;
      const courseIndex = state.courses.findIndex(c => c._id === courseId);
      if (courseIndex !== -1) {
        state.courses[courseIndex].isUnlocked = isUnlocked;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Course fetch actions
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        // ✅ Courses now come with isCompleted and isUnlocked flags
        state.courses = action.payload;
        state.loading = false;
      })
      .addCase(fetchApprovedCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
        state.loading = false;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selectedCourse = action.payload;
        state.loading = false;
      })
      
      // ✅ NEW: Handle user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.progressLoading = true;
        state.progressError = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.userProgress = action.payload;
        state.progressLoading = false;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.progressLoading = false;
        state.progressError = action.payload;
      })
      
      // ✅ NEW: Handle course access check
      .addCase(checkCourseAccess.fulfilled, (state, action) => {
        const { courseId, canAccess, reason } = action.payload;
        state.courseAccess[courseId] = { canAccess, reason };
      })
      
      // Existing CRUD operations
      .addCase(addCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
        state.loading = false;
      })
      .addCase(editCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
        state.loading = false;
      })
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(c => c._id !== action.payload);
        state.loading = false;
      })
      
      // Generic matchers
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.includes('Progress'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && !action.type.includes('Progress'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearError, updateCourseCompletion, updateCourseUnlock } = courseSlice.actions;
export default courseSlice.reducer;