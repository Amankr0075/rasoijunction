import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  HiOutlineCreditCard,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineGlobeAlt,
  HiOutlineOfficeBuilding,
  HiOutlineKey,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaymentSimulationPage = () => {
  const { cartItems, subtotal, gstAmount, deliveryCharges, discountAmount, finalTotal, clearCart, orderContext, clearDineInContext } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'debit_card', 'credit_card'
  const [processing, setProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      customerName: orderContext?.customerName || user?.name || '',
      mobileNumber: orderContext?.mobileNumber || '',
    }
  });

  const [address, setAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('temp_checkout_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          street: parsed.street || '',
          city: parsed.city || '',
          state: parsed.state || 'Delhi',
          pincode: parsed.pincode || '',
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      street: '',
      city: '',
      state: 'Delhi',
      pincode: '',
    };
  });

  const handleProcessPayment = async (formData) => {
    if (orderContext.orderType === 'delivery' && (!address.street || !address.city || !address.pincode)) {
      toast.error('Please complete your delivery address first.');
      return;
    }

    setProcessing(true);

    // Simulate 2.5 second network latency for payment gateway
    setTimeout(async () => {
      try {
        const payload = {
          items: cartItems.map((i) => ({
            menuitem: i._id,
            quantity: i.quantity,
            price: i.price,
          })),
          subtotal,
          tax: gstAmount,
          deliveryCharges,
          discount: discountAmount,
          total: finalTotal,
          deliveryAddress: orderContext.orderType === 'delivery' ? address : {
            street: `Table ${orderContext.tableNumber} - ${orderContext.customerName || user?.name || 'Guest'}`,
            city: 'Rasoi Junction Dine-In',
            state: 'Gujarat',
            pincode: '390001'
          },
          orderType: orderContext.orderType,
          tableNumber: orderContext.tableNumber,
          paymentMethod,
          paymentDetails: {
            ...formData,
            // Fallback default details if UPI
            customerName: formData.customerName || user?.name || 'Guest User',
            mobileNumber: formData.mobileNumber || '9876543210',
          },
        };

        const res = await api.post('/payments/process-simulated', payload);
        toast.success('Payment completed successfully! 🎉');
        if (orderContext.orderType === 'dine-in') {
          clearDineInContext();
        }
        clearCart();
        navigate(`/orders/invoice/${res.data.payment.orderId}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Payment simulation failed.');
        setProcessing(false);
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold font-display text-dark-800 dark:text-white mb-8">
          Secure checkout <span className="text-gradient">Payment</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery address or Dine-in Details */}
            {orderContext.orderType === 'dine-in' ? (
              <Card className="p-6 bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <HiOutlineOfficeBuilding className="w-6 h-6" />
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
                  1. Delivery Coordinates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-1 block">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="House No, Apartment, Street"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-1 block">City *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Vadodara"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-1 block">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="110001"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Method Tabs */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-6">
                2. Choose Payment Method
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { id: 'upi', label: 'UPI / GPay', icon: HiOutlineSparkles },
                  { id: 'debit_card', label: 'Debit Card', icon: HiOutlineCreditCard },
                  { id: 'credit_card', label: 'Credit Card', icon: HiOutlineCreditCard },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`py-4 px-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-500/10 text-primary-500 font-bold shadow-sm'
                          : 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs sm:text-sm">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Form */}
              <form onSubmit={handleSubmit(handleProcessPayment)} className="space-y-4">
                
                {paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <Input
                      label="Account Holder Name *"
                      name="customerName"
                      placeholder="E.g. Priya Sharma"
                      register={register}
                      required
                      error={errors.customerName?.message}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="UPI ID *"
                        name="upiId"
                        placeholder="E.g. priya@upi, priya@ybl"
                        register={register}
                        required
                        error={errors.upiId?.message}
                      />

                      <Input
                        label="Mobile Number *"
                        name="mobileNumber"
                        placeholder="10-digit number"
                        register={register}
                        required
                        error={errors.mobileNumber?.message}
                      />
                    </div>
                  </div>
                )}

                {(paymentMethod === 'debit_card' || paymentMethod === 'credit_card') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Card Holder Name *"
                        name="cardHolderName"
                        placeholder="As printed on card"
                        register={register}
                        required
                        error={errors.cardHolderName?.message}
                      />

                      <Input
                        label="Card Number *"
                        name="cardNumber"
                        placeholder="16-digit card number"
                        register={register}
                        required
                        error={errors.cardNumber?.message}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Expiry Month *"
                        name="expiryMonth"
                        placeholder="MM (e.g. 08)"
                        register={register}
                        required
                        error={errors.expiryMonth?.message}
                      />
                      <Input
                        label="Expiry Year *"
                        name="expiryYear"
                        placeholder="YY (e.g. 29)"
                        register={register}
                        required
                        error={errors.expiryYear?.message}
                      />
                      <Input
                        label="CVV *"
                        name="cvv"
                        type="password"
                        placeholder="3 digits"
                        register={register}
                        required
                        error={errors.cvv?.message}
                      />
                    </div>

                    <div className="border-t border-gray-100 dark:border-dark-700/50 pt-4 mt-4 space-y-4">
                      <h4 className="text-sm font-bold text-dark-800 dark:text-white">Billing Address</h4>
                      
                      <Input
                        label="Billing Street Address *"
                        name="billingAddress"
                        placeholder="Building, street coordinates"
                        register={register}
                        required
                        error={errors.billingAddress?.message}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="City *"
                          name="city"
                          placeholder="Vadodara"
                          register={register}
                          required
                          error={errors.city?.message}
                        />
                        <Input
                          label="State *"
                          name="state"
                          placeholder="Delhi"
                          register={register}
                          required
                          error={errors.state?.message}
                        />
                        <Input
                          label="Pincode *"
                          name="pinCode"
                          placeholder="6 digits"
                          register={register}
                          required
                          error={errors.pinCode?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Billing Mobile Number *"
                          name="mobileNumber"
                          placeholder="10 digits"
                          register={register}
                          required
                          error={errors.mobileNumber?.message}
                        />
                        <Input
                          label="Billing Email Address *"
                          name="emailAddress"
                          type="email"
                          placeholder="name@example.com"
                          register={register}
                          required
                          error={errors.emailAddress?.message}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full py-4 mt-6"
                >
                  Pay Now (₹{finalTotal})
                </Button>
              </form>
            </Card>
          </div>

          {/* Pricing calculations */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-dark-800 dark:text-white mb-6">Order Checkout</h3>
              
              <div className="space-y-4 text-sm border-b border-gray-100 dark:border-dark-700 pb-5 mb-5">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-dark-800 dark:text-white">₹{gstAmount}</span>
                </div>
                {orderContext.orderType !== 'dine-in' && (
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-dark-800 dark:text-white">₹{deliveryCharges}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success-500 font-bold">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-primary-500 font-bold mt-2 p-2 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                  <span className="flex items-center gap-1"><HiOutlineSparkles className="w-4 h-4"/> Loyalty Points to Earn</span>
                  <span>+{Math.floor(finalTotal * 0.25)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-dark-800 dark:text-white mb-6">
                <span>Final Total</span>
                <span className="text-2xl font-black text-primary-500">₹{finalTotal}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Processing Animation Modal */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-dark-900 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-premium"
            >
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary-500 border-t-transparent animate-spin flex items-center justify-center" />
              <div>
                <h3 className="text-xl font-bold text-dark-800 dark:text-white">Processing Payment...</h3>
                <p className="text-sm text-gray-400 mt-2">Connecting with secure payment simulation channel. Please do not close this window.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSimulationPage;
