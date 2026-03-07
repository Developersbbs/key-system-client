import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyCourses, fetchUserProgress } from '../redux/features/coures/courseSlice';
import {
  BookOpen, PlayCircle, ChevronRight, CheckCircle, Award, Clock,
  TrendingUp, AlertCircle, UserCircle, ArrowRight, Sparkles
} from 'lucide-react';
import apiClient from '../api/apiClient';
import PaymentModal from '../components/PaymentModal';

/* ─── Profile completion helpers (mirrors Profile.jsx) ─────────────── */
const COMPLETION_FIELDS = [
  { key: 'name',                    label: 'Full Name' },
  { key: 'phoneNumber',             label: 'Phone' },
  { key: 'profileDetails.gender',   label: 'Gender' },
  { key: 'profileDetails.dob',      label: 'Date of Birth' },
  { key: 'profileDetails.state',    label: 'State' },
  { key: 'profileDetails.district', label: 'District' },
  { key: 'profileDetails.address',  label: 'Address' },
];

const WEIGHTS = { name: 20, phoneNumber: 15, 'profileDetails.gender': 10, 'profileDetails.dob': 10, 'profileDetails.state': 15, 'profileDetails.district': 15, 'profileDetails.address': 15 };

const getNestedValue = (obj, key) => {
  if (!obj) return '';
  if (key.includes('.')) { const [p, c] = key.split('.'); return obj[p]?.[c] ?? ''; }
  return obj[key] ?? '';
};

const calcCompletion = (user) => {
  if (!user) return 0;
  let score = 0;
  COMPLETION_FIELDS.forEach(({ key }) => {
    const val = getNestedValue(user, key);
    if (val && String(val).trim() !== '') score += WEIGHTS[key] || 0;
  });
  return Math.min(score, 100);
};

