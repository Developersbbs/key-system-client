import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCourses } from '../redux/features/coures/courseSlice';
import { fetchAllMembers, fetchAllAdmins } from '../redux/features/members/memberSlice';
import { BookOpen, Users, ShieldCheck, ListChecks } from 'lucide-react';

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, color, label, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
    <div className={`p-4 rounded-lg bg-${color}-100 mr-4`}>
      <Icon className={`h-8 w-8 text-${color}-600`} />
    </div>
    <div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();

  // --- Data Fetching ---
  const { user } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.courses);
  const { members, admins } = useSelector((state) => state.members);

  useEffect(() => {
    // Fetch all necessary data when the component mounts
    dispatch(fetchAllCourses());
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  // --- Stats Calculation ---
  const totalChapters = courses.reduce((acc, course) => acc + (course.chapters?.length || 0), 0);
  const recentCourses = courses.slice(0, 3); // Get the 3 most recently added courses

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.name || 'Admin'}!</h1>
        <p className="text-gray-600 mt-2">Here's a snapshot of your platform's activity.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={BookOpen} color="teal" label="Total Courses" value={courses.length} />
        <StatCard icon={ListChecks} color="teal" label="Total Chapters" value={totalChapters} />
        <StatCard icon={Users} color="teal" label="Total Members" value={members.length} />
        <StatCard icon={ShieldCheck} color="teal" label="Total Admins" value={admins.length} />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/admin/courses" className="block w-full text-center bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 transition">
              Manage Courses
            </Link>
            <Link to="/admin/members" className="block w-full text-center bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition">
              Manage Users
            </Link>
          </div>
        </div>

        {/* Recently Added Courses */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Added Courses</h2>
          <div className="space-y-4">
            {recentCourses.length > 0 ? recentCourses.map(course => (
              <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.chapters?.length || 0} chapters</p>
                </div>
                <Link to={`/admin/courses/${course._id}/chapters`} className="text-teal-600 font-semibold text-sm">
                  View
                </Link>
              </div>
            )) : (
              <p className="text-gray-500">No courses have been created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;