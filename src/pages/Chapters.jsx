import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllChapters, clearError } from "../redux/features/chapters/chapterSlice";
import { BookOpen, Clock, AlertCircle } from "lucide-react";

const Chapters = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const { chapters, error } = useSelector((state) => state.chapters);

  useEffect(() => {
    if (courseId) {
      dispatch(getAllChapters(courseId));
    }
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, courseId]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Course Chapters
              </h1>
              <p className="text-gray-600">
                Browse all chapters included in this course
              </p>
            </div>
            <Link
              to={`/courses`}
              className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-colors duration-200"
            >
              Back to Courses
            </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chapter, index) => (
              <div
                key={chapter._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Header strip */}
                <div className="h-2 bg-gradient-to-r from-teal-600 to-green-600"></div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Chapter {index + 1}: {chapter.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {chapter.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-2" />
                      <span>
                        Duration: {chapter.duration ? `${chapter.duration} min` : "N/A"}
                      </span>
                    </div>
                    <Link
                      to={`/courses/${courseId}/chapters/${chapter._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors duration-200"
                    >
                      <BookOpen size={16} />
                      View Chapter
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No chapters yet
              </h3>
              <p className="text-gray-600">
                This course doesn’t have any chapters added yet.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Chapters;
