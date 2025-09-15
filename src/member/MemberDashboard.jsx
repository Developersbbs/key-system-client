import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyCourses, fetchUserProgress } from '../redux/features/coures/courseSlice';
import { BookOpen, PlayCircle, ChevronRight, CheckCircle, Award, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import apiClient from '../api/apiClient'; // Adjust path as needed

// Inactive User Message Component
const InactiveUserMessage = () => (
  <div className="w-full max-w-4xl mx-auto px-4 py-12">
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-900 mb-2">Account Inactive</h2>
      <p className="text-red-700 mb-4">
        Your account is currently inactive. You don't have access to the dashboard or courses at this time.
      </p>
      <p className="text-red-600 text-sm">
        Please contact an administrator to reactivate your account.
      </p>
    </div>
  </div>
);

const MemberDashboard = () => {
  const dispatch = useDispatch();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  const { user } = useSelector((state) => state.auth);
  const { courses, error, userProgress } = useSelector((state) => state.courses);

  // Check if user is active
  const isUserActive = user?.isActive !== false; // Default to true if not specified

  // Fetch quiz results with chapter names
  const fetchQuizResults = async () => {
    try {
      const response = await apiClient.get('/member/quiz-results');
      setQuizResults(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if user is active
    if (isUserActive) {
      // Fetch member-specific courses and user progress
      dispatch(fetchMyCourses());
      dispatch(fetchUserProgress());
      
      // Fetch quiz results with chapter names
      fetchQuizResults();
    } else {
      setLoading(false);
    }
  }, [dispatch, isUserActive]);

  // If user is inactive, show inactive message
  if (!isUserActive) {
    return <InactiveUserMessage />;
  }

  // Calculate overall statistics
  const stats = {
    totalCourses: courses?.length || 0,
    completedCourses: courses?.filter(course => course.isCompleted)?.length || 0,
    totalQuizzes: quizResults.length,
    averageScore: quizResults.length > 0 
      ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
      : 0
  };

  // Get next course to continue
  const nextCourse = courses?.find(course => course.isUnlocked && !course.isCompleted);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-2">
          Welcome back, {user?.name || 'Member'}!
        </h1>
        <p className="text-green-700">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Courses</p>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
            <BookOpen size={24} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats.completedCourses}</p>
            </div>
            <CheckCircle size={24} className="text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lime-100 text-sm">Quizzes Taken</p>
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            </div>
            <Award size={24} className="text-lime-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Avg. Score</p>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
            </div>
            <TrendingUp size={24} className="text-teal-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Continue Learning + Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning Section */}
          {nextCourse && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-md">
              <h2 className="text-2xl font-bold mb-2">Continue Learning</h2>
              <p className="text-green-100 mb-4">Pick up where you left off</p>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-1">{nextCourse.title}</h3>
                <p className="text-green-100 text-sm mb-3">
                  {nextCourse.chapters?.length || 0} chapters available
                </p>
                <Link 
                  to={`/courses/${nextCourse._id}`}
                  className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold py-2 px-4 rounded-lg hover:shadow-md transition hover:bg-green-50"
                >
                  <PlayCircle size={18} />
                  Continue Course
                </Link>
              </div>
            </div>
          )}

          {/* All Enrolled Courses */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-3">
              <BookOpen className="text-green-600" />
              My Learning Path
            </h2>

            {error ? (
              <p className="text-red-500">{error}</p>
            ) : courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map(course => {
                  const progress = userProgress?.find(p => p.courseId === course._id);
                  const isLocked = course.isUnlocked === false;
                  
                  return (
                    <div key={course._id} className={`p-4 rounded-lg border transition ${
                      isLocked 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-white border-green-100 hover:shadow-md hover:border-green-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                            {course.isCompleted && (
                              <CheckCircle size={16} className="text-green-600" />
                            )}
                            {isLocked && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {course.chapters?.length || 0} chapters
                          </p>
                          
                          {/* Progress Bar */}
                          {progress && !isLocked && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${progress.progressPercentage || 0}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        
                        {!isLocked ? (
                          <Link 
                            to={`/courses/${course._id}`}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition ml-4 shadow-md hover:shadow-lg"
                          >
                            {course.isCompleted ? (
                              <>
                                <CheckCircle size={18} />
                                Review
                              </>
                            ) : (
                              <>
                                <PlayCircle size={18} />
                                {progress && progress.completedChapters > 0 ? 'Continue' : 'Start'}
                              </>
                            )}
                          </Link>
                        ) : (
                          <span className="text-gray-400 font-medium py-2 px-4 ml-4">
                            Complete previous course
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">You don't have access to any courses yet.</p>
                <Link to="/courses" className="text-green-600 font-semibold flex items-center justify-center gap-1 hover:underline">
                  Browse Available Courses <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Recent Quiz Results */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-3">
              <Award className="text-green-600" />
              Recent Quiz Results
            </h2>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : quizResults && quizResults.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quizResults.slice(0, 10).map(result => (
                  <div key={`${result.chapterId}-${result.completedAt}`} className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition border border-green-100">
                    <Link 
                      to={`/courses/${result.courseId}/chapters/${result.chapterId}`} 
                      className="block"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-green-900 text-sm leading-tight flex-1 mr-2">
                          {result.chapterTitle}
                        </h4>
                        <span className={`font-bold text-lg flex-shrink-0 ${
                          result.score >= 70 ? 'text-green-600' : 
                          result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                      <p className="text-xs text-green-700 truncate mb-1">
                        {result.courseTitle}
                      </p>
                      {result.completedAt && (
                        <div className="flex items-center gap-1 text-xs text-green-500">
                          <Clock size={12} />
                          {new Date(result.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">
                  {courses && courses.length === 0 
                    ? "Start taking courses to see your quiz results here!" 
                    : "Complete some quizzes to see your results here."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;