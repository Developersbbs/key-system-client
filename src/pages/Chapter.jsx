import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchChapterById } from "../redux/features/chapters/chapterSlice";
import {
  Video,
  FileText,
  Clock,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

/* ✅ YouTube Embed */
const YouTubeEmbed = ({ url }) => {
  try {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[7].length === 11 ? match[7] : null;

    if (!videoId) {
      return <p className="text-red-500">Invalid YouTube URL provided.</p>;
    }

    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    );
  } catch (error) {
    return <p className="text-red-500">Invalid video URL format.</p>;
  }
};

/* ✅ MCQ Item */
const McqItem = ({ mcq }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
        <HelpCircle size={20} className="text-blue-500" />
        {mcq.question}
      </h3>
      <div className="space-y-3 my-4">
        {mcq.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
              isSubmitted && mcq.correctAnswerIndex === index
                ? "bg-green-50 border-green-400"
                : isSubmitted && selectedAnswer === index
                ? "bg-red-50 border-red-400"
                : "hover:bg-gray-50 border-gray-200"
            }`}
          >
            <input
              type="radio"
              name={`mcq-${mcq._id}`}
              className="w-4 h-4 mr-3 accent-blue-600"
              disabled={isSubmitted}
              onChange={() => setSelectedAnswer(index)}
            />
            {option}
            {isSubmitted && mcq.correctAnswerIndex === index && (
              <CheckCircle size={20} className="ml-auto text-green-500" />
            )}
            {isSubmitted &&
              selectedAnswer === index &&
              mcq.correctAnswerIndex !== index && (
                <XCircle size={20} className="ml-auto text-red-500" />
              )}
          </label>
        ))}
      </div>
      {!isSubmitted ? (
        <button
          onClick={handleAnswerSubmit}
          className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition"
        >
          Submit Answer
        </button>
      ) : (
        <div className="p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-bold text-gray-800">Explanation:</h4>
          <p className="text-gray-600 mt-1">
            {mcq.explanation || "No explanation provided."}
          </p>
        </div>
      )}
    </div>
  );
};

/* ✅ Main Component */
const Chapter = () => {
  const { courseId, chapterId } = useParams();
  const dispatch = useDispatch();
  const { selectedChapter: chapter, error } = useSelector(
    (state) => state.chapters
  );

  useEffect(() => {
    if (courseId && chapterId) {
      dispatch(fetchChapterById({ courseId, chapterId }));
    }
  }, [dispatch, courseId, chapterId]);

  if (error || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-2">
          ❌ {error || "Chapter not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-teal-600 to-green-600"></div>
          <div className="p-6 sm:p-8">
            <nav className="mb-4">
              <Link
                to={`/courses/${courseId}`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
              >
                <ArrowLeft size={16} />
                Back to Chapters
              </Link>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {chapter.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{chapter.description}</p>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock size={16} className="mr-2" />
              <span>Duration: {chapter.duration || "N/A"} minutes</span>
            </div>
          </div>
        </div>

        {/* Video Section */}
        {chapter.videoUrl && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Video size={20} className="text-teal-600" /> Lesson Video
            </h2>
            <YouTubeEmbed url={chapter.videoUrl} />
          </div>
        )}

        {/* Document Section */}
        {chapter.documentUrl && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-800 font-medium">
              <FileText size={22} className="text-blue-600" />
              Chapter Document
            </div>
            <a
              href={chapter.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition"
            >
              Download
            </a>
          </div>
        )}

        {/* MCQs Section */}
        {chapter.mcqs && chapter.mcqs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold border-b pb-2 mb-6">
              📝 Test Your Knowledge
            </h2>
            <div className="space-y-6">
              {chapter.mcqs.map((mcq) => (
                <McqItem key={mcq._id} mcq={mcq} />
              ))}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {chapter.tasks && chapter.tasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold border-b pb-2 mb-6">
              ✅ Your Tasks
            </h2>
            <div className="space-y-4">
              {chapter.tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-50 p-5 rounded-lg border shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                    {task.title}
                    <span className="text-sm font-medium text-teal-600 bg-purple-100 px-2 py-1 rounded-full">
                      {task.type}
                    </span>
                  </h3>
                  <p className="text-gray-700 mt-2">{task.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Deadline:{" "}
                    {new Date(task.deadline).toLocaleDateString("en-GB")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapter;
