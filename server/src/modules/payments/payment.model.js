import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'debit_card', 'credit_card'],
      required: true,
    },
    upiId: {
      type: String,
    },
    cardHolderName: {
      type: String,
    },
    maskedCardNumber: {
      type: String,
    },
    billingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String, // String representation e.g. RJ-20260630-0001
      required: true,
    },
    orderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    paymentDate: {
      type: String,
      required: true,
    },
    paymentTime: {
      type: String,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
