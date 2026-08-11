import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'],
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    tableNumber: {
      type: String,
    },
    preference: {
      type: String,
      enum: ['window', 'centre', 'corner', 'outdoor', 'none'],
      default: 'none',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    amount: {
      type: Number,
      default: 199,
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
    paymentDetails: {
      upiId: { type: String },
      customerName: { type: String },
      mobileNumber: { type: String },
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ user: 1 });
reservationSchema.index({ date: 1 });
reservationSchema.index({ status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
