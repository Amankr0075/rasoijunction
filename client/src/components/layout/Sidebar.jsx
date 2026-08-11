import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCollection,
  HiOutlineCube,
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFire,
  HiOutlineTruck,
  HiOutlineChatAlt2,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Menu items based on role
  const getMenuItems = () => {
    const getDashboardPath = (role) => {
      if (role === 'admin' || role === 'manager') return '/admin/dashboard';
      if (role === 'customer') return '/customer/dashboard';
      if (role === 'chef') return '/kitchen/dashboard';
      if (role === 'delivery') return '/delivery/dashboard';
      if (role === 'staff') return '/staff/dashboard';
      return '/';
    };

    const common = [
      { label: 'Dashboard', icon: HiOutlineViewGrid, path: getDashboardPath(user?.role) },
    ];

    const adminManagerItems = [
      { section: 'Management' },
      { label: 'Orders', icon: HiOutlineClipboardList, path: '/admin/orders' },
      { label: 'Menu Items', icon: HiOutlineCollection, path: '/admin/menu' },
      { label: 'Reservations', icon: HiOutlineCalendar, path: '/admin/reservations' },
      { label: 'Inventory', icon: HiOutlineCube, path: '/admin/inventory' },
      { section: 'People' },
      { label: 'Customers', icon: HiOutlineUsers, path: '/admin/customers' },
      { label: 'Staff', icon: HiOutlineUserGroup, path: '/admin/staff' },
      { section: 'Finance' },
      { label: 'Payments', icon: HiOutlineCreditCard, path: '/admin/payments' },
      { label: 'Coupons', icon: HiOutlineTag, path: '/admin/coupons' },
      { label: 'Reports', icon: HiOutlineChartBar, path: '/admin/reports' },
      { section: 'Feedback' },
      { label: 'Reviews', icon: HiOutlineStar, path: '/admin/reviews' },
      { label: 'Notifications', icon: HiOutlineBell, path: '/admin/notifications' },
      { section: 'System' },
      { label: 'Settings', icon: HiOutlineCog, path: '/admin/settings' },
      { label: 'Provide Feedback', icon: HiOutlineChatAlt2, path: '/customer/feedback' },
    ];

    const staffItems = [
      { section: 'Daily Operations' },
      { label: 'Assigned Orders', icon: HiOutlineClipboardList, path: '/staff/orders' },
      { label: 'Reservations', icon: HiOutlineCalendar, path: '/staff/reservations' },
      { section: 'Customer Support' },
      { label: 'Reviews & Feedback', icon: HiOutlineStar, path: '/staff/reviews' },
      { section: 'System' },
      { label: 'Settings', icon: HiOutlineCog, path: '/staff/settings' },
      { label: 'Provide Feedback', icon: HiOutlineChatAlt2, path: '/customer/feedback' },
    ];

    const customerItems = [
      { label: 'My Orders', icon: HiOutlineClipboardList, path: '/customer/orders' },
      { label: 'Reservations', icon: HiOutlineCalendar, path: '/customer/reservations' },
      { label: 'My Reviews', icon: HiOutlineStar, path: '/customer/reviews' },
      { label: 'Payments', icon: HiOutlineCreditCard, path: '/customer/payments' },
      { label: 'Feedback', icon: HiOutlineChatAlt2, path: '/customer/feedback' },
      { label: 'Settings', icon: HiOutlineCog, path: '/customer/settings' },
    ];

    const chefItems = [
      { label: 'Kitchen Queue', icon: HiOutlineFire, path: '/kitchen/queue' },
      { label: 'Orders', icon: HiOutlineClipboardList, path: '/kitchen/orders' },
      { label: 'Settings', icon: HiOutlineCog, path: '/kitchen/settings' },
      { label: 'Provide Feedback', icon: HiOutlineChatAlt2, path: '/customer/feedback' },
    ];

    const deliveryItems = [
      { label: 'Deliveries', icon: HiOutlineTruck, path: '/delivery/orders' },
      { label: 'History', icon: HiOutlineClipboardList, path: '/delivery/history' },
      { label: 'Settings', icon: HiOutlineCog, path: '/delivery/settings' },
      { label: 'Provide Feedback', icon: HiOutlineChatAlt2, path: '/customer/feedback' },
    ];

    switch (user?.role) {
      case 'admin':
      case 'manager':
        return [...common, ...adminManagerItems];
      case 'staff':
        return [...common, ...staffItems];
      case 'customer':
        return [...common, ...customerItems];
      case 'chef':
        return [...common, ...chefItems];
      case 'delivery':
        return [...common, ...deliveryItems];
      default:
        return common;
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-screen glass-sidebar z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100 dark:border-dark-700/50">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <img src="/logo.png" alt="Rasoi Junction" className="h-10 w-10 flex-shrink-0 rounded-full object-cover bg-white shadow-sm" />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h2 className="text-lg font-bold font-display text-dark-800 dark:text-white">
                    Rasoi Junction
                  </h2>
                  <p className="text-[9px] tracking-widest text-gray-400 uppercase">Enterprise</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
          {menuItems.map((item, index) => {
            if (item.section) {
              return !collapsed ? (
                <p
                  key={`section-${index}`}
                  className="px-3 pt-5 pb-2 text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-dark-500"
                >
                  {item.section}
                </p>
              ) : (
                <div key={`section-${index}`} className="my-3 border-t border-gray-100 dark:border-dark-700/50" />
              );
            }

            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group ${isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-dark-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-dark-800 dark:hover:text-white'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Collapse Toggle */}
        <div className="border-t border-gray-100 dark:border-dark-700/50 p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-dark-800 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-500 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          {user && (
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 p-2.5 mb-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-sm ${collapsed ? 'justify-center' : ''
                }`}
              title="Logout"
            >
              <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-400 transition-colors"
          >
            {collapsed ? (
              <HiOutlineChevronRight className="w-5 h-5" />
            ) : (
              <HiOutlineChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
