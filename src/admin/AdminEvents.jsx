import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllEvents,
  addEvent,
  updateEvent,
  deleteEvent
} from '../redux/features/events/eventSlice';
import { Plus, X, Calendar, User, DollarSign, Search, Filter, BarChart3, TrendingUp, Clock, MapPin, Users, Edit, Trash2, Layers } from 'lucide-react';
import { fetchAllMembers } from '../redux/features/members/memberSlice';
import { fetchAllLevels } from '../redux/features/level/levelSlice';
import { fetchAdminFounders } from '../redux/features/founders/founderSlice';
import toast from 'react-hot-toast';

// Update the EventFormModal to support both create and edit modes
const EventFormModal = ({ isOpen, onClose, onSubmit, event, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    description: '',
    eventDate: '',
    rate: '',
    location: '',
    attendees: '',
    participants: []
  });
  const [participantSearch, setParticipantSearch] = useState('');
  const { loading } = useSelector(state => state.events);
  const { members } = useSelector(state => state.members);
  const { levels } = useSelector(state => state.levels);
  const { founders } = useSelector(state => state.founders);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllMembers());
      dispatch(fetchAllLevels());
      dispatch(fetchAdminFounders());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (mode === 'edit' && event) {
      setFormData({
        description: event.description || '',
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
        rate: event.rate || '',
        location: event.location || '',
        attendees: event.attendees || '',
        participants: event.participants?.map(p => typeof p === 'object' ? p._id : p) || []
      });
    } else {
      setFormData({
        description: '',
        eventDate: '',
        rate: '',
        location: '',
        attendees: '',
        participants: []
      });
    }
  }, [event, mode, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-4 border-b border-green-100 flex justify-between items-center bg-green-50 rounded-t-xl shrink-0">
            <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
              {mode === 'edit' ? <Edit size={24} /> : <Plus size={24} />}
              {mode === 'edit' ? 'Edit Event Details' : 'Post a New Event'}
            </h3>
            <button type="button" onClick={onClose} className="text-green-600 hover:text-green-800 bg-white p-2 rounded-full shadow-sm hover:shadow transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto grow">
            {/* Top Section: Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-green-700 mb-2">Event Description</label>
                  <textarea
                    placeholder="Describe your event in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[160px] resize-none text-gray-700 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-green-700 mb-2">Event Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-green-700 mb-2">Ticket Rate ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-green-700 mb-2">Event Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                      <input
                        type="text"
                        placeholder="Venue / Link"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-green-700 mb-2">Target Capacity</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                      <input
                        type="number"
                        placeholder="Max attendees"
                        value={formData.attendees || ''}
                        onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Participant Selection */}
            <div className="border-t border-green-100 pt-8 mt-4">
              <h4 className="text-lg font-bold text-green-800 mb-6 flex items-center gap-2">
                <Users size={20} className="text-green-600" />
                Manage Participants
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Level Selection */}
                <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-green-800">Assign by Level</label>
                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold uppercase">Batch</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {levels && levels.length > 0 ? (
                      levels.map(level => (
                        <button
                          key={level._id}
                          type="button"
                          onClick={() => {
                            const levelMembers = members.filter(m => m.currentLevel === level.levelNumber);
                            const levelMemberIds = levelMembers.map(m => m._id);
                            const newParticipants = [...new Set([...formData.participants, ...levelMemberIds])];
                            setFormData({ ...formData, participants: newParticipants });
                            toast.success(`Added Level ${level.levelNumber} members`);
                          }}
                          className="bg-white hover:bg-green-600 hover:text-white border-2 border-green-200 hover:border-green-600 text-green-800 p-2 rounded-xl transition-all shadow-sm active:scale-95 group flex flex-col items-center gap-1"
                        >
                          <Layers size={14} className="group-hover:text-white text-green-500" />
                          <span className="text-[10px] font-black">LVL {level.levelNumber}</span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full py-2 text-center text-gray-400 text-[10px] italic">No levels</div>
                    )}
                  </div>
                </div>

                {/* Leader Designation Selection */}
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-emerald-800">Assign by Leader</label>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Designation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Founder', 'Director', 'Key Leader'].map(designation => (
                      <button
                        key={designation}
                        type="button"
                        onClick={() => {
                          const designatedFounders = founders.filter(f => f.designation === designation && f.user);
                          const userIds = designatedFounders.map(f => typeof f.user === 'object' ? f.user._id : f.user);
                          const newParticipants = [...new Set([...formData.participants, ...userIds])];
                          setFormData({ ...formData, participants: newParticipants });
                          toast.success(`Added all ${designation}s`);
                        }}
                        className="bg-white hover:bg-emerald-600 hover:text-white border-2 border-emerald-200 hover:border-emerald-600 text-emerald-800 p-2 rounded-xl transition-all shadow-sm active:scale-95 group flex flex-col items-center gap-1"
                      >
                        <User size={14} className="group-hover:text-white text-emerald-500" />
                        <span className="text-[10px] font-black">{designation}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Search/Select */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-green-800">Search Individual Members</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold uppercase">
                        {formData.participants.length} Selected
                      </span>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                    <input
                      type="text"
                      placeholder="Type name or email to filter..."
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                    />
                  </div>

                  <div className="h-[200px] overflow-y-auto border-2 border-green-50 rounded-2xl p-2 space-y-1 bg-white shadow-inner">
                    {members && members.length > 0 ? (
                      members
                        .filter(m =>
                          m.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                          m.email.toLowerCase().includes(participantSearch.toLowerCase())
                        )
                        .map(member => (
                          <label key={member._id} className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-green-100 group">
                            <input
                              type="checkbox"
                              checked={formData.participants.includes(member._id)}
                              onChange={(e) => {
                                const p = [...formData.participants];
                                if (e.target.checked) p.push(member._id);
                                else {
                                  const index = p.indexOf(member._id);
                                  if (index > -1) p.splice(index, 1);
                                }
                                setFormData({ ...formData, participants: p });
                              }}
                              className="w-5 h-5 rounded-md text-green-600 focus:ring-green-500 border-green-300 cursor-pointer"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-gray-800 group-hover:text-green-700 truncate">{member.name}</span>
                              <span className="text-[10px] text-gray-500 truncate">{member.email}</span>
                            </div>
                            <div className="ml-auto shrink-0">
                              <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">Lvl {member.currentLevel || 1}</span>
                            </div>
                          </label>
                        ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Users size={32} />
                        <p className="text-xs mt-2">Member directory empty</p>
                      </div>
                    )}

                    {members && members.length > 0 && members.filter(m =>
                      m.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                      m.email.toLowerCase().includes(participantSearch.toLowerCase())
                    ).length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                          <Search size={32} />
                          <p className="text-xs mt-2">No matches for "{participantSearch}"</p>
                        </div>
                      )}
                  </div>

                  {formData.participants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, participants: [] })}
                      className="mt-3 text-[10px] text-red-500 hover:text-red-700 font-black uppercase tracking-widest text-right transition-all"
                    >
                      Reset Selection
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-green-100 bg-green-50 flex justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-green-200 text-green-700 rounded-xl font-bold bg-white hover:bg-green-100 transition-all active:scale-95"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {mode === 'edit' ? 'Updating...' : 'Posting...'}</>
              ) : (
                mode === 'edit' ? 'Save Changes' : 'Publish Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const handleUpdateEvent = (eventData) => {
    dispatch(updateEvent({ id: selectedEvent._id, eventData })).unwrap()
      .then(() => {
        toast.success("Event updated successfully!");
        setIsEditModalOpen(false);
        setSelectedEvent(null);
      })
      .catch((err) => toast.error(err));
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      dispatch(deleteEvent(id)).unwrap()
        .then(() => {
          toast.success("Event deleted successfully!");
        })
        .catch((err) => toast.error(err));
    }
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-green-900">{event.description}</h3>

                          {isLoggedIn && user?.role === 'admin' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(event)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                                title="Edit event"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event._id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                                title="Delete event"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

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

                          {event.participants && event.participants.length > 0 && (
                            <div className="flex items-center gap-2 text-green-700">
                              <User size={16} className="text-green-600" />
                              <span className="text-sm">{event.participants.length} participants</span>
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
          mode="create"
        />

        <EventFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleUpdateEvent}
          event={selectedEvent}
          mode="edit"
        />
      </div>
    </div>
  );
};

export default Events;