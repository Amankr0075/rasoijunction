import nodemailer from 'nodemailer';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import env from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateEmailTemplate } from './emailTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to safely find the logo path regardless of working directory
const getLogoAttachment = () => {
  const candidatePaths = [
    path.resolve(__dirname, '../../../client/public/logo.png'),
    path.resolve(__dirname, '../../../../client/public/logo.png'),
    path.resolve(process.cwd(), 'client/public/logo.png'),
    path.resolve(process.cwd(), '../client/public/logo.png'),
    path.resolve(process.cwd(), 'public/logo.png'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return [
        {
          filename: 'logo.png',
          path: candidate,
          cid: 'logo',
        },
      ];
    }
  }
  return [];
};

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email plain text message
 * @param {string} [options.html] - Optional HTML email body
 * @param {Array} [options.attachments] - Optional attachments array
 * @param {boolean} [options.wrapTemplate] - Explicitly force template wrapping
 */
const sendEmail = async (options) => {
  // Skip sending email if it's a demo account
  if (options.email && options.email.endsWith('@demo.com')) {
    console.log(`Skipping email to demo account: ${options.email}`);
    return;
  }

  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not configured. Skipping email dispatch.');
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] Simulated email to: ${options.email} | Subject: "${options.subject}"`);
    }
    return;
  }

  try {
    // 1. Create a transporter with optimized configuration
    const isGmail = env.EMAIL_SERVICE === 'gmail' || (env.EMAIL_HOST && env.EMAIL_HOST.includes('gmail'));
    
    const transportConfig = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
          },
        }
      : {
          host: env.EMAIL_HOST,
          port: Number(env.EMAIL_PORT) || 587,
          secure: Number(env.EMAIL_PORT) === 465,
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    // 2. Attachments with safe resolution
    const defaultAttachments = getLogoAttachment();
    const finalAttachments = options.attachments
      ? [...defaultAttachments, ...options.attachments]
      : defaultAttachments;

    // 3. HTML formatting (avoid double wrapping pre-styled templates)
    let finalHtml = options.html;
    if (!finalHtml && options.message) {
      const paragraphHtml = options.message
        .split('\n')
        .filter(Boolean)
        .map(line => `<p>${line}</p>`)
        .join('');
      finalHtml = generateEmailTemplate(paragraphHtml);
    } else if (finalHtml && options.wrapTemplate) {
      finalHtml = generateEmailTemplate(finalHtml);
    }

    // 4. Define the email options
    const mailOptions = {
      from: `Rasoi Junction <${env.EMAIL_FROM || env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      ...(finalHtml && { html: finalHtml }),
      ...(finalAttachments.length > 0 && { attachments: finalAttachments }),
    };

    // 5. Actually send the email
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    if (error.code === 'EAUTH' || (error.response && error.response.includes('535'))) {
      console.error('❌ Email Authentication Failed (EAUTH / 535 BadCredentials):');
      console.error('   1. Check that EMAIL_USER and EMAIL_PASS are correct in server/.env.');
      console.error('   2. For Gmail, Google requires a 16-character App Password (https://myaccount.google.com/apppasswords).');
      console.error('   3. Ensure 2-Step Verification is active on the Google account.');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error(`❌ Email Connection Failed (${error.code}): Could not connect to ${env.EMAIL_HOST}:${env.EMAIL_PORT}.`);
    } else {
      console.error('❌ Error sending email:', error.message || error);
    }
    throw new AppError(error.message || 'There was an error sending the email. Try again later!', 500);
  }
};

export default sendEmail;
