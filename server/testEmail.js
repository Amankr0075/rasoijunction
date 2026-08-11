import dotenv from 'dotenv';
dotenv.config();

import sendEmail from './src/utils/sendEmail.js';

const runTest = async () => {
  console.log('Testing Email System...');
  try {
    await sendEmail({
      email: process.env.EMAIL_FROM, // Send it to yourself
      subject: 'Test Email from Rasoi Junction',
      message: 'Hello! Your email configuration is working perfectly on the server.',
    });
    console.log('✅ Test email sent successfully! Please check your inbox (and spam folder).');
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
};

runTest();
