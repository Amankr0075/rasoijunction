import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineBell, HiOutlineSearch, HiOutlineHome, HiOutlineMenu } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const DashboardLayout = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (user) {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.notifications || []);
      } catch (err) {
        console.error('Failed to load layout notifications:', err);
      }
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const hasUnread = notifications.some(n => !n.read);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
        mobileOpen={mobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen} 
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ml-0 ${sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'}`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 glass-nav h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
            >
              <HiOutlineMenu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl text-sm text-dark-800 dark:text-dark-200 placeholder-gray-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-dark-400 transition-colors font-medium text-sm"
              title="Go to Homepage"
            >
              <HiOutlineHome className="w-5 h-5" />
              <span>Homepage</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-dark-400 transition-colors"
            >
              {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>

            <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-dark-400 transition-colors flex animate-none"
                >
                  <HiOutlineBell className="w-5 h-5" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-50 dark:border-dark-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-950/20">
                        <span className="font-bold text-dark-800 dark:text-white text-sm">Notifications</span>
                        {hasUnread && (
                          <button 
                            onClick={markAllAsRead} 
                            className="text-xs text-primary-500 hover:text-primary-600 font-semibold bg-transparent border-0 cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                       <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-dark-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">
                            No notifications yet!
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n._id || n.id} 
                              className={`p-4 text-left cursor-pointer transition-colors ${n.read ? 'hover:bg-gray-50 dark:hover:bg-dark-800/40' : 'bg-primary-500/5 hover:bg-primary-500/10'}`}
                            >
                              <p className={`text-xs ${n.read ? 'text-gray-600 dark:text-dark-300' : 'text-dark-800 dark:text-white font-medium'}`}>
                                {n.message || n.text}
                              </p>
                              {n.attachmentUrl && (
                                <div className="mt-2 text-xs">
                                  <a 
                                    href={n.attachmentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-dark-800 text-primary-600 dark:text-primary-400 rounded-md hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors border border-gray-200 dark:border-dark-700 font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    View Attachment
                                  </a>
                                </div>
                              )}
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : n.time}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-dark-700">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-dark-800 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
