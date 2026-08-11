import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import env from '../config/env.js';
import sendEmail from './sendEmail.js';

let client;

export const startAutoResponder = async () => {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.log('Skipping Auto-Responder: No EMAIL_USER or EMAIL_PASS configured.');
    return;
  }

  client = new ImapFlow({
    host: env.EMAIL_HOST || 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS
    },
    logger: false // Set to false to avoid console spam
  });

  try {
    await client.connect();
    console.log('Auto-Responder: IMAP Connected and listening for emails.');

    // Wait for the Inbox mailbox to be ready
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Listen for new messages
      client.on('exists', async (data) => {
        // When new mail exists, we fetch UNSEEN messages
        try {
          for await (let message of client.fetch({ seen: false }, { source: true, envelope: true })) {
            const parsedMail = await simpleParser(message.source);
            
            const fromHeader = parsedMail.from.value[0];
            const senderEmail = fromHeader.address;
            const senderName = fromHeader.name || senderEmail.split('@')[0];

            // Prevent infinite auto-reply loops by ignoring automated emails or our own email
            if (
              senderEmail === env.EMAIL_USER ||
              parsedMail.headers.get('auto-submitted') ||
              parsedMail.subject?.toLowerCase().includes('auto-reply')
            ) {
              await client.messageFlagsAdd(message.seq, ['\\Seen']);
              continue;
            }

            console.log(`Auto-Responder: New email from ${senderName} (${senderEmail}). Sending reply...`);

            // Build the HTML reply
            const htmlMessage = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #f97316; padding: 30px; text-align: center;">
                <img src="cid:logo" alt="Rasoi Junction" style="max-height: 80px; width: auto; object-fit: contain; margin-bottom: 10px;" />
                <p style="color: #ffedd5; margin: 5px 0 0 0; font-size: 14px;">Where Tradition Meets Technology</p>
              </div>
              <div style="padding: 40px 30px; background-color: #ffffff; color: #374151;">
                <h2 style="color: #ea580c; margin-top: 0; font-size: 22px;">Thank you for contacting us!</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">Hello <strong>${senderName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
                  We have received your email. Our team is currently reviewing your message and we will get back to you with a positive reply for your concern as soon as possible.
                </p>
                
                <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #db2777;">
                  <p style="font-size: 14px; line-height: 1.6; color: #9d174d; margin: 0;">If this is urgent, please feel free to call our support line listed on our website.</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
                <p style="font-size: 15px; color: #6b7280; margin: 0;">Warm Regards,</p>
                <p style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 5px 0 0 0;">The Rasoi Junction Team</p>
              </div>
            </div>
            `;

            // Send the reply
            await sendEmail({
              email: senderEmail,
              subject: 'Re: ' + (parsedMail.subject || 'Your Inquiry'),
              message: `Hello ${senderName}, thank you for contacting us. We will get back to you shortly.`,
              html: htmlMessage,
            });

            // Mark the message as SEEN so we don't reply again
            await client.messageFlagsAdd(message.seq, ['\\Seen']);
            console.log(`Auto-Responder: Reply sent to ${senderEmail}`);
          }
        } catch (err) {
          console.error('Auto-Responder Fetch Error:', err);
        }
      });
      
    } finally {
      // We keep the lock active to keep listening to IDLE events
      // lock.release();
    }

  } catch (err) {
    console.error('Auto-Responder Connection Error:', err);
  }
};
