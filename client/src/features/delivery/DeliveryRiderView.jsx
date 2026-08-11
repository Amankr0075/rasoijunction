import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMap, HiOutlineCheckCircle, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineCurrencyRupee, HiOutlineStar } from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { connectSocket, getSocket } from '../../services/socketService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const DeliveryRiderView = ({ isHistory = false }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssigned = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load assigned deliveries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();

    // Socket setup
    connectSocket(user);
    const socket = getSocket();

    if (socket) {
      socket.on('order_status_update', (updatedOrder) => {
        // If driver matches or status updates, reload assigned
        fetchAssigned();
      });
    }

    return () => {
      if (socket) {
        socket.off('order_status_update');
      }
    };
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Delivery updated: ${newStatus.replace('_', ' ')}!`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data : o))
      );
    } catch (err) {
      toast.error('Failed to update delivery status.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LoadingSkeleton type="table" count={2} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              Rider Portal
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold font-display drop-shadow-lg tracking-tight">
              {isHistory ? 'Delivery History' : 'Assigned Deliveries'}
            </h1>
            <p className="text-white/90 mt-2 text-lg font-medium drop-shadow-md">
              {isHistory ? 'View your completed deliveries.' : 'Update progress as you dispatch and deliver meals.'}
            </p>
          </div>
          {user?.staffDetails?.rating > 0 && (
            <div className="text-center bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
              <p className="text-xs text-white/80 font-bold mb-1 uppercase tracking-wider">Your Rating</p>
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-white drop-shadow-md">
                <HiOutlineStar className="fill-current w-6 h-6 text-yellow-400" /> {user.staffDetails.rating.toFixed(1)}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {orders.filter(o => isHistory ? o.orderStatus === 'delivered' : o.orderStatus !== 'delivered').length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl text-gray-400"
            >
              {isHistory ? 'No past deliveries found.' : 'No active delivery assignments. Enjoy the break! ☕'}
            </motion.div>
          ) : (
            orders.filter(o => isHistory ? o.orderStatus === 'delivered' : o.orderStatus !== 'delivered').map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card variant="premium" className="p-6 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 dark:border-dark-700/50 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-mono font-bold text-primary-500">{order.orderId}</span>
                        <Badge variant={order.orderStatus === 'ready' ? 'warning' : 'info'}>
                          {order.orderStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Assigned to: {user?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Cash collection</p>
                      <p className="text-lg font-black text-dark-800 dark:text-white">₹{order.total}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Location Address details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-dark-300">
                        <HiOutlineLocationMarker className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-dark-800 dark:text-white">Customer Address</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.user?.name || 'Guest User'} ({order.user?.phone || 'N/A'})</p>
                          <p className="mt-1">
                            {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}` : 'No delivery address provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick advance actions */}
                    <div className="flex flex-wrap items-center justify-end gap-3 h-full sm:pt-4 md:pt-0">
                      {order.orderStatus === 'ready' && (
                        <Button
                          variant="primary"
                          className="gap-1.5 shadow-sm w-full sm:w-auto"
                          onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')}
                        >
                          <HiOutlineTruck className="w-5 h-5" /> Start Trip (Out for Delivery)
                        </Button>
                      )}
                      
                      {order.orderStatus === 'out_for_delivery' && (
                        <Button
                          variant="primary"
                          className="gap-1.5 shadow-sm bg-success-500 hover:bg-success-600 w-full sm:w-auto"
                          onClick={() => handleUpdateStatus(order._id, 'delivered')}
                        >
                          <HiOutlineCheckCircle className="w-5 h-5" /> Mark as Delivered (Paid)
                        </Button>
                      )}
                      
                      {order.orderStatus === 'delivered' && (
                        <span className="text-sm font-bold text-success-500 flex items-center gap-1">
                          <HiOutlineCheckCircle className="w-5 h-5" /> Completed Delivery
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryRiderView;
