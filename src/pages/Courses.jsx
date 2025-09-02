import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyCourses, fetchApprovedCourses, fetchUserProgress } from '../redux/features/coures/courseSlice';
import { fetchAllLevels } from '../redux/features/level/levelSlice';
import { BookOpen, ImageIcon, Lock, CheckCircle, Star, Clock, AlertCircle } from 'lucide-react';

// Helper component for the course card image
const CourseCardImage = ({ course, isLocked }) => {
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => setImageError(true);
  const showPlaceholder = !course.image || imageError;

  return (
    <div className={`h-48 relative overflow-hidden group ${isLocked ? 'filter grayscale' : ''}`}>
      {!showPlaceholder ? (
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          onError={handleImageError} 
        />
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
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
      </div>
    ))}
  </div>
);

// Course Progress Bar Component
const CourseProgressBar = ({ progress }) => {
  if (!progress) return null;
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        <span>{progress.completedChapters}/{progress.totalChapters} chapters</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-teal-600 to-green-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progress.progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Course Status Badge Component
const CourseStatusBadge = ({ course, userProgress }) => {
  const isCompleted = course.isCompleted;
  const isUnlocked = course.isUnlocked !== false; // Default to unlocked if not specified
  
  if (isCompleted) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
        <CheckCircle size={14} /> 
        Completed
      </div>
    );
  }
  
  if (!isUnlocked) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold">
        <Lock size={14} /> 
        Locked
      </div>
    );
  }
  
  // Show progress if course is in progress
  const progress = userProgress?.find(p => p.courseId === course._id);
  if (progress && progress.completedChapters > 0 && !isCompleted) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs font-semibold">
        <Clock size={14} /> 
        {progress.progressPercentage}%
      </div>
    );
  }
  
  return null;
};

// Inactive User Message Component
const InactiveUserMessage = () => (
  <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-900 mb-2">Account Inactive</h2>
      <p className="text-red-700 mb-4">
        Your account is currently inactive. You don't have access to courses at this time.
      </p>
      <p className="text-red-600 text-sm">
        Please contact an administrator to reactivate your account.
      </p>
    </div>
  </div>
);

