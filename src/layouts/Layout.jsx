import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/features/auth/authSlice';
import { Home, BookOpen, Users, LogOut, User, Menu, ChevronLeft, ChevronRight, Twitter, Facebook, Linkedin, Settings } from 'lucide-react';
import logo from '../assets/key-system-logo.png';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };
  
  const isActive = (path) => location.pathname.startsWith(path);

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
    { path: '/admin/members', label: 'Members', icon: Users },
    {path: '/settings', label: 'Settings', icon: Settings },
  ];

  const memberNavItems = [
    { path: '/member', label: 'Dashboard', icon: Home },
    { path: '/courses', label: 'Courses', icon: BookOpen },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : memberNavItems;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* --- SIDEBAR (for logged-in users) --- */}
      {isLoggedIn && (
        <aside className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-50 ${sidebarMinimized ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}>
          <div className="flex items-center justify-center p-4 border-b dark:border-gray-700 h-20">
            <Link to={user?.role === 'admin' ? "/admin" : "/member"}>
              <img src={logo} alt="Logo" className={`${sidebarMinimized ? 'h-10 w-30' : 'h-12 w-30'} transition-all`} />
            </Link>
            <button onClick={() => setSidebarMinimized(!sidebarMinimized)} className="w-10 ml-10 hidden md:flex items-center justify-center p-2 mb-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                {sidebarMinimized ? <ChevronRight size={20}/> : <ChevronLeft size={20} />}
            </button>
          </div>
           
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} title={sidebarMinimized ? item.label : ''} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isActive(item.path) && 'bg-gradient-to-r from-teal-600 to-green-600 text-white dark:text-white font-semibold'} ${sidebarMinimized && 'justify-center'}`}>
                <item.icon size={20} />
                {!sidebarMinimized && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t dark:border-gray-700">
           
            <button onClick={handleLogout} title={sidebarMinimized ? 'Logout' : ''} className={`w-full flex items-center gap-3 rounded-lg p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors ${sidebarMinimized && 'justify-center'}`}>
                <LogOut size={20} />
                {!sidebarMinimized && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </aside>
      )}
      
      {/* --- MAIN CONTENT WRAPPER (pushes content based on sidebar width) --- */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
          isLoggedIn ? (sidebarMinimized ? 'md:pl-20' : 'md:pl-64') : 'pl-0'
        }`}
      >
        <header className="sticky top-0 h-20 flex-shrink-0 flex items-center bg-white dark:bg-gray-800/80 backdrop-blur-lg shadow-sm z-30">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {isLoggedIn ? (
                  <button onClick={() => setSidebarOpen(true)} className="p-2 md:hidden">
                    <Menu size={24} />
                  </button>
                ) : (
                  <Link to="/"><img src={logo} alt="Logo" className="h-16 w-32" /></Link>
                )}
              </div>
              <div className="flex items-center gap-6">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-800 dark:text-white font-medium hidden sm:block">
                      Welcome, {user?.name || 'User'}
                    </span>
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium hidden md:block">Home</Link>
                    
                    <a href="#about" >About</a>
                  <a href="#contacts" >Contacts</a>
                  <a href="#features" >Features</a>
                  <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">Login</Link>
                    <Link to="/" className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-grow p-6">
          {children}
        </main>
        
        {/* --- FOOTER --- */}
        <footer className="w-full bg-white dark:bg-gray-800 shadow-inner mt-auto">
          <div className="container mx-auto px-6 py-8">
            {!isLoggedIn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 ml-86">
                <div className="space-y-4">
                  <Link to="/"><img src={logo} alt="Key System Logo" className="h-10" /></Link>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Empowering financial knowledge for a prosperous future.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li><a href="/#home" className="hover:text-blue-600">Home</a></li>
                    <li><a href="/#about" className="hover:text-blue-600">About Us</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Follow Us</h4>
                  <div className="flex space-x-4 text-gray-500">
                    <a href="#" aria-label="Twitter" className="hover:text-blue-600"><Twitter size={20} /></a>
                    <a href="#" aria-label="Facebook" className="hover:text-blue-600"><Facebook size={20} /></a>
                    <a href="#" aria-label="LinkedIn" className="hover:text-blue-600"><Linkedin size={20} /></a>
                  </div>
                </div>
              </div>
            )}
            <div className={`text-center ${!isLoggedIn ? 'border-t border-gray-200 dark:border-gray-700 pt-8' : ''}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} <span className="font-semibold">Key System</span>. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;