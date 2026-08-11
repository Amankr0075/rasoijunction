import Contact from './contact.model.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import User from '../auth/auth.model.js';
import { createSystemNotification } from '../notifications/notification.controller.js';
import sendEmail from '../../utils/sendEmail.js';

// @desc    Submit a contact form
// @route   POST /api/contacts
// @access  Public
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  try {
    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Inquiry Received</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Dear ${name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Thank you for contacting Rasoi Junction.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">We have received your inquiry regarding "<strong>${subject}</strong>". Our support team is reviewing it and will get back to you shortly.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    await sendEmail({
      email,
      subject: 'Inquiry Received - Rasoi Junction',
      message: `Dear ${name},\n\nThank you for contacting Rasoi Junction.\n\nWe have received your inquiry regarding "${subject}". Our support team is reviewing it and will get back to you shortly.\n\nBest regards,\nRasoi Junction Team`,
      html: htmlMessage,
    });
  } catch (emailError) {
    console.error('Contact confirmation email failed to send:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been submitted successfully!',
    contact,
  });
});

// @desc    Get all contact submissions
// @route   GET /api/contacts
// @access  Private (Admin, Manager)
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contacts.length,
    contacts,
  });
});

// @desc    Get current customer's contact submissions
// @route   GET /api/contacts/mine
// @access  Private (Customer)
export const getMyContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ email: req.user.email }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contacts.length,
    contacts,
  });
});

// @desc    Delete a contact submission
// @route   DELETE /api/contacts/:id
// @access  Private (Admin, Manager)
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Inquiry not found',
    });
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Inquiry deleted successfully',
  });
});

// @desc    Reply to a contact inquiry
// @route   PUT /api/contacts/:id/reply
// @access  Private (Admin, Manager)
export const replyContact = asyncHandler(async (req, res) => {
  const { replyText } = req.body;
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Inquiry not found',
    });
  }

  contact.reply = replyText;
  await contact.save();

  const user = await User.findOne({ email: contact.email });
  if (user) {
    await createSystemNotification(
      `Support Team replied to your inquiry "${contact.subject}": "${replyText}"`,
      'Feedback',
      user._id
    );
  }

  try {
    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f97316; padding: 30px; text-align: center;">
        <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain;" />
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
        <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Reply to Your Inquiry</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Dear ${contact.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Our support team has replied to your inquiry regarding "<strong>${contact.subject}</strong>".</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f97316;">
          <p style="margin: 0; font-size: 15px; font-style: italic;">"${replyText}"</p>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">If you have any further questions, please let us know.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
        <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
        <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
      </div>
    </div>
    `;

    await sendEmail({
      email: contact.email,
      subject: `Reply to your Inquiry: "${contact.subject}"`,
      message: `Dear ${contact.name},\n\nOur support team has replied to your inquiry regarding "${contact.subject}".\n\nReply from Admin:\n"${replyText}"\n\nIf you have any further questions, please let us know.\n\nBest regards,\nRasoi Junction Team`,
      html: htmlMessage,
    });
  } catch (emailError) {
    console.error('Contact reply email failed to send:', emailError);
  }

  res.status(200).json({
    success: true,
    message: 'Reply submitted successfully',
    contact,
  });
});
