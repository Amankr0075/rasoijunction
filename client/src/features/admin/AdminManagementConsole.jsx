import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineStar,
  HiOutlineBell,
  HiOutlineChatAlt2,
  HiOutlineMail,
  HiOutlineSpeakerphone,
  HiOutlineCog,
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { generateFinancialLogExcel } from '../../utils/generateFinancialLogExcel';

const AdminManagementConsole = ({ defaultTab = 'inventory' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // For Staff, limit access
  const isStaff = user?.role?.toLowerCase() === 'staff';

  // 1. Inventory State
  const [inventory, setInventory] = useState([
    { id: 1, itemName: 'Basmati Rice', category: 'Raw Material', stock: 120, unit: 'kg', status: 'In Stock' },
    { id: 2, itemName: 'Boneless Chicken', category: 'Poultry', stock: 8, unit: 'kg', status: 'Low Stock' },
    { id: 3, itemName: 'Amul Butter', category: 'Dairy', stock: 45, unit: 'packs', status: 'In Stock' },
    { id: 4, itemName: 'Paneer (Cottage Cheese)', category: 'Dairy', stock: 0, unit: 'kg', status: 'Out of Stock' },
  ]);

  // 2. Coupons State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await api.get('/coupons');
      setCoupons(res.coupons || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      toast.error('Failed to load coupons.');
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 3. Customers State
  const [customers, setCustomers] = useState([]);

  // 4. Staff State
  const [staff, setStaff] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 5. Feedbacks State
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.feedbacks || []);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbacks();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
      fetchMaintenanceStatus();
    } else if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab]);

  const [replyText, setReplyText] = useState({});

  // 6. KPI Stats State
  const [kpiStats, setKpiStats] = useState({ totalSales: 0, activeTables: 0, orders: [] });

  const fetchKPIStats = async () => {
    try {
      const [ordersRes, resRes] = await Promise.all([
        api.get('/orders'),
        api.get('/reservations')
      ]);

      const orders = ordersRes.data || [];
      const reservations = resRes.data || [];

      // Calculate total sales (delivered orders)
      const totalSales = orders
        .filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'completed')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Calculate active tables (approved or pending reservations for today/future)
      const activeTables = reservations.filter(r => r.status === 'approved' || r.status === 'pending').length;

      setKpiStats({ totalSales, activeTables, orders, reservations });
    } catch (err) {
      console.error('Failed to fetch KPI stats:', err);
    }
  };

  // States for creation forms
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponFormData, setCouponFormData] = useState({ code: '', type: 'Percentage', value: '', minOrder: '' });

  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormRole, setUserFormRole] = useState('customer'); // 'customer', 'staff', 'chef', 'delivery', 'manager'
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', phone: '', salary: '', employeeId: '' });

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code || !couponFormData.value) {
      toast.error('Please enter coupon code and discount value.');
      return;
    }
    try {
      const payload = {
        code: couponFormData.code.toUpperCase().replace(/\s+/g, ''),
        type: couponFormData.type,
        value: parseFloat(couponFormData.value),
        minOrder: parseFloat(couponFormData.minOrder) || 0,
        status: 'Active',
      };
      await api.post('/coupons', payload);
      setCouponFormData({ code: '', type: 'Percentage', value: '', minOrder: '' });
      setShowCouponForm(false);
      toast.success(`Coupon code ${payload.code} created successfully!`);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create coupon.');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      toast.error('Name, Email, and Password are required.');
      return;
    }
    try {
      const payload = {
        name: userFormData.name,
        email: userFormData.email,
        password: userFormData.password,
        phone: userFormData.phone,
        role: userFormRole,
      };
      if (!payload.phone || payload.phone.trim() === '') {
        delete payload.phone;
      }
      if (userFormRole !== 'customer' && userFormData.salary) {
        payload.staffDetails = { salary: Number(userFormData.salary) };
      }
      if (userFormRole !== 'customer' && userFormData.employeeId) {
        payload.employeeId = userFormData.employeeId;
      }
      await api.post('/auth/users', payload);
      toast.success(`${userFormRole} created successfully!`);
      setShowUserForm(false);
      setUserFormData({ name: '', email: '', password: '', phone: '', salary: '', employeeId: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register user.');
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/auth/users', { params: { limit: 100 } });
      const allUsers = res.data.users || [];

      const customerList = allUsers.filter(u => u.role === 'customer');
      let staffList = allUsers.filter(u => u.role !== 'customer');
      if (user?.role?.toLowerCase() === 'manager') {
        staffList = staffList.filter(u => u.role?.toLowerCase() !== 'admin');
      }

      setCustomers(customerList.map(c => ({
        ...c,
        totalOrders: c.totalOrders || 0,
        loyaltyPoints: c.loyaltyPoints || 0
      })));
      setStaff(staffList);
    } catch (err) {
      console.error('Failed to load customers/staff:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success(`${role} deleted successfully!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${role}`);
    }
  };

  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editUserFormData, setEditUserFormData] = useState({ id: '', name: '', email: '', phone: '', role: '', employeeId: '' });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAttendanceStaff, setSelectedAttendanceStaff] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');

  const [showPaySalaryModal, setShowPaySalaryModal] = useState(false);
  const [selectedSalaryStaff, setSelectedSalaryStaff] = useState(null);
  const [paySalaryData, setPaySalaryData] = useState({ month: new Date().getMonth(), year: new Date().getFullYear(), amount: '', paymentMethod: 'Cash' });

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUserFormData.name || !editUserFormData.email) {
      toast.error('Name and Email are required.');
      return;
    }

    try {
      const payload = {
        name: editUserFormData.name,
        email: editUserFormData.email,
        phone: editUserFormData.phone,
        role: editUserFormData.role
      };

      if (editUserFormData.password) {
        payload.password = editUserFormData.password;
      }

      if (editUserFormData.role !== 'customer' && editUserFormData.staffDetails) {
        payload.staffDetails = editUserFormData.staffDetails;
      }
      if (editUserFormData.role !== 'customer' && editUserFormData.employeeId) {
        payload.employeeId = editUserFormData.employeeId;
      }

      await api.put(`/auth/users/${editUserFormData.id}`, payload);
      toast.success('User updated successfully! Notification sent.');
      setShowEditUserForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedAttendanceStaff) return;
    try {
      await api.put(`/auth/users/${selectedAttendanceStaff._id || selectedAttendanceStaff.id}/attendance`, {
        date: attendanceDate,
        status: attendanceStatus
      });
      toast.success(`Attendance marked as ${attendanceStatus}`);
      setShowAttendanceModal(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to mark attendance.');
    }
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    if (!selectedSalaryStaff) return;
    if (!paySalaryData.amount || Number(paySalaryData.amount) < 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    try {
      await api.post(`/auth/users/${selectedSalaryStaff._id || selectedSalaryStaff.id}/salary-payment`, {
        month: Number(paySalaryData.month),
        year: Number(paySalaryData.year),
        amount: Number(paySalaryData.amount),
        paymentMethod: paySalaryData.paymentMethod
      });
      toast.success('Salary payment recorded successfully!');
      setShowPaySalaryModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record salary payment.');
    }
  };

  // 5. Customer Reviews State
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  // 6. System Notifications State
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted successfully!');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete review.');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      toast.success('Notification deleted!');
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete notification.');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      toast.success('All notifications marked as read!');
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark notifications read.');
    }
  };

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ subject: '', message: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject || !broadcastData.message) {
      toast.error('Please provide both subject and message.');
      return;
    }

    setIsBroadcasting(true);
    try {
      const formData = new FormData();
      formData.append('subject', broadcastData.subject);
      formData.append('message', broadcastData.message);
      if (broadcastData.attachment) {
        formData.append('attachment', broadcastData.attachment);
      }

      await api.post('/notifications/broadcast', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Broadcast sent successfully!');
      setShowBroadcastModal(false);
      setBroadcastData({ subject: '', message: '', attachment: null });
      fetchNotifications(); // Refresh notifications log
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast.');
    } finally {
      setIsBroadcasting(false);
    }
  };



  // 8. Maintenance Mode State
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const fetchMaintenanceStatus = async () => {
    try {
      const res = await api.get('/system/maintenance/status');
      setIsMaintenanceMode(res.isMaintenanceMode);
    } catch (err) {
      console.error('Failed to load maintenance status:', err);
    }
  };

  const handleToggleMaintenance = async () => {
    const action = isMaintenanceMode ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} Maintenance Mode?`)) return;

    try {
      const res = await api.post('/system/maintenance/toggle', { enabled: !isMaintenanceMode });
      setIsMaintenanceMode(res.isMaintenanceMode);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle maintenance mode.');
    }
  };

  // 7. Contact Inquiries State
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.contacts || []);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Inquiry deleted successfully!');
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete inquiry.');
    }
  };

  // Operational toggles / modifiers
  const handleRestock = (id) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: item.stock + 20, status: 'In Stock' }
          : item
      )
    );
    toast.success('Stock replenished successfully! 📦');
  };

  const handleToggleCoupon = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/coupons/${id}`, { status: newStatus });
      toast.success('Coupon status updated!');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update coupon status.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete coupon.');
    }
  };

  const handleReplyFeedback = async (id) => {
    const text = replyText[id];
    if (!text || !text.trim()) {
      toast.error('Please enter a reply.');
      return;
    }
    try {
      await api.put(`/feedbacks/${id}/reply`, { replyText: text.trim() });
      setReplyText(prev => ({ ...prev, [id]: '' }));
      toast.success('Reply submitted successfully!');
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit reply.');
    }
  };

  const handleReplyContact = async (id) => {
    const text = replyText[id];
    if (!text || !text.trim()) {
      toast.error('Please enter a reply.');
      return;
    }
    try {
      await api.put(`/contacts/${id}/reply`, { replyText: text.trim() });
      setReplyText(prev => ({ ...prev, [id]: '' }));
      toast.success('Reply submitted successfully!');
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit reply.');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(`/feedbacks/${id}`);
      toast.success('Feedback deleted successfully.');
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete feedback.');
    }
  };

  const handleExportCSV = async () => {
    try {
      await generateFinancialLogExcel({ ...kpiStats, customers });
      toast.success('Financial Logs report generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Excel report');
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchKPIStats();
    }
  }, [activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Title details */}
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white capitalize">
            Enterprise {activeTab} Control Console
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            {user?.role === 'staff'
              ? 'View and manage customer reviews for our services and food.'
              : 'Enterprise administration control hub. Audit inventory, roster shifts, manage coupons, and export sales reports.'}
          </p>
        </div>

        {/* Console tab headers */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-dark-800 pb-3">
          {[
            { id: 'inventory', label: 'Inventory Stock', icon: HiOutlineCube },
            { id: 'coupons', label: 'Festival Coupons', icon: HiOutlineTag },
            { id: 'customers', label: 'Customer Index', icon: HiOutlineUsers },
            { id: 'staff', label: 'Staff Roster', icon: HiOutlineUserGroup },
            { id: 'reports', label: 'Auditing Reports', icon: HiOutlineChartBar },
            { id: 'reviews', label: 'Customer Reviews', icon: HiOutlineStar },
            { id: 'feedback', label: 'Customer Feedback', icon: HiOutlineChatAlt2 },
            { id: 'notifications', label: 'System Notifications', icon: HiOutlineBell },
            { id: 'contacts', label: 'Contact Messages', icon: HiOutlineMail },
          ].filter(tab => {
            if (user?.role === 'staff') {
              return tab.id === 'reviews';
            }
            return true;
          }).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                  : 'text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab display sections */}
        <div className="space-y-6">
          {activeTab === 'inventory' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white">Ingredient Stock Catalog</h3>
              </div>
              <Table
                columns={[
                  { header: 'Material Name', field: 'itemName' },
                  { header: 'Category', field: 'category' },
                  { header: 'Stock Value', field: 'stock', render: (stock, row) => `${stock} ${row.unit}` },
                  {
                    header: 'Status',
                    field: 'status',
                    render: (status) => (
                      <Badge variant={status === 'In Stock' ? 'success' : status === 'Low Stock' ? 'warning' : 'danger'} dot>
                        {status}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Actions',
                    field: 'id',
                    render: (id) => (
                      <Button variant="ghost" size="sm" onClick={() => handleRestock(id)}>
                        Replenish (+20)
                      </Button>
                    ),
                  },
                ]}
                data={inventory}
              />
            </Card>
          )}

          {activeTab === 'coupons' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white">Active Promo Coupon Registry</h3>
                <Button variant="primary" size="sm" onClick={() => setShowCouponForm(!showCouponForm)}>
                  <HiOutlinePlus className="w-4 h-4 mr-1 inline" /> Create Coupon
                </Button>
              </div>

              {showCouponForm && (
                <form onSubmit={handleCreateCoupon} className="mb-6 p-4 border border-gray-100 dark:border-dark-700 rounded-xl bg-gray-50/50 dark:bg-dark-900/30 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. FESTIVAL50"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Discount Type</label>
                    <select
                      value={couponFormData.type}
                      onChange={(e) => setCouponFormData({ ...couponFormData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Value</label>
                    <input
                      type="number"
                      placeholder="Value"
                      value={couponFormData.value}
                      onChange={(e) => setCouponFormData({ ...couponFormData, value: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Min Order</label>
                    <input
                      type="number"
                      placeholder="Min Order"
                      value={couponFormData.minOrder}
                      onChange={(e) => setCouponFormData({ ...couponFormData, minOrder: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowCouponForm(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" type="submit">Submit</Button>
                  </div>
                </form>
              )}
              <Table
                columns={[
                  { header: 'Coupon Code', field: 'code', render: (code) => <span className="font-mono font-bold text-primary-500">{code}</span> },
                  { header: 'Discount Type', field: 'type' },
                  { header: 'Value', field: 'value', render: (val, row) => row.type === 'Percentage' ? `${val}%` : `₹${val}` },
                  { header: 'Min Order Amount', field: 'minOrder', render: (amt) => `₹${amt}` },
                  { header: 'Status', field: 'status', render: (s) => <Badge variant={s === 'Active' ? 'success' : 'neutral'} dot>{s}</Badge> },
                  {
                    header: 'Actions',
                    field: '_id',
                    render: (id, row) => (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleToggleCoupon(id, row.status)}>
                          {row.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 font-bold"
                          onClick={() => handleDeleteCoupon(id)}
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={coupons}
              />
            </Card>
          )}

          {activeTab === 'customers' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white">Verified Customer Directory</h3>
                <Button variant="primary" size="sm" onClick={() => { setUserFormRole('customer'); setShowUserForm(true); }}>
                  <HiOutlinePlus className="w-4 h-4 mr-1 inline" /> Add Customer
                </Button>
              </div>
              <Table
                columns={[
                  { header: 'Customer Name', field: 'name' },
                  { header: 'Email Address', field: 'email' },
                  { header: 'Phone Number', field: 'phone' },
                  { header: 'Orders Count', field: 'totalOrders' },
                  { header: 'Loyalty Points', field: 'loyaltyPoints' },
                  {
                    header: 'Actions',
                    field: '_id',
                    render: (val, row) => (
                      <div className="flex space-x-2">
                        {user?.role !== 'manager' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-700 font-bold"
                              onClick={() => {
                                setEditUserFormData({
                                  id: row._id || row.id,
                                  name: row.name,
                                  email: row.email,
                                  phone: row.phone || '',
                                  role: row.role,
                                  staffDetails: row.staffDetails || { salary: '', rating: '' },
                                  employeeId: row.employeeId || ''
                                });
                                setShowEditUserForm(true);
                              }}
                            >
                              <HiOutlinePencilAlt className="w-4 h-4 mr-1 inline" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 font-bold"
                              onClick={() => handleDeleteUser(row._id || row.id, 'Customer')}
                            >
                              <HiOutlineTrash className="w-4 h-4 mr-1 inline" /> Delete
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">View Only</span>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={customers}
              />
            </Card>
          )}

          {activeTab === 'staff' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white font-display">Staff Shift Scheduler</h3>
                <Button variant="primary" size="sm" onClick={() => { setUserFormRole('staff'); setShowUserForm(true); }}>
                  <HiOutlinePlus className="w-4 h-4 mr-1 inline" /> Add Staff
                </Button>
              </div>
              <Table
                columns={[
                  { header: 'Employee Name', field: 'name' },
                  { header: 'Operational Role', field: 'role' },
                  { header: 'Employee ID', field: 'employeeId' },
                  { header: 'Contact Number', field: 'phone' },
                  { header: 'Shift Window', field: 'shift', render: (s) => <span className="text-sm font-semibold">{s || 'Not Assigned'}</span> },
                  {
                    header: 'Actions',
                    field: '_id',
                    render: (val, row) => (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-700 font-bold"
                          onClick={() => {
                            setEditUserFormData({
                              id: row._id || row.id,
                              name: row.name,
                              email: row.email,
                              phone: row.phone || '',
                              role: row.role,
                              staffDetails: row.staffDetails || { salary: '', rating: '' },
                              employeeId: row.employeeId || ''
                            });
                            setShowEditUserForm(true);
                          }}
                        >
                          <HiOutlinePencilAlt className="w-4 h-4 mr-1 inline" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-500 hover:text-green-700 font-bold"
                          onClick={() => {
                            setSelectedAttendanceStaff(row);
                            setAttendanceDate(new Date().toISOString().split('T')[0]);
                            setAttendanceStatus('Present');
                            setShowAttendanceModal(true);
                          }}
                        >
                          Manage Attendance
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-500 hover:text-orange-700 font-bold"
                          onClick={() => {
                            const baseSalary = row.staffDetails?.salary || 0;
                            const dailyRate = baseSalary / 30;
                            const attendance = row.staffDetails?.attendance || [];
                            const currentMonth = new Date().getMonth();
                            const currentYear = new Date().getFullYear();

                            const currentMonthRecords = attendance.filter(a => {
                              try {
                                const d = new Date(a.date);
                                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                              } catch { return false; }
                            });

                            let penalty = 0;
                            currentMonthRecords.forEach(a => {
                              if (a.status === 'Absent') penalty += dailyRate;
                              if (a.status === 'Half-Day') penalty += (dailyRate * 0.5);
                            });

                            const payable = Math.max(0, baseSalary - penalty).toFixed(0);

                            setSelectedSalaryStaff(row);
                            setPaySalaryData({
                              month: currentMonth,
                              year: currentYear,
                              amount: payable,
                              paymentMethod: 'Cash'
                            });
                            setShowPaySalaryModal(true);
                          }}
                        >
                          Pay Salary
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 font-bold"
                          onClick={() => handleDeleteUser(row._id || row.id, 'Staff')}
                        >
                          <HiOutlineTrash className="w-4 h-4 mr-1 inline" /> Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={staff}
              />
            </Card>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 md:col-span-1 space-y-4">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white">Export Financial Logs</h3>
                <p className="text-xs text-gray-500">Download itemized sales metrics, booking frequencies and invoice entries formatted as CSV spreadsheet.</p>
                <Button variant="primary" className="w-full py-3 gap-1.5" onClick={handleExportCSV}>
                  <HiOutlineDownload className="w-5 h-5" /> Export Sales Log (Excel)
                </Button>
              </Card>

              <Card className="p-6 md:col-span-2 space-y-3">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white">Enterprise KPI Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
                    <p className="text-xs text-gray-400">Total Sales</p>
                    <p className="text-2xl font-black text-dark-800 dark:text-white mt-1">₹{kpiStats.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
                    <p className="text-xs text-gray-400">Active Dining Bookings</p>
                    <p className="text-2xl font-black text-dark-800 dark:text-white mt-1">{kpiStats.activeTables} Tables</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'reviews' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white">Customer Feedback Dashboard</h3>
              </div>
              <Table
                columns={[
                  { header: 'Dish / Service', field: 'dishName', render: (val) => <span className="font-semibold text-primary-500">{val}</span> },
                  { header: 'Customer', field: 'customerName' },
                  {
                    header: 'Rating',
                    field: 'rating',
                    render: (stars) => (
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <HiOutlineStar key={i} className={`w-4 h-4 ${i < stars ? 'fill-current' : 'text-gray-300 dark:text-dark-700'}`} />
                        ))}
                      </div>
                    ),
                  },
                  { header: 'Comment', field: 'comment', render: (text) => <p className="max-w-md truncate text-xs">{text}</p> },
                  { header: 'Date', field: 'date', render: (d, row) => <span className="text-xs text-gray-500">{d || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '')}</span> },
                  {
                    header: 'Actions',
                    field: '_id',
                    render: (id) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 font-bold"
                        onClick={() => handleDeleteReview(id)}
                      >
                        <HiOutlineTrash className="w-4 h-4 mr-1 inline" /> Delete
                      </Button>
                    ),
                  },
                ]}
                data={reviews}
              />
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-dark-800 dark:text-white">System Settings & Logs</h3>
                  <p className="text-xs text-gray-500">Manage global platform state and view automated system logs.</p>
                </div>
                <div className="flex gap-2">
                  {user?.role === 'admin' && (
                    <Button
                      variant={isMaintenanceMode ? "danger" : "outline"}
                      size="sm"
                      onClick={handleToggleMaintenance}
                      className={isMaintenanceMode ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : ""}
                    >
                      <HiOutlineCog className="w-4 h-4 mr-1 inline" />
                      {isMaintenanceMode ? 'Maintenance Mode: ON' : 'Enable Maintenance'}
                    </Button>
                  )}
                  <Button variant="primary" size="sm" onClick={() => setShowBroadcastModal(true)}>
                    <HiOutlineSpeakerphone className="w-4 h-4 mr-1 inline" /> Broadcast
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleMarkAllNotificationsRead}>
                    Mark Read
                  </Button>
                </div>
              </div>
              <Table
                columns={[
                  {
                    header: 'Type',
                    field: 'type',
                    render: (type, row) => (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.read ? 'bg-gray-100 text-gray-400 dark:bg-dark-800 dark:text-dark-500' : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                        }`}>
                        {type}
                      </span>
                    ),
                  },
                  {
                    header: 'Message',
                    field: 'message',
                    render: (msg, row) => (
                      <span className={row.read ? 'text-gray-400 dark:text-dark-500 text-xs' : 'text-dark-800 dark:text-white font-medium text-xs'}>
                        {msg}
                      </span>
                    ),
                  },
                  { header: 'Time', field: 'time', render: (t, row) => <span className="text-xs text-gray-400">{t || (row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : '')}</span> },
                  {
                    header: 'Actions',
                    field: '_id',
                    render: (id) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 font-bold"
                        onClick={() => handleDeleteNotification(id)}
                      >
                        <HiOutlineTrash className="w-4 h-4 mr-1 inline" /> Dismiss
                      </Button>
                    ),
                  },
                ]}
                data={notifications}
              />
            </Card>
          )}

          {activeTab === 'feedback' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white font-display">Customer Service Tickets</h3>
              </div>
              <Table
                columns={[
                  { header: 'Customer', field: 'customerName', render: (val, row) => <div><p className="font-semibold text-sm">{val}</p><p className="text-[10px] text-gray-400">{row.customerEmail}</p></div> },
                  { header: 'Subject', field: 'subject', render: (val) => <span className="font-semibold text-primary-500 text-xs">{val}</span> },
                  { header: 'Message', field: 'message', render: (val) => <p className="max-w-xs break-words text-xs">{val}</p> },
                  { header: 'Date', field: 'date', render: (d, row) => <span className="text-xs text-gray-500">{d || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '')}</span> },
                  {
                    header: 'Status',
                    field: 'reply',
                    render: (reply) => <Badge variant={reply ? 'success' : 'warning'}>{reply ? 'Replied' : 'Pending Reply'}</Badge>
                  },
                  {
                    header: 'Reply / Actions',
                    field: '_id',
                    render: (id, row) => (
                      <div className="space-y-2">
                        {row.reply ? (
                          <div className="bg-green-50/50 dark:bg-green-500/5 border-l-2 border-l-green-500 p-2.5 rounded-r-lg max-w-xs">
                            <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Reply Sent</p>
                            <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed italic">"{row.reply}"</p>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-end max-w-xs">
                            <input
                              type="text"
                              placeholder="Type reply..."
                              value={replyText[id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [id]: e.target.value })}
                              className="w-full px-2 py-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-xs focus:outline-none focus:border-primary-500"
                            />
                            <Button variant="primary" size="sm" onClick={() => handleReplyFeedback(id)}>Send</Button>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 font-bold"
                          onClick={() => handleDeleteFeedback(id)}
                        >
                          <HiOutlineTrash className="w-4 h-4 mr-1 inline" /> Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={feedbacks}
              />
            </Card>
          )}

          {activeTab === 'contacts' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white font-display">Contact Form Messages</h3>
              </div>
              <Table
                columns={[
                  { header: 'Sender', field: 'name', render: (val, row) => <div><p className="font-semibold text-sm">{val}</p><p className="text-[10px] text-gray-400">{row.email}</p></div> },
                  { header: 'Subject', field: 'subject', render: (val) => <span className="font-semibold text-primary-500 text-xs">{val}</span> },
                  { header: 'Message', field: 'message', render: (val) => <p className="max-w-md break-words text-xs">{val}</p> },
                  { header: 'Date', field: 'createdAt', render: (d) => <span className="text-xs text-gray-500">{d ? new Date(d).toLocaleDateString() : ''}</span> },
                  {
                    header: 'Status',
                    field: 'reply',
                    render: (reply) => <Badge variant={reply ? 'success' : 'warning'}>{reply ? 'Replied' : 'Pending Reply'}</Badge>
                  },
                  {
                    header: 'Reply / Actions',
                    field: '_id',
                    render: (id, row) => (
                      <div className="space-y-2">
                        {row.reply ? (
                          <div className="bg-green-50/50 dark:bg-green-500/5 border-l-2 border-l-green-500 p-2.5 rounded-r-lg max-w-xs">
                            <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Reply Sent</p>
                            <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed italic">"{row.reply}"</p>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-end max-w-xs">
                            <input
                              type="text"
                              placeholder="Type reply..."
                              value={replyText[id] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [id]: e.target.value })}
                              className="w-full px-2 py-1.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-xs focus:outline-none focus:border-primary-500"
                            />
                            <Button variant="primary" size="sm" onClick={() => handleReplyContact(id)}>Send</Button>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 font-bold"
                          onClick={() => handleDeleteContact(id)}
                        >
                          <HiOutlineTrash className="w-4 h-4 mr-1 inline" /> Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={contacts}
              />
            </Card>
          )}
        </div>
      </div>

      {/* User Creation Modal */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-dark-800"
          >
            <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-4">
              Add New {userFormRole === 'customer' ? 'Customer' : 'Staff Member'}
            </h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              {userFormRole !== 'customer' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Staff Role</label>
                  <select
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="staff">Staff / Roster</option>
                    <option value="chef">Chef</option>
                    <option value="delivery">Delivery Partner</option>
                    <option value="manager">Manager</option>
                    {user?.role?.toLowerCase() !== 'manager' && (
                      <option value="admin">Administrator</option>
                    )}
                  </select>
                </div>
              )}
              {userFormRole !== 'customer' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Employee ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="RJ123456"
                        value={userFormData.employeeId || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, employeeId: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const randomNum = Math.floor(100000 + Math.random() * 900000);
                          setUserFormData({ ...userFormData, employeeId: `RJ${randomNum}` });
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Base Salary (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 15000"
                      value={userFormData.salary || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, salary: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowUserForm(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Add User</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Edit User Modal */}
      {showEditUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-dark-800"
          >
            <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-4">
              Edit User Details
            </h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={editUserFormData.name}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={editUserFormData.email}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={editUserFormData.phone}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={editUserFormData.password || ''}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
                <select
                  value={editUserFormData.role}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff / Roster</option>
                  <option value="chef">Chef</option>
                  <option value="delivery">Delivery Partner</option>
                  <option value="manager">Manager</option>
                  {user?.role?.toLowerCase() !== 'manager' && (
                    <option value="admin">Administrator</option>
                  )}
                </select>
              </div>
              {editUserFormData.role && editUserFormData.role !== 'customer' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Employee ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="RJ123456"
                        value={editUserFormData.employeeId || ''}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, employeeId: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const randomNum = Math.floor(100000 + Math.random() * 900000);
                          setEditUserFormData({ ...editUserFormData, employeeId: `RJ${randomNum}` });
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Salary (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        value={editUserFormData.staffDetails?.salary || ''}
                        onChange={(e) => setEditUserFormData({
                          ...editUserFormData,
                          staffDetails: { ...editUserFormData.staffDetails, salary: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Rating</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="e.g. 4.5"
                        value={editUserFormData.staffDetails?.rating || ''}
                        onChange={(e) => setEditUserFormData({
                          ...editUserFormData,
                          staffDetails: { ...editUserFormData.staffDetails, rating: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowEditUserForm(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Changes</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Attendance Modal */}
      {showAttendanceModal && selectedAttendanceStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden p-6"
          >
            <h3 className="font-bold text-xl text-dark-900 dark:text-white mb-4">
              Mark Attendance for {selectedAttendanceStaff.name}
            </h3>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl px-4 py-2 text-dark-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl px-4 py-2 text-dark-900 dark:text-white"
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => setShowAttendanceModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Attendance
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-dark-700">
              <h3 className="font-bold text-lg text-dark-900 dark:text-white">
                Broadcast Message
              </h3>
            </div>
            <form onSubmit={handleBroadcast} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl px-4 py-2 text-dark-900 dark:text-white"
                  value={broadcastData.subject}
                  onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl px-4 py-2 text-dark-900 dark:text-white"
                  rows="4"
                  placeholder="Enter the broadcast message here..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
                  onChange={(e) => setBroadcastData({ ...broadcastData, attachment: e.target.files[0] })}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowBroadcastModal(false)} disabled={isBroadcasting}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" disabled={isBroadcasting}>
                  {isBroadcasting ? 'Sending...' : 'Broadcast'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Pay Salary Modal */}
      {showPaySalaryModal && selectedSalaryStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden p-6"
          >
            <h3 className="font-bold text-xl text-dark-900 dark:text-white mb-4">
              Pay Salary - {selectedSalaryStaff.name}
            </h3>
            <form onSubmit={handlePaySalary} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <select
                    value={paySalaryData.month}
                    onChange={(e) => setPaySalaryData({ ...paySalaryData, month: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={paySalaryData.year}
                    onChange={(e) => setPaySalaryData({ ...paySalaryData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={paySalaryData.amount}
                  onChange={(e) => setPaySalaryData({ ...paySalaryData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select
                  value={paySalaryData.paymentMethod}
                  onChange={(e) => setPaySalaryData({ ...paySalaryData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowPaySalaryModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Record Payment</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminManagementConsole;
