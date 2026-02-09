import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMeetings, joinMeeting } from '../redux/features/meetings/meetingSlice';
import { Calendar, Video, User, Clock, Users, ChevronRight, AlertCircle, Link, FileText, X, Save, PlayCircle, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isThisWeek, isThisMonth, isAfter } from 'date-fns';
import apiClient from '../api/apiClient';

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

// MOM Modal Component
const MomModal = ({ isOpen, onClose, meetingId, meetingTitle }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && meetingId) {
      fetchMom();
    } else {
      setContent('');
    }
  }, [isOpen, meetingId]);

  const fetchMom = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/meetings/${meetingId}/mom`);
      if (res.data.success && res.data.data) {
        setContent(res.data.data.content || '');
      }
    } catch (error) {
      console.error("Error fetching MOM:", error);
      // Don't show error if it's just 404/null (no notes yet)
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/meetings/${meetingId}/mom`, { content });
      toast.success('Notes saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error('Failed to save notes.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-emerald-600" size={20} />
              Minutes of Meeting
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Your private notes for: <span className="font-medium text-gray-800">{meetingTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your key takeaways, tasks, and notes here..."
                className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none text-gray-700 leading-relaxed bg-gray-50 focus:bg-white transition-colors"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
                {content.length} chars
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <span className="animate-spin">⌛</span> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );

};

// Photo Upload Modal Component
const PhotoUploadModal = ({ isOpen, onClose, meeting }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading attendance photo...');

    try {
      // 1. Get presigned URL
      const presignRes = await apiClient.post('/upload/meeting-upload', {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        type: 'attendance'
      });

      const { uploadUrl, finalUrl } = presignRes.data;

      // 2. Upload to storage
      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      // 3. Submit attendance with photo URL
      await apiClient.post(`/meetings/${meeting._id}/attendance-photo`, {
        photoUrl: finalUrl
      });

      toast.success('Attendance marked successfully!', { id: toastId });
      onClose();
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setPreview(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Camera className="text-purple-600" size={20} />
              Upload Attendance Photo
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {meeting?.title}
            </p>
          </div>
          <button onClick={handleClose} disabled={uploading} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg border-2 border-gray-200" />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                disabled={uploading}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Choose different photo
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? <span className="animate-spin">⌛</span> : <Camera size={18} />}
            {uploading ? 'Uploading...' : 'Mark Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MemberMeetings = () => {
  const dispatch = useDispatch();

  // Redux state selectors
  const { meetings, loading, error } = useSelector(state => state.meetings);
  const { user } = useSelector(state => state.auth);

  // State
  const [memberMeetings, setMemberMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null); // For MOM Modal
  const [isMomModalOpen, setIsMomModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false); // For Photo Upload Modal

  // Fetch all meetings when component mounts
  useEffect(() => {
    dispatch(fetchAllMeetings());
  }, [dispatch]);

  // Filter meetings where current user is a participant
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

  const openMomModal = (meeting) => {
    setSelectedMeeting(meeting);
    setIsMomModalOpen(true);
  };

  const openPhotoModal = (meeting) => {
    setSelectedMeeting(meeting);
    setIsPhotoModalOpen(true);
  };

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
          <div className="bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
            <div className="text-xl font-bold text-emerald-800">{memberMeetings.length}</div>
            <div className="text-sm text-emerald-600">Total Meetings</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <MeetingStatsCard
            title="Today's Meetings"
            count={todayMeetings}
            icon={<Clock size={20} />}
            bgColor="bg-emerald-500"
          />
          <MeetingStatsCard
            title="This Week's Meetings"
            count={weekMeetings}
            icon={<Calendar size={20} />}
            bgColor="bg-emerald-600"
          />
          <MeetingStatsCard
            title="All Upcoming"
            count={upcomingMeetings.length}
            icon={<Users size={20} />}
            bgColor="bg-emerald-700"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
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
              <Calendar size={24} className="text-emerald-600" />
              Upcoming Meetings
            </h2>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              {upcomingMeetings.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingMeetings.map(meeting => (
              <div key={meeting._id} className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-all duration-300">
                {/* Meeting Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{meeting.title}</h3>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                    Upcoming
                  </span>
                </div>

                {/* Meeting Description */}
                <p className="text-gray-700 mb-4 text-sm">{meeting.description}</p>

                {/* Meeting Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-emerald-600" />
                    <span>Host: </span>
                    <strong className="text-gray-800">
                      {meeting.host?.name || meeting.createdBy?.name || 'Admin'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-600" />
                    <span>Date: </span>
                    <strong className="text-gray-800">
                      {format(new Date(meeting.meetingDate), 'EEE, MMM d, yyyy')}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-emerald-600" />
                    <span>Time: </span>
                    <strong className="text-gray-800">
                      {format(new Date(meeting.meetingDate), 'h:mm a')}
                    </strong>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openMomModal(meeting)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <FileText size={16} /> My Notes
                  </button>

                  {/* Show Join button only for Zoom and Online meetings */}
                  {meeting.meetingType !== 'in-person' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (meeting.meetingLink) {
                          dispatch(joinMeeting(meeting._id));
                          window.open(meeting.meetingLink, '_blank');
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${meeting.meetingLink
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      disabled={!meeting.meetingLink}
                    >
                      <Video size={16} />
                      {meeting.meetingLink ? 'Join' : 'No Link'}
                    </button>
                  )}

                  {/* Show upload photo button for in-person meetings */}
                  {meeting.meetingType === 'in-person' && (
                    <button
                      onClick={() => openPhotoModal(meeting)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      <Camera size={16} />
                      Upload Attendance Photo
                    </button>
                  )}
                </div>
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
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openMomModal(meeting)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <FileText size={16} /> My Notes
                  </button>

                  {meeting.recordingLink ? (
                    <a
                      href={meeting.recordingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                      <PlayCircle size={16} /> Recording
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">
                      <Video size={16} /> Ended
                    </div>
                  )}

                  {/* ✅ View MOM (Admin Uploaded) */}
                  {meeting.momLink && (
                    <a
                      href={meeting.momLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                      title="View Minutes of Meeting"
                    >
                      <FileText size={16} /> MOM
                    </a>
                  )}

                  {/* ✅ View Proof */}
                  {meeting.engagementProof && (
                    <a
                      href={meeting.engagementProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                      title="View Engagement Proof"
                    >
                      <Link size={16} /> Proof
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOM Modal */}
      <MomModal
        isOpen={isMomModalOpen}
        onClose={() => setIsMomModalOpen(false)}
        meetingId={selectedMeeting?._id}
        meetingTitle={selectedMeeting?.title}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        meeting={selectedMeeting}
      />
    </div>
  );
};

export default MemberMeetings;