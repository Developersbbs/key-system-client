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
import Events from "./pages/Events";
import AdminMeetings from "./admin/AdminMeetings";
import AdminEvents from "./admin/AdminEvents";
import Marketplace from "./pages/Marcketplace";
import AdminTransactions from "./admin/AdminTransactions";
import AdminSettings from "./admin/AdminSettings";
import Profile from "./pages/Profile";
import MemberMeetings from "./pages/MemberMeetings";
import MemberTransactions from "./pages/MemberTransactions";
import AdminAnnouncements from "./admin/AdminAnnouncements";
import MemberAnnouncements from "./pages/MemberAnnouncement";
import Founders from "./pages/Founders";
import AdminFounders from "./admin/AdminFounders";
import AdminAttendance from "./admin/AdminAttendance";
import Achievers from "./pages/Achievers";
import AdminTools from "./admin/AdminTools";
import Tools from "./pages/Tools";

// Import Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

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
          {/* --- Public Routes (only these 3) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* --- Protected Routes (everything else requires login) --- */}
          <Route path="/courses" element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          <Route path="/courses/:courseId" element={
            <ProtectedRoute>
              <Chapters />
            </ProtectedRoute>
          } />
          <Route path="/courses/:courseId/chapters/:chapterId" element={
            <ProtectedRoute>
              <Chapter />
            </ProtectedRoute>
          } />

          {/* --- Member-Specific Routes --- */}
          <Route path="/member" element={
            <ProtectedRoute requiredRole="member">
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/meeting" element={
            <ProtectedRoute>
              <MemberMeetings />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <MemberTransactions />
            </ProtectedRoute>
          } />
          <Route path="/announcements" element={
            <ProtectedRoute>
              <MemberAnnouncements />
            </ProtectedRoute>
          } />
          <Route path="/founders" element={
            <ProtectedRoute>
              <Founders />
            </ProtectedRoute>
          } />
          <Route path="/achievers" element={
            <ProtectedRoute>
              <Achievers />
            </ProtectedRoute>
          } />
          <Route path="/tools" element={
            <ProtectedRoute>
              <Tools />
            </ProtectedRoute>
          } />

          {/* --- Admin-Specific Routes --- */}
          <Route path="/admin/courses" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute requiredRole="admin">
              <AdminMembers />
            </ProtectedRoute>
          } />
          <Route path="/admin/meetings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminMeetings />
            </ProtectedRoute>
          } />
          <Route path="/admin/transactions" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTransactions />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnnouncements />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute requiredRole="admin">
              <AdminEvents />
            </ProtectedRoute>
          } />
          <Route path="/admin/levels" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLevels />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses/:courseId/chapters" element={
            <ProtectedRoute requiredRole="admin">
              <AdminChapter />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/founders" element={
            <ProtectedRoute requiredRole="admin">
              <AdminFounders />
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAttendance />
            </ProtectedRoute>
          } />
          <Route path="/admin/tools" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTools />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;