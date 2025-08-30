import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyCourses } from '../redux/features/coures/courseSlice';
import { BookOpen, PlayCircle, ChevronRight, CheckCircle } from 'lucide-react';

const MemberDashboard = () => {
  const dispatch = useDispatch();

  // --- Data Fetching ---
  const { user } = useSelector((state) => state.auth);
  // The 'courses' state will hold member-specific courses
  const { courses, error } = useSelector((state) => state.courses);

  useEffect(() => {
    // This thunk fetches only the courses the logged-in member has access to
    dispatch(fetchMyCourses());
  }, [dispatch]);
  
  // This logic finds the chapter titles for the quiz results and filters out deleted chapters
  const quizResultsWithTitles = useMemo(() => {
    if (!user?.mcqResults || !courses || courses.length === 0) return [];
    
    // Create a quick lookup map of all chapters from the user's current courses
    const chapterMap = new Map();
    courses.forEach(course => {
      if (course.chapters && course.chapters.length > 0) {
        course.chapters.forEach(chapter => {
          chapterMap.set(chapter._id.toString(), { 
            chapterTitle: chapter.title,
            courseId: course._id,
            courseTitle: course.title
          });
        });
      }
    });

    // Filter and map quiz results to only include existing chapters
    return user.mcqResults
      .filter(result => {
        // Only include results for chapters that still exist
        return chapterMap.has(result.chapterId.toString());
      })
      .map(result => {
        const chapterDetails = chapterMap.get(result.chapterId.toString());
        return {
          ...result,
          title: chapterDetails.chapterTitle,
          courseId: chapterDetails.courseId,
          courseTitle: chapterDetails.courseTitle
        };
      })
      .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)); // Sort by most recent
  }, [user, courses]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.name || 'Member'}!</h1>
        <p className="text-gray-600 mt-2">Ready to continue your learning journey?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Enrolled Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <BookOpen className="text-blue-600" />
              My Enrolled Courses
            </h2>

            {error ? (
              <p className="text-red-500">{error}</p>
            ) : courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map(course => (
                  <div key={course._id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center transition hover:shadow-md">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.chapters?.length || 0} chapters</p>
                    </div>
                    <Link 
                      to={`/courses/${course._id}`}
                      className="bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
                    >
                      <PlayCircle size={18} />
                      Start Learning
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
                <Link to="/courses" className="text-blue-600 font-semibold flex items-center justify-center gap-1 hover:underline">
                  Browse Available Courses <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Quiz Results */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle className="text-green-600" />
              Quiz Results
            </h2>
            {quizResultsWithTitles && quizResultsWithTitles.length > 0 ? (
              <div className="space-y-3">
                {quizResultsWithTitles.map(result => (
                  <div key={result.chapterId} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <Link 
                      to={`/courses/${result.courseId}/chapters/${result.chapterId}`} 
                      className="block"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight">
                          {result.title}
                        </h4>
                        <span className={`font-bold text-lg ml-2 flex-shrink-0 ${
                          result.score >= 50 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.score}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {result.courseTitle}
                      </p>
                      {result.completedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {courses.length === 0 
                  ? "Enroll in courses to start taking quizzes!" 
                  : "You haven't completed any quizzes yet."
                }
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;