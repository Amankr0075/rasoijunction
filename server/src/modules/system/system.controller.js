import asyncHandler from '../../middleware/asyncHandler.js';
import EmailLog from './emailLog.model.js';
import sendEmail from '../../utils/sendEmail.js';
import { GoogleGenAI } from '@google/genai';
import env from '../../config/env.js';

// @desc    Get system maintenance status
// @route   GET /api/system/maintenance/status
// @access  Public
export const getMaintenanceStatus = asyncHandler(async (req, res) => {
  if (global.isMaintenanceMode && global.maintenanceEndTime && Date.now() > global.maintenanceEndTime) {
    global.isMaintenanceMode = false;
    global.maintenanceEndTime = null;
  }
  res.status(200).json({
    success: true,
    isMaintenanceMode: !!global.isMaintenanceMode,
    endTime: global.maintenanceEndTime || null,
  });
});

// @desc    Toggle system maintenance mode
// @route   POST /api/system/maintenance/toggle
// @access  Admin/Manager
export const toggleMaintenanceMode = asyncHandler(async (req, res) => {
  const { enabled, durationMinutes } = req.body;
  
  global.isMaintenanceMode = enabled === true;
  
  if (enabled && durationMinutes) {
    global.maintenanceEndTime = Date.now() + durationMinutes * 60000;
  } else {
    global.maintenanceEndTime = null;
  }
  
  res.status(200).json({
    success: true,
    message: global.isMaintenanceMode 
      ? `System is now in Maintenance Mode. ${durationMinutes ? `(Auto-disables in ${durationMinutes} mins)` : ''}` 
      : 'Maintenance Mode disabled. System is operating normally.',
    isMaintenanceMode: global.isMaintenanceMode,
    endTime: global.maintenanceEndTime,
  });
});

// @desc    Send a custom email to a user and log it
// @route   POST /api/system/emails/send
// @access  Admin only
export const sendCustomEmail = asyncHandler(async (req, res) => {
  const { recipient, subject, message, type } = req.body;
  const sentBy = req.user._id;

  if (!recipient || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please provide recipient, subject, and message.' });
  }

  const emailType = type === 'Promotional' ? 'Promotional' : 'Simple';

  // Send the email
  try {
    let htmlMessage = message;
    if (emailType === 'Promotional') {
      htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #f97316; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Special Offer for You!</h1>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
          <div style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://rasoijunction.vercel.app/" style="background-color: #f97316; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Visit Rasoi Junction</a>
          </div>
        </div>
      </div>
      `;
    }

    await sendEmail({
      email: recipient,
      subject,
      message,
      html: emailType === 'Promotional' ? htmlMessage : undefined,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }

  // Log to database
  const emailLog = await EmailLog.create({
    recipient,
    subject,
    message,
    type: emailType,
    sentBy,
  });

  res.status(200).json({
    success: true,
    message: 'Email sent and logged successfully',
    data: emailLog,
  });
});

// @desc    Get all email logs
// @route   GET /api/system/emails/logs
// @access  Admin only
export const getEmailLogs = asyncHandler(async (req, res) => {
  const logs = await EmailLog.find()
    .populate('sentBy', 'name email')
    .sort('-sentAt');

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// @desc    Generate promotional email text using AI
// @route   POST /api/system/emails/generate
// @access  Admin only
export const generatePromotionalEmail = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'Please provide a prompt topic.' });
  }

  try {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key is set
      return res.status(200).json({
        success: true,
        subject: `Exciting Offer: ${prompt}`,
        message: `Dear Valued Customer,\n\nWe are excited to announce a special promotion regarding: ${prompt}.\n\nVisit Rasoi Junction today to claim this limited-time offer!\n\nBest Regards,\nThe Rasoi Junction Team`
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a professional, short, and engaging promotional email body for a restaurant called Rasoi Junction. The topic is: "${prompt}". Do NOT include the subject line in the body. I want a plain text body that is ready to be sent. Just return the email body.`
    });

    const aiMessage = response.text;

    const responseSubject = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a catchy email subject line for a restaurant promotional email about: "${prompt}". Just return the subject line, no quotes, no extra text.`
    });
    let generatedSubject = responseSubject.text.replace(/^"|"$/g, '').trim();

    res.status(200).json({
      success: true,
      subject: generatedSubject,
      message: aiMessage,
    });
  } catch (error) {
    console.error('AI Generation error:', error);
    // Fallback on error
    res.status(200).json({
      success: true,
      subject: `Special Promotion: ${prompt}`,
      message: `Dear Valued Customer,\n\nWe are excited to announce a special promotion for: ${prompt}.\n\nDon't miss out on this fantastic opportunity! Come dine with us at Rasoi Junction and experience the magic of our culinary delights.\n\nWarm regards,\nThe Rasoi Junction Team`
    });
  }
});

// @desc    Enhance email text using AI
// @route   POST /api/system/emails/enhance
// @access  Admin only
export const enhanceEmail = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  
  if (!subject && !message) {
    return res.status(400).json({ success: false, message: 'Please provide subject or message body to enhance.' });
  }

  try {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'AI API Key is not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let enhancedSubject = subject;
    let enhancedMessage = message;

    if (message) {
      const responseMessage = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `I am writing an email from Rasoi Junction. Please rewrite the following email body to sound highly professional, polite, engaging, and grammatically perfect. Ensure the tone is appropriate for a reputable restaurant communicating with a customer. Return only the enhanced email body, ready to be sent.\n\nDraft Email Body:\n${message}`
      });
      enhancedMessage = responseMessage.text;
    }

    if (subject) {
      const responseSubject = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `I am writing an email from Rasoi Junction. Please rewrite the following email subject line to be catchy, professional, and clear. Return only the subject line text without any quotes or extra words.\n\nDraft Subject:\n${subject}`
      });
      enhancedSubject = responseSubject.text;
    }

    res.status(200).json({
      success: true,
      subject: enhancedSubject,
      message: enhancedMessage
    });
  } catch (error) {
    console.error('AI Email Enhance Error:', error);
    res.status(500).json({ success: false, message: 'Failed to enhance email with AI.' });
  }
});
