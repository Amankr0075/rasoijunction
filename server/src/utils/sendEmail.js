import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateEmailTemplate } from './emailTemplate.js';

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email plain text message
 * @param {string} [options.html] - Optional HTML email body
 */
const sendEmail = async (options) => {
  // Skip sending email if it's a demo account
  if (options.email && options.email.endsWith('@demo.com')) {
    console.log(`Skipping email to demo account: ${options.email}`);
    return;
  }

  try {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465, // true for 465, false for other ports (like 587)
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    // Add the logo attachment for CID inline embedding
    const defaultAttachments = [
      {
        filename: 'logo.png',
        path: '../client/public/logo.png', // path relative to the process execution (server root)
        cid: 'logo' // same cid value as in the html img src
      }
    ];

    // Combine default with provided attachments
    const finalAttachments = options.attachments
      ? [...defaultAttachments, ...options.attachments]
      : defaultAttachments;

    // Prepare HTML content using the template
    let contentHtml = options.html;

    // If html is not provided, convert text to simple html paragraphs
    if (!contentHtml && options.message) {
      contentHtml = options.message.split('\n').map(line => `<p>${line}</p>`).join('');
    }

    const finalHtml = generateEmailTemplate(contentHtml);

    // 2. Define the email options
    const mailOptions = {
      from: `Rasoi Junction <${env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: finalHtml,
      attachments: finalAttachments,
    };

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError('There was an error sending the email. Try again later!', 500);
  }
};

export default sendEmail;
