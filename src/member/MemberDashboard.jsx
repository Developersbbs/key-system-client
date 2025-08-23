import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyCourses } from '../redux/features/coures/courseSlice';
import { BookOpen, PlayCircle, ChevronRight } from 'lucide-react';

const MemberDashboard = () => {
  const dispatch = useDispatch();

  // --- Data Fetching ---
  const { user } = useSelector((state) => state.auth);
  // The 'courses' state will hold member-specific courses because of our role-aware fetching
  const { courses, loading, error } = useSelector((state) => state.courses);

  useEffect(() => {
    // This thunk fetches only the courses the logged-in member has access to
    dispatch(fetchMyCourses());
  }, [dispatch]);

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="mb-8 justify-center items-center text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.name || 'Member'}!</h1>
        <p className="text-gray-600 mt-2">Ready to continue your learning journey?</p>
      </div>

      {/* Enrolled Courses Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <BookOpen className="text-teal-600" />
          My Enrolled Courses
        </h2>
        
        
      
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course._id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.chapters?.length || 0} chapters</p>
                </div>
                <Link 
                  to={`/courses/${course._id}`}
                  className="bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
                >
                  <PlayCircle size={18} />
                  Start Learning
                </Link>
              </div>
            ))}
          </div>
        
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
            <Link to="/courses" className="text-teal-600 font-semibold flex items-center justify-center gap-1">
              Browse Available Courses <ChevronRight size={18} />
            </Link>
          </div>
        
      </div>
    </div>
  );
};

export default MemberDashboard;