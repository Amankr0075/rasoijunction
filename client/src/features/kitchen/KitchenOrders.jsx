import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineExternalLink } from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const KitchenOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <LoadingSkeleton className="h-16 w-full rounded-2xl" />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-dark-800 dark:text-white">Kitchen Orders History</h1>
        <p className="text-gray-500 dark:text-dark-400 mt-1">Review all past and present orders assigned to the kitchen.</p>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-dark-800 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-dark-800 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted / Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 dark:text-dark-400">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 dark:border-dark-700/50 hover:bg-gray-50/50 dark:hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-primary-500">
                      {order.orderId}
                    </td>
                    <td className="py-4 px-6 text-sm text-dark-800 dark:text-white">
                      {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-dark-300">
                      {order.items.map(i => `${i.quantity}x ${i.menuitem.name}`).join(', ')}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={
                        order.orderStatus === 'pending' ? 'neutral' :
                        order.orderStatus === 'delivered' ? 'success' :
                        order.orderStatus === 'cancelled' ? 'error' : 'info'
                      }>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20">
                        <HiOutlineExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default KitchenOrders;
