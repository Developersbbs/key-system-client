import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChapterById,
  submitMcqs,
  clearMcqResult,
  getCourseProgress,
} from "../redux/features/chapters/chapterSlice";
import {
  Video,
  FileText,
  Clock,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Play,
  Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

import VideoPlayer from "../components/VideoPlayer";
import apiClient from "../api/apiClient";

// ─── McqSection ────────────────────────────────────────────────────────────────
const McqSection = ({ chapter, user, courseId }) => {
  const dispatch = useDispatch();
  const { mcqSubmission, courseProgress } = useSelector((s) => s.chapters);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  // ✅ Fetch Process record for this chapter to get attempts count
  const [processAttempts, setProcessAttempts] = useState(null);
  useEffect(() => {
    apiClient.get("/api/process/user").then((res) => {
      const processes = res.data || [];
      const match = processes.find((p) => {
        const pid = p.chapterId?._id
          ? p.chapterId._id.toString()
          : p.chapterId?.toString?.();
        return pid === chapter._id?.toString();
      });
      setProcessAttempts(match?.attempts ?? null);
    }).catch(() => {});
  }, [chapter._id]);

  // After fresh submission, re-fetch to get updated attempts
  useEffect(() => {
    if (mcqSubmission.result) {
      apiClient.get("/api/process/user").then((res) => {
        const processes = res.data || [];
        const match = processes.find((p) => {
          const pid = p.chapterId?._id
            ? p.chapterId._id.toString()
            : p.chapterId?.toString?.();
          return pid === chapter._id?.toString();
        });
        setProcessAttempts(match?.attempts ?? null);
      }).catch(() => {});
    }
  }, [mcqSubmission.result, chapter._id]);

  // Read from getCourseProgress chaptersProgress
  // Fields: chapterId, isCompleted (any attempt), score, completedAt
  const chapterProgress = courseProgress?.chaptersProgress?.find((p) => {
    if (!p?.chapterId) return false;
    const pid =
      typeof p.chapterId === "object"
        ? p.chapterId._id?.toString?.() || p.chapterId.toString()
        : p.chapterId;
    return pid === chapter._id?.toString();
  });

  const isAttempted  = chapterProgress?.isCompleted === true;
  const savedScore   = chapterProgress?.score ?? null;
  const isCompleted  = savedScore === 100;

  const currentScore = results
    ? Math.round(Number(results.result?.score) || 0)
    : null;
  const isMcqPerfect = currentScore === 100;

  // Restore saved state on mount if previously attempted
  useEffect(() => {
    const existingResult = user?.mcqResults?.find(
      (r) => r.chapterId === chapter._id,
    );
    if (existingResult) {
      setAnswers(existingResult.userAnswers || {});
      setResults({
        result: existingResult,
        correctAnswers: chapter.mcqs.map((mcq) => ({
          mcqId: mcq._id,
          answer: mcq.correctAnswerIndex,
          explanation: mcq.explanation,
        })),
      });
    }
  }, [user, chapter]);

  // Handle fresh submission response
  useEffect(() => {
    if (mcqSubmission.result) {
      const { result: submissionResult, correctAnswers: submissionAnswers } =
        mcqSubmission.result;
      setResults({
        result: submissionResult,
        correctAnswers:
          submissionAnswers?.length > 0
            ? submissionAnswers
            : chapter.mcqs.map((mcq) => ({
                mcqId: mcq._id,
                answer: mcq.correctAnswerIndex,
                explanation: mcq.explanation,
              })),
      });
      toast.success("Quiz submitted successfully!");
    }
    if (mcqSubmission.error) toast.error(mcqSubmission.error);
  }, [mcqSubmission, chapter.mcqs]);

  const handleAnswerChange = (mcqId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [mcqId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < chapter.mcqs.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?"))
        return;
    }
    try {
      await dispatch(submitMcqs({ chapterId: chapter._id, answers })).unwrap();
      const effectiveCourseId = courseId || chapter.courseId;
      if (effectiveCourseId) dispatch(getCourseProgress(effectiveCourseId));
    } catch (err) {
      console.error("MCQ submission error:", err);
    }
  };

  const isSubmitted = !!results;

  return (
    <div className="mt-10">
      <h2 className="text-2xl sm:text-3xl font-bold border-b pb-4 mb-4 flex items-center gap-2">
        <HelpCircle size={28} />
        Test Your Knowledge
      </h2>

      {/* Prior attempt summary bar */}
      {isAttempted && (
        <div className="mb-6 bg-gradient-to-r from-teal-50 to-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm flex-wrap">
            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-green-600" />
              <span className="text-gray-600">
                Last Score:{" "}
                <span className="font-bold text-green-600">{savedScore}%</span>
              </span>
            </div>

            {/* ✅ Attempts count from Process model */}
            {processAttempts !== null && processAttempts > 0 && (
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <span>Attempts: {processAttempts}</span>
              </div>
            )}

            {/* Completion badge */}
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600 font-semibold sm:ml-auto">
                <CheckCircle size={15} />
                Chapter Completed
              </div>
            )}

            {/* Hint */}
            {!isCompleted && (
              <span className="text-xs text-green-600 font-medium sm:ml-auto">
                Score 100% to complete this chapter
              </span>
            )}
          </div>
        </div>
      )}

      {/* MCQ questions */}
      <div className="space-y-6">
        {chapter.mcqs.map((mcq, index) => {
          const correctOptionIndex = Number(
            results?.correctAnswers?.find((a) => a.mcqId === mcq._id)?.answer,
          );
          const selectedOptionIndex =
            answers[mcq._id] !== undefined ? Number(answers[mcq._id]) : null;

          return (
            <div key={mcq._id} className="bg-white p-5 sm:p-6 rounded-lg shadow-sm border">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded-full mr-2">
                  {index + 1}
                </span>
                {mcq.question}
              </h3>

              <div className="space-y-3">
                {mcq.options.map((option, idx) => {
                  const optionIndex = Number(idx);
                  const isCorrect = correctOptionIndex === optionIndex;
                  const isSelected = selectedOptionIndex === optionIndex;

                  let style = "border-gray-200";
                  if (isSubmitted) {
                    if (isCorrect) style = "bg-green-50 border-green-400";
                    else if (isSelected) style = "bg-red-50 border-red-400";
                  } else if (isSelected) {
                    style = "border-teal-500 bg-teal-50";
                  }

                  return (
                    <label
                      key={idx}
                      className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${style}`}
                    >
                      <input
                        type="radio"
                        name={`mcq-${mcq._id}`}
                        className="w-4 h-4 mr-3 text-teal-600 focus:ring-teal-500 flex-shrink-0"
                        disabled={isSubmitted}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(mcq._id, optionIndex)}
                      />
                      <span className="font-medium flex-shrink-0">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <span className="ml-2 text-sm sm:text-base">{option}</span>
                      {isSubmitted && isCorrect && (
                        <CheckCircle size={20} className="ml-auto flex-shrink-0 text-green-500" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle size={20} className="ml-auto flex-shrink-0 text-red-500" />
                      )}
                    </label>
                  );
                })}
              </div>

              {isSubmitted && mcq.explanation && (
                <div className="p-4 bg-gray-100 rounded-lg text-sm mt-4">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Play size={16} />
                    Explanation:
                  </h4>
                  <p className="text-gray-600 mt-1">{mcq.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0 || mcqSubmission.loading}
          className={`mt-8 w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg shadow hover:shadow-md transition text-lg flex items-center justify-center gap-2 ${
            Object.keys(answers).length === 0 || mcqSubmission.loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-teal-700 hover:to-green-700"
          }`}
        >
          <CheckCircle size={20} />
          {mcqSubmission.loading ? "Submitting..." : "Submit Quiz"}
        </button>
      )}

      {/* Result panel */}
      {isSubmitted && results.result && (
        <div className="mt-8 text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-800 flex items-center justify-center gap-2">
            <CheckCircle className="text-green-500" size={28} />
            Quiz Complete!
          </h3>

          {/* Score */}
          <p className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 my-4">
            {currentScore}%
            <span className="text-base sm:text-lg font-normal text-gray-500 block">Score</span>
          </p>

          {/* ✅ Attempts from Process model — always up to date after re-fetch */}
          {processAttempts !== null && processAttempts > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-green-700 font-semibold">
              <Trophy size={15} className="text-green-600" />
              <span>Total Attempts: {processAttempts}</span>
            </div>
          )}

          <p className="text-gray-600 mb-4">
            {currentScore >= 80
              ? "Excellent work!"
              : currentScore >= 60
              ? "Good job!"
              : "Keep learning and try again!"}
          </p>

          {/* ✅ FIXED: hide re-attempt when score is 100% */}
          {!isMcqPerfect && (
            <button
              onClick={() => {
                setResults(null);
                setAnswers({});
                dispatch(clearMcqResult());
              }}
              className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold px-5 py-3 rounded-lg shadow hover:shadow-md transition hover:from-purple-700 hover:to-indigo-700"
            >
              <Play size={18} />
              Re-Attempt Quiz
            </button>
          )}

          {/* Perfect score banner */}
          {isMcqPerfect && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 font-semibold px-5 py-3 rounded-lg">
              <Trophy size={18} />
              Perfect Score! Chapter Complete 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Chapter page ─────────────────────────────────────────────────────────
const Chapter = () => {
  const { courseId, chapterId } = useParams();
  const dispatch = useDispatch();
  const { selectedChapter: chapter, loading, error } = useSelector(
    (s) => s.chapters,
  );
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (courseId && chapterId) {
      dispatch(fetchChapterById({ courseId, chapterId }))
        .unwrap()
        .catch((err) => console.error("Error fetching chapter:", err));
    }
    return () => { dispatch(clearMcqResult()); };
  }, [dispatch, courseId, chapterId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chapter Not Found</h2>
          <p className="text-gray-600 mb-6">Sorry, we couldn't load the chapter details.</p>
          <p className="text-red-500 bg-red-50 p-3 rounded-lg inline-block mb-6">
            {error || "The requested chapter does not exist or you do not have access."}
          </p>
          <Link
            to={`/courses/${courseId}`}
            className="inline-flex items-center px-5 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-sm"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <nav className="mb-6 text-sm text-gray-600">
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 hover:text-teal-600 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back to Chapters
        </Link>
      </nav>

      <div className="bg-white p-5 sm:p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">{chapter.title}</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-2">{chapter.description}</p>
          </div>
          <div className="flex items-center text-gray-500 bg-gray-100 px-4 py-2 rounded-lg self-start">
            <Clock size={18} className="mr-2" />
            <span className="font-medium">{chapter.duration || "N/A"} min</span>
          </div>
        </div>

        {/* Video */}
        {chapter.videoUrl && (
          <div className="my-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Video size={24} className="text-teal-600" />
              Chapter Video
            </h2>
            <VideoPlayer
              videoUrl={chapter.videoUrl}
              chapterId={chapter._id}
              courseId={courseId}
            />
          </div>
        )}

        {/* Document */}
        {chapter.documentUrl && (
          <div className="my-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Chapter Resources
            </h2>
            <a
              href={chapter.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-sm hover:shadow transition-all duration-200"
            >
              <FileText size={18} />
              Download Document
            </a>
          </div>
        )}

        {/* MCQ */}
        {chapter.mcqs && chapter.mcqs.length > 0 && (
          <McqSection chapter={chapter} user={user} courseId={courseId} />
        )}

        {/* Tasks */}
        {chapter.tasks && chapter.tasks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold border-b pb-4 mb-4 flex items-center gap-2">
              <CheckCircle size={28} />
              Your Tasks
            </h2>
            <div className="space-y-4">
              {chapter.tasks.map((task, index) => (
                <div
                  key={task._id || index}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start">
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full mr-3 mt-1 flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {task.title}
                      </h3>
                      <p className="text-gray-700 mt-2 text-sm sm:text-base">
                        {task.description}
                      </p>
                      {task.deadline && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <Clock size={14} className="mr-1 flex-shrink-0" />
                          Deadline: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <span
                        className={`inline-block mt-3 text-xs font-semibold px-2 py-1 rounded-full ${
                          task.type === "online"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {task.type === "online" ? "Online Task" : "Offline Task"}
                      </span>
                    </div>
                  </div>
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