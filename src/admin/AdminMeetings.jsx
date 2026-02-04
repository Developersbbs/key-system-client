import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMeetings, addMeeting, removeMeeting, fetchMeetingLogs } from '../redux/features/meetings/meetingSlice';
import { fetchAllAdmins, fetchAllMembers } from '../redux/features/members/memberSlice';
import { Plus, X, Calendar, Video, User, Clock, Trash2, Users, BarChart3, ChevronRight, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isThisWeek, isThisMonth, isAfter } from 'date-fns';
import { Select } from 'antd';
import apiClient from '../api/apiClient';

// Meeting Form Modal Component
const MeetingFormModal = ({ isOpen, onClose, onSubmit, admins, members }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    meetingDate: '',
    host: '',
    participants: [],
    meetingLink: '',
    zoomMeetingId: '' // Store Zoom ID
  });
  const { loading } = useSelector(state => state.meetings);
  const [generatingZoom, setGeneratingZoom] = useState(false);

  const handleGenerateZoom = async () => {
    try {
      if (!formData.title || !formData.meetingDate) {
        toast.error('Please enter a title and date first');
        return;
      }

      setGeneratingZoom(true);
      const res = await apiClient.post('/meetings/generate-zoom', {
        topic: formData.title,
        startTime: formData.meetingDate,
        duration: 60, // Default duration
        host: formData.host // Pass selected host
      });

      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          meetingLink: res.data.data.join_url,
          zoomMeetingId: res.data.data.meeting_id, // Capture Zoom ID
          description: prev.description + (res.data.data.password ? `\n\nPassword: ${res.data.data.password}` : '')
        }));
        toast.success('Zoom link generated successfully!');
      }
    } catch (error) {
      console.error('Error generating zoom link:', error);
      toast.error(error.response?.data?.message || 'Failed to generate Zoom link');
    } finally {
      setGeneratingZoom(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-bold text-gray-800">Schedule New Meeting</h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="Meeting Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Agenda / Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                rows="3"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Meeting Link</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateZoom}
                  disabled={generatingZoom}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors text-sm font-bold whitespace-nowrap flex items-center gap-2"
                  title="Auto-generate via Zoom API"
                >
                  {generatingZoom ? (
                    <span className="animate-spin">⌛</span>
                  ) : (
                    <Video size={18} />
                  )}
                  {generatingZoom ? 'Generating...' : 'Auto-Generate'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Host</label>
              <Select
                placeholder="Select Host (Admin)"
                className="w-full h-11"
                onChange={(value) => setFormData({ ...formData, host: value })}
                options={admins.map(admin => ({ label: admin.name, value: admin._id }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Participants</label>
              <Select
                mode="multiple"
                allowClear
                placeholder="Select Participants (Members)"
                className="w-full"
                onChange={(values) => setFormData({ ...formData, participants: values })}
                options={members.map(member => ({ label: member.name, value: member._id }))}
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MeetingStatsCard = ({ title, count, icon, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-6 text-white shadow-lg transition-transform hover:-translate-y-1`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{count}</h3>
      </div>
      <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
        {icon}
      </div>
    </div>
  </div>
);

// Attendance Logs Modal
const LogsModal = ({ isOpen, onClose, logs, users }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-emerald-600" />
            Meeting Attendance
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-emerald-100 rounded-full text-gray-500 hover:text-emerald-700 transition-all"><X size={20} /></button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {logs && logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                      {log.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{log.userName}</p>
                      <p className="text-xs text-gray-500">{log.userId?.email || 'No Email'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mb-1">
                      Joined
                    </span>
                    <p className="text-xs text-gray-500 font-medium">{format(new Date(log.joinedAt), 'h:mm a, MMM d')}</p>
                    {log.duration > 0 && (
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        {log.duration} mins
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No attendance recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminMeetings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false); // Log Modal State
  const [currentMeetingLogs, setCurrentMeetingLogs] = useState([]); // Store current logs

  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector(state => state.meetings);
  const { members, admins } = useSelector(state => state.members);

  useEffect(() => {
    dispatch(fetchAllMeetings());
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  const handleAddMeeting = (meetingData) => {
    dispatch(addMeeting(meetingData)).unwrap()
      .then(() => {
        toast.success("Meeting scheduled successfully!");
        setIsModalOpen(false);
      })
      .catch((err) => {
        toast.error(err || "Failed to schedule meeting.");
      });
  };

  const handleDelete = (meetingId, meetingTitle) => {
    if (window.confirm(`Are you sure you want to delete "${meetingTitle}"?`)) {
      dispatch(removeMeeting(meetingId))
        .unwrap()
        .then(() => toast.success("Meeting deleted."))
        .catch(err => toast.error(err));
    }
  };

  const handleViewLogs = (meetingId) => {
    dispatch(fetchMeetingLogs(meetingId)) // Assuming fetchMeetingLogs is imported correctly at top
      .unwrap()
      .then((data) => {
        setCurrentMeetingLogs(data.logs);
        setIsLogsModalOpen(true);
      })
      .catch(() => toast.error('Failed to load attendance logs'));
  };

  const handleSyncAttendance = async (meetingId) => {
    const toastId = toast.loading("Syncing with Zoom...");
    try {
      const res = await apiClient.post(`/meetings/${meetingId}/sync`);
      if (res.data.success) {
        toast.success(res.data.message, { id: toastId });
        // Optionally refresh logs if modal is open - for now just success message
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(error.response?.data?.message || "Failed to sync attendance", { id: toastId });
    }
  };

  // ... (Calculations) ...
  // Calculate meeting statistics
  const todayMeetings = meetings.filter(meeting =>
    isToday(new Date(meeting.meetingDate))
  ).length;

  const weekMeetings = meetings.filter(meeting =>
    isThisWeek(new Date(meeting.meetingDate))
  ).length;

  const monthMeetings = meetings.filter(meeting =>
    isThisMonth(new Date(meeting.meetingDate))
  ).length;

  const upcomingMeetings = meetings
    .filter(meeting => isAfter(new Date(meeting.meetingDate), new Date()))
    .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate))
    .slice(0, 3);

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meeting Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage Zoom meetings and track attendance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 font-semibold"
        >
          <Plus size={20} /> New Meeting
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MeetingStatsCard
          title="Today's Meetings"
          count={todayMeetings}
          icon={<Clock size={24} />}
          bgColor="bg-emerald-500"
        />
        <MeetingStatsCard
          title="This Week's Meetings"
          count={weekMeetings}
          icon={<Calendar size={24} />}
          bgColor="bg-emerald-600"
        />
        <MeetingStatsCard
          title="This Month's Meetings"
          count={monthMeetings}
          icon={<BarChart3 size={24} />}
          bgColor="bg-emerald-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                {upcomingMeetings.length}
              </span>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming meetings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map(meeting => (
                  <div key={meeting._id} className="border-l-4 border-emerald-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                    <h3 className="font-bold text-gray-800 text-sm">{meeting.title}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {format(new Date(meeting.meetingDate), 'EEE, MMM d • h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Meetings Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Meetings</h2>

            {loading && meetings.length === 0 && (
              <div className="flex flex-col items-center justify-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading meetings...</p>
              </div>
            )}

            {error && (
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-500 font-medium">Error: {error}</p>
              </div>
            )}

            {meetings.length === 0 && !loading && (
              <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Video size={48} className="text-emerald-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No meetings have been scheduled yet.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-emerald-600 font-semibold text-sm hover:underline"
                >
                  Schedule your first meeting
                </button>
              </div>
            )}

            <div className="space-y-4">
              {meetings.map(meeting => (
                <div key={meeting._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Zoom</span>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{meeting.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{meeting.description}</p>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                          <User size={14} className="text-emerald-500" />
                          <span className="text-gray-700 font-medium text-xs">{meeting.createdBy?.name || 'Admin'}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                          <Clock size={14} className="text-emerald-500" />
                          <span className="text-gray-700 font-medium text-xs">
                            {format(new Date(meeting.meetingDate), 'p')}
                          </span>
                        </span>

                        <button
                          onClick={() => handleViewLogs(meeting._id)}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors ml-auto md:ml-0"
                        >
                          <Users size={14} />
                          <span className="font-medium text-xs">Attendance</span>
                        </button>

                        {meeting.zoomMeetingId && (
                          <button
                            onClick={() => handleSyncAttendance(meeting._id)}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Sync Zoom Attendance"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                            <span className="font-medium text-xs">Sync</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 pl-4">
                      {meeting.meetingLink && (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5"
                        >
                          <Video size={16} /> Join
                        </a>
                      )}

                      <button
                        onClick={() => handleDelete(meeting._id, meeting.title)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Meeting"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MeetingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMeeting}
        admins={admins}
        members={members}
      />

      <LogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={currentMeetingLogs}
      />
    </div>
  );
};

export default AdminMeetings;