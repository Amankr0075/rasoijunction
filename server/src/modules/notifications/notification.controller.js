import Notification from './notification.model.js';
import User from '../auth/auth.model.js';
import sendEmail from '../../utils/sendEmail.js';
import asyncHandler from '../../middleware/asyncHandler.js';

// @desc    Get system or customer notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'customer') {
    query = { user: req.user._id };
  } else {
    query = { user: { $exists: false } };
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

// @desc    Mark notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
export const markAllRead = asyncHandler(async (req, res) => {
  let query = { read: false };
  if (req.user.role === 'customer') {
    query.user = req.user._id;
  } else {
    query.user = { $exists: false };
  }

  await Notification.updateMany(query, { read: true });

  res.status(200).json({
    success: true,
    message: 'Notifications marked as read',
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  // Customers can only delete their own notifications
  if (req.user.role === 'customer' && (!notification.user || notification.user.toString() !== req.user._id.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this notification',
    });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

// Helper function to create notification from server controllers
export const createSystemNotification = async (message, type, userId = null) => {
  try {
    await Notification.create({
      message,
      type,
      user: userId || undefined,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

// @desc    Broadcast a message to all users
// @route   POST /api/notifications/broadcast
// @access  Admin/Manager
export const broadcastMessage = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  let attachmentUrl = null;
  let attachmentPath = null;
  let originalFilename = null;

  if (req.file) {
    // req.file path usually looks like .../public/uploads/broadcasts/filename
    attachmentUrl = `/uploads/broadcasts/${req.file.filename}`;
    attachmentPath = req.file.path;
    originalFilename = req.file.originalname;
  }

  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both subject and message.',
    });
  }

  // Fetch all users
  const users = await User.find({});

  // Dispatch notifications in the background
  const emailPromises = [];
  const dbNotifications = [];

  for (const user of users) {
    // 1. Prepare system notification
    dbNotifications.push({
      message: `Announcement: ${subject}`,
      type: 'System',
      user: user._id,
      attachmentUrl,
    });

    // 2. Prepare email
    let attachmentHtml = '';
    if (attachmentUrl) {
      attachmentHtml = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #4b5563;">
          <strong>Attachment Included:</strong> ${originalFilename}
        </p>
      </div>`;
    }

    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello ${user.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; white-space: pre-wrap;">${message}</p>
        
        ${attachmentHtml}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 15px; color: #111827; font-weight: 600; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    const emailOptions = {
      email: user.email,
      subject: subject,
      message: message,
      html: htmlMessage,
    };

    if (attachmentPath) {
      emailOptions.attachments = [
        {
          filename: originalFilename,
          path: attachmentPath,
        }
      ];
    }

    emailPromises.push(
      sendEmail(emailOptions).catch(err => console.error(`Failed to email ${user.email}:`, err))
    );
  }

  // Execute bulk DB insert
  if (dbNotifications.length > 0) {
    await Notification.insertMany(dbNotifications);
  }

  // Fire emails asynchronously (do not block the response)
  Promise.allSettled(emailPromises);

  res.status(200).json({
    success: true,
    message: `Broadcast message sent to ${users.length} users successfully.`,
  });
});
