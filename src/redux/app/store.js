// store/index.js or store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import chapterReducer from "../features/chapters/chapterSlice";
import courseReducer from "../features/coures/courseSlice";
import memberReducer from "../features/members/memberSlice";
import levelReducer from '../features/level/levelSlice';
import batchReducer from '../features/batches/batchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chapters: chapterReducer,
    courses: courseReducer,
    members: memberReducer,
    levels: levelReducer,
    batches: batchReducer,
  },
});

// 🔧 CRITICAL: Hydrate auth state from localStorage on store creation
console.log("🏪 Store created, hydrating auth state...");


export default store;