import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        menuitem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    deliveryCharges: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'online'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderType: {
      type: String,
      enum: ['delivery', 'dine-in', 'takeaway'],
      default: 'delivery',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String, default: 'Delhi' },
      pincode: { type: String },
    },
    tableNumber: {
      type: String, // optional, for dine-in tables
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ chef: 1 });
orderSchema.index({ deliveryPartner: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