const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isLoggedIn } = useSelector(state => state.auth);
  const { courses, loading: coursesLoading, userProgress } = useSelector(state => state.courses);
  const { levels, loading: levelsLoading } = useSelector(state => state.levels);

  // Check if user is active
  const isUserActive = user?.isActive !== false; // Default to true if not specified

  useEffect(() => {
    // Only fetch courses if user is active (or not logged in/not a member)
    if (!isLoggedIn || user?.role !== 'member' || isUserActive) {
      // Fetch courses based on user type
      if (isLoggedIn && user?.role === 'member') {
        // For logged-in members, fetch their accessible courses with unlock status
        dispatch(fetchMyCourses());
        dispatch(fetchUserProgress()); // Get overall progress
      } else {
        // For guests and other users, fetch only admin-approved courses
        dispatch(fetchApprovedCourses());
      }
      dispatch(fetchAllLevels());
    }
  }, [dispatch, isLoggedIn, user?.role, isUserActive]);

  const isLoading = (coursesLoading || levelsLoading) && levels.length === 0;

  // If user is logged in as member but inactive, show inactive message
  if (isLoggedIn && user?.role === 'member' && !isUserActive) {
    return <InactiveUserMessage />;
  }

  // Handle course card click with access validation
  const handleCourseClick = (course) => {
    // If user is not logged in or not a member, allow navigation to approved courses
    if (!isLoggedIn || user?.role !== 'member') {
      navigate(`/courses/${course._id}`);
      return;
    }

    // For members, check if course is unlocked
    if (course.isUnlocked === false) {
      // Show message or do nothing for locked courses
      return;
    }

    // Navigate to unlocked course
    navigate(`/courses/${course._id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse mb-8"></div>
        <CoursesSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          {isLoggedIn && user?.role === 'member' ? 'My Learning Path' : 'Our Courses'}
        </h1>
        {isLoggedIn && user?.role === 'member' && (
          <p className="text-gray-600">
            Complete courses in order to unlock the next level. 
          </p>
        )}
      </div>

      <div className="space-y-12">
        {levels.map(level => {
          // Check if level is accessible to user
          const isLevelAccessible = user ? user.accessibleLevels?.includes(level.levelNumber) : true;
          
          // Get courses in this level
          const coursesInLevel = courses.filter(course => 
            level.courses.some(levelCourse => {
              const courseId = typeof levelCourse === 'object' ? levelCourse._id : levelCourse;
              return courseId === course._id;
            })
          );

          // Don't render the level if it has no courses
          if (coursesInLevel.length === 0) return null;

          return (
            <div key={level._id} className="relative">
              {/* Level Header */}
              <div className="flex items-center gap-4 mb-6">
                {!isLevelAccessible && <Lock className="text-gray-400" size={28} />}
                <div>
                  {/* <h2 className={`text-3xl font-bold ${isLevelAccessible ? 'text-gray-800' : 'text-gray-400'}`}>
                    Level {level.levelNumber}: {level.name}
                  </h2> */}
                  {/* {level.description && (
                    <p className="text-gray-600 mt-1">{level.description}</p>
                  )} */}
                </div>
              </div>

              {/* Level Progress (for members) */}
              {isLoggedIn && user?.role === 'member' && userProgress && (
                <div className="mb-6">
                  {(() => {
                    const levelProgress = userProgress.find(p => p.levelNumber === level.levelNumber);
                    if (levelProgress) {
                      return (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Level Progress</span>
                            <span className="text-sm text-gray-600">
                              {levelProgress.completedCourses}/{levelProgress.totalCourses} courses completed
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-600 to-green-600 h-2 rounded-full" 
                              style={{ width: `${levelProgress.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              {/* Courses Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${!isLevelAccessible ? 'opacity-50' : ''}`}>
                {coursesInLevel.map((course, index) => {
                  const isCompleted = course.isCompleted;
                  const isUnlocked = course.isUnlocked !== false; // Default to unlocked if not specified
                  const canClick = isLevelAccessible && (isUnlocked || !isLoggedIn || user?.role !== 'member');
                  
                  return (
                    <div 
                      key={course._id}
                      className={`group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                        canClick ? 'hover:shadow-xl cursor-pointer' : 'cursor-not-allowed'
                      }`}
                      onClick={() => handleCourseClick(course)}
                    >
                      {/* Course Image */}
                      <CourseCardImage course={course} isLocked={!isUnlocked && isLoggedIn && user?.role === 'member'} />
                      
                      {/* Course Content */}
                      <div className="p-6 relative">
                        {/* Status Badge */}
                        <CourseStatusBadge course={course} userProgress={userProgress} />
                        
                        {/* Course Title */}
                        <h3 className="font-bold text-lg text-gray-900 mb-2 pr-20">{course.title}</h3>
                        
                        {/* Course Description */}
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 h-16">{course.description}</p>
                        
                        {/* Course Progress (for members) */}
                        {isLoggedIn && user?.role === 'member' && (
                          <CourseProgressBar 
                            progress={userProgress?.find(p => p.courseId === course._id)} 
                          />
                        )}
                        
                        {/* Course Info Footer */}
                        <div className="pt-4 border-t text-sm font-medium text-gray-500 flex items-center justify-between">
                          <div className="flex items-center">
                            <BookOpen size={16} className="mr-2"/>
                            <span>{course.chapters?.length || 0} Chapters</span>
                          </div>
                          
                          {!isUnlocked && isLoggedIn && user?.role === 'member' && (
                            <span className="text-xs text-gray-400">Complete previous course to unlock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {courses.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
          <p className="text-gray-600">
            {isLoggedIn && user?.role === 'member' 
              ? "You don't have access to any courses yet." 
              : "There are no approved courses available at the moment."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;