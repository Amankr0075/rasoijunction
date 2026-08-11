import Feedback from './feedback.model.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { createSystemNotification } from '../notifications/notification.controller.js';
import sendEmail from '../../utils/sendEmail.js';

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Private (Admin, Manager)
export const getFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedbacks.length,
    feedbacks,
  });
});

// @desc    Get current customer's feedbacks
// @route   GET /api/feedbacks/mine
// @access  Private (Customer)
export const getMyFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: feedbacks.length,
    feedbacks,
  });
});

// @desc    Create a new feedback
// @route   POST /api/feedbacks
// @access  Private (Customer)
export const createFeedback = asyncHandler(async (req, res) => {
  const { subject, message, email } = req.body;
  const customerEmail = email || req.user.email;

  const feedback = await Feedback.create({
    customerName: req.user.name,
    customerEmail,
    subject,
    message,
  });

  await createSystemNotification(`New feedback ticket from ${feedback.customerName}: "${feedback.subject}"`, 'Feedback');

  try {
    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Feedback Received</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Dear ${feedback.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Thank you for reaching out and providing your feedback regarding "<strong>${feedback.subject}</strong>".</p>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">Our team has received your message and will review it shortly. If a reply is necessary, we will get back to you soon.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: customerEmail,
      subject: 'Feedback Received - Rasoi Junction',
      message: `Dear ${feedback.customerName},\n\nThank you for reaching out and providing your feedback regarding "${feedback.subject}".\n\nOur team has received your message and will review it shortly. If a reply is necessary, we will get back to you soon.\n\nBest regards,\nRasoi Junction Team`,
      html: htmlMessage,
    });
  } catch (emailError) {
    console.error('Feedback confirmation email failed to send:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    feedback,
  });
});

// @desc    Reply to a feedback
// @route   PUT /api/feedbacks/:id/reply
// @access  Private (Admin, Manager)
export const replyFeedback = asyncHandler(async (req, res) => {
  const { replyText } = req.body;
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found',
    });
  }

  feedback.reply = replyText;
  await feedback.save();

  try {
    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Reply to Your Feedback</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Dear ${feedback.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Our team has replied to your feedback regarding "<strong>${feedback.subject}</strong>".</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f97316;">
          <p style="margin: 0; font-size: 15px; font-style: italic;">"${replyText}"</p>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">Thank you for helping us improve!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: feedback.customerEmail,
      subject: `Reply to your Feedback: "${feedback.subject}"`,
      message: `Dear ${feedback.customerName},\n\nOur team has replied to your feedback regarding "${feedback.subject}".\n\nReply from Admin:\n"${replyText}"\n\nThank you for helping us improve!\n\nBest regards,\nRasoi Junction Team`,
      html: htmlMessage,
    });
  } catch (emailError) {
    console.error('Feedback reply email failed to send:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Reply submitted successfully',
    feedback,
  });
});

// @desc    Delete a feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private (Admin, Manager)
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found',
    });
  }

  await feedback.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Feedback deleted successfully',
  });
});
