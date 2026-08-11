import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFire, HiOutlineClock, HiOutlineCheckCircle, HiOutlinePlay } from 'react-icons/hi';
import api from '../../services/api';
import { connectSocket, getSocket } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const KitchenQueue = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load kitchen queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    connectSocket(user);
    const socket = getSocket();

    if (socket) {
      socket.on('new_order', (newOrder) => {
        setOrders((prev) => {
          if (prev.find((o) => o._id === newOrder._id)) return prev;
          toast(`New order received: ${newOrder.orderId}! 🔥`, { icon: '🍽️' });
          return [newOrder, ...prev];
        });
      });

      socket.on('order_status_update', (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      });
    }

    const timer = setInterval(() => setNow(new Date()), 60000); // Live timer update

    return () => {
      clearInterval(timer);
      if (socket) {
        socket.off('new_order');
        socket.off('order_status_update');
      }
    };
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order advanced to: ${newStatus.replace('_', ' ')}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data : o))
      );
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const getOrdersByStatus = (statusList) => {
    return orders.filter((o) => statusList.includes(o.orderStatus));
  };

  const columns = [
    { title: 'Incoming', statuses: ['pending'], color: 'from-orange-400 to-orange-600', textColor: 'text-orange-500', nextStatus: 'accepted', actionLabel: 'Accept Order', icon: HiOutlineFire },
    { title: 'Preparing', statuses: ['accepted', 'preparing'], color: 'from-blue-400 to-blue-600', textColor: 'text-blue-500', nextStatus: 'ready', actionLabel: 'Set Ready', icon: HiOutlineClock },
    { title: 'Ready for Rider', statuses: ['ready'], color: 'from-green-400 to-green-600', textColor: 'text-green-500', nextStatus: 'out_for_delivery', actionLabel: 'Dispatch Partner', icon: HiOutlineCheckCircle },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-[70vh] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-dark-800 dark:text-white">Kitchen Cooking Queue</h1>
        <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Live order Kanban board. Advance status as dishes are prepared.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {columns.map((col) => {
          const colOrders = getOrdersByStatus(col.statuses);
          const ColIcon = col.icon;

          return (
            <div key={col.title} className="bg-gray-50/80 dark:bg-dark-900/40 border border-gray-100 dark:border-dark-800 rounded-3xl p-5 flex flex-col min-h-[75vh] shadow-inner">
              {/* Column Title bar */}
              <div className="flex items-center justify-between mb-5 border-b border-gray-200 dark:border-dark-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${col.color} flex items-center justify-center text-white shadow-md`}>
                    <ColIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-dark-800 dark:text-white text-lg">
                    {col.title}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 text-sm font-black ${col.textColor} shadow-sm`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[70vh] no-scrollbar pb-6">
                <AnimatePresence mode="popLayout">
                  {colOrders.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-dark-800 rounded-2xl"
                    >
                      No orders in this stage
                    </motion.div>
                  ) : (
                    colOrders.map((order) => {
                      const waitMins = Math.round((now - new Date(order.createdAt)) / 60000);
                      const isUrgent = waitMins > 15 && col.statuses.includes('pending');

                      return (
                        <motion.div
                          key={order._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className={`p-5 shadow-sm hover:shadow-lg transition-all group border-l-4 ${isUrgent ? 'border-l-red-500' : 'border-l-primary-500'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-sm font-mono font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">{order.orderId}</span>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-800 px-2 py-1 rounded-full">
                                  <HiOutlineClock className="w-3 h-3" />
                                  {waitMins}m
                                </span>
                              </div>
                            </div>

                            {/* Items list */}
                            <div className="space-y-2 border-y border-gray-50 dark:border-dark-700/50 py-3 my-3 max-h-32 overflow-y-auto no-scrollbar">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="font-semibold text-dark-800 dark:text-gray-200">{item.menuitem.name}</span>
                                  <span className="text-gray-500 bg-gray-100 dark:bg-dark-800 px-2 py-0.5 rounded-md text-xs font-bold">×{item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <Badge variant={order.orderStatus === 'pending' ? 'neutral' : 'info'}>
                                {order.orderStatus.replace('_', ' ')}
                              </Badge>
                              
                              <Button
                                variant="primary"
                                size="sm"
                                className="py-1.5 px-4 text-xs gap-1.5 font-bold shadow-sm"
                                onClick={() => handleUpdateStatus(order._id, col.nextStatus)}
                              >
                                {col.actionLabel}
                                <HiOutlinePlay className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenQueue;
