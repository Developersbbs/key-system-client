import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/features/auth/authSlice';
import { Home, BookOpen, Users, LogOut, User, Menu, ChevronLeft, ChevronRight, Twitter, Facebook, Linkedin, Settings, CircleGauge, Calendar, Megaphone, CircleDollarSign, Projector, Video, VideoIcon, DollarSign, Bell, X, Info, Palette, Instagram, MapPin, Mail, Phone, Trophy, FolderOpen } from 'lucide-react';
import logo from '../assets/key-system-logo.png';
import { fetchAllAnnouncements } from '../redux/features/announcements/announcementSlice';

// Color theme options
const colorThemes = [
  {
    id: 'teal',
    name: 'Teal Gradient',
    primary: '#14987c',
    secondary: '#0f705c',
    light: '#e6f7f3',
    gradient: 'from-teal-500 to-green-600',
    bgGradient: 'bg-gradient-to-r from-teal-500 to-green-600',
    text: 'text-white'
  },
  {
    id: 'emerald',
    name: 'Emerald Gradient',
    primary: '#10b981',
    secondary: '#059669',
    light: '#d1fae5',
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'bg-gradient-to-r from-emerald-500 to-green-600',
    text: 'text-white'
  },
  {
    id: 'lime',
    name: 'Lime Gradient',
    primary: '#84cc16',
    secondary: '#65a30d',
    light: '#ecfccb',
    gradient: 'from-lime-400 to-green-500',
    bgGradient: 'bg-gradient-to-r from-lime-400 to-green-500',
    text: 'text-white'
  },
  {
    id: 'blue',
    name: 'Ocean Gradient',
    primary: '#0ea5e9',
    secondary: '#0284c7',
    light: '#e0f2fe',
    gradient: 'from-blue-500 to-teal-500',
    bgGradient: 'bg-gradient-to-r from-blue-500 to-teal-500',
    text: 'text-white'
  },
  {
    id: 'purple',
    name: 'Purple Gradient',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    light: '#ede9fe',
    gradient: 'from-purple-500 to-indigo-600',
    bgGradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    text: 'text-white'
  }
];

