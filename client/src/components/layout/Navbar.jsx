import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import {
  HiOutlineShoppingCart,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogin,
  HiOutlineLogout,
  HiOutlineViewGrid,
  HiOutlineCog,
  HiOutlineHeart,
} from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { cartItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.notifications || []);
      } catch (err) {
        console.error('Failed to load navbar notifications:', err);
      }
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const hasUnread = notifications.some(n => !n.read);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Reservations', path: '/reservations' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    const routes = {
      admin: '/admin/dashboard',
      manager: '/admin/dashboard',
      customer: '/customer/dashboard',
      chef: '/kitchen/dashboard',
      staff: '/staff/dashboard',
      delivery: '/delivery/dashboard',
    };
    return routes[user.role] || '/customer/dashboard';
  };

  const getSettingsLink = () => {
    if (!user) return '/login';
    const routes = {
      admin: '/admin/settings',
      manager: '/admin/settings',
      customer: '/customer/settings',
      chef: '/kitchen/settings',
      staff: '/admin/settings',
      delivery: '/delivery/settings',
    };
    return routes[user.role] || '/customer/settings';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Rasoi Junction" className="h-10 w-10 lg:h-12 lg:w-12 rounded-full object-cover bg-white dark:bg-white shadow-sm" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold font-display text-dark-800 dark:text-white group-hover:text-primary-500 transition-colors">
                Rasoi Junction
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-gray-400 dark:text-dark-500 uppercase font-accent hidden sm:block">
                Good Food • Good Mood • Good Times
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                    : 'text-dark-600 dark:text-dark-300 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <HiOutlineSun className="w-5 h-5" />
              ) : (
                <HiOutlineMoon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                {user?.role === 'customer' && (
                  <Link
                    to="/customer/wishlist"
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 transition-all duration-200 hidden sm:flex"
                  >
                    <HiOutlineHeart className="w-5 h-5" />
                  </Link>
                )}

                {/* Cart */}
                {user?.role === 'customer' && (
                  <Link
                    to="/cart"
                    className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 transition-all duration-200"
                  >
                    <HiOutlineShoppingCart className="w-5 h-5" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                      </span>
                    )}
                  </Link>
                )}

                 {/* Notifications */}
                 <div className="relative hidden sm:block">
                   <button 
                     onClick={() => {
                       setIsNotificationsOpen(!isNotificationsOpen);
                       setIsProfileOpen(false);
                     }}
                     className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 transition-all duration-200 flex"
                   >
                     <HiOutlineBell className="w-5 h-5" />
                     {hasUnread && (
                       <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-white dark:border-dark-900" />
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
                              <div className="p-4 text-center text-xs text-gray-400">
                                No notifications.
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

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-200 hidden md:block">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl shadow-premium border border-gray-100 dark:border-dark-700 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700">
                          <p className="text-sm font-semibold text-dark-800 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-400">
                            {user?.email}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-semibold rounded-md uppercase">
                            {user?.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                          >
                            <HiOutlineViewGrid className="w-4 h-4" />
                            Dashboard
                          </Link>
                           <Link
                            to={getSettingsLink()}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                          >
                            <HiOutlineUser className="w-4 h-4" />
                            My Profile
                          </Link>
                          <Link
                            to={getSettingsLink()}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                          >
                            <HiOutlineCog className="w-4 h-4" />
                            Settings
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 dark:border-dark-700 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors w-full"
                          >
                            <HiOutlineLogout className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 transition-all"
            >
              {isMobileOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-dark-900 border-t border-gray-100 dark:border-dark-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/10'
                      : 'text-dark-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-gray-100 dark:border-dark-800 space-y-2">
                  <Link to="/login" className="block w-full btn-outline text-sm py-2.5 text-center">
                    Login
                  </Link>
                  <Link to="/register" className="block w-full btn-primary text-sm py-2.5 text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
