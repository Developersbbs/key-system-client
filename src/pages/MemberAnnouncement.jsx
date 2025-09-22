import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllAnnouncements } from '../redux/features/announcements/announcementSlice';
import { Bell, Calendar, Clock, Filter, Search, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const MemberAnnouncements = () => {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector(state => state.announcements);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchAllAnnouncements());
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [dispatch]);

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
      hour12: true 
    });
  };

  // Filter announcements based on selected filter and search term
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesFilter = filter === 'all' || announcement.type === filter;
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        return <CheckCircle size={18} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-600" />;
      case 'urgent':
        return <AlertCircle size={18} className="text-red-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  // Get type label based on announcement type
  const getTypeLabel = (type) => {
    switch(type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'urgent':
        return 'Urgent';
      default:
        return 'Information';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Date and Time */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-green-600" />
            Announcements
          </h1>
          <p className="text-gray-600">Stay updated with the latest news and updates</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4 md:mt-0 flex items-center gap-4">
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

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Latest Updates</h2>
            <p className="opacity-90">You have {announcements.length} announcements</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <div className="bg-green-700 px-3 py-1 rounded-full text-sm">
              {announcements.filter(a => a.type === 'urgent').length} Urgent
            </div>
            <div className="bg-green-700 px-3 py-1 rounded-full text-sm">
              {announcements.filter(a => a.type === 'success').length} Success
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="info">Information</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {filter === 'all' ? 'All Announcements' : `${getTypeLabel(filter)} Announcements`}
          <span className="text-sm text-gray-600 ml-2">({filteredAnnouncements.length})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => (
            <div 
              key={item._id} 
              className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${getTypeStyle(item.type)} transition-all hover:shadow-md`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  {getTypeIcon(item.type)}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeStyle(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-gray-500">
                <div>
                  Posted by <span className="font-medium text-green-700">{item.createdBy?.name || 'Administrator'}</span>
                </div>
                <div>
                  {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No announcements found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No announcements match your search for "${searchTerm}"`
                : `There are no ${filter !== 'all' ? getTypeLabel(filter).toLowerCase() : ''} announcements at this time.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberAnnouncements;