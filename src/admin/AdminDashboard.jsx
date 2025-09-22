import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCourses } from '../redux/features/coures/courseSlice';
import { fetchAllMembers, fetchAllAdmins } from '../redux/features/members/memberSlice';
import { 
  BookOpen, 
  Users, 
  ShieldCheck, 
  ListChecks, 
  TrendingUp, 
  BarChart3,
  PlusCircle,
  Eye,
  Calendar,
  ArrowUpRight,
  UserPlus,
  FileText,
  ChevronRight
} from 'lucide-react';

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, color, label, value, trend }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center border border-emerald-100 transition-all duration-300 hover:shadow-md hover:border-emerald-200">
    <div className={`p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 mr-4 shadow-sm`}>
      <Icon className={`h-8 w-8 text-emerald-600`} />
    </div>
    <div className="flex-1">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-600 text-sm mt-1">{label}</p>
    </div>
    {trend && (
      <div className="flex items-center text-emerald-600 text-sm font-medium">
        <TrendingUp size={16} className="mr-1" />
        <span>{trend}%</span>
      </div>
    )}
  </div>
);

// Course Card Component
const CourseCard = ({ course }) => (
  <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 text-lg mb-1">{course.title}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <ListChecks size={14} className="mr-1" />
          <span>{course.chapters?.length || 0} chapters</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={14} className="mr-1" />
          <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <Link 
        to={`/admin/courses/${course._id}/chapters`} 
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors flex items-center"
      >
        <Eye size={16} />
      </Link>
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
  const recentCourses = courses.slice(0, 4); // Get the 4 most recently added courses

  return (
    <div className="w-full p-6 bg-gradient-to-b from-emerald-50 to-gray-100 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Admin'}! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your platform today.</p>
        
        <div className="flex items-center mt-4 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg max-w-md">
          <BarChart3 size={18} className="mr-2" />
          <span>Your platform has grown by 12% in the last 30 days</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={BookOpen} color="emerald" label="Total Courses" value={courses.length} trend={8} />
        <StatCard icon={ListChecks} color="emerald" label="Total Chapters" value={totalChapters} trend={12} />
        <StatCard icon={Users} color="emerald" label="Total Members" value={members.length} trend={15} />
        <StatCard icon={ShieldCheck} color="emerald" label="Admin Users" value={admins.length} trend={5} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full"></div>
              <ChevronRight className="text-emerald-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/admin/courses" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:from-emerald-100 hover:to-green-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-emerald-500 p-3 rounded-lg mr-3">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Manage Courses</span>
                </div>
                <ArrowUpRight size={18} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <Link 
                to="/admin/members" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:from-emerald-100 hover:to-green-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-emerald-500 p-3 rounded-lg mr-3">
                    <Users size={20} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Manage Users</span>
                </div>
                <ArrowUpRight size={18} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <Link 
                to="/admin/courses" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:from-emerald-100 hover:to-green-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-emerald-500 p-3 rounded-lg mr-3">
                    <PlusCircle size={20} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Create Course</span>
                </div>
                <ArrowUpRight size={18} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <Link 
                to="/admin/members" 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:from-emerald-100 hover:to-green-100 transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-emerald-500 p-3 rounded-lg mr-3">
                    <UserPlus size={20} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-800">Invite User</span>
                </div>
                <ArrowUpRight size={18} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Recently Added Courses */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recently Added Courses</h2>
              <Link to="/admin/courses" className="text-emerald-600 text-sm font-medium flex items-center">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            {recentCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentCourses.map(course => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={48} className="text-emerald-200 mx-auto mb-4" />
                <p className="text-gray-500">No courses have been created yet.</p>
                <Link 
                  to="/admin/courses/new" 
                  className="inline-block mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats Summary */}
        <div className="lg:col-span-1 space-y-8">
          {/* Platform Overview */}
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30">
                <span>Active Users</span>
                <span className="font-bold">{members.filter(m => m.status === 'active').length}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30">
                <span>Published Courses</span>
                <span className="font-bold">{courses.filter(c => c.published).length}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/30">
                <span>Completion Rate</span>
                <span className="font-bold">78%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Avg. Session</span>
                <span className="font-bold">24 min</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-emerald-500/30">
              <div className="flex items-center justify-center text-sm">
                <TrendingUp size={16} className="mr-1" />
                <span>Overall growth: 12.8%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <UserPlus size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New member registered</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <BookOpen size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New course published</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <FileText size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Chapter added to "Advanced Trading"</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 text-center text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors">
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;