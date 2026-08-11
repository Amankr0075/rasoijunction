import mongoose from 'mongoose';
import Order from './order.model.js';
import User from '../auth/auth.model.js';
import MenuItem from '../menu/menu.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { createSystemNotification } from '../notifications/notification.controller.js';
import sendEmail from '../../utils/sendEmail.js';
import { generateInvoicePDF } from '../../utils/pdfGenerator.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, subtotal, tax, deliveryCharges, discount, total, paymentMethod, deliveryAddress, tableNumber, orderType } = req.body;

  if (!items || items.length === 0) {
    throw new AppError('No items in order', 400);
  }

  if (orderType === 'delivery') {
    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      throw new AppError('Delivery address is required for delivery orders', 400);
    }
  } else if (orderType === 'dine-in') {
    if (!tableNumber) {
      throw new AppError('Table number is required for dine-in orders', 400);
    }
  }

  // Verify stock / items exist
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuitem);
    if (!menuItem) {
      throw new AppError(`Menu item ${item.menuitem} not found`, 404);
    }
    if (!menuItem.isAvailable) {
      throw new AppError(`Dish "${menuItem.name}" is currently sold out`, 400);
    }
  }

  // Generate unique order ID (e.g. RJ-1001, RJ-1002, etc.)
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  let nextNumber = 1001;
  if (lastOrder && lastOrder.orderId) {
    const lastNum = parseInt(lastOrder.orderId.replace('RJ-', ''));
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }
  const orderId = `RJ-${nextNumber}`;
  
  // Calculate loyalty points earned (25% of total)
  const loyaltyPointsEarned = Math.floor(total * 0.25);

  const order = await Order.create({
    orderId,
    user: req.user._id,
    items,
    subtotal,
    tax,
    deliveryCharges,
    discount,
    total,
    paymentMethod,
    deliveryAddress,
    tableNumber,
    orderType: orderType || 'delivery',
    orderStatus: 'pending',
    loyaltyPointsEarned,
    statusHistory: [{ status: 'pending' }],
  });

  // Update user's loyalty points
  await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: loyaltyPointsEarned } });

  await createSystemNotification(`New order placed: ${order.orderId} (₹${order.total})`, 'Order');

  // Populate menu items details for response and sockets
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email phone')
    .populate('items.menuitem', 'name price image category isVeg');

  // Trigger Socket.IO broadcast if active
  if (global.io) {
    global.io.emit('new_order', populatedOrder);
  }

  // Send Order Placed Email
  try {
    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Order Placed Successfully!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello ${populatedOrder.user.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Thank you for your order! We have received it and our kitchen will start preparing it soon.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f97316;">
          <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Order ID:</strong> ${populatedOrder.orderId}</p>
          <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Total Amount:</strong> ₹${populatedOrder.total}</p>
          <p style="margin: 0; font-size: 15px;"><strong>Payment Method:</strong> ${populatedOrder.paymentMethod.toUpperCase()}</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">You can track your order status in your dashboard.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: populatedOrder.user.email,
      subject: `Order Confirmation: ${populatedOrder.orderId}`,
      message: `Thank you for your order. Your Order ID is ${populatedOrder.orderId} and Total is ₹${populatedOrder.total}.`,
      html: htmlMessage,
    });
  } catch (err) {
    console.log('Error sending order placed email:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder,
  });
});

/**
 * @desc    Get all orders (Admin views all, Customer views their own, Chef views preparing/ready, Delivery views assigned)
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const { status, limit = 50, page = 1 } = req.query;
  const query = {};

  // Role-based filtering
  if (req.user.role === 'customer') {
    query.user = req.user._id;
  } else if (req.user.role === 'chef') {
    query.$or = [
      { orderStatus: { $in: ['accepted', 'preparing', 'ready'] } },
      { chef: req.user._id }
    ];
  } else if (req.user.role === 'delivery') {
    query.deliveryPartner = req.user._id;
  } else if (req.user.role === 'staff') {
    query.assignedStaff = req.user._id;
  }

  if (status) query.orderStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email phone')
    .populate('items.menuitem', 'name price image category isVeg');

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
    data: orders,
  });
});

/**
 * @desc    Get single order details
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('chef', 'name phone')
    .populate('deliveryPartner', 'name phone')
    .populate('items.menuitem', 'name price image category isVeg');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Authorization check: customers can only view their own orders
  if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied to view this order', 403);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Cancel order by customer
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Customer)
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Ensure it belongs to the user
  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Access denied', 403);
  }

  // Allowed to cancel only if pending or accepted
  if (order.orderStatus !== 'pending' && order.orderStatus !== 'accepted') {
    throw new AppError('Order cannot be cancelled because kitchen preparation has already started.', 400);
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({ status: 'cancelled' });

  // Update payment status for refund processing manually (store credit logic)
  if (order.paymentStatus === 'paid') {
    order.paymentStatus = 'refunded';
  }

  await order.save();

  await createSystemNotification(`Order ${order.orderId} cancelled by customer`, 'Order');

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email phone')
    .populate('items.menuitem', 'name price image category isVeg');

  if (global.io) {
    global.io.emit('order_status_update', updatedOrder);
    global.io.to(order.user.toString()).emit('my_order_update', updatedOrder);
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: updatedOrder,
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Staff/Chef/Delivery/Admin)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Update status and historical logs
  order.orderStatus = status;
  order.statusHistory.push({ status });

  // Handle specific automatic updates
  if (status === 'delivered') {
    order.paymentStatus = 'paid'; // COD orders get paid on delivery
  }

  // Chef assignments
  if (status === 'preparing' && req.user.role === 'chef') {
    order.chef = req.user._id;
  }
  // Delivery assignments
  if (status === 'out_for_delivery' && req.user.role === 'delivery') {
    order.deliveryPartner = req.user._id;
  }

  await order.save();

  await createSystemNotification(`Order ${order.orderId} status updated to "${status}"`, 'Order');

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email phone')
    .populate('chef', 'name phone')
    .populate('deliveryPartner', 'name phone')
    .populate('items.menuitem', 'name price image category isVeg');

  // Broadcast real-time status update to Customer and Admin listeners
  if (global.io) {
    global.io.emit('order_status_update', updatedOrder);
    global.io.to(order.user.toString()).emit('my_order_update', updatedOrder);
  }

  // Send Email Notification if delivered
  if (status === 'delivered') {
    try {
      const itemsHtml = updatedOrder.items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.menuitem?.name || 'Deleted Item'}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
      `).join('');

      const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f97316; padding: 30px; text-align: center;">
          <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
          <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Order Delivered! 🍽️</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello ${updatedOrder.user.name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Your order <strong>${updatedOrder.orderId}</strong> has been successfully delivered. We hope you enjoy your meal!</p>
          
          <h3 style="color: #374151; margin-top: 25px; margin-bottom: 10px;">Invoice Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; color: #4b5563;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Subtotal:</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${updatedOrder.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Tax (GST):</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${updatedOrder.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Delivery Charges:</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${updatedOrder.deliveryCharges.toFixed(2)}</td>
              </tr>
              ${updatedOrder.discount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #16a34a;">Discount:</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #16a34a;">-₹${updatedOrder.discount.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total:</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #ea580c;">₹${updatedOrder.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #db2777;">
            <p style="font-size: 14px; line-height: 1.6; color: #9d174d; margin: 0;">We would love to hear your feedback. Please rate your experience on our website.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
          <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
          <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
        </div>
      </div>
      `;

      const pdfBuffer = await generateInvoicePDF(updatedOrder);

      await sendEmail({
        email: updatedOrder.user.email,
        subject: `Your Order ${updatedOrder.orderId} is Delivered!`,
        message: `Your order ${updatedOrder.orderId} has been successfully delivered.`,
        html: htmlMessage,
        attachments: [
          {
            filename: `Invoice_${updatedOrder.orderId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    } catch (err) {
      console.log('Error sending order delivered email:', err);
    }
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to "${status}"`,
    data: updatedOrder,
  });
});

/**
 * @desc    Assign staff manually to an order
 * @route   PUT /api/orders/:id/assign
 * @access  Private (Admin/Manager)
 */
export const assignStaff = asyncHandler(async (req, res) => {
  const { chefId, deliveryId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (chefId !== undefined) {
    if (chefId && mongoose.Types.ObjectId.isValid(chefId)) {
      order.chef = chefId;
    } else {
      order.chef = null;
    }
  }
  if (deliveryId !== undefined) {
    if (deliveryId && mongoose.Types.ObjectId.isValid(deliveryId)) {
      order.deliveryPartner = deliveryId;
    } else {
      order.deliveryPartner = null;
    }
  }
  if (req.body.staffId !== undefined) {
    if (req.body.staffId && mongoose.Types.ObjectId.isValid(req.body.staffId)) {
      order.assignedStaff = req.body.staffId;
    } else {
      order.assignedStaff = null;
    }
  }

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email phone')
    .populate('chef', 'name phone')
    .populate('deliveryPartner', 'name phone')
    .populate('items.menuitem', 'name price image category isVeg');

  if (global.io) {
    global.io.emit('order_status_update', updatedOrder);
  }

  res.status(200).json({
    success: true,
    message: 'Staff assigned successfully',
    data: updatedOrder,
  });
});

/**
 * @desc    Delete order
 * @route   DELETE /api/orders/:id
 * @access  Private (Admin, Manager)
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully',
    data: {},
  });
});

/**
 * @desc    Delete all orders (Admin/Manager)
 * @route   DELETE /api/orders/all
 * @access  Private/Admin/Manager
 */
export const deleteAllOrders = asyncHandler(async (req, res) => {
  await Order.deleteMany({});
  
  res.status(200).json({
    success: true,
    message: 'All orders have been deleted successfully',
    data: {},
  });
});
