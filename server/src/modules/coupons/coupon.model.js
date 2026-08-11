import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, 'Coupon type is required'],
      enum: ['Percentage', 'Flat'],
      default: 'Percentage',
    },
    value: {
      type: Number,
      required: [true, 'Coupon discount value is required'],
      min: [0, 'Value cannot be negative'],
    },
    minOrder: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ status: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