// Extracted NotificationBell component outside of Layout
const NotificationBell = () => {
  const dispatch = useDispatch();
  const { announcements } = useSelector(state => state.announcements);
  const { user } = useSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get seen announcements from localStorage
  const [seenIds, setSeenIds] = useState(() =>
    new Set(JSON.parse(localStorage.getItem('seenAnnouncements') || '[]'))
  );

  useEffect(() => {
    dispatch(fetchAllAnnouncements());

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  const unreadCount = announcements.filter(a => !seenIds.has(a._id)).length;

  const handleOpen = () => {
    setIsOpen(!isOpen);
    // Mark all as seen when opening the dropdown
    if (!isOpen) {
      const allIds = new Set(announcements.map(a => a._id));
      setSeenIds(allIds);
      localStorage.setItem('seenAnnouncements', JSON.stringify(Array.from(allIds)));
    }
  };

  // Get type styling based on announcement type
  const getTypeStyle = (type) => {
    switch (type) {
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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell size={22} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 font-semibold border-b border-gray-200 bg-gray-50 text-gray-800 flex justify-between items-center">
            <span>Announcements</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {announcements.length > 0 ? (
              announcements.map(item => (
                <div
                  key={item._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getTypeStyle(item.type)}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm">{item.title}</p>
                    <span className="text-xs opacity-70">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="text-sm mb-1">{item.content}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-medium">
                      {item.createdBy?.name || 'System'}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-800 capitalize">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 flex flex-col items-center">
                <Info size={24} className="text-gray-400 mb-2" />
                <p>No announcements</p>
              </div>
            )}
          </div>
          <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
            <Link
              to={user?.role === 'admin' ? '/admin/announcements' : '/announcements'}
              className="text-xs text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all announcements
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [theme, setTheme] = useState(colorThemes[0]); // Default to teal theme
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is login page
  const isLoginPage = location.pathname === '/login';

  // Show sidebar only when logged in AND not on login page
  const showSidebar = isLoggedIn && !isLoginPage;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/members', label: 'Members', icon: Users },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
    { path: '/admin/levels', label: 'Levels', icon: CircleGauge },
    { path: '/admin/meetings', label: 'Meetings', icon: VideoIcon },
    { path: '/admin/attendance', label: 'Attendance', icon: Users },
    { path: '/admin/events', label: 'Events', icon: Calendar },
    { path: '/marketplace', label: 'Marketplace', icon: CircleDollarSign },
    { path: '/admin/transactions', label: 'Transactions', icon: DollarSign },
    { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'QR Code', icon: User },
    { path: '/admin/founders', label: 'Leaders', icon: Users },
    { path: '/achievers', label: 'Achievers', icon: Trophy },
    { path: '/admin/tools', label: 'Tools', icon: FolderOpen },
  ];

  const memberNavItems = [
    { path: '/member', label: 'Dashboard', icon: Home },
    { path: '/courses', label: 'Courses', icon: BookOpen },
    { path: '/marketplace', label: 'Marketplace', icon: CircleDollarSign },
    { path: '/transactions', label: 'Transactions', icon: DollarSign },
    { path: '/meeting', label: 'Meetings', icon: Projector },
    { path: '/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/profile', label: 'QR Code', icon: User },
    { path: '/founders', label: 'Leaders', icon: Users },
    { path: '/achievers', label: 'Achievers', icon: Trophy },
    { path: '/tools', label: 'Tools', icon: FolderOpen },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : memberNavItems;

  // Close sidebar when clicking outside on mobile
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- SIDEBAR (only for logged-in users and not on login page) --- */}
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
          )}

          <aside
            ref={sidebarRef}
            className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50 ${sidebarMinimized ? 'w-16 md:w-20' : 'w-full md:w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col border-r border-gray-200`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16 md:h-20">
              {!sidebarMinimized && (
                <Link to={user?.role === 'admin' ? "/admin" : "/member"} className="flex items-center">
                  <img src={logo} alt="Logo" className="h-16  transition-all" />
                </Link>
              )}
              <button
                onClick={() => setSidebarMinimized(!sidebarMinimized)}
                className="flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>

            <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto no-scrollbar">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={sidebarMinimized ? item.label : ''}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100 transition-colors ${isActive(item.path) && `${theme.bgGradient} text-white font-semibold`} ${sidebarMinimized && 'justify-center'}`}
                >
                  <item.icon size={30} />
                  {!sidebarMinimized && <span>{item.label}</span>}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                title={sidebarMinimized ? 'Logout' : ''}
                className={`w-full flex items-center gap-3 rounded-lg p-3 text-red-600 hover:bg-red-50 transition-colors ${sidebarMinimized && 'justify-center'}`}
              >
                <LogOut size={30} />
                {!sidebarMinimized && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* --- MAIN CONTENT WRAPPER (always visible) --- */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${showSidebar ? (sidebarMinimized ? 'md:pl-20' : 'md:pl-64') : 'pl-0'}`}>
        <header className="sticky top-0 h-16 md:h-20 flex-shrink-0 flex items-center bg-white backdrop-blur-lg shadow-sm z-30 border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {isLoggedIn && !isLoginPage ? (
                  <>
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-1 md:p-2 md:hidden text-gray-700"
                    >
                      <Menu size={24} />
                    </button>
                    {/* Show logo in navbar when sidebar is minimized */}
                    {sidebarMinimized && (
                      <Link to={user?.role === 'admin' ? "/admin" : "/member"} className="hidden md:block">
                        <img src={logo} alt="Logo" className="h-16 " />
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="">
                    <img src={logo} alt="Logo" className="h-14 sm:h-16 md:h-20" />

                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4">
                {isLoggedIn && !isLoginPage && (
                  <div className="relative">
                    {/* <button 
                      onClick={() => setShowThemeSelector(!showThemeSelector)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Change theme"
                    >
                      <Palette size={20} className="text-gray-700" />
                    </button> */}

                    {showThemeSelector && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <div className="p-3 font-semibold border-b border-gray-200 bg-gray-50 text-gray-800">
                          Color Themes
                        </div>
                        <div className="p-2 space-y-1">
                          {colorThemes.map((themeOption) => (
                            <button
                              key={themeOption.id}
                              onClick={() => {
                                setTheme(themeOption);
                                setShowThemeSelector(false);
                              }}
                              className={`w-full flex items-center gap-2 p-2 rounded text-left hover:bg-gray-100 transition-colors ${theme.id === themeOption.id ? 'bg-gray-100 font-medium' : ''}`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeOption.gradient}`}></div>
                              <span>{themeOption.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isLoggedIn && !isLoginPage ? (
                  <div className="flex items-center gap-4">
                    {/* Add Notification Bell to the header */}
                    <NotificationBell />
                    <span className="text-gray-800 font-medium hidden sm:block">
                      {user?.name || 'User'}
                    </span>
                    {user?.imageUrl ? (
                      <Link to="/profile">
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm hover:opacity-90 transition-opacity"
                        />
                      </Link>
                    ) : (
                      <Link to="/profile">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${theme.bgGradient} text-white shadow-sm hover:opacity-90 transition-opacity`}>
                          <User size={20} />
                        </div>
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium hidden md:block">Home</Link>
                    <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Login</Link>
                    <Link to="/register" className={`px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all ${theme.bgGradient} text-white`}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow p-0">
          {children}
        </main>

        {/* --- FOOTER (always visible) --- */}
        <footer className="w-full bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-auto">
          {(() => {
            const isUserLoggedIn = Boolean(isLoggedIn && user && user.role);

            if (isUserLoggedIn) {
              // Logged in user - show only simple copyright
              return (
                <div className="container mx-auto px-6 py-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      &copy; {new Date().getFullYear()} Education Dashboard. All rights reserved.
                    </p>
                  </div>
                </div>
              );
            } else {
              // Not logged in - show complete footer
              return (
                <div className="container mx-auto px-6 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6 text-center">
                      <Link to="/">
                        <div className="flex items-center justify-center">
                          <img src={logo} alt="Key System Logo" className="h-32 sm:h-20 md:h-20" />
                        </div>
                      </Link>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
                        Empowering financial knowledge for a prosperous future through comprehensive crypto education and trading strategies.
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center">
                      <h4 className="font-bold text-gray-900 text-lg mb-6 relative pb-2 inline-block after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-10 after:h-1 after:bg-gradient-to-r after:from-emerald-400 after:to-teal-400">
                        Contact Us
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex items-start justify-center">
                          <MapPin className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={16} />
                          <span className="text-gray-600 text-sm text-left">No 6, Third Floor, Kumaran Colony Main Road, Vadapalani, Chennai, Tamil Nadu</span>
                        </li>
                        <li className="flex items-center justify-center">
                          <Mail className="text-emerald-500 mr-3 flex-shrink-0" size={16} />
                          <a href="mailto:admin@keysystem.in" className="text-gray-600 text-sm hover:text-emerald-600 hover:underline">
                            admin@keysystem.in
                          </a>
                        </li>
                        <li className="flex items-center justify-center">
                          <Phone className="text-emerald-500 mr-3 flex-shrink-0" size={16} />
                          <a href="tel:+919876543210" className="text-gray-600 hover:text-emerald-600 hover:underline">
                            +91 98765 43210
                          </a>
                        </li>
                      </ul>
                      <div className="flex space-x-4 mt-6 justify-center">
                        <a href="https://www.facebook.com/people/Key-System/61578967386229/?rdid=eF5OHaKZNdw5P7cC&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19Y9KPubDw%2F" aria-label="Facebook" className="bg-gray-100 p-2.5 rounded-full text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-300">
                          <Facebook size={18} />
                        </a>
                        <a href="https://www.instagram.com/key_system2025/?igsh=cnFoNmdpdjJhcHN1#" aria-label="Instagram" className="bg-gray-100 p-2.5 rounded-full text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-300">
                          <Instagram size={18} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar for non-logged in users */}
                  <div className="border-t border-gray-200 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-600 mb-4 md:mb-0">
                      &copy; {new Date().getFullYear()} <span className="font-semibold text-emerald-600">Key Kissan</span>. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                      <a href="#" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors duration-300">Privacy Policy</a>
                      <a href="#" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors duration-300">Terms of Service</a>
                      <a href="#" className="text-gray-500 hover:text-emerald-600 text-sm transition-colors duration-300">Cookie Policy</a>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </footer>
      </div>
    </div>
  );
};

export default Layout;