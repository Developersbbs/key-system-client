import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

// Import Layout and Page Components
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import Chapters from "./pages/Chapters";
import Chapter from "./pages/Chapter";
import MemberDashboard from "./member/MemberDashboard";
import AdminCourses from "./admin/AdminCourses";
import AdminChapter from "./admin/AdminChapter";
import AdminMembers from "./admin/AdminMembers";

// Import the Redux action to check for a user session
import { fetchUserProfile } from "./redux/features/auth/authSlice";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLevels from "./admin/AdminLevels";

const App = () => {
  const dispatch = useDispatch();

  // On app load, dispatch fetchUserProfile to check for an active session cookie
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* Toaster component for modern notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* The Layout component wraps all pages to provide the sidebar and header */}
      <Layout>
        <Routes>
          {/* --- Core & Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<Chapters />} />
          <Route path="/courses/:courseId/chapters/:chapterId" element={<Chapter />} />

          {/* --- Authentication Routes --- */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* --- Member-Specific Routes --- */}
          <Route path="/member" element={<MemberDashboard />} />
          
          {/* --- Admin-Specific Routes --- */}
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/members" element={<AdminMembers />} />
           <Route path="/admin/levels" element={<AdminLevels />} />
          <Route path="/admin/courses/:courseId/chapters" element={<AdminChapter />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;