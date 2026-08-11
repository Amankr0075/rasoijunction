import Payment from './payment.model.js';
import Order from '../orders/order.model.js';
import MenuItem from '../menu/menu.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { createSystemNotification } from '../notifications/notification.controller.js';

// Helper to pad numbers (e.g. 1 -> 0001)
const padZero = (num, size = 4) => {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
};

// Helper to generate 9 random digits
const generateRandomDigits = (length = 9) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

/**
 * @desc    Process simulated online payment (UPI, Debit/Credit Card)
 * @route   POST /api/payments/process-simulated
 * @access  Private (Customer)
 */
export const processSimulatedPayment = asyncHandler(async (req, res) => {
  const {
    items,
    subtotal,
    tax,
    deliveryCharges,
    discount,
    total,
    deliveryAddress,
    paymentMethod,
    paymentDetails,
  } = req.body;

  // Basic validations
  if (!items || items.length === 0) {
    throw new AppError('No items in order', 400);
  }
  if (!paymentMethod || !['upi', 'debit_card', 'credit_card'].includes(paymentMethod)) {
    throw new AppError('Invalid payment method selected', 400);
  }
  if (!paymentDetails) {
    throw new AppError('Payment details are required', 400);
  }

  // UPI Validations
  if (paymentMethod === 'upi') {
    const { upiId, customerName, mobileNumber } = paymentDetails;
    if (!upiId || !customerName || !mobileNumber) {
      throw new AppError('All UPI fields are required', 400);
    }
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      throw new AppError('Mobile number must be 10 digits', 400);
    }
    // Validation regex allowing any standard UPI format (e.g. name@bank)
    const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/;
    if (!upiRegex.test(upiId)) {
      throw new AppError('Invalid UPI ID format. E.g. name@upi, name@ybl', 400);
    }
  }

  // Card Validations
  if (paymentMethod === 'debit_card' || paymentMethod === 'credit_card') {
    const {
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      billingAddress,
      city,
      state,
      pinCode,
      mobileNumber,
      emailAddress,
    } = paymentDetails;

    if (
      !cardHolderName ||
      !cardNumber ||
      !expiryMonth ||
      !expiryYear ||
      !cvv ||
      !billingAddress ||
      !city ||
      !state ||
      !pinCode ||
      !mobileNumber ||
      !emailAddress
    ) {
      throw new AppError('All Card fields are required', 400);
    }

    if (cardNumber.replace(/\s+/g, '').length !== 16 || isNaN(cardNumber.replace(/\s+/g, ''))) {
      throw new AppError('Card number must contain 16 digits', 400);
    }
    if (cvv.length !== 3 || isNaN(cvv)) {
      throw new AppError('CVV must be 3 digits', 400);
    }
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      throw new AppError('Mobile number must be 10 digits', 400);
    }
    if (pinCode.length !== 6 || isNaN(pinCode)) {
      throw new AppError('PIN code must be 6 digits', 400);
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailAddress)) {
      throw new AppError('Please enter a valid email address', 400);
    }

    // Expiry Check
    const currentYear = new Date().getFullYear() % 100; // e.g. 26
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const expYearNum = parseInt(expiryYear);
    const expMonthNum = parseInt(expiryMonth);

    if (expYearNum < currentYear || (expYearNum === currentYear && expMonthNum < currentMonth)) {
      throw new AppError('Card expiry date cannot be in the past', 400);
    }
  }

  // Verify stock levels / items
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuitem);
    if (!menuItem) {
      throw new AppError(`Menu item not found`, 404);
    }
    if (!menuItem.isAvailable) {
      throw new AppError(`Dish "${menuItem.name}" is currently sold out`, 400);
    }
  }

  // Generate Unique Identifiers
  const now = new Date();
  const year = now.getFullYear();
  const month = padZero(now.getMonth() + 1, 2);
  const day = padZero(now.getDate(), 2);
  const dateStr = `${year}${month}${day}`; // e.g. 20260630

  // Count orders placed today to increment sequence
  const startOfDay = new Date(now.setHours(0,0,0,0));
  const endOfDay = new Date(now.setHours(23,59,59,999));
  const todayOrdersCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const nextSeq = todayOrdersCount + 1;
  const seqStr = padZero(nextSeq, 4); // e.g. 0001

  const orderId = `RJ-${dateStr}-${seqStr}`;
  const invoiceNumber = `INV-${dateStr}-${seqStr}`;
  const paymentId = `PAY-${generateRandomDigits()}`;
  const transactionId = `TXN-${generateRandomDigits()}`;

  const paymentDateStr = `${year}-${month}-${day}`;
  const paymentTimeStr = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

  // Mask card number if card payment
  let maskedCardNumber = '';
  if (paymentMethod === 'debit_card' || paymentMethod === 'credit_card') {
    const cleanNum = paymentDetails.cardNumber.replace(/\s+/g, '');
    const last4 = cleanNum.slice(-4);
    maskedCardNumber = `**** **** **** ${last4}`;
  }

  // Create Order in DB
  const order = await Order.create({
    orderId,
    user: req.user._id,
    items,
    subtotal,
    tax,
    deliveryCharges,
    discount,
    total,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    orderStatus: 'pending',
    deliveryAddress,
    statusHistory: [{ status: 'pending' }],
  });

  // Create Payment record in DB
  const payment = await Payment.create({
    customerName: paymentMethod === 'upi' ? paymentDetails.customerName : paymentDetails.cardHolderName,
    mobileNumber: paymentDetails.mobileNumber,
    email: paymentMethod === 'upi' ? req.user.email : paymentDetails.emailAddress,
    paymentMethod,
    upiId: paymentDetails.upiId || undefined,
    cardHolderName: paymentDetails.cardHolderName || undefined,
    maskedCardNumber: maskedCardNumber || undefined,
    billingAddress: paymentMethod === 'upi' 
      ? { street: deliveryAddress.street, city: deliveryAddress.city, state: deliveryAddress.state || 'Delhi', pincode: deliveryAddress.pincode }
      : { street: paymentDetails.billingAddress, city: paymentDetails.city, state: paymentDetails.state, pincode: paymentDetails.pinCode },
    transactionId,
    paymentId,
    invoiceNumber,
    orderId,
    orderRef: order._id,
    paymentStatus: 'success',
    paymentDate: paymentDateStr,
    paymentTime: paymentTimeStr,
    amountPaid: total,
  });

  await createSystemNotification(`Simulated payment of ₹${total} completed successfully for Order ${orderId}`, 'Payment');

  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email phone')
    .populate('items.menuitem', 'name price image category isVeg');

  // Broadcast updates through Socket
  if (global.io) {
    global.io.emit('new_order', populatedOrder);
    global.io.to(req.user._id.toString()).emit('my_order_update', populatedOrder);
  }

  res.status(201).json({
    success: true,
    message: 'Simulated payment completed successfully!',
    data: {
      order: populatedOrder,
      payment,
    },
  });
});

