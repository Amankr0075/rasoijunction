import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineStar,
} from 'react-icons/hi';
import api from '../../services/api';
import { connectSocket, getSocket } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rating State
  const [hasRated, setHasRated] = useState(false);
  const [chefRating, setChefRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Status mapping
  const steps = [
    { status: 'pending', label: 'Ordered', desc: 'Order received by restaurant', icon: HiOutlineClipboardList },
    { status: 'accepted', label: 'Accepted', desc: 'Confirmed by manager', icon: HiOutlineCheckCircle },
    { status: 'preparing', label: 'Cooking', desc: 'Chef preparing your meal', icon: HiOutlineClock },
    { status: 'ready', label: 'Ready', desc: 'Gourmet meal ready to serve', icon: HiOutlineCheckCircle },
    ...(order?.orderType !== 'dine-in' ? [{ status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way', icon: HiOutlineLocationMarker }] : []),
    { status: 'delivered', label: order?.orderType === 'dine-in' ? 'Delivered to Table' : 'Delivered', desc: 'Enjoy your fresh meal!', icon: HiOutlineCheckCircle },
  ];

  const getStepIndex = (currentStatus) => {
    return steps.findIndex((step) => step.status === currentStatus);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        
        if (res.data.orderStatus === 'delivered') {
          const reviewRes = await api.get(`/reviews?orderId=${id}`);
          if (reviewRes.reviews && reviewRes.reviews.length > 0) {
            setHasRated(true);
          }
        }
      } catch (err) {
        toast.error('Failed to load order progress.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Socket listeners setup
    connectSocket(user);
    const socket = getSocket();

    if (socket) {
      // Listen to status update events specifically for this user's order
      socket.on('my_order_update', (updatedOrder) => {
        if (updatedOrder._id === id) {
          setOrder(updatedOrder);
          toast.success(`Order status updated: ${updatedOrder.orderStatus.replace('_', ' ')}!`);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('my_order_update');
      }
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 flex items-center justify-center">
        <LoadingSkeleton type="text" count={3} className="w-full max-w-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-dark-800 dark:text-white mb-2">Order Not Found</h2>
        <Link to="/customer/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (submittingRating) return;
    setSubmittingRating(true);
    try {
      await api.post('/reviews', {
        orderId: order._id,
        chefId: order.chef?._id || order.chef,
        chefRating: chefRating,
        deliveryId: order.deliveryPartner?._id || order.deliveryPartner,
        deliveryRating: deliveryRating,
        comment: ratingComment,
      });
      toast.success('Thank you! Your ratings have been submitted. 🌟');
      setHasRated(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const currentIndex = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header summary info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-bold text-primary-500">{order.orderId}</span>
              <Badge variant={order.orderStatus === 'cancelled' ? 'danger' : 'success'} dot>
                {order.orderStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Link to="/customer/dashboard" className="btn-ghost text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Visual Progress Steps Tracker */}
        {order.orderStatus !== 'cancelled' ? (
          <Card className="p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center relative group">
                    {/* Vertical connecting line for mobile view */}
                    {idx < steps.length - 1 && (
                      <div className={`hidden md:block absolute left-1/2 right-0 top-6 h-0.5 z-0 ${
                        idx < currentIndex ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-700'
                      }`} style={{ width: '100%' }} />
                    )}

                    {/* Step Icon circle */}
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                          : 'bg-gray-100 dark:bg-dark-800 text-gray-400 border border-gray-200 dark:border-dark-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    <h4 className={`text-sm font-bold mt-3 ${
                      isCompleted ? 'text-dark-800 dark:text-white' : 'text-gray-400 dark:text-dark-500'
                    }`}>
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-dark-500 mt-1 max-w-[120px] hidden md:block">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-danger-500/20 bg-danger-50/50 dark:bg-danger-500/5 mb-8 text-center">
            <h3 className="text-xl font-bold text-danger-500 mb-2">Order Cancelled</h3>
            <p className="text-sm text-gray-500 dark:text-dark-400">
              This order has been cancelled. If you have any queries, please reach out to customer support.
            </p>
          </Card>
        )}

        {/* Rating Section for Delivered Orders */}
        {order.orderStatus === 'delivered' && !hasRated && (
          <Card className="p-8 mb-8 border-primary-500/20 bg-primary-50/30 dark:bg-primary-900/10">
            <h3 className="text-xl font-bold text-dark-800 dark:text-white mb-6 text-center">Rate Your Experience</h3>
            <form onSubmit={handleSubmitRating} className="max-w-xl mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Chef Rating */}
                {order.chef && (
                  <div className="bg-white dark:bg-dark-900 p-4 rounded-xl border border-gray-100 dark:border-dark-700 text-center shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Food Quality</p>
                    <p className="text-base font-bold text-dark-800 dark:text-white mb-3">Chef {order.chef.name.split(' ')[0]}</p>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setChefRating(star)}
                          className={`text-2xl transition-colors ${star <= chefRating ? 'text-yellow-400' : 'text-gray-200 dark:text-dark-700'}`}
                        >
                          <HiOutlineStar className={star <= chefRating ? 'fill-current' : ''} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Rating */}
                {order.deliveryPartner && (
                  <div className="bg-white dark:bg-dark-900 p-4 rounded-xl border border-gray-100 dark:border-dark-700 text-center shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Delivery Service</p>
                    <p className="text-base font-bold text-dark-800 dark:text-white mb-3">Rider {order.deliveryPartner.name.split(' ')[0]}</p>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setDeliveryRating(star)}
                          className={`text-2xl transition-colors ${star <= deliveryRating ? 'text-yellow-400' : 'text-gray-200 dark:text-dark-700'}`}
                        >
                          <HiOutlineStar className={star <= deliveryRating ? 'fill-current' : ''} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <textarea
                  className="input-field w-full min-h-[100px] resize-y"
                  placeholder="Any additional feedback? (Optional)"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-lg font-bold shadow-md shadow-primary-500/30"
                disabled={submittingRating}
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </form>
          </Card>
        )}

        {/* Order Details & Summary columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items & details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <HiOutlineClipboardList className="w-5 h-5 text-primary-500" /> Items Placed
              </h3>
              <div className="divide-y divide-gray-50 dark:divide-dark-700/50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.menuitem.image}
                        alt={item.menuitem.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-bold text-dark-800 dark:text-white">
                          {item.menuitem.name}
                        </p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-dark-800 dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4 flex items-center gap-2">
                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500" /> Delivery Details
              </h3>
              <div className="text-sm text-gray-600 dark:text-dark-300 space-y-2">
                <p><strong>Customer:</strong> {order.user?.name || 'Guest User'}</p>
                <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
              </div>
            </Card>
          </div>

          {/* Pricing Math */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-4">Payment Summary</h3>
              <div className="space-y-3 text-sm border-b border-gray-100 dark:border-dark-700 pb-4 mb-4">
                <div className="flex items-center justify-between text-gray-600 dark:text-dark-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{order.subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-dark-300">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{order.tax}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-dark-300">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-dark-800 dark:text-white">
                    {order.deliveryCharges === 0 ? 'Free' : `₹${order.deliveryCharges}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-success-500">
                    <span>Discount</span>
                    <span className="font-bold">-₹{order.discount}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-base font-bold text-dark-800 dark:text-white mb-4">
                <span>Total Paid</span>
                <span className="text-xl font-black text-primary-500">₹{order.total}</span>
              </div>
              <div className="bg-gray-50 dark:bg-dark-800 p-3 rounded-xl border border-gray-100 dark:border-dark-700 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1"><HiOutlineCurrencyRupee className="w-4 h-4" /> Method:</span>
                <span className="font-bold uppercase text-dark-700 dark:text-dark-300">{order.paymentMethod}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
