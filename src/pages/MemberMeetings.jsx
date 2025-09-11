import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMeetings } from '../redux/features/meetings/meetingSlice';
import { Calendar, Video, User, Clock, Users, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isThisWeek, isThisMonth, isAfter } from 'date-fns';

const MeetingStatsCard = ({ title, count, icon, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-5 text-white shadow-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{count}</h3>
      </div>
      <div className="bg-white/20 p-2 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const MemberMeetings = () => {
  const dispatch = useDispatch();
  
  // Redux state selectors
  const { meetings, loading, error } = useSelector(state => state.meetings);
  const { user } = useSelector(state => state.auth); // Assuming you have auth state with current user
  
  // State for filtered meetings
  const [memberMeetings, setMemberMeetings] = useState([]);

  // ✅ Fetch all meetings when component mounts
  useEffect(() => {
    dispatch(fetchAllMeetings());
  }, [dispatch]);

  // ✅ Filter meetings where current user is a participant
  useEffect(() => {
    if (user && meetings.length > 0) {
      const filteredMeetings = meetings.filter(meeting => 
        meeting.participants?.some(participant => 
          participant._id === user._id || participant === user._id
        )
      );
      setMemberMeetings(filteredMeetings);
    }
  }, [meetings, user]);

  // ✅ Handle Google Auth redirect success/error messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      toast.success("Google Account connected successfully!");
    } else if (params.get('auth') === 'error') {
      toast.error("Failed to connect Google Account.");
    }
    // Clean the URL after checking
    if (params.has('auth')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Get upcoming and past meetings
  const now = new Date();
  const upcomingMeetings = memberMeetings.filter(meeting => new Date(meeting.meetingDate) >= now);
  const pastMeetings = memberMeetings.filter(meeting => new Date(meeting.meetingDate) < now);

  // Calculate meeting statistics
  const todayMeetings = memberMeetings.filter(meeting => 
    isToday(new Date(meeting.meetingDate)) && new Date(meeting.meetingDate) >= now
  ).length;
  
  const weekMeetings = memberMeetings.filter(meeting => 
    isThisWeek(new Date(meeting.meetingDate)) && new Date(meeting.meetingDate) >= now
  ).length;

  // Sort meetings by date
  upcomingMeetings.sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
  pastMeetings.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Meetings</h1>
            <p className="text-gray-600 mt-1">Meetings you're invited to participate in</p>
          </div>
          <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-100">
            <div className="text-xl font-bold text-green-800">{memberMeetings.length}</div>
            <div className="text-sm text-green-600">Total Meetings</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <MeetingStatsCard 
            title="Today's Meetings" 
            count={todayMeetings} 
            icon={<Clock size={20} />}
            bgColor="bg-green-500"
          />
          <MeetingStatsCard 
            title="This Week's Meetings" 
            count={weekMeetings} 
            icon={<Calendar size={20} />}
            bgColor="bg-green-600"
          />
          <MeetingStatsCard 
            title="All Upcoming" 
            count={upcomingMeetings.length} 
            icon={<Users size={20} />}
            bgColor="bg-green-700"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your meetings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      )}

      {/* No meetings message */}
      {memberMeetings.length === 0 && !loading && (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No meetings found</h3>
          <p className="text-gray-500">You haven't been invited to any meetings yet.</p>
        </div>
      )}

      {/* Upcoming Meetings Section */}
      {upcomingMeetings.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} className="text-green-600" />
              Upcoming Meetings
            </h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {upcomingMeetings.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMeetings.map(meeting => (
              <div key={meeting._id} className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-l-green-500 hover:shadow-md transition-all duration-300">
                {/* Meeting Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Upcoming
                  </span>
                </div>

                {/* Meeting Description */}
                <p className="text-gray-700 mb-4 text-sm">{meeting.description}</p>

                {/* Meeting Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-green-600" /> 
                    <span>Host: </span>
                    <strong className="text-gray-800">
                      {meeting.host?.name || meeting.createdBy?.name || 'Admin'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-green-600" /> 
                    <span>Date: </span>
                    <strong className="text-gray-800">
                      {format(new Date(meeting.meetingDate), 'EEE, MMM d, yyyy')}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-600" /> 
                    <span>Time: </span>
                    <strong className="text-gray-800">
                      {format(new Date(meeting.meetingDate), 'h:mm a')}
                    </strong>
                  </div>
                </div>

                {/* Other Participants */}
                {meeting.participants?.filter(p => (p._id || p) !== user?._id).length > 0 && (
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-semibold">Other Participants: </span>
                    <span>
                      {meeting.participants
                        .filter(p => (p._id || p) !== user?._id)
                        .map(p => p.name || p)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {/* Join Meeting Button */}
                <a 
                  href={meeting.meetingLink || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    meeting.meetingLink 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={!meeting.meetingLink ? (e) => e.preventDefault() : undefined}
                >
                  <Video size={16} /> 
                  {meeting.meetingLink ? 'Join Meeting' : 'Link Not Available'}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings Section */}
      {pastMeetings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock size={24} className="text-gray-500" />
              Past Meetings
            </h2>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {pastMeetings.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastMeetings.map(meeting => (
              <div key={meeting._id} className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-l-gray-300 opacity-80 hover:opacity-100 transition-opacity">
                {/* Meeting Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-700">{meeting.title}</h3>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>

                {/* Meeting Description */}
                <p className="text-gray-600 mb-4 text-sm">{meeting.description}</p>

                {/* Meeting Details */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" /> 
                    <span>Host: </span>
                    <strong className="text-gray-700">
                      {meeting.host?.name || meeting.createdBy?.name || 'Admin'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" /> 
                    <span>Date: </span>
                    <strong className="text-gray-700">
                      {format(new Date(meeting.meetingDate), 'EEE, MMM d, yyyy')}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" /> 
                    <span>Time: </span>
                    <strong className="text-gray-700">
                      {format(new Date(meeting.meetingDate), 'h:mm a')}
                    </strong>
                  </div>
                </div>

                {/* Meeting Link (Disabled for past meetings) */}
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">
                  <Video size={16} /> Meeting Ended
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberMeetings;