import Review from './review.model.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { createSystemNotification } from '../notifications/notification.controller.js';
import User from '../auth/auth.model.js';
import mongoose from 'mongoose';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.staffId) {
    query.staffId = req.query.staffId;
  }
  if (req.query.orderId) {
    query.orderId = req.query.orderId;
  }
  const reviews = await Review.find(query).sort({ createdAt: -1 }).populate('staffId', 'name');

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = asyncHandler(async (req, res) => {
  const { dishName, rating, comment, orderId, chefId, chefRating, deliveryId, deliveryRating } = req.body;

  const review = await Review.create({
    dishName: dishName || undefined,
    orderId: orderId || undefined,
    chefId: chefId || undefined,
    chefRating: chefRating || undefined,
    deliveryId: deliveryId || undefined,
    deliveryRating: deliveryRating || undefined,
    staffId: req.body.staffId || undefined,
    customerName: req.body.customerName || req.user.name,
    rating: rating || 5, // Default to 5 if only rating staff
    comment: comment || 'No comment',
  });

  // Update Chef Average Rating
  if (chefId && chefRating) {
    const stats = await Review.aggregate([
      { $match: { chefId: new mongoose.Types.ObjectId(chefId) } },
      { $group: { _id: '$chefId', averageRating: { $avg: '$chefRating' } } }
    ]);
    if (stats.length > 0) {
      await User.findByIdAndUpdate(chefId, { 'staffDetails.rating': Number(stats[0].averageRating.toFixed(1)) });
    }
  }

  // Update Delivery Average Rating
  if (deliveryId && deliveryRating) {
    const stats = await Review.aggregate([
      { $match: { deliveryId: new mongoose.Types.ObjectId(deliveryId) } },
      { $group: { _id: '$deliveryId', averageRating: { $avg: '$deliveryRating' } } }
    ]);
    if (stats.length > 0) {
      await User.findByIdAndUpdate(deliveryId, { 'staffDetails.rating': Number(stats[0].averageRating.toFixed(1)) });
    }
  }

  let notificationMsg = `New review from ${review.customerName}`;
  if (dishName) notificationMsg += ` for "${dishName}"`;
  else if (orderId) notificationMsg += ` for Order Experience`;

  await createSystemNotification(notificationMsg, 'Review');

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    review,
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin, Manager)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});