/* ─── Profile Completion Banner ─────────────────────────────────────── */
const ProfileCompletionBanner = ({ user }) => {
  const pct = calcCompletion(user);
  if (pct >= 100) return null; // fully complete — hide entirely

  const missing = COMPLETION_FIELDS.filter(({ key }) => {
    const val = getNestedValue(user, key);
    return !val || String(val).trim() === '';
  });

  const isLow = pct < 40;
  const isMid = pct >= 40 && pct < 70;

  // Color scheme that fits the green dashboard
  const scheme = isLow
    ? { bg: 'from-red-50 to-orange-50', border: 'border-red-200', bar: 'bg-red-400', pill: 'bg-red-100 text-red-700', text: 'text-red-700', btn: 'bg-red-500 hover:bg-red-600', label: 'text-red-600', pctColor: 'text-red-500' }
    : isMid
    ? { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', bar: 'bg-amber-400', pill: 'bg-amber-100 text-amber-700', text: 'text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600', label: 'text-amber-600', pctColor: 'text-amber-500' }
    : { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', bar: 'bg-emerald-400', pill: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', label: 'text-emerald-600', pctColor: 'text-emerald-600' };

  return (
    <div className={`bg-gradient-to-r ${scheme.bg} border ${scheme.border} rounded-2xl p-5 mb-8 shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Left: icon + text */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar / icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-white">
            {user?.imageUrl
              ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              : <UserCircle size={28} className={scheme.pctColor} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-bold text-gray-800">Complete your profile</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scheme.pill}`}>
                {pct}% done
              </span>
            </div>
            <p className={`text-xs ${scheme.label} mb-3`}>
              {missing.length} field{missing.length !== 1 ? 's' : ''} missing —&nbsp;
              {isLow ? 'complete your profile to get full benefits' : isMid ? "you're halfway there, keep going!" : 'almost done, just a few more fields!'}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-white/70 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${scheme.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Missing field chips */}
            <div className="flex flex-wrap gap-1.5">
              {missing.map(({ label }) => (
                <span key={label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/60 ${scheme.text} border-current/20`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: CTA button */}
        <div className="flex-shrink-0 sm:self-center">
          <Link
            to="/profile"
            className={`inline-flex items-center gap-2 px-5 py-2.5 ${scheme.btn} text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap`}
          >
            <Sparkles size={14} />
            Complete Profile
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Inactive User Message Component (unchanged)
const InactiveUserMessage = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await apiClient.get('/subscriptions/my-subscription');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchSubscriptionStatus();
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const isPending = subscription?.status === 'pending';
  const isRejected = subscription?.status === 'rejected';

  let title = "Account Inactive";
  let titleColor = "text-red-900";
  let iconColor = "text-red-500";
  let bgColor = "from-red-50 to-orange-50 border-red-200";

  if (isPending) {
    title = "Payment Under Review";
    titleColor = "text-blue-900";
    iconColor = "text-blue-500";
    bgColor = "from-blue-50 to-indigo-50 border-blue-200";
  } else if (isRejected) {
    title = "Payment Verification Failed";
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className={`bg-gradient-to-br ${bgColor} border-2 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden transition-all duration-300`}>
        {isPending ? (
          <Clock size={56} className={`mx-auto ${iconColor} mb-4`} />
        ) : (
          <AlertCircle size={56} className={`mx-auto ${iconColor} mb-4`} />
        )}
        <h2 className={`text-3xl font-bold ${titleColor} mb-3`}>{title}</h2>
        {isPending ? (
          <div className="mb-8">
            <p className="text-blue-700 text-lg mb-2">Your payment is being verified by our admin team. This usually takes up to 24 hours.</p>
            <p className="text-blue-600">You'll be notified once your account is activated.</p>
          </div>
        ) : isRejected ? (
          <div className="mb-8">
            <p className="text-red-700 text-lg mb-2">{subscription.rejectionReason || 'Your payment could not be verified.'}</p>
            <p className="text-red-600">Please try again with a clear payment screenshot or contact support.</p>
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-red-700 text-lg mb-2">Your account is currently inactive. You don't have access to the dashboard or courses at this time.</p>
            <p className="text-red-600">Subscribe now to reactivate your account and get full access!</p>
          </div>
        )}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-md mx-auto shadow-sm border border-white/50">
          <h3 className="font-bold text-gray-900 mb-4">What you'll get:</h3>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500 flex-shrink-0" /><span className="font-medium">Access to all courses and materials</span></li>
            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500 flex-shrink-0" /><span className="font-medium">Interactive quizzes and assessments</span></li>
            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500 flex-shrink-0" /><span className="font-medium">Progress tracking and certificates</span></li>
            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-emerald-500 flex-shrink-0" /><span className="font-medium">1 year of unlimited learning</span></li>
          </ul>
        </div>
        {isPending ? (
          <div>
            <button onClick={fetchSubscriptionStatus} className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">Refresh Status</button>
            <p className="text-sm text-blue-600/80 mt-4">Hang tight while we verify your transaction</p>
          </div>
        ) : (
          <div>
            <button onClick={() => setShowPaymentModal(true)} className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xl font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl">
              {isRejected ? 'Try Subscribing Again' : 'Subscribe for 10 USDT/year'}
            </button>
            <p className="text-sm text-gray-600 mt-4">Instant activation after payment verification</p>
          </div>
        )}
      </div>
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />
    </div>
  );
};

const MemberDashboard = () => {
  const dispatch = useDispatch();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const { courses, error, userProgress } = useSelector((state) => state.courses);

  const isUserActive = user?.isActive !== false;

  const fetchQuizResults = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      const response = await Promise.race([
        apiClient.get('/member/quiz-results'),
        timeoutPromise
      ]);
      setQuizResults(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz results:', error);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserActive) {
      dispatch(fetchMyCourses());
      dispatch(fetchUserProgress());
      fetchQuizResults();
    } else {
      setLoading(false);
    }
  }, [dispatch, isUserActive]);

  if (!isUserActive) {
    return <InactiveUserMessage />;
  }

  const stats = {
    totalCourses: courses?.length || 0,
    completedCourses: courses?.filter(course => course.isCompleted)?.length || 0,
    totalQuizzes: quizResults.length,
    averageScore: quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
      : 0
  };

  const nextCourse = courses?.find(course => course.isUnlocked && !course.isCompleted);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">

      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-green-900 mb-2">
          Welcome back, {user?.name || 'Member'}!
        </h1>
        <p className="text-green-700">Ready to continue your learning journey?</p>
      </div>

      {/* ── Profile Completion Banner (auto-hides at 100%) ── */}
      <ProfileCompletionBanner user={user} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {nextCourse && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-md">
              <h2 className="text-2xl font-bold mb-2">Continue Learning</h2>
              <p className="text-green-100 mb-4">Pick up where you left off</p>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-1">{nextCourse.title}</h3>
                <p className="text-green-100 text-sm mb-3">{nextCourse.chapters?.length || 0} chapters available</p>
                <Link to={`/courses/${nextCourse._id}`} className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold py-2 px-4 rounded-lg hover:shadow-md transition hover:bg-green-50">
                  <PlayCircle size={18} />
                  Continue Course
                </Link>
              </div>
            </div>
          )}

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
                    <div key={course._id} className={`p-4 rounded-lg border transition ${isLocked ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-green-100 hover:shadow-md hover:border-green-300'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                            {course.isCompleted && <CheckCircle size={16} className="text-green-600" />}
                            {isLocked && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Locked</span>}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{course.chapters?.length || 0} chapters</p>
                          {progress && !isLocked && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress.progressPercentage || 0}%` }}></div>
                            </div>
                          )}
                        </div>
                        {!isLocked ? (
                          <Link to={`/courses/${course._id}`} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition ml-4 shadow-md hover:shadow-lg">
                            {course.isCompleted ? <><CheckCircle size={18} />Review</> : <><PlayCircle size={18} />{progress && progress.completedChapters > 0 ? 'Continue' : 'Start'}</>}
                          </Link>
                        ) : (
                          <span className="text-gray-400 font-medium py-2 px-4 ml-4 text-sm">Complete previous course</span>
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

        {/* Sidebar */}
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
                    <Link to={`/courses/${result.courseId}/chapters/${result.chapterId}`} className="block">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-green-900 text-sm leading-tight flex-1 mr-2">{result.chapterTitle}</h4>
                        <span className={`font-bold text-lg flex-shrink-0 ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{result.score}%</span>
                      </div>
                      <p className="text-xs text-green-700 truncate mb-1">{result.courseTitle}</p>
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
                  {courses && courses.length === 0 ? "Start taking courses to see your quiz results here!" : "Complete some quizzes to see your results here."}
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