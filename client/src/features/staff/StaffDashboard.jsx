import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import { HiOutlineUserGroup, HiOutlineCurrencyRupee, HiOutlineStar, HiOutlineCalendar, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineDownload } from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { generateSalarySlip } from '../../utils/generateSalarySlip';
import toast from 'react-hot-toast';

const ALLOWED_ROLES = ['staff', 'admin', 'manager', 'delivery'];

const StaffDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Role guard — allow staff, admin, manager only
  if (user && !ALLOWED_ROLES.includes(user.role?.toLowerCase())) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-2xl font-bold text-red-500 mb-2">Access Denied</p>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, revRes] = await Promise.all([
          api.get('/auth/me'),
          api.get(`/reviews?staffId=${user?._id}`)
        ]);
        setProfile(profileRes.data.user);
        setReviews(revRes.reviews || revRes.data?.reviews || []);

        if (user?.role !== 'delivery') {
          const resRes = await api.get('/reservations');
          const allReservations = Array.isArray(resRes.data) ? resRes.data : (resRes.data || []);
          const myReservations = allReservations.filter(r => r.assignedStaff?._id === user?._id || r.assignedStaff === user?._id);
          setReservations(myReservations);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20 text-gray-500">Loading your dashboard...</div>
      </DashboardLayout>
    );
  }

  const staffDetails = profile?.staffDetails || { salary: 0, rating: 0, attendance: [], joinDate: Date.now() };
  
  const tablesServed = reservations.filter(r => r.status === 'completed' || r.status === 'approved').length;
  const activeTables = reservations.filter(r => r.status === 'approved').length;
  const presentDays = staffDetails.attendance?.filter(a => a.status === 'Present' || a.status === 'Half-Day').length || 0;

  // Calculate payable salary for current month
  const baseSalary = staffDetails.salary || 0;
  const dailyRate = baseSalary / 30;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let penalty = 0;
  
  const thisMonthAttendance = (staffDetails.attendance || []).filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  thisMonthAttendance.forEach(a => {
    if (a.status === 'Absent') penalty += dailyRate;
    if (a.status === 'Half-Day') penalty += dailyRate * 0.5;
  });

  const payableSalary = Math.max(0, baseSalary - penalty).toFixed(0);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-saffron-500 to-orange-600 p-8 lg:p-10 mb-10 text-white shadow-2xl shadow-primary-500/20"
      >
        <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
              Staff Portal
            </span>
            <h1 className="text-3xl lg:text-5xl font-bold font-display drop-shadow-lg tracking-tight">
              Welcome back, {profile?.name}!
            </h1>
            <p className="text-white/90 mt-2 text-lg font-medium drop-shadow-md">
              Here is a summary of your performance and assignments.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="premium" className="p-6 h-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <HiOutlineUserGroup className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Tables Served</p>
                <h3 className="text-3xl font-bold font-display text-dark-900 dark:text-white">{tablesServed}</h3>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="premium" className="p-6 h-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${staffDetails.salaryPaid ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30'}`}>
                <HiOutlineCurrencyRupee className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Payable Salary</p>
                <h3 className="text-3xl font-bold font-display text-dark-900 dark:text-white">₹{payableSalary}</h3>
                <div className="flex gap-2 items-center mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${staffDetails.salaryPaid ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                    {staffDetails.salaryPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  {staffDetails.salaryPaid && staffDetails.paymentMethod && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">via {staffDetails.paymentMethod}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card variant="premium" className="p-6 h-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/30">
                <HiOutlineStar className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Rating</p>
                <h3 className="text-3xl font-bold font-display text-dark-900 dark:text-white">{staffDetails.rating} <span className="text-lg text-gray-400">/ 5</span></h3>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card variant="premium" className="p-6 h-full flex flex-col justify-between bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <HiOutlineCheckCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Attendance</p>
                <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">
                  {presentDays} Days Present
                </h3>
              </div>
            </div>
            <button 
              onClick={() => setShowAttendanceModal(true)}
              className="mt-5 w-full text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg py-2.5 rounded-xl transition-all duration-300"
            >
              View Details
            </button>
          </Card>
        </motion.div>
      </div>

      <div className={`grid grid-cols-1 ${user?.role === 'delivery' ? '' : 'lg:grid-cols-2'} gap-6`}>
        {user?.role !== 'delivery' && (
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl p-6">
            <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white flex items-center gap-2 mb-6">
              <HiOutlineCalendar className="w-6 h-6 text-primary-500" /> Active Tables to Serve
            </h3>
          {activeTables > 0 ? (
            <div className="space-y-4">
              {reservations.filter(r => r.status === 'approved').map(res => (
                <div key={res._id} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-dark-800 dark:text-white">Table {res.tableNumber}</h4>
                    <p className="text-xs text-gray-500">{res.name} • {res.guests} Guests</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md">
                    {res.timeSlot}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <HiOutlineClipboardList className="w-12 h-12 mb-2 text-gray-200 dark:text-dark-700" />
              <p className="text-sm">No active tables assigned to you right now.</p>
            </div>
          )}
        </Card>
        )}
        
        <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl p-6">
          <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white flex items-center gap-2 mb-6">
            <HiOutlineStar className="w-6 h-6 text-yellow-500" /> Your Recent Reviews
          </h3>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 5).map(rev => (
                <div key={rev._id} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-dark-800 dark:text-white">{rev.customerName}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <HiOutlineStar className="w-12 h-12 mb-2 text-gray-200 dark:text-dark-700" />
              <p className="text-sm">No reviews yet. Keep up the good work!</p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <Card variant="glass" className="border border-white/20 dark:border-white/5 shadow-2xl p-6">
          <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white flex items-center gap-2 mb-6">
            <HiOutlineCurrencyRupee className="w-6 h-6 text-green-500" /> Salary Payment History
          </h3>
          {staffDetails.salaryPayments && staffDetails.salaryPayments.length > 0 ? (
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
                  {[...staffDetails.salaryPayments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).map((payment, idx) => {
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
              {staffDetails.attendance && staffDetails.attendance.length > 0 ? (
                [...staffDetails.attendance].sort((a, b) => new Date(b.date) - new Date(a.date)).map((record, idx) => {
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
    </DashboardLayout>
  );
};

export default StaffDashboard;
