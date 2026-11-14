import { ImapFlow } from 'imapflow';
import env from './src/config/env.js';

const client = new ImapFlow({
  host: env.EMAIL_IMAP_HOST,
  port: 993,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  logger: false,
});

async function test() {
  await client.connect();
  console.log('✅ IMAP Connected successfully to', env.EMAIL_IMAP_HOST);
  await client.logout();
}

test().catch(e => {
  console.error('IMAP error:', e.message);
  process.exit(1);
});
