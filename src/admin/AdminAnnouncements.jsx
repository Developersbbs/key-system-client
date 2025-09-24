import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllAnnouncements, 
  addAnnouncement, 
  deleteAnnouncement,
  clearError 
} from '../redux/features/announcements/announcementSlice';
import { Plus, Send, Calendar, Clock, Users, Bell, TrendingUp, BarChart3, Info, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  
  const dispatch = useDispatch();
  const { announcements, loading, error } = useSelector(state => state.announcements);

  useEffect(() => {
    dispatch(fetchAllAnnouncements());
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content cannot be empty!");
      return;
    }
    
    dispatch(addAnnouncement({ title, content, type })).unwrap()
      .then(() => {
        toast.success("Announcement posted successfully!");
        setTitle('');
        setContent('');
        setType('info');
      })
      .catch(err => {
        console.error("Error adding announcement:", err);
        toast.error(err || "Failed to post announcement");
      });
  };

  const handleDelete = (id, title) => {
    setDeleteConfirm({ show: true, id, title });
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteAnnouncement(deleteConfirm.id)).unwrap();
      toast.success("Announcement deleted successfully!");
      setDeleteConfirm({ show: false, id: null, title: '' });
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error(err || "Failed to delete announcement");
    }
  };

  // Format date and time
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  // Get type styling based on announcement type
  const getTypeStyle = (type) => {
    switch(type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Get type icon based on announcement type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'success':
        return <TrendingUp size={16} />;
      case 'warning':
        return <BarChart3 size={16} />;
      case 'urgent':
        return <Bell size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  // Stats for the dashboard
  const stats = [
    { label: 'Total Announcements', value: announcements?.length || 0, icon: <Bell className="text-green-600" /> },
    { label: 'Info Type', value: announcements?.filter(a => a.type === 'info').length || 0, icon: <BarChart3 className="text-green-600" /> },
    { label: 'Success Type', value: announcements?.filter(a => a.type === 'success').length || 0, icon: <TrendingUp className="text-green-600" /> },
    { label: 'Warning Type', value: announcements?.filter(a => a.type === 'warning').length || 0, icon: <BarChart3 className="text-amber-600" /> },
    { label: 'Urgent Type', value: announcements?.filter(a => a.type === 'urgent').length || 0, icon: <Bell className="text-red-600" /> },
  ];

  // Sort announcements by date (newest first)
  const sortedAnnouncements = [...(announcements || [])].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="w-full space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete "{deleteConfirm.title}"?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Date and Time */}
      <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-start sm:items-center md:items-center lg:items-center xl:items-center mb-6 p-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Announcements Dashboard</h1>
          <p className="text-gray-600">Manage and create announcements for your community</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0 flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-700">
            <Calendar size={20} />
            <span className="font-medium">{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Clock size={20} />
            <span className="font-medium">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 p-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 p-4">
        {/* Create Announcement Form */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-green-600" />
              Create New Announcement
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="Enter announcement title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea 
                  placeholder="Write your announcement content here..." 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  rows="4" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="info">Info (General Information)</option>
                  <option value="success">Success (Achievements, Updates)</option>
                  <option value="warning">Warning (Important Notices)</option>
                  <option value="urgent">Urgent (Critical Information)</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:from-green-700 hover:to-teal-700 transition-all"
              >
                <Send size={18} /> 
                {loading ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Sent Announcements */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100 h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-green-600" />
              Recent Announcements
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {sortedAnnouncements.length > 0 ? (
                sortedAnnouncements.map(item => (
                  <div 
                    key={item._id} 
                    className={`p-4 rounded-lg border ${getTypeStyle(item.type)} relative group`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(item._id, item.title)}
                      className="absolute top-8 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded-full"
                      title="Delete announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg pr-6">{item.title}</h3>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span className="text-xs font-medium capitalize">{item.type}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{item.content}</p>
                    <p className="text-xs text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'} • {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Unknown time'}
                    </p>
                    {item.createdBy && item.createdBy.name && (
                      <p className="text-xs text-gray-500 mt-1">
                        By: {item.createdBy.name}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell size={40} className="mx-auto mb-2 text-gray-400" />
                  <p>No announcements yet</p>
                  <p className="text-sm">Create your first announcement to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;