import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  HiOutlineCurrencyRupee,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineArrowRight,
  HiOutlineCog,
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// Animated counter
const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

import { useAuth } from '../../context/AuthContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Role guard — allow admin, manager only
  if (user && !['admin', 'manager'].includes(user.role?.toLowerCase())) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-2xl font-bold text-red-500 mb-2">Access Denied</p>
          <p className="text-gray-500">You don't have permission to view the Admin Dashboard.</p>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, usersRes, reservationsRes, maintenanceRes] = await Promise.all([
          api.get('/orders', { params: { limit: 100 } }),
          api.get('/auth/users', { params: { limit: 100 } }),
          api.get('/reservations', { params: { limit: 100 } }),
          api.get('/system/maintenance/status'),
        ]);

        setOrders(ordersRes.data || []);
        setUsers(usersRes.data.users || []);
        setReservations(reservationsRes.data || []);
        setIsMaintenanceMode(maintenanceRes.isMaintenanceMode);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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

  // 1. Total Revenue
  const totalRevenue = orders
    .filter(o => o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // 2. Total Orders
  const totalOrdersCount = orders.length;

  // 3. Total Customers
  const totalCustomersCount = users.filter(u => u.role === 'customer').length;

  // 4. Total Staff
  const totalStaffCount = users.filter(u => {
    if (u.role === 'customer') return false;
    if (user?.role?.toLowerCase() === 'manager' && u.role?.toLowerCase() === 'admin') return false;
    return true;
  }).length;

  // 5. Reservations count
  const reservationsCount = reservations.length;

  // 6. Pending Orders count
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;

  // 7. Completed count
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'delivered').length;

  // 8. Cancelled count
  const cancelledOrdersCount = orders.filter(o => o.orderStatus === 'cancelled').length;

  const stats = [
    { label: 'Total Revenue', value: totalRevenue, prefix: '₹', icon: HiOutlineCurrencyRupee, change: '+12.5%', trend: 'up', color: 'from-emerald-400 to-emerald-600' },
    { label: 'Total Orders', value: totalOrdersCount, icon: HiOutlineShoppingBag, change: '+8.2%', trend: 'up', color: 'from-blue-400 to-blue-600', path: '/admin/orders' },
    { label: 'Total Customers', value: totalCustomersCount, icon: HiOutlineUsers, change: '+15.3%', trend: 'up', color: 'from-violet-400 to-violet-600', path: '/admin/customers' },
    { label: 'Total Staff', value: totalStaffCount, icon: HiOutlineUserGroup, change: '+2', trend: 'up', color: 'from-amber-400 to-amber-600', path: '/admin/staff' },
    { label: 'Reservations', value: reservationsCount, icon: HiOutlineCalendar, change: '+5.1%', trend: 'up', color: 'from-pink-400 to-pink-600', path: '/admin/reservations' },
    { label: 'Pending Orders', value: pendingOrdersCount, icon: HiOutlineClock, change: '-3', trend: 'down', color: 'from-orange-400 to-orange-600', path: '/admin/orders' },
    { label: 'Completed', value: completedOrdersCount, icon: HiOutlineCheckCircle, change: '+9.8%', trend: 'up', color: 'from-teal-400 to-teal-600', path: '/admin/orders' },
    { label: 'Cancelled', value: cancelledOrdersCount, icon: HiOutlineXCircle, change: '-2.1%', trend: 'down', color: 'from-red-400 to-red-600', path: '/admin/orders' },
  ];

  // 1. Weekly Sales
  const getWeeklySales = () => {
    const sales = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach(o => {
      if (o.orderStatus === 'delivered') {
        const day = new Date(o.createdAt).getDay();
        const index = day === 0 ? 6 : day - 1;
        sales[index] += o.total || 0;
      }
    });
    return sales;
  };
  const weeklySales = getWeeklySales();
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'This Week',
        data: weeklySales,
        borderColor: '#E67E22',
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#E67E22',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ],
  };

  // 2. Category distribution
  const getCategoryStats = () => {
    const categoriesMap = { 'North Indian': 0, 'South Indian': 0, 'Chinese': 0, 'Italian': 0, 'Desserts': 0, 'Beverages': 0 };
    orders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const cat = item.menuitem?.category;
          if (cat && categoriesMap[cat] !== undefined) {
            categoriesMap[cat] += item.quantity || 1;
          }
        });
      }
    });
    return Object.values(categoriesMap);
  };
  const categoryCounts = getCategoryStats();
  const categoryChartData = {
    labels: ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Desserts', 'Beverages'],
    datasets: [{
      data: categoryCounts,
      backgroundColor: [
        '#E67E22', '#27AE60', '#3498DB', '#9B59B6', '#E74C3C', '#F39C12',
      ],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  // 3. Order status counts
  const pendingCount = orders.filter(o => o.orderStatus === 'pending').length;
  const preparingCount = orders.filter(o => o.orderStatus === 'preparing' || o.orderStatus === 'accepted').length;
  const readyCount = orders.filter(o => o.orderStatus === 'ready').length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;
  const cancelledCount = orders.filter(o => o.orderStatus === 'cancelled').length;

  const orderStatusData = {
    labels: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    datasets: [{
      label: 'Orders',
      data: [pendingCount, preparingCount, readyCount, deliveredCount, cancelledCount],
      backgroundColor: [
        'rgba(249, 115, 22, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { family: 'Inter', size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { family: 'Inter', size: 11 } },
      },
    },
  };

  // 4. Recent orders
  const recentOrders = orders.slice(0, 5).map(o => ({
    id: o.orderId,
    customer: o.user?.name || 'Guest User',
    items: o.items?.map(it => `${it.menuitem?.name || 'Dish'} (${it.quantity})`).join(', ') || 'No Items',
    total: o.total,
    status: o.orderStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const statusColors = {
    'Delivered': 'success',
    'Preparing': 'info',
    'Ready': 'warning',
    'Pending': 'neutral',
    'Cancelled': 'danger',
    'Accepted': 'warning',
    'Out For Delivery': 'info',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">Loading system metrics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-block px-3 py-1 mb-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest">
            Admin Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-dark-900 dark:text-white drop-shadow-sm">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-saffron-500">{user?.name?.split(' ')[0] || user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span> 👋
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">Here's what's happening at Rasoi Junction today</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {user?.role === 'admin' && (
            <Button 
              variant={isMaintenanceMode ? "danger" : "outline"} 
              onClick={handleToggleMaintenance}
              className={isMaintenanceMode ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : ""}
            >
              <HiOutlineCog className="w-5 h-5 inline mr-1" />
              {isMaintenanceMode ? 'Maintenance Mode is ON' : 'Enable Maintenance Mode'}
            </Button>
          )}
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Card variant="premium" onClick={() => stat.path && navigate(stat.path)} className={`relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 ${stat.path ? 'cursor-pointer' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold font-display text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} />
                  </p>
                  <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${
                    stat.trend === 'up' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    {stat.trend === 'up' ? (
                      <HiOutlineTrendingUp className="w-4 h-4" />
                    ) : (
                      <HiOutlineTrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                    <span className="text-gray-400 dark:text-dark-500 ml-1 font-medium">vs last month</span>
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-xl shadow-[${stat.color.split(' ')[0].replace('from-', '')}]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
              {/* Decorative gradient line at bottom */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl">
            <Card.Header className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700/50 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">Sales Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 font-medium">Weekly revenue comparison</p>
                </div>
                <select className="text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl px-4 py-2 text-dark-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500/30 shadow-sm font-medium outline-none">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
            </Card.Header>
            <Card.Body className="h-72">
              <Line data={salesChartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </motion.div>

        {/* Category Doughnut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl">
            <Card.Header className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700/50 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">Category Sales</h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 font-medium">Distribution by cuisine</p>
            </Card.Header>
            <Card.Body className="h-72 flex items-center justify-center">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        font: { family: 'Inter', size: 11 },
                      },
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* Order Status Bar + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl">
            <Card.Header className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700/50 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">Order Status</h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 font-medium">Current distribution</p>
            </Card.Header>
            <Card.Body className="h-72">
              <Bar
                data={orderStatusData}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: { ...chartOptions.plugins, legend: { display: false } },
                }}
              />
            </Card.Body>
          </Card>
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl">
            <Card.Header className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700/50 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">Recent Orders</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 font-medium">Latest 5 orders</p>
                </div>
                <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold bg-primary-50 dark:bg-primary-500/10 px-4 py-2 rounded-xl transition-colors">
                  View All <HiOutlineArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </Card.Header>
            <Card.Body padding="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-dark-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Order ID</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider hidden md:table-cell">Items</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Total</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono font-semibold text-primary-500">{order.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-dark-800 dark:text-white">{order.customer}</span>
                          <p className="text-xs text-gray-400 dark:text-dark-500">{order.time}</p>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-dark-300 line-clamp-1">{order.items}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-dark-800 dark:text-white">₹{order.total}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusColors[order.status]} dot>{order.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
