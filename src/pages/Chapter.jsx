import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChapterById, submitMcqs } from '../redux/features/chapters/chapterSlice';
import { Video, FileText, Clock, HelpCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper component to safely embed YouTube videos
const YouTubeEmbed = ({ url }) => {
  try {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    if (!videoId) return <p className="text-red-500">Invalid YouTube URL.</p>;
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
        <iframe src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
      </div>
    );
  } catch (error) {
    return <p className="text-red-500">Invalid video URL format.</p>;
  }
};

// Helper component for the entire interactive MCQ section
const McqSection = ({ chapter, user }) => {
  const dispatch = useDispatch();
  
  const initialData = useMemo(() => {
    const existingResult = user?.mcqResults?.find(r => r.chapterId === chapter._id);
    if (existingResult) {
      return {
        // ✅ FIXED: The userAnswers object is already in the correct format.
        // We just use it directly and provide a fallback to an empty object.
        answers: existingResult.userAnswers || {},
        results: {
          result: existingResult,
          correctAnswers: chapter.mcqs.map(mcq => ({
            mcqId: mcq._id,
            answer: mcq.correctAnswerIndex,
            explanation: mcq.explanation,
          })),
        }
      };
    }
    return { answers: {}, results: null }; // Default for a new quiz
  }, [user, chapter]);

  const [answers, setAnswers] = useState(initialData.answers);
  const [results, setResults] = useState(initialData.results);
  
  const handleAnswerChange = (mcqId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [mcqId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < chapter.mcqs.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
    }
    try {
      const response = await dispatch(submitMcqs({ chapterId: chapter._id, answers })).unwrap();
      setResults(response);
      toast.success(`Quiz submitted! You scored ${response.result.score}%`);
    } catch (err) {
      toast.error(err || "Failed to submit answers.");
    }
  };

  const isSubmitted = !!results;

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold border-b pb-4 mb-4">📝 Test Your Knowledge</h2>
      <div className="space-y-6">
        {chapter.mcqs.map(mcq => {
          const correctOptionIndex = results?.correctAnswers.find(a => a.mcqId === mcq._id)?.answer;
          const selectedOptionIndex = answers[mcq._id];
          
          return (
            <div key={mcq._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{mcq.question}</h3>
              <div className="space-y-3">
                {mcq.options.map((option, index) => {
                  const isCorrect = correctOptionIndex === index;
                  const isSelected = selectedOptionIndex === index;
                  
                  return (
                    <label key={index} className={`flex items-center p-3 rounded-lg border-2 transition-all ${isSubmitted ? '' : 'cursor-pointer'} ${
                        isSubmitted && isCorrect ? 'bg-green-50 border-green-400' :
                        isSubmitted && isSelected ? 'bg-red-50 border-red-400' :
                        'hover:bg-gray-50 border-gray-200'
                      }`}>
                      <input type="radio" name={`mcq-${mcq._id}`} className="w-4 h-4 mr-3"
                        disabled={isSubmitted}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(mcq._id, index)}
                      />
                      {option}
                      {isSubmitted && isCorrect && <CheckCircle size={20} className="ml-auto text-green-500"/>}
                      {isSubmitted && isSelected && !isCorrect && <XCircle size={20} className="ml-auto text-red-500"/>}
                    </label>
                  );
                })}
              </div>
              {isSubmitted && (
                <div className="p-4 bg-gray-100 rounded-lg text-sm mt-4">
                  <h4 className="font-bold text-gray-800">Explanation:</h4>
                  <p className="text-gray-600 mt-1">{mcq.explanation || 'No explanation provided.'}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!isSubmitted && (
        <button onClick={handleSubmit} className="mt-8 w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-semibold py-3 rounded-lg shadow hover:shadow-md transition text-lg">
          Submit Quiz
        </button>
      )}
      {isSubmitted && (
         <div className="mt-8 text-center p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
           <h3 className="text-2xl font-bold text-blue-800">Quiz Complete!</h3>
           <p className="text-4xl font-bold text-blue-600 my-2">{results.result.score}%</p>
           <p className="text-gray-600">Your score has been saved to your dashboard.</p>
         </div>
      )}
    </div>
  );
};

const Chapter = () => {
  const { courseId, chapterId } = useParams();
  const dispatch = useDispatch();
  const { selectedChapter: chapter, loading, error } = useSelector((state) => state.chapters);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (courseId && chapterId) {
      dispatch(fetchChapterById({ courseId, chapterId }));
    }
  }, [dispatch, courseId, chapterId]);


  

  if (error || !chapter) {
    return <div className="text-center p-10 text-red-500 bg-red-50 rounded-lg">Error: {error || 'Chapter not found.'}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50">
      <nav className="mb-6 text-sm text-gray-600">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 hover:text-blue-600">
          <ArrowLeft size={16} />
          Back to Chapters
        </Link>
      </nav>
      
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        {/* Chapter Header, Video, Document, and Tasks sections */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{chapter.title}</h1>
        <p className="text-lg text-gray-600 mt-2">{chapter.description}</p>
        <div className="flex items-center text-gray-500 mt-4 border-t pt-4">
          <Clock size={16} className="mr-2"/>
          <span>Duration: {chapter.duration || 'N/A'} minutes</span>
        </div>
        {chapter.videoUrl && (<div className="my-8"><YouTubeEmbed url={chapter.videoUrl} /></div>)}
        {chapter.documentUrl && (<a href={chapter.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg my-6 hover:bg-blue-200 font-semibold"><FileText size={18}/> Download Document</a>)}
        
        {/* Pass the user object to the McqSection */}
        {chapter.mcqs && chapter.mcqs.length > 0 && <McqSection chapter={chapter} user={user} />}

        {chapter.tasks && chapter.tasks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold border-b pb-4 mb-4">✅ Your Tasks</h2>
            <div className="space-y-4">
              {chapter.tasks.map(task => (
                <div key={task._id} className="bg-gray-50 p-5 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                  <p className="text-gray-700 mt-2">{task.description}</p>
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