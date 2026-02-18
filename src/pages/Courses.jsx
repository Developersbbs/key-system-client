import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyCourses, fetchApprovedCourses, fetchUserProgress } from '../redux/features/coures/courseSlice';
import { fetchAllLevels } from '../redux/features/level/levelSlice';
import { BookOpen, ImageIcon, Lock, CheckCircle, Star, Clock, AlertCircle, Search, Filter, ChevronDown, Trophy, Award, Target } from 'lucide-react';

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
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
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
      <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse border border-green-100">
        <div className="h-48 bg-green-100 rounded-lg mb-4"></div>
        <div className="h-6 bg-green-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-green-200 rounded w-full"></div>
        <div className="h-4 bg-green-200 rounded w-1/2 mt-1"></div>
      </div>
    ))}
  </div>
);

// Course Progress Bar Component
const CourseProgressBar = ({ progress }) => {
  if (!progress) return null;
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-green-700 mb-1">
        <span>Progress</span>
        <span>{progress.completedChapters}/{progress.totalChapters} chapters</span>
      </div>
      <div className="w-full bg-green-100 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300" 
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
      <div className="absolute top-3 right-3 flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold">
        <CheckCircle size={14} /> 
        Completed
      </div>
    );
  }
  
  if (!isUnlocked) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-1 text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
        <Lock size={14} /> 
        Locked
      </div>
    );
  }
  
  // Show progress if course is in progress
  const progress = userProgress?.find(p => p.courseId === course._id);
  if (progress && progress.completedChapters > 0 && !isCompleted) {
    return (
      <div className="absolute top-3 right-3 flex items-center gap-1 text-teal-600 bg-teal-100 px-3 py-1 rounded-full text-xs font-semibold">
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
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-900 mb-2">Account Inactive</h2>
      <p className="text-red-700 mb-4">
        Your account is currently inactive. You don't have access to courses at this time.
      </p>
      <p className="text-red-600 text-sm">
        Please contact an administrator to reactivate your account.
      </p>
    </div>ng
Testing

Sathish R
11:22 AM
￼
Attendance
￼
Sync
  </div>
);

// User Stats Component
const UserStats = ({ userProgress, courses }) => {
  if (!userProgress || userProgress.length === 0) return null;
  
  const totalCourses = courses.length;
  const completedCourses = userProgress.filter(p => p.progressPercentage === 100).length;
  const inProgressCourses = userProgress.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-green-100 mr-4">
            <Trophy className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900">{completedCourses}</p>
            <p className="text-green-700">Completed Courses</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-teal-100 mr-4">
            <Target className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900">{inProgressCourses}</p>
            <p className="text-green-700">In Progress</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-emerald-100 mr-4">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900">{totalCourses}</p>
            <p className="text-green-700">Total Courses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Courses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isLoggedIn } = useSelector(state => state.auth);
  const { courses, loading: coursesLoading, userProgress } = useSelector(state => state.courses);
  const { levels, loading: levelsLoading } = useSelector(state => state.levels);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || 
      levels.some(level => 
        level.levelNumber.toString() === levelFilter && 
        level.courses.some(levelCourse => {
          const courseId = typeof levelCourse === 'object' ? levelCourse._id : levelCourse;
          return courseId === course._id;
        })
      );
    
    let matchesStatus = true;
    if (statusFilter !== 'all' && userProgress) {
      const progress = userProgress.find(p => p.courseId === course._id);
      if (statusFilter === 'completed') {
        matchesStatus = progress && progress.progressPercentage === 100;
      } else if (statusFilter === 'in-progress') {
        matchesStatus = progress && progress.progressPercentage > 0 && progress.progressPercentage < 100;
      } else if (statusFilter === 'not-started') {
        matchesStatus = !progress || progress.progressPercentage === 0;
      }
    }
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

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
        <div className="h-10 bg-green-200 rounded-xl w-1/3 animate-pulse mb-8"></div>
        <CoursesSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              {isLoggedIn && user?.role === 'member' ? 'My Learning Journey' : 'Explore Our Courses'}
            </h1>
            {isLoggedIn && user?.role === 'member' ? (
              <p className="text-green-700">
                Continue your learning path and unlock new levels as you progress
              </p>
            ) : (
              <p className="text-green-700">
                Discover our curated collection of courses to expand your knowledge
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Stats (for members) */}
      {isLoggedIn && user?.role === 'member' && userProgress && (
        <UserStats userProgress={userProgress} courses={courses} />
      )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-green-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
              <select 
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-green-200 rounded-xl appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 bg-white"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level._id} value={level.levelNumber}>Level {level.levelNumber}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4 pointer-events-none" />
            </div>
            
            {isLoggedIn && user?.role === 'member' && (
              <div className="relative flex-grow md:flex-grow-0">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-4 pr-8 py-3 border border-green-200 rounded-xl appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="not-started">Not Started</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {levels.map(level => {
          // Check if level is accessible to user
          const isLevelAccessible = user ? user.accessibleLevels?.includes(level.levelNumber) : true;
          
          // Get courses in this level
          const coursesInLevel = filteredCourses.filter(course => 
            level.courses.some(levelCourse => {
              const courseId = typeof levelCourse === 'object' ? levelCourse._id : levelCourse;
              return courseId === course._id;
            })
          );
          const hasAssignedCourses = Array.isArray(level.courses) && level.courses.length > 0;
          const hasCoursesToDisplay = coursesInLevel.length > 0;

          return (
            <div key={level._id} className="relative">
              {/* Level Header */}
              <div className="flex items-center gap-4 mb-6">
                {!isLevelAccessible && <Lock className="text-green-400" size={28} />}
                <div>
                  <h2 className={`text-2xl font-bold ${isLevelAccessible ? 'text-green-900' : 'text-green-700'}`}>
                    Level {level.levelNumber}: {level.name}
                  </h2>
                  {level.description && (
                    <p className="text-green-700 mt-1">{level.description}</p>
                  )}
                </div>
              </div>

              {/* Level Progress (for members) */}
              {isLoggedIn && user?.role === 'member' && userProgress && (
                <div className="mb-6">
                  {(() => {
                    const levelProgress = userProgress.find(p => p.levelNumber === level.levelNumber);
                    if (levelProgress) {
                      return (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-green-700">Level Progress</span>
                            <span className="text-sm text-green-600">
                              {levelProgress.completedCourses}/{levelProgress.totalCourses} courses completed
                            </span>
                          </div>
                          <div className="w-full bg-green-100 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full" 
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

              {/* Courses Grid or Locked Message */}
              {hasCoursesToDisplay ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${!isLevelAccessible ? 'opacity-50' : ''}`}>
                  {coursesInLevel.map((course, index) => {
                    const isCompleted = course.isCompleted;
                    const isUnlocked = course.isUnlocked !== false; // Default to unlocked if not specified
                    const canClick = isLevelAccessible && (isUnlocked || !isLoggedIn || user?.role !== 'member');
                    
                    return (
                      <div 
                        key={course._id}
                        className={`group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 border border-green-100 ${
                          canClick ? 'hover:shadow-xl hover:border-green-300 cursor-pointer' : 'cursor-not-allowed'
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
                          <h3 className="font-bold text-lg text-green-900 mb-2 pr-20">{course.title}</h3>
                          
                          {/* Course Description */}
                          <p className="text-sm text-green-700 line-clamp-3 mb-4 h-16">{course.description}</p>
                          
                          {/* Course Progress (for members) */}
                          {isLoggedIn && user?.role === 'member' && (
                            <CourseProgressBar 
                              progress={userProgress?.find(p => p.courseId === course._id)} 
                            />
                          )}
                          
                          {/* Course Info Footer */}
                          <div className="pt-4 border-t border-green-100 text-sm font-medium text-green-600 flex items-center justify-between">
                            <div className="flex items-center">
                              <BookOpen size={16} className="mr-2"/>
                              <span>{course.chapters?.length || 0} Chapters</span>
                            </div>
                            
                            {!isUnlocked && isLoggedIn && user?.role === 'member' && (
                              <span className="text-xs text-green-500">Complete previous course to unlock</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-green-100 rounded-xl p-6 text-center text-green-700">
                  <div className="flex flex-col items-center gap-2">
                    <Lock size={28} className="text-green-500" />
                    <p className="font-semibold">
                      {!hasAssignedCourses
                        ? 'Courses will be added to this level soon.'
                        : isLevelAccessible
                          ? 'No courses are currently available for this level.'
                          : 'Complete previous levels to unlock these courses.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm p-8 border border-green-100">
          <BookOpen className="mx-auto h-16 w-16 text-green-300 mb-4" />
          <h3 className="text-lg font-medium text-green-900 mb-2">No courses found</h3>
          <p className="text-green-700 mb-4">
            {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
              ? "Try adjusting your search or filters to find more courses."
              : isLoggedIn && user?.role === 'member' 
                ? "You don't have access to any courses yet." 
                : "There are no approved courses available at the moment."
            }
          </p>
          {(searchTerm || levelFilter !== 'all' || statusFilter !== 'all') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setLevelFilter('all');
                setStatusFilter('all');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;