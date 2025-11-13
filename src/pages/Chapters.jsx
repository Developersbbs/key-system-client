import React, { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllChapters, clearError, getCourseProgress } from "../redux/features/chapters/chapterSlice";
import { BookOpen, Clock, AlertCircle, ArrowLeft, BookText, BarChart3, Users, Calendar } from "lucide-react";

const Chapters = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { chapters, error, courseProgress } = useSelector((state) => state.chapters);
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  const canFetchProgress = isLoggedIn && user?.role === "member";

  useEffect(() => {
    if (courseId) {
      dispatch(getAllChapters(courseId));
      if (canFetchProgress) {
        dispatch(getCourseProgress(courseId));
      }
    }
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, courseId, canFetchProgress]);

  const progressData = useMemo(() => {
    if (!canFetchProgress) return null;
    if (!courseProgress) return null;
    return courseProgress.courseId === courseId ? courseProgress : null;
  }, [canFetchProgress, courseProgress, courseId]);

  const stats = useMemo(() => {
    const totalChapters = chapters?.length || 0;
    const totalDuration = chapters?.reduce((sum, chapter) => sum + (chapter.duration || 0), 0) || 0;
    const completedChapters = progressData?.completedChapters || 0;

    return {
      totalChapters,
      totalDuration,
      completedChapters,
      enrolledStudents: 42, // Placeholder until enrollment data is available
    };
  }, [chapters, progressData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <BookText className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Course Chapters
                </h1>
              </div>
              <p className="text-gray-600 ml-11">
                Browse all chapters included in this course
              </p>
            </div>
            <Link
              to={`/courses`}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Back to Courses
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-green-50 flex items-center">
            <div className="p-3 bg-green-100 rounded-xl mr-4">
              <BookText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalChapters}</h3>
              <p className="text-sm text-gray-500">Total Chapters</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-md border border-green-50 flex items-center">
            <div className="p-3 bg-teal-100 rounded-xl mr-4">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalDuration}</h3>
              <p className="text-sm text-gray-500">Total Minutes</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-md border border-green-50 flex items-center">
            <div className="p-3 bg-amber-100 rounded-xl mr-4">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.completedChapters}/{stats.totalChapters}</h3>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-md border border-green-50 flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.enrolledStudents}</h3>
              <p className="text-sm text-gray-500">Enrolled</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Chapters Grid */}
        { chapters && chapters.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={16} className="mr-1" />
                <span>Last updated: Today</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter._id}
                  className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-green-100"
                >
                  {/* Header strip */}
                  <div className="h-2 bg-gradient-to-r from-teal-500 to-green-500"></div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Chapter {index + 1}
                      </span>
                      <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <Clock size={12} className="mr-1" />
                        {chapter.duration ? `${chapter.duration} min` : "N/A"}
                      </span>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {chapter.title}
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {chapter.description}
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-green-50">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                          {(() => {
                            const chapterProgress = progressData?.chaptersProgress?.find((progress) => {
                              if (!progress?.chapterId) return false;
                              const progressId =
                                typeof progress.chapterId === "object" ? progress.chapterId.toString() : progress.chapterId;
                              return progressId === chapter._id;
                            });

                            const completionPercentage = (() => {
                              if (!chapterProgress) return 0;
                              if (typeof chapterProgress.progressPercentage === "number") {
                                return Math.min(100, Math.max(0, Math.round(chapterProgress.progressPercentage)));
                              }
                              return chapterProgress.isCompleted ? 100 : 0;
                            })();

                            const width = `${completionPercentage}%`;

                            return (
                              <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width }}
                              ></div>
                            );
                          })()}
                        </div>
                        {(() => {
                          const chapterProgress = progressData?.chaptersProgress?.find((progress) => {
                            if (!progress?.chapterId) return false;
                            const progressId =
                              typeof progress.chapterId === "object" ? progress.chapterId.toString() : progress.chapterId;
                            return progressId === chapter._id;
                          });

                          const completionPercentage = (() => {
                            if (!chapterProgress) return 0;
                            if (typeof chapterProgress.progressPercentage === "number") {
                              return Math.min(100, Math.max(0, Math.round(chapterProgress.progressPercentage)));
                            }
                            return chapterProgress.isCompleted ? 100 : 0;
                          })();

                          return <span>{completionPercentage}% completed</span>;
                        })()}
                      </div>
                      <Link
                        to={`/courses/${courseId}/chapters/${chapter._id}`}
                        className="text-white bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <BookOpen size={14} />
                        Study Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-green-100">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No chapters yet
            </h3>
            <p className="text-gray-600 mb-6">
              This course doesn't have any chapters added yet.
            </p>
            <button className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              Add First Chapter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapters;