import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineStar, HiOutlineChatAlt2, HiOutlineLockClosed } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const [dishName, setDishName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [eligibleDishes, setEligibleDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        // Filter orders that are delivered
        const delivered = res.data.filter((order) => order.orderStatus === 'delivered');
        setDeliveredOrders(delivered);

        // Gather unique dishes from all delivered orders
        const dishesMap = {};
        delivered.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              if (item.menuitem && item.menuitem.name) {
                dishesMap[item.menuitem.name] = {
                  id: item.menuitem._id,
                  name: item.menuitem.name,
                };
              }
            });
          }
        });
        const dishes = Object.values(dishesMap);
        setEligibleDishes(dishes);
        if (dishes.length > 0) {
          setDishName(dishes[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch orders for review validation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const isReviewEnabled = eligibleDishes.length > 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isReviewEnabled) {
      toast.error('You must have at least one successfully delivered order to post a review.');
      return;
    }

    if (!dishName.trim() || !comment.trim()) {
      toast.error('Please complete all feedback fields.');
      return;
    }

    try {
      await api.post('/reviews', {
        dishName,
        rating: parseInt(rating, 10),
        comment,
      });
      toast.success('Thank you! Review published successfully! 🌟');
      setComment('');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit review.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Customer Reviews & Feedback</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Share your gourmet experience. Rating criteria includes food quality and presentation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Submit Review Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-dark-800 dark:text-white">Publish Review</h3>
                {!isReviewEnabled && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg uppercase tracking-wide">
                    <HiOutlineLockClosed className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>

              {!isReviewEnabled && (
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 rounded-xl leading-relaxed mb-4">
                  ⚠️ Feedback options are locked. Place an order and receive successful food delivery to unlock reviewing features!
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Dish / Service Item</label>
                  <select
                    disabled={!isReviewEnabled}
                    required
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                  >
                    {!isReviewEnabled ? (
                      <option value="">Feature locked</option>
                    ) : (
                      eligibleDishes.map((dish) => (
                        <option key={dish.id} value={dish.name}>
                          {dish.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Gourmet Rating (1-5)</label>
                  <select
                    disabled={!isReviewEnabled}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Outstanding (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ Great (4/5)</option>
                    <option value="3">⭐⭐⭐ Satisfactory (3/5)</option>
                    <option value="2">⭐⭐ Needs Improvement (2/5)</option>
                    <option value="1">⭐ Poor (1/5)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Comments</label>
                  <textarea
                    required
                    disabled={!isReviewEnabled}
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isReviewEnabled ? "E.g. The paneer was incredibly fresh and soft. Perfectly cooked!" : "Feature locked"}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3"
                  disabled={!isReviewEnabled}
                >
                  Publish Review
                </Button>
              </form>
            </Card>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h3 className="text-base font-bold text-dark-800 dark:text-white mb-6">Your Recent Reviews</h3>
              <div className="space-y-4">
                {reviews.filter(r => r.customerName === user?.name).map((rev) => (
                  <div key={rev._id || rev.id} className="p-4 bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-dark-800 dark:text-white">{rev.dishName}</h4>
                      <span className="text-[10px] text-gray-400">{rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : '')}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <HiOutlineStar key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-dark-300 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReviewsPage;