/**
 * @desc    Retrieve payment details for a specific order
 * @route   GET /api/payments/order/:orderId
 * @access  Private
 */
export const getPaymentByOrderId = asyncHandler(async (req, res) => {
  let payment = await Payment.findOne({ orderId: req.params.orderId })
    .populate({
      path: 'orderRef',
      populate: {
        path: 'items.menuitem'
      }
    });

  if (!payment) {
    // Check if it's a COD order that was paid upon delivery
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.menuitem')
      .populate('user');
      
    if (order && order.paymentStatus === 'paid') {
      // Synthesize a payment object for the UI to render the invoice
      payment = {
        customerName: order.user?.name || 'Customer',
        mobileNumber: order.user?.phone || 'N/A',
        email: order.user?.email || 'N/A',
        paymentMethod: order.paymentMethod,
        billingAddress: order.deliveryAddress,
        transactionId: `COD-${order.orderId}`,
        paymentId: `PAY-${order.orderId}`,
        invoiceNumber: `INV-${order.orderId}`,
        orderId: order.orderId,
        orderRef: order,
        paymentStatus: 'success',
        paymentDate: new Date(order.updatedAt).toLocaleDateString(),
        paymentTime: new Date(order.updatedAt).toLocaleTimeString(),
        amountPaid: order.total,
      };
    } else {
      throw new AppError('Payment records not found for this order', 404);
    }
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

/**
 * @desc    Get all payment records (Admin views analytics/auditing logs)
 * @route   GET /api/payments
 * @access  Private (Admin/Manager)
 */
export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).populate('orderRef');
  res.status(200).json({
    success: true,
    data: payments,
  });
});
