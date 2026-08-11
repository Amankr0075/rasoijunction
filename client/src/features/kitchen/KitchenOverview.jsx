import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineFire, HiOutlineCheckCircle, HiOutlineStar, HiOutlineCurrencyRupee } from 'react-icons/hi';
import api from '../../services/api';
import { connectSocket, getSocket } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import { generateSalarySlip } from '../../utils/generateSalarySlip';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const KitchenOverview = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const fetchData = async () => {
    try {
      const [orderRes, profileRes] = await Promise.all([
        api.get('/orders'),
        api.get('/auth/me')
      ]);
      setOrders(orderRes.data);
      setProfile(profileRes.data.user);
    } catch (err) {
      toast.error('Failed to load kitchen data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    connectSocket(user);
    const socket = getSocket();
    
    if (socket) {
      socket.on('new_order', (newOrder) => {
        setOrders((prev) => {
          if (prev.find((o) => o._id === newOrder._id)) return prev;
          return [newOrder, ...prev];
        });
      });
      socket.on('order_status_update', (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      });
    }

    const timer = setInterval(() => setNow(new Date()), 60000); // update wait times every minute

    return () => {
      clearInterval(timer);
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_update');
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <LoadingSkeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending');
  const preparingOrders = orders.filter(o => o.orderStatus === 'accepted' || o.orderStatus === 'preparing');
  const readyOrders = orders.filter(o => o.orderStatus === 'ready');
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const priorityOrders = orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.orderStatus));

  const stats = [
    { title: "Today's Orders", value: todayOrders.length, icon: HiOutlineDocumentText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { title: 'Pending (Queue)', value: pendingOrders.length, icon: HiOutlineClock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { title: 'In Preparation', value: preparingOrders.length, icon: HiOutlineFire, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
    { title: 'Ready for Pickup', value: readyOrders.length, icon: HiOutlineCheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
  ];

  const presentDays = profile?.staffDetails?.attendance?.filter(a => a.status === 'Present' || a.status === 'Half-Day').length || 0;
  const baseSalary = profile?.staffDetails?.salary || 0;
  
  // Calculate payable salary for current month
  const dailyRate = baseSalary / 30;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let penalty = 0;
  
  const thisMonthAttendance = (profile?.staffDetails?.attendance || []).filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  thisMonthAttendance.forEach(a => {
    if (a.status === 'Absent') penalty += dailyRate;
    if (a.status === 'Half-Day') penalty += dailyRate * 0.5;
  });

  const payableSalary = Math.max(0, baseSalary - penalty).toFixed(0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-saffron-500 to-orange-600 p-8 lg:p-10 mb-8 text-white shadow-2xl shadow-primary-500/20"
      >
        <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
              Kitchen Portal
            </span>
            <h1 className="text-3xl lg:text-5xl font-bold font-display drop-shadow-lg tracking-tight">
              Kitchen Dashboard
            </h1>
            <p className="text-white/90 mt-2 text-lg font-medium drop-shadow-md">
              Overview of your daily operations and real-time order statistics.
            </p>
          </div>
          <div className="flex gap-4">
            <div className={`px-5 py-3 ${profile?.staffDetails?.salaryPaid ? 'bg-green-500/20 text-green-100 border-green-500/30' : 'bg-orange-500/20 text-orange-100 border-orange-500/30'} backdrop-blur-md rounded-xl border font-semibold flex flex-col justify-center shadow-lg`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">Payable: ₹{payableSalary}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${profile?.staffDetails?.salaryPaid ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                  {profile?.staffDetails?.salaryPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1 gap-2 text-white/80">
                <span className="text-xs">Base: ₹{baseSalary}</span>
                {profile?.staffDetails?.salaryPaid && profile?.staffDetails?.paymentMethod && (
                  <span className="text-xs font-medium">via {profile?.staffDetails?.paymentMethod}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowAttendanceModal(true)}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-xl border border-white/20 shadow-lg font-semibold flex flex-col items-center justify-center transition-all duration-300"
            >
              <span className="text-lg">Attendance: {presentDays} Days</span>
              <span className="text-xs opacity-80 font-normal mt-1">Click to view details</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.title}
            >
              <Card variant="premium" className="p-6 flex items-center justify-between bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold font-display text-dark-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="p-6 border border-white/20 dark:border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold font-display text-dark-900 dark:text-white mb-6 flex items-center gap-2">
              <HiOutlineFire className="w-6 h-6 text-red-500" />
              Priority Action Needed
            </h2>
            {priorityOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-dark-500 bg-gray-50 dark:bg-dark-800 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                No priority orders. Kitchen is clear! ✨
              </div>
            ) : (
              <div className="space-y-4">
                {priorityOrders.map(order => {
                  const waitMins = Math.round((now - new Date(order.createdAt)) / 60000);
                  const isUrgent = waitMins > 15;
                  
                  return (
                    <div key={order._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-xl transition-colors ${isUrgent ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10' : 'border-gray-100 dark:border-dark-700 hover:border-primary-200'}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-primary-500">{order.orderId}</span>
                          <Badge variant={order.orderStatus === 'pending' ? 'neutral' : 'warning'}>
                            {order.orderStatus.replace('_', ' ')}
                          </Badge>
                          {isUrgent && <Badge variant="error" className="animate-pulse">Urgent</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">
                          <span className="font-semibold text-dark-800 dark:text-white">{order.items.length} items</span> • Ordered at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className={`text-lg font-bold ${isUrgent ? 'text-red-500' : 'text-dark-700 dark:text-dark-300'}`}>
                          {waitMins} min
                        </div>
                        <p className="text-xs text-gray-400">waiting time</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
           <Card className="p-6 h-full bg-gradient-to-br from-dark-800 to-dark-900 text-white border-0 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <HiOutlineClock className="w-32 h-32" />
             </div>
             <h3 className="text-xl font-bold mb-2 relative z-10">Shift Summary</h3>
             <p className="text-dark-300 text-sm mb-8 relative z-10">Keep up the great work today!</p>
             
             <div className="space-y-6 relative z-10">
               <div>
                 <p className="text-dark-400 text-xs uppercase tracking-wider font-semibold mb-1">Total Prepared</p>
                 <p className="text-3xl font-bold text-success-400">
                    {todayOrders.filter(o => ['ready', 'out_for_delivery', 'delivered'].includes(o.orderStatus)).length}
                 </p>
               </div>
               <div>
                 <p className="text-dark-400 text-xs uppercase tracking-wider font-semibold mb-1">Current Backlog</p>
                 <p className="text-3xl font-bold text-orange-400">{pendingOrders.length + preparingOrders.length}</p>
               </div>
               <div>
                 <p className="text-dark-400 text-xs uppercase tracking-wider font-semibold mb-1">Customer Rating</p>
                 <p className="text-3xl font-bold text-yellow-400 flex items-center gap-1">
                   <HiOutlineStar className="fill-current w-6 h-6" /> 
                   {profile?.staffDetails?.rating > 0 ? profile.staffDetails.rating.toFixed(1) : 'New'}
                 </p>
               </div>
             </div>
           </Card>
        </div>
       </div>

      <div className="mt-8">
        <Card variant="glass" className="p-6 border border-white/20 dark:border-white/5 shadow-2xl">
          <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white flex items-center gap-2 mb-6">
            <HiOutlineCurrencyRupee className="w-6 h-6 text-green-500" /> Salary Payment History
          </h3>
          {profile?.staffDetails?.salaryPayments && profile.staffDetails.salaryPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-dark-800 text-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Month/Year</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...profile.staffDetails.salaryPayments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).map((payment, idx) => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return (
                      <tr key={payment._id || idx} className="border-b border-gray-100 dark:border-dark-700 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-800/50">
                        <td className="px-4 py-3 font-medium">{months[payment.month]} {payment.year}</td>
                        <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">₹{payment.amount}</td>
                        <td className="px-4 py-3">{payment.paymentMethod}</td>
                        <td className="px-4 py-3 text-xs">{new Date(payment.paidAt).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => generateSalarySlip(profile, payment, 'view')}
                              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600 rounded font-semibold transition-colors"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => generateSalarySlip(profile, payment, 'download')}
                              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded font-semibold transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <HiOutlineCurrencyRupee className="w-10 h-10 mb-2 text-gray-200 dark:text-dark-700" />
              <p className="text-sm">No salary payments recorded yet.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Day-wise Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-dark-800 dark:text-white">Attendance Records</h3>
              <button onClick={() => setShowAttendanceModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-2 pr-2">
              {profile?.staffDetails?.attendance && profile.staffDetails.attendance.length > 0 ? (
                [...profile.staffDetails.attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).map((record, idx) => {
                  let deduction = 0;
                  if (record.status === 'Absent') deduction = dailyRate;
                  if (record.status === 'Half-Day') deduction = dailyRate * 0.5;
                  
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-900 rounded-lg border border-gray-100 dark:border-dark-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        {deduction > 0 && (
                          <span className="text-xs text-red-500 font-semibold mt-0.5">
                            Deduction: -₹{Math.round(deduction)}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        record.status === 'Present' ? 'bg-green-100 text-green-700' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                        record.status === 'Half-Day' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No attendance records found.</p>
              )}
            </div>
            <button 
              onClick={() => setShowAttendanceModal(false)}
              className="mt-4 w-full py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KitchenOverview;
