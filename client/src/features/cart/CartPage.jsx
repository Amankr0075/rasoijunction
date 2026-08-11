import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineShoppingBag,
  HiOutlineReceiptTax,
  HiOutlineTruck,
  HiOutlineTicket,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
} from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    gstAmount,
    deliveryCharges,
    discountAmount,
    finalTotal,
    activeCoupon,
    setActiveCoupon,
    orderContext,
  } = useCart();

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const code = couponCode.toUpperCase().replace(/\s+/g, '');
      const res = await api.get(`/coupons/${code}`);
      const foundCoupon = res.coupon;

      if (!foundCoupon) {
        toast.error('Invalid coupon code.');
        setCouponLoading(false);
        return;
      }

      if (foundCoupon.status !== 'Active') {
        toast.error('This coupon is currently inactive.');
        setCouponLoading(false);
        return;
      }

      if (subtotal < foundCoupon.minOrder) {
        toast.error(`Minimum order amount for this coupon is ₹${foundCoupon.minOrder}`);
        setCouponLoading(false);
        return;
      }

      setActiveCoupon({
        code: foundCoupon.code,
        discountType: foundCoupon.type.toLowerCase(),
        value: foundCoupon.value,
        maxDiscount: foundCoupon.type.toLowerCase() === 'percentage' ? 150 : undefined
      });

      toast.success(`Coupon Applied: ${foundCoupon.type === 'Percentage' ? `${foundCoupon.value}%` : `₹${foundCoupon.value}`} Off!`);
      setCouponLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid coupon code.');
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed.');
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order.');
      navigate('/login');
      return;
    }

    if (orderContext.orderType === 'delivery' && (!address.street || !address.city || !address.pincode)) {
      toast.error('Please complete your delivery address.');
      return;
    }

    setCheckoutLoading(true);
    try {
      // Setup payload matching order model
      const items = cartItems.map((item) => ({
        menuitem: item._id,
        quantity: item.quantity,
        price: item.price,
      }));

      const payload = {
        items,
        subtotal,
        tax: gstAmount,
        deliveryCharges,
        discount: discountAmount,
        total: finalTotal,
        paymentMethod: 'cod', // COD for now, Razorpay in Phase 4
        deliveryAddress: orderContext.orderType === 'delivery' ? address : {
          street: `Table ${orderContext.tableNumber} - ${orderContext.customerName || user?.name || 'Guest'}`,
          city: 'Rasoi Junction Dine-In',
          state: 'Gujarat',
          pincode: '390001'
        },
        orderType: orderContext.orderType,
        tableNumber: orderContext.tableNumber,
      };

      const res = await api.post('/orders', payload);
      toast.success('Order placed successfully! 🎉');
      clearCart();
      
      // Redirect to the customer orders list page
      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-dark-800 flex items-center justify-center mb-6"
        >
          <HiOutlineShoppingBag className="w-12 h-12 text-gray-400 dark:text-dark-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-dark-800 dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 dark:text-dark-400 max-w-sm mb-8">
          Add some delicious dishes from our menu to get started on your gourmet journey.
        </p>
        <Link to="/menu" className="btn-primary py-3 px-8 text-base">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-display text-dark-800 dark:text-white mb-8">
          Shopping <span className="text-gradient">Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4 flex items-center gap-4 flex-col sm:flex-row hover:shadow-md transition-shadow">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl shadow-sm bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-dark-800 dark:text-white truncate">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-danger-500 transition-colors p-1"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-dark-500 capitalize mb-2">
                        {item.category}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="p-1 rounded-md text-gray-500 hover:bg-white dark:hover:bg-dark-700 transition-colors"
                          >
                            <HiOutlineMinus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold text-dark-800 dark:text-white px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-1 rounded-md text-gray-500 hover:bg-white dark:hover:bg-dark-700 transition-colors"
                          >
                            <HiOutlinePlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-base font-black text-dark-800 dark:text-white">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Delivery Details Block or Dine-in Details */}
            {orderContext.orderType === 'dine-in' ? (
              <Card className="p-6 bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <span className="text-xl font-bold">🍽️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900 dark:text-primary-100">
                      Dine-In Order
                    </h3>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Food will be served directly to <span className="font-bold">Table {orderContext.tableNumber}</span>.
                    </p>
                    {orderContext.customerName && (
                      <p className="text-xs text-primary-600/80 dark:text-primary-400/80 mt-1">
                        Reserved under: {orderContext.customerName} ({orderContext.mobileNumber})
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-4">
                  Delivery Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-1 block">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="E.g. House No. 45, Sector 15"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-1 block">
                      City *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Vadodara"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-1 block">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="110001"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Pricing Calculations Panel */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-4">
                Order Summary
              </h3>

              {/* Free Delivery Banner */}
              {orderContext.orderType !== 'dine-in' && (
                <div className={`mb-6 p-3 rounded-xl border text-sm font-bold flex items-center justify-center text-center ${
                  subtotal > 599 
                    ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:border-success-800/30'
                    : 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800/30'
                }`}>
                  {subtotal > 599 ? (
                    <span>You have unlocked FREE delivery! 🎉</span>
                  ) : (
                    <span>Add ₹{600 - subtotal} more to get FREE delivery! 🚚</span>
                  )}
                </div>
              )}

              {/* Promo Coupon Form */}
              {!activeCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="E.g. WELCOME10, RASOI50"
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm uppercase placeholder-gray-400"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={couponLoading}
                  >
                    Apply
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-xl p-3.5 mb-6">
                  <div className="flex items-center gap-2">
                    <HiOutlineTicket className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase">
                        {activeCoupon.code}
                      </p>
                      <p className="text-xs text-primary-500/80">Coupon applied successfully</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-danger-500 hover:text-danger-600 px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Price Details */}
              <div className="space-y-4 text-sm border-b border-gray-100 dark:border-dark-700 pb-5 mb-5">
                <div className="flex items-center justify-between text-gray-600 dark:text-dark-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-dark-300">
                  <span className="flex items-center gap-1">
                    <HiOutlineReceiptTax className="w-4 h-4" /> GST (5%)
                  </span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{gstAmount}</span>
                </div>
                {orderContext.orderType !== 'dine-in' && (
                  <div className="flex items-center justify-between text-gray-600 dark:text-dark-300">
                    <span className="flex items-center gap-1">
                      <HiOutlineTruck className="w-4 h-4" /> Delivery Fee
                    </span>
                    <span className="font-semibold text-dark-800 dark:text-white">
                      {deliveryCharges === 0 ? (
                        <span className="text-success-500 font-bold uppercase text-xs">Free</span>
                      ) : (
                        `₹${deliveryCharges}`
                      )}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-success-500">
                    <span>Discount</span>
                    <span className="font-bold">-₹{discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Final Math Total */}
              <div className="flex items-center justify-between text-lg font-bold text-dark-800 dark:text-white mb-6">
                <span>Final Total</span>
                <span className="text-2xl font-black text-primary-500">₹{finalTotal}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full py-4 gap-2 mb-3"
                onClick={() => {
                  if (orderContext.orderType === 'delivery' && (!address.street || !address.city || !address.pincode)) {
                    toast.error('Please complete your delivery address first.');
                    return;
                  }
                  localStorage.setItem('temp_checkout_address', JSON.stringify(address));
                  navigate('/checkout/payment');
                }}
              >
                <HiOutlineCreditCard className="w-5 h-5" />
                Proceed to Online Payment
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full py-3 gap-2 border border-gray-100 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-850 text-gray-500"
                onClick={handleCheckout}
                loading={checkoutLoading}
              >
                <HiOutlineCheckCircle className="w-5 h-5" />
                Place Order (COD)
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
