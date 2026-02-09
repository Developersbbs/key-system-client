import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMeetings, addMeeting, removeMeeting, fetchMeetingLogs, updateMeeting } from '../redux/features/meetings/meetingSlice';
import { fetchAllAdmins, fetchAllMembers } from '../redux/features/members/memberSlice';
import { Plus, X, Calendar, Video, User, Clock, Trash2, Users, BarChart3, ChevronRight, Link as LinkIcon, ChevronLeft, Edit2, PlayCircle } from 'lucide-react';
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
    meetingType: 'manual', // Default to manual
    host: '',
    participants: [],
    meetingLink: '',
    zoomMeetingId: '', // Store Zoom ID
    recordingLink: '', // Store Recording Link
    momLink: '',
    engagementProof: ''
  });
  const { loading } = useSelector(state => state.meetings);
  const [generatingZoom, setGeneratingZoom] = useState(false);
  const [uploadingType, setUploadingType] = useState(null); // 'mom' or 'proof'

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setUploadingType(type);
    const toastId = toast.loading(`Uploading ${type === 'mom' ? 'MOM' : 'Proof'}...`);

    try {
      // 1. Get Presigned URL
      const presignRes = await apiClient.post('/upload/meeting-upload', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        type: type // 'mom' or 'proof'
      });

      const { uploadUrl, finalUrl } = presignRes.data;

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      // 3. Update State
      setFormData(prev => ({
        ...prev,
        [type === 'mom' ? 'momLink' : 'engagementProof']: finalUrl
      }));

      toast.success(`${type === 'mom' ? 'MOM' : 'Proof'} uploaded successfully!`, { id: toastId });

    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Upload failed. Please try again.', { id: toastId });
    } finally {
      setUploadingType(null);
    }
  };

  // Prefill form when editing
  useEffect(() => {
    if (isOpen && onSubmit.initialData) {
      const data = onSubmit.initialData;
      setFormData({
        title: data.title || '',
        description: data.description || '',
        meetingDate: data.meetingDate ? new Date(data.meetingDate).toISOString().slice(0, 16) : '',
        meetingType: data.meetingType || 'manual',
        host: data.host?._id || data.host || '',
        participants: data.participants?.map(p => p._id || p) || [],
        meetingLink: data.meetingLink || '',
        zoomMeetingId: data.zoomMeetingId || '',
        recordingLink: data.recordingLink || '',
        momLink: data.momLink || '',
        engagementProof: data.engagementProof || ''
      });
    } else if (isOpen) {
      // Reset if new meeting
      setFormData({
        title: '',
        description: '',
        meetingDate: '',
        meetingType: 'manual',
        host: '',
        participants: [],
        meetingLink: '',
        zoomMeetingId: '',
        recordingLink: '',
        momLink: '',
        engagementProof: ''
      });
    }
  }, [isOpen, onSubmit.initialData]);

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
          meetingType: 'zoom', // Set type to zoom
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
    onSubmit.handler(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="text-lg font-bold text-gray-800">
              {onSubmit.initialData ? 'Edit Meeting' : 'Schedule New Meeting'}
            </h3>
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

            {/* Meeting Type Selector */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Meeting Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meetingType: 'zoom' })}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${formData.meetingType === 'zoom'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Video size={20} className="mx-auto mb-1" />
                  <div className="text-sm font-semibold">Zoom</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meetingType: 'manual' })}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${formData.meetingType === 'manual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <LinkIcon size={20} className="mx-auto mb-1" />
                  <div className="text-sm font-semibold">Online</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meetingType: 'in-person' })}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${formData.meetingType === 'in-person'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Users size={20} className="mx-auto mb-1" />
                  <div className="text-sm font-semibold">In-Person</div>
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

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">
                {formData.meetingType === 'in-person' ? 'Location' : 'Meeting Link'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={formData.meetingType === 'in-person' ? 'text' : 'url'}
                    placeholder={
                      formData.meetingType === 'zoom'
                        ? 'https://zoom.us/j/...'
                        : formData.meetingType === 'in-person'
                          ? 'Conference Room A, Building B'
                          : 'https://meet.google.com/... or Teams link'
                    }
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
                {formData.meetingType === 'zoom' && (
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
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Recording Link (Youtube / Drive)</label>
              <div className="relative">
                <PlayCircle size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.recordingLink}
                  onChange={(e) => setFormData({ ...formData, recordingLink: e.target.value })}
                  className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* ✅ MOM Upload */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Minutes of Meeting (PDF/Doc)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'mom')}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {uploadingType === 'mom' && <span className="text-xs text-emerald-600 animate-pulse">Uploading...</span>}
                {formData.momLink && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
              </div>
              {formData.momLink && (
                <a href={formData.momLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline ml-1">
                  View Current File
                </a>
              )}
            </div>

            {/* ✅ Engagement Proof Upload */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium ml-1 uppercase tracking-wider">Engagement Proof (Image)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'proof')}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {uploadingType === 'proof' && <span className="text-xs text-emerald-600 animate-pulse">Uploading...</span>}
                {formData.engagementProof && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
              </div>
              {formData.engagementProof && (
                <a href={formData.engagementProof} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline ml-1">
                  View Current Proof
                </a>
              )}
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
            >
              {loading ? 'Saving...' : (onSubmit.initialData ? 'Update Meeting' : 'Schedule Meeting')}
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
                  <div className="flex items-center gap-3">
                    {/* Show attendance photo if available */}
                    {log.attendanceProof && (
                      <a
                        href={log.attendanceProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                        title="View attendance photo"
                      >
                        <img
                          src={log.attendanceProof}
                          alt="Attendance proof"
                          className="w-12 h-12 rounded-lg object-cover border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs">View</span>
                        </div>
                      </a>
                    )}
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
  const [editingMeeting, setEditingMeeting] = useState(null); // Track editing state
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false); // Log Modal State
  const [currentMeetingLogs, setCurrentMeetingLogs] = useState([]); // Store current logs

  const dispatch = useDispatch();
  const { meetings, loading, error, pagination } = useSelector(state => state.meetings);
  const { members, admins } = useSelector(state => state.members);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAllMeetings({ page: currentPage, limit: itemsPerPage }));
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
  }, [dispatch, currentPage]);

  console.log("DEBUG: Pagination State:", { meetingsLength: meetings.length, pagination, loading });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

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

  const handleUpdateMeeting = (meetingData) => {
    if (!editingMeeting) return;

    dispatch(updateMeeting({ id: editingMeeting._id, meetingData })).unwrap()
      .then(() => {
        toast.success("Meeting updated successfully!");
        setIsModalOpen(false);
        setEditingMeeting(null);
      })
      .catch((err) => {
        toast.error(err || "Failed to update meeting.");
      });
  };

  const openAddModal = () => {
    setEditingMeeting(null);
    setIsModalOpen(true);
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setIsModalOpen(true);
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
          onClick={openAddModal}
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
                  onClick={openAddModal}
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
                        {/* Meeting Type Badge */}
                        {meeting.meetingType === 'zoom' && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                            <Video size={12} /> Zoom
                          </span>
                        )}
                        {meeting.meetingType === 'manual' && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                            <LinkIcon size={12} /> Online
                          </span>
                        )}
                        {meeting.meetingType === 'in-person' && (
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                            <Users size={12} /> In-Person
                          </span>
                        )}
                        {!meeting.meetingType && meeting.zoomMeetingId && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                            <Video size={12} /> Zoom
                          </span>
                        )}
                        {!meeting.meetingType && !meeting.zoomMeetingId && (
                          <span className="bg-gray-50 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                            <LinkIcon size={12} /> Meeting
                          </span>
                        )}
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
                      {/* Show Join button only for Zoom and Online meetings */}
                      {meeting.meetingLink && meeting.meetingType !== 'in-person' && (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5"
                        >
                          <Video size={16} /> Join
                        </a>
                      )}

                      {/* Show location info for in-person meetings */}
                      {meeting.meetingType === 'in-person' && meeting.meetingLink && (
                        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold">
                          <Users size={16} />
                          <span className="max-w-[150px] truncate" title={meeting.meetingLink}>
                            {meeting.meetingLink}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(meeting._id, meeting.title)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Meeting"
                      >
                      </button>

                      <button
                        onClick={() => openEditModal(meeting)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Meeting"
                      >
                        <Edit2 size={18} />
                      </button>

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

            {/* Pagination Controls */}
            {!loading && meetings.length > 0 && pagination && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-100 gap-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, pagination.totalDocs)}</span> of <span className="font-bold text-gray-800">{pagination.totalDocs}</span> meetings
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((validPage) => (
                      // Show only current, first, last, and nearby pages for cleaner look if many pages
                      (validPage === 1 || validPage === pagination.totalPages || (validPage >= currentPage - 1 && validPage <= currentPage + 1)) ? (
                        <button
                          key={validPage}
                          onClick={() => handlePageChange(validPage)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === validPage
                            ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200'
                            }`}
                        >
                          {validPage}
                        </button>
                      ) : (
                        (validPage === currentPage - 2 || validPage === currentPage + 2) && <span key={validPage} className="px-1 text-gray-400">...</span>
                      )
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <MeetingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={{ handler: editingMeeting ? handleUpdateMeeting : handleAddMeeting, initialData: editingMeeting }}
        admins={admins}
        members={members}
      />

      <LogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={currentMeetingLogs}
      />
    </div >
  );
};

export default AdminMeetings;