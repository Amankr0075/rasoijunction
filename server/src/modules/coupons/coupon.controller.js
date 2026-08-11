import Coupon from './coupon.model.js';
import asyncHandler from '../../middleware/asyncHandler.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public (for customer usage) / Private (for admin list)
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: coupons.length,
    coupons,
  });
});

// @desc    Get / validate a coupon by code
// @route   GET /api/coupons/:code
// @access  Public
export const getCouponByCode = asyncHandler(async (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Invalid coupon code.',
    });
  }

  res.status(200).json({
    success: true,
    coupon,
  });
});

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Admin, Manager)
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, type, value, minOrder, status } = req.body;

  const codeFormatted = code.toUpperCase().replace(/\s+/g, '');

  const existingCoupon = await Coupon.findOne({ code: codeFormatted });
  if (existingCoupon) {
    return res.status(400).json({
      success: false,
      message: 'Coupon code already exists.',
    });
  }

  const coupon = await Coupon.create({
    code: codeFormatted,
    type,
    value,
    minOrder: minOrder || 0,
    status: status || 'Active',
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully.',
    coupon,
  });
});

// @desc    Update/Toggle a coupon status
// @route   PUT /api/coupons/:id
// @access  Private (Admin, Manager)
export const updateCoupon = asyncHandler(async (req, res) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found',
    });
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    coupon,
  });
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin, Manager)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found',
    });
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});
