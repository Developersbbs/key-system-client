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

// ✅ ADD THIS NEW THUNK for member-specific courses
export const fetchMyCourses = createAsyncThunk('courses/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/courses/my-courses');
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
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // ✅ ADD fulfilled handler for the new thunk.
      // It can share the same logic as fetchAllCourses.
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selectedCourse = action.payload;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      .addCase(editCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
      })
      .addCase(removeCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(c => c._id !== action.payload);
      })
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;