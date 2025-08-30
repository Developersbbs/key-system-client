import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyCourses, fetchApprovedCourses } from '../redux/features/coures/courseSlice';
import { fetchAllLevels } from '../redux/features/level/levelSlice';
import { BookOpen, ImageIcon, Lock, CheckCircle } from 'lucide-react';

// Helper component for the course card image
const CourseCardImage = ({ course, isLocked }) => {
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => setImageError(true);
  const showPlaceholder = !course.image || imageError;

  return (
    <div className={`h-48 relative overflow-hidden group ${isLocked && 'filter grayscale'}`}>
      {!showPlaceholder ? (
        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={handleImageError} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center">
          <ImageIcon size={48} className="text-white opacity-40" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <Lock size={40} className="text-white opacity-75" />
        </div>
      )}
    </div>
  );
};

// Helper component for the loading state
const CoursesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
      </div>
    ))}
  </div>
);

const Courses = () => {
  const dispatch = useDispatch();
  
  const { user, isLoggedIn } = useSelector(state => state.auth);
  const { courses, loading: coursesLoading } = useSelector(state => state.courses);
  const { levels, loading: levelsLoading } = useSelector(state => state.levels);

  useEffect(() => {
    // Fetch only admin-approved courses based on user type
    if (isLoggedIn && user?.role === 'member') {
      // For logged-in members, fetch their enrolled courses (already approved)
      dispatch(fetchMyCourses());
    } else {
      // For guests and other users, fetch only admin-approved courses
      dispatch(fetchApprovedCourses());
    }
    dispatch(fetchAllLevels());
  }, [dispatch, isLoggedIn, user?.role]);

  const isLoading = (coursesLoading || levelsLoading) && levels.length === 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse mb-8"></div>
        <CoursesSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-900">
        {isLoggedIn && user?.role === 'member' ? 'My Learning Path' : 'Our Courses'}
      </h1>
      <div className="space-y-12">
        {levels.map(level => {
          const isLevelUnlocked = user ? user.currentLevel >= level.levelNumber : true;
          const coursesInLevel = courses.filter(c => 
            level.courses.map(lc => lc._id).includes(c._id)
          );

          // Don't render the level if it has no approved courses
          if (coursesInLevel.length === 0) return null;

          return (
            <div key={level._id}>
              <div className="flex items-center gap-4 mb-6">
                {!isLevelUnlocked && <Lock className="text-gray-400" />}
                <h2 className={`text-3xl font-bold ${isLevelUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                  Level {level.levelNumber}: {level.name}
                </h2>
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${!isLevelUnlocked && 'opacity-60'}`}>
                {coursesInLevel.map(course => {
                  const isCompleted = user?.completedCourses?.includes(course._id);
                  const CardWrapper = isLevelUnlocked ? Link : 'div';
                  return (
                    <CardWrapper 
                      to={isLevelUnlocked ? `/courses/${course._id}` : '#'}
                      key={course._id}
                      className={`group block bg-white rounded-lg shadow-md overflow-hidden ${isLevelUnlocked ? 'hover:shadow-xl transition-shadow' : 'pointer-events-none'}`}
                    >
                      <CourseCardImage course={course} isLocked={!isLevelUnlocked} />
                      <div className="p-6 relative">
                        {isCompleted && (
                          <div className="absolute top-4 right-4 flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                             <CheckCircle size={16} /> Completed
                          </div>
                        )}
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 h-16">{course.description}</p>
                        <div className="pt-4 border-t text-sm font-medium text-gray-500 flex items-center">
                            <BookOpen size={16} className="mr-2"/>
                            <span>{course.chapters?.length || 0} Chapters</span>
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Courses;