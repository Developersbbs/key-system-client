import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvents, addEvent } from '../redux/features/events/eventSlice';
import { Plus, X, Calendar, User, DollarSign, Search, Filter, BarChart3, TrendingUp, Clock, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const EventFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    description: '', 
    eventDate: '', 
    rate: '',
    location: '',
    attendees: '' 
  });
  const { loading } = useSelector(state => state.events);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-green-100 flex justify-between items-center bg-green-50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-green-800">Post a New Event</h3>
            <button type="button" onClick={onClose} className="text-green-600 hover:text-green-800">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Event Description</label>
              <textarea 
                placeholder="Describe your event..." 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                rows="4" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Event Date</label>
                <input 
                  type="date" 
                  value={formData.eventDate} 
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})} 
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Rate / Price ($)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.rate} 
                  onChange={(e) => setFormData({...formData, rate: e.target.value})} 
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  required 
                  min="0" 
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Location</label>
                <input 
                  type="text" 
                  placeholder="Event location" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Expected Attendees</label>
                <input 
                  type="number" 
                  placeholder="Number of attendees" 
                  value={formData.attendees} 
                  onChange={(e) => setFormData({...formData, attendees: e.target.value})} 
                  className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                  min="0" 
                />
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 flex justify-end gap-3 rounded-b-xl">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? 'Posting...' : 'Post Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    totalEvents: 0,
    averageRate: 0,
    upcomingEvents: 0
  });
  
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector(state => state.events);
  const { user, isLoggedIn } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);
  
  useEffect(() => {
    // Calculate dashboard statistics
    if (events.length > 0) {
      const totalEvents = events.length;
      const totalRate = events.reduce((sum, event) => sum + parseFloat(event.rate || 0), 0);
      const averageRate = totalRate / totalEvents;
      
      // Count upcoming events (events with date in the future)
      const today = new Date();
      const upcomingEvents = events.filter(event => new Date(event.eventDate) > today).length;
      
      setStats({
        totalEvents,
        averageRate: averageRate.toFixed(2),
        upcomingEvents
      });
    }
  }, [events]);
  
  const handleAddEvent = (eventData) => {
    dispatch(addEvent(eventData)).unwrap()
      .then(() => {
        toast.success("Event posted successfully!");
        setIsModalOpen(false);
      })
      .catch((err) => toast.error(err));
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const now = new Date();
      const eventDate = new Date(event.eventDate);
      
      if (filterDate === 'upcoming') return eventDate > now;
      if (filterDate === 'past') return eventDate < now;
      return true; // 'all'
    })
    .sort((a, b) => {
      if (sortBy === 'rate-low') return a.rate - b.rate;
      if (sortBy === 'rate-high') return b.rate - a.rate;
      if (sortBy === 'date-asc') return new Date(a.eventDate) - new Date(b.eventDate);
      if (sortBy === 'date-desc') return new Date(b.eventDate) - new Date(a.eventDate);
      return new Date(b.createdAt) - new Date(a.createdAt); // 'newest'
    });

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-md">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchAllEvents())}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Events Dashboard</h1>
          <p className="text-green-600">Discover and manage community events</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Events</p>
                <h3 className="text-2xl font-bold text-green-800">{stats.totalEvents}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">All events in the system</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Average Rate</p>
                <h3 className="text-2xl font-bold text-green-800">${stats.averageRate}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">Average event price</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 text-sm font-medium">Upcoming Events</p>
                <h3 className="text-2xl font-bold text-green-800">{stats.upcomingEvents}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">Events yet to happen</p>
          </div>
        </div>
        
        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-green-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-green-600" />
              <select 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="date-asc">Date: Earliest</option>
              <option value="date-desc">Date: Latest</option>
              <option value="rate-low">Price: Low to High</option>
              <option value="rate-high">Price: High to Low</option>
            </select>
          </div>
          
          {isLoggedIn && user?.role === 'admin' && (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={20} /> Post Event
            </button>
          )}
        </div>
        
        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-green-600" size={28} />
            </div>
            <p className="text-green-700 text-lg">No events found. Try adjusting your search criteria.</p>
            {isLoggedIn && user?.role === 'admin' && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map(event => {
              const eventDate = new Date(event.eventDate);
              const isUpcoming = eventDate > new Date();
              const isPast = eventDate < new Date();
              
              return (
                <div 
                  key={event._id} 
                  className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden transition-all hover:shadow-md"
                >
                  <div className={`h-2 ${isUpcoming ? 'bg-gradient-to-r from-teal-500 to-green-500' : 'bg-gray-300'}`}></div>
                  
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-24 h-24 rounded-lg flex items-center justify-center ${isUpcoming ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Calendar className={isUpcoming ? 'text-green-600' : 'text-gray-400'} size={36} />
                          <div className="absolute mt-10 ml-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isUpcoming ? 'bg-green-500' : 'bg-gray-400'}`}>
                              <span className="text-white text-xs font-bold">
                                {eventDate.getDate()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-green-900 mb-2">{event.description}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-green-700">
                            <Calendar size={16} className="text-green-600" />
                            <span className="text-sm">{eventDate.toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-green-700">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="text-sm font-medium">${event.rate}</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2 text-green-700">
                              <MapPin size={16} className="text-green-600" />
                              <span className="text-sm">{event.location}</span>
                            </div>
                          )}
                          
                          {event.attendees && (
                            <div className="flex items-center gap-2 text-green-700">
                              <Users size={16} className="text-green-600" />
                              <span className="text-sm">{event.attendees} attendees</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-green-600 mt-4 pt-4 border-t border-green-100">
                          <span className="flex items-center gap-2">
                            <User size={14} /> 
                            Posted by: <strong className="text-green-800">{event.postedBy?.name || 'User'}</strong>
                          </span>
                          
                          <span className={`flex items-center gap-2 ${isUpcoming ? 'text-teal-600' : 'text-gray-500'}`}>
                            <Clock size={14} /> 
                            {isUpcoming ? 'Upcoming' : isPast ? 'Past event' : 'Today'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <EventFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddEvent}
        />
      </div>
    </div>
  );
};

export default Events;