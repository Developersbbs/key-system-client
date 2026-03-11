import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllAnnouncements, 
  addAnnouncement, 
  deleteAnnouncement,
  clearError 
} from '../redux/features/announcements/announcementSlice';
import { Plus, Send, Calendar, Clock, Bell, TrendingUp, BarChart3, Info, Trash2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const BUILTIN_TYPES = ['info', 'success', 'warning', 'urgent'];

const AdminAnnouncements = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [customTypes, setCustomTypes] = useState([]); // [{ name: string }]
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newType, setNewType] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });

  const dispatch = useDispatch();
  const { announcements, loading, error } = useSelector(state => state.announcements);

  useEffect(() => {
    dispatch(fetchAllAnnouncements());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Load custom types from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('announcementCustomTypes');
    if (stored) {
      try { setCustomTypes(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  // Persist custom types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('announcementCustomTypes', JSON.stringify(customTypes));
  }, [customTypes]);

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

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
      .catch(err => toast.error(err || "Failed to post announcement"));
  };

  const handleDelete = (id, announcementTitle) => {
    setDeleteConfirm({ show: true, id, title: announcementTitle });
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteAnnouncement(deleteConfirm.id)).unwrap();
      toast.success("Announcement deleted successfully!");
      setDeleteConfirm({ show: false, id: null, title: '' });
    } catch (err) {
      toast.error(err || "Failed to delete announcement");
    }
  };

  const handleAddType = () => {
    const name = newType.trim();
    if (!name) { toast.error('Type name cannot be empty'); return; }
    if (
      customTypes.some(ct => ct.name.toLowerCase() === name.toLowerCase()) ||
      BUILTIN_TYPES.includes(name.toLowerCase())
    ) { toast.error('Type already exists'); return; }

    const updated = [...customTypes, { name }];
    setCustomTypes(updated);
    setNewType('');
    setType(name);
    toast.success(`Custom type "${name}" added`);
    // Keep modal open so user can see it in the list + add more if needed
  };

  const handleDeleteCustomType = (typeName) => {
    const updated = customTypes.filter(ct => ct.name !== typeName);
    setCustomTypes(updated);
    if (type === typeName) setType('info');
    toast.success(`Custom type "${typeName}" removed`);
  };

  const getTypeStyle = (t) => {
    switch (t) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'urgent':  return 'bg-red-100 text-red-800 border-red-200';
      case 'info':    return 'bg-gray-50 text-gray-800 border-gray-200 shadow-sm';
      default:        return 'bg-white-100 text-indigo-800 border-indigo-200';
    }
  };

  const getTypeIcon = (t) => {
    switch (t) {
      case 'success': return <TrendingUp size={16} />;
      case 'warning': return <BarChart3 size={16} />;
      case 'urgent':  return <Bell size={16} />;
      default:        return <Info size={16} />;
    }
  };

  const stats = [
    { label: 'Total Announcements', value: announcements?.length || 0, icon: <Bell className="text-green-600" /> },
    { label: 'Info Type', value: announcements?.filter(a => a.type === 'info').length || 0, icon: <BarChart3 className="text-green-600" /> },
    { label: 'Success Type', value: announcements?.filter(a => a.type === 'success').length || 0, icon: <TrendingUp className="text-green-600" /> },
    { label: 'Warning Type', value: announcements?.filter(a => a.type === 'warning').length || 0, icon: <BarChart3 className="text-amber-600" /> },
    { label: 'Urgent Type', value: announcements?.filter(a => a.type === 'urgent').length || 0, icon: <Bell className="text-red-600" /> },
  ];

  const sortedAnnouncements = [...(announcements || [])].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const isCustomType = customTypes.some(ct => ct.name === type);

  return (
    <div className="w-full space-y-6">

      {/* Delete Announcement Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4 text-gray-600">Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage / Add Custom Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-gray-800">Manage Custom Types</h3>
              <button
                onClick={() => { setShowTypeModal(false); setNewType(''); }}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Existing custom types list with delete */}
            {customTypes.length > 0 ? (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Custom Types</p>
                <div className="flex flex-wrap gap-2">
                  {customTypes.map(ct => (
                    <span
                      key={ct.name}
                      className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-sm font-medium px-3 py-1.5 rounded-full"
                    >
                      <Tag size={12} />
                      {ct.name}
                      <button
                        onClick={() => handleDeleteCustomType(ct.name)}
                        className="ml-1 text-green-500 hover:text-red-500 transition-colors"
                        title={`Delete "${ct.name}"`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No custom types yet. Add one below.</p>
            )}

            {/* Add new type input */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Type Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  placeholder="e.g. Event, Reminder, Workshop..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyDown={e => e.key === 'Enter' && handleAddType()}
                  autoFocus
                />
                <button
                  onClick={handleAddType}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => { setShowTypeModal(false); setNewType(''); }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Announcements Dashboard</h1>
          <p className="text-gray-600">Manage and create announcements for your community</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4 sm:mt-0 flex items-center gap-4">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-700">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">

        {/* Create Announcement Form */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
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
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  Type
                  <button
                    type="button"
                    className="text-xs text-green-600 hover:underline flex items-center gap-1"
                    onClick={() => setShowTypeModal(true)}
                  >
                    <Tag size={11} /> Manage Types
                    {customTypes.length > 0 && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                        {customTypes.length}
                      </span>
                    )}
                  </button>
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="info">Info (General Information)</option>
                  <option value="success">Success (Achievements, Updates)</option>
                  <option value="warning">Warning (Important Notices)</option>
                  <option value="urgent">Urgent (Critical Information)</option>
                  {customTypes.length > 0 && (
                    <optgroup label="── Custom Types ──">
                      {customTypes.map(ct => (
                        <option key={ct.name} value={ct.name}>{ct.name}</option>
                      ))}
                    </optgroup>
                  )}
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

        {/* Recent Announcements */}
        <div className="sm:col-span-1 md:col-span-1 lg:col-span-1">
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
                    className={`p-4 rounded-lg border relative group ${getTypeStyle(item.type)}`}
                  >
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
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'} •{' '}
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Unknown time'}
                    </p>
                    {item.createdBy?.name && (
                      <p className="text-xs text-gray-500 mt-1">By: {item.createdBy.name}</p>
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