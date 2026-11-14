import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure .env is loaded from the server directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

import sendEmail from './src/utils/sendEmail.js';
import env from './src/config/env.js';

const runTest = async () => {
  console.log('--------------------------------------------------');
  console.log('📧 Testing Rasoi Junction Email Configuration');
  console.log(`   Host:     ${env.EMAIL_HOST}`);
  console.log(`   Port:     ${env.EMAIL_PORT}`);
  console.log(`   User:     ${env.EMAIL_USER || '(not set)'}`);
  console.log(`   From:     ${env.EMAIL_FROM || '(not set)'}`);
  console.log(`   Password: ${env.EMAIL_PASS ? '******** (' + env.EMAIL_PASS.length + ' chars)' : '(not set)'}`);
  console.log('--------------------------------------------------');

  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.error('❌ Missing EMAIL_USER or EMAIL_PASS in server/.env file.');
    process.exit(1);
  }

  try {
    const targetEmail = process.argv[2] || env.EMAIL_FROM || env.EMAIL_USER;
    console.log(`Sending test email to: ${targetEmail}...`);

    await sendEmail({
      email: targetEmail,
      subject: 'Test Email from Rasoi Junction',
      message: 'Hello! Your email configuration is working perfectly on the Rasoi Junction server.',
    });
    console.log('✅ Test email sent successfully! Please check your inbox (and spam folder).');
  } catch (error) {
    console.error('❌ Failed to send test email.');
  }
};

runTest();
