import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCourses, fetchMyCourses } from '../redux/features/coures/courseSlice';
import { BookOpen, ImageIcon } from 'lucide-react';

// Helper component to manage the course card image
const CourseCardImage = ({ course }) => {
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => setImageError(true);
  const showPlaceholder = !course.image || imageError;

  return (
    <div className="h-48 bg-gray-200 relative overflow-hidden group">
      {!showPlaceholder ? (
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          onError={handleImageError} 
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center">
          <ImageIcon size={48} className="text-white opacity-50" />
        </div>
      )}
      {course.category && (
        <div className="absolute top-3 left-3">
          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
            {course.category}
          </span>
        </div>
      )}
    </div>
  );
};

const Courses = () => {
  const dispatch = useDispatch();
  
  // Get data from both the 'courses' and 'auth' slices
  const { courses, loading, error } = useSelector((state) => state.courses);
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Make the data fetching role-aware
    if (isLoggedIn && user?.role === 'member') {
      // If user is a member, fetch only their accessible courses
      dispatch(fetchMyCourses());
    } else {
      // For guests or admins, fetch all courses
      dispatch(fetchAllCourses());
    }
  }, [dispatch, isLoggedIn, user]);

  // Handle the loading state while fetching
  if (loading && courses.length === 0) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Courses...</p>
      </div>
    );
  }

  // Handle any errors during the fetch
  if (error) {
    return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {isLoggedIn && user?.role === 'member' ? 'My Enrolled Courses' : 'Our Courses'}
      </h1>

      {courses.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow-sm">
          <p className="text-xl text-gray-500">
            {isLoggedIn && user?.role === 'member' ? "You have not been given access to any courses yet." : "No courses are available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link 
              to={`/courses/${course._id}`} 
              key={course._id} 
              className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <CourseCardImage course={course} />
              <div className="p-6">
                {course.category && (
                  <p className="text-sm text-teal-600 font-semibold mb-2">{course.category}</p>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-teal-600 transition-colors duration-300">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-3 h-16">
                  {course.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-gray-500 flex items-center">
                  <BookOpen size={16} className="mr-2"/>
                  <span>{course.chapters?.length || 0} Chapters</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;