import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMeetings, addMeeting, removeMeeting } from '../redux/features/meetings/meetingSlice';
import { fetchAllAdmins, fetchAllMembers } from '../redux/features/members/memberSlice';
import { Plus, X, Calendar, Video, User, Clock, Trash2, Users, BarChart3, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isToday, isThisWeek, isThisMonth, isAfter } from 'date-fns';
import { Select } from 'antd';

// Meeting Form Modal Component
const MeetingFormModal = ({ isOpen, onClose, onSubmit, admins, members }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    meetingDate: '', 
    host: '', 
    participants: [] 
  });
  const { loading } = useSelector(state => state.meetings);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Schedule New Meeting</h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input 
              type="text" 
              placeholder="Meeting Title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full p-2 border rounded" 
              required 
            />
            <textarea 
              placeholder="Agenda / Description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full p-2 border rounded" 
              rows="3" 
              required 
            />
            <input 
              type="datetime-local" 
              value={formData.meetingDate} 
              onChange={(e) => setFormData({...formData, meetingDate: e.target.value})} 
              className="w-full p-2 border rounded" 
              required 
            />
            <p className="text-xs text-gray-500 mt-1">
              A Google Meet link will be automatically generated and saved.
            </p>
            <Select
              placeholder="Select Host (Admin)"
              className="w-full"
              onChange={(value) => setFormData({...formData, host: value})}
              options={admins.map(admin => ({ label: admin.name, value: admin._id }))}
            />
           
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Participants (Members)"
              className="w-full"
              onChange={(values) => setFormData({...formData, participants: values})}
              options={members.map(member => ({ label: member.name, value: member._id }))}
            />
          </div>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule & Create Meet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MeetingStatsCard = ({ title, count, icon, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-6 text-white shadow-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{count}</h3>
      </div>
      <div className="bg-white/20 p-3 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const AdminMeetings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { meetings, loading, error } = useSelector(state => state.meetings);
  const { members, admins } = useSelector(state => state.members);

  useEffect(() => {
    dispatch(fetchAllMeetings());
    dispatch(fetchAllMembers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      toast.success("Google Account connected successfully!");
    } else if (params.get('auth') === 'error') {
      toast.error("Failed to connect Google Account.");
    }
    if (params.has('auth')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const handleAddMeeting = (meetingData) => {
    dispatch(addMeeting(meetingData)).unwrap()
      .then(() => {
        toast.success("Meeting scheduled and Google Meet link created!");
        setIsModalOpen(false);
      })
      .catch((err) => {
        if (err.includes('Admin has not connected')) {
          toast.error("Please connect your Google Account first to create a Meet link.");
          window.location.href = 'http://localhost:5001/api/auth/google';
        } else {
          toast.error(err || "Failed to schedule meeting.");
        }
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
  
  const handleConnectGoogle = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

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
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meeting Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
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
          bgColor="bg-green-500"
        />
        <MeetingStatsCard 
          title="This Week's Meetings" 
          count={weekMeetings} 
          icon={<Calendar size={24} />}
          bgColor="bg-green-600"
        />
        <MeetingStatsCard 
          title="This Month's Meetings" 
          count={monthMeetings} 
          icon={<BarChart3 size={24} />}
          bgColor="bg-green-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Meetings</h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {upcomingMeetings.length}
              </span>
            </div>
            
            {upcomingMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map(meeting => (
                  <div key={meeting._id} className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-800">{meeting.title}</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(meeting.meetingDate), 'EEE, MMM d • h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Integration Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Google Meet Integration</h2>
            <p className="text-gray-600 mb-4">Connect your Google Account to automatically generate Google Meet links.</p>
            <button 
              onClick={handleConnectGoogle} 
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Connect Google Account
            </button>
          </div>
        </div>

        {/* All Meetings Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">All Meetings</h2>
            
            {loading && meetings.length === 0 && (
              <div className="text-center p-6">
                <p className="text-gray-500">Loading meetings...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center p-6">
                <p className="text-red-500">Error: {error}</p>
              </div>
            )}
            
            {meetings.length === 0 && !loading && (
              <div className="text-center p-10">
                <p className="text-gray-500">No meetings have been scheduled yet.</p>
              </div>
            )}
            
            <div className="space-y-4">
              {meetings.map(meeting => (
                <div key={meeting._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      <p className="text-gray-600 mt-1">{meeting.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-3">
                        <span className="flex items-center gap-2">
                          <User size={14} /> 
                          <span className="text-gray-700 font-medium">{meeting.createdBy?.name || 'Admin'}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar size={14} /> 
                          <span className="text-gray-700 font-medium">
                            {format(new Date(meeting.meetingDate), 'PPP')}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={14} /> 
                          <span className="text-gray-700 font-medium">
                            {format(new Date(meeting.meetingDate), 'p')}
                          </span>
                        </span>
                        {meeting.participants && meeting.participants.length > 0 && (
                          <span className="flex items-center gap-2">
                            <Users size={14} /> 
                            <span className="text-gray-700 font-medium">
                              {meeting.participants.length} participants
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => handleDelete(meeting._id, meeting.title)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" 
                        title="Delete Meeting"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      {meeting.meetingLink && (
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Video size={14} /> Join
                        </a>
                      )}
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
    </div>
  );
};

export default AdminMeetings;