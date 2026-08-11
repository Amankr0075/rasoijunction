import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  HiOutlineShoppingBag,
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineCreditCard,
  HiOutlineGift,
  HiOutlineArrowRight,
  HiOutlineRefresh,
  HiOutlineHeart,
  HiOutlineDocumentReport,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancelLoading(true);
    try {
      const res = await api.put(`/orders/${orderToCancel._id}/cancel`);
      toast.success(res.data.message || 'Order cancelled successfully.');
      setOrders(orders.map(o => o._id === orderToCancel._id ? res.data.data : o));
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelLoading(false);
    }
  };

  const quickActions = [
    { label: 'Order Food', icon: HiOutlineShoppingBag, path: '/menu', color: 'from-primary-400 to-primary-600' },
    { label: 'Book Table', icon: HiOutlineCalendar, path: '/reservations', color: 'from-blue-400 to-blue-600' },
    { label: 'My Reviews', icon: HiOutlineStar, path: '/customer/reviews', color: 'from-amber-400 to-amber-600' },
    { label: 'Wishlist', icon: HiOutlineHeart, path: '/customer/wishlist', color: 'from-pink-400 to-pink-600' },
  ];

  const recommendations = [
    { name: 'Chicken Biryani', price: 320, rating: 4.8, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=150&q=80', reason: 'Based on your orders' },
    { name: 'Mango Lassi', price: 80, rating: 4.9, image: 'https://images.unsplash.com/photo-1571006682887-8e6580f55cf5?auto=format&fit=crop&w=150&q=80', reason: 'Trending now' },
    { name: 'Garlic Naan', price: 60, rating: 4.7, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=150&q=80', reason: 'Pairs well' },
    { name: 'Gulab Jamun', price: 120, rating: 4.8, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=150&q=80', reason: 'Most loved' },
  ];

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadPDFDirect = async (orderId) => {
    toast.loading('Redirecting to invoice to export PDF...', { id: 'pdf-direct' });
    navigate(`/orders/invoice/${orderId}`);
  };

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-saffron-500 to-orange-600 p-8 lg:p-10 mb-10 text-white shadow-2xl shadow-primary-500/20"
      >
        <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
              Customer Portal
            </span>
            <h1 className="text-3xl lg:text-5xl font-bold font-display drop-shadow-lg tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Guest'} 👋
            </h1>
            <p className="text-white/90 mt-2 text-lg font-medium drop-shadow-md">
              "Good Food • Good Mood • Good Times"
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
              <HiOutlineGift className="w-5 h-5" />
              <div>
                <p className="text-xs text-white/70">Loyalty Points</p>
                <p className="text-lg font-bold">{user?.loyaltyPoints || 250}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link to={action.path}>
              <Card variant="premium" hoverable className="text-center group h-full flex flex-col items-center justify-center py-8 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-xl shadow-[${action.color.split(' ')[0].replace('from-', '')}]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <action.icon className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-dark-800 dark:text-white group-hover:text-primary-500 transition-colors">{action.label}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl">
            <Card.Header className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700/50 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">Order History & Invoices</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 font-medium">Track order statuses and download receipts</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body padding="p-0">
              {loading ? (
                <div className="p-6">
                  <LoadingSkeleton type="table" count={2} />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {orders.map((order) => (
                    <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-mono font-bold text-primary-500">{order.orderId}</span>
                          <Badge variant={order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'danger' : 'warning'} dot>
                            {order.orderStatus.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'neutral'}>
                            {order.paymentStatus === 'paid' ? 'Paid' : 'COD/Unpaid'}
                          </Badge>
                        </div>
                        <p className="text-sm text-dark-700 dark:text-dark-300 font-semibold">
                          {order.items.map((i) => `${i.menuitem?.name || 'Dish'} (×${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                          Placed: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 ml-0 sm:ml-4 border-t sm:border-t-0 border-gray-100 dark:border-dark-700 pt-3 sm:pt-0">
                        <p className="text-lg font-bold text-dark-800 dark:text-white">₹{order.total}</p>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/orders/${order._id}/track`}
                            className="text-xs text-primary-500 hover:text-primary-600 font-bold border border-primary-500/25 px-2.5 py-1 rounded-lg"
                          >
                            Track
                          </Link>
                          {(order.orderStatus === 'pending' || order.orderStatus === 'placed') && (
                            <button
                              onClick={() => {
                                setOrderToCancel(order);
                                setCancelModalOpen(true);
                              }}
                              className="text-xs text-red-500 hover:text-red-600 font-bold border border-red-500/25 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20"
                            >
                              Cancel
                            </button>
                          )}
                          {order.paymentStatus === 'paid' && (
                            <>
                              <Link
                                to={`/orders/invoice/${order.orderId}`}
                                className="text-xs text-dark-700 dark:text-dark-200 hover:text-primary-500 font-bold border border-gray-200 dark:border-dark-700 px-2.5 py-1 rounded-lg flex items-center gap-1 bg-white dark:bg-dark-800"
                              >
                                <HiOutlineDocumentReport className="w-3.5 h-3.5" /> Invoice
                              </Link>
                              <button
                                onClick={() => handleDownloadPDFDirect(order.orderId)}
                                className="text-xs text-white bg-primary-500 hover:bg-primary-600 font-bold px-2.5 py-1 rounded-lg"
                              >
                                PDF
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        {/* Recommended For You */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card variant="glass" className="h-full border border-white/20 dark:border-white/5 shadow-2xl">
            <Card.Header className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700/50 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold font-display text-dark-900 dark:text-white">Recommended</h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1 font-medium">Just for you</p>
            </Card.Header>
            <Card.Body padding="p-0">
              <div className="divide-y divide-gray-100 dark:divide-dark-700">
                {recommendations.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors cursor-pointer group animate-fade-in">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-800 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-500">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-dark-800 dark:text-white">₹{item.price}</p>
                      <div className="flex items-center gap-0.5 text-xs text-amber-500">
                        <HiOutlineStar className="w-3 h-3 fill-amber-400" />
                        {item.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-xl text-sm border border-red-200 dark:border-red-800/30">
            <h4 className="font-bold mb-1">1. Cancellation Window</h4>
            <p className="mb-3">You can cancel your order at any time before the kitchen team marks it as "accepted" or starts the cooking process. Once kitchen preparation begins, cancellations are not allowed and no refunds will be initiated.</p>
            
            <h4 className="font-bold mb-1">2. Processing of Refunds</h4>
            <p className="mb-3">Approved refunds are credited back to your original payment method (Credit Card, Debit Card, or UPI account) within 5 to 7 business days, depending on bank processing timelines. For COD orders, cash refunds are not provided; instead, equivalent store credit / loyalty points will be added to your account.</p>
            
            <h4 className="font-bold mb-1">3. Quality issues & Missing Items</h4>
            <p>If you receive an incorrect dish, food quality issues, or missing items in your delivery package, please raise a support ticket on our Contact page within 2 hours of order delivery. Our team will verify and initiate a partial or full refund as appropriate.</p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel order <span className="font-bold">{orderToCancel?.orderId}</span>?
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleCancelOrder}
              loading={cancelLoading}
            >
              Yes, Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
