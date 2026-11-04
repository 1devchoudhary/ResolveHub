import { waitUntil } from '@vercel/functions';
import env from '../config/env.js';
import logger from './logger.js';

const RESEND_URL = 'https://api.resend.com/emails';

// In tests, emails are captured here instead of being sent, so tests can assert on them
export const testOutbox = [];

const deliver = async ({ to, subject, html, text }) => {
  if (env.isTest) {
    testOutbox.push({ to, subject, html, text });
    return;
  }

  if (!env.RESEND_API_KEY) {
    // Local development without an email provider: show the email in the terminal.
    // In production only the envelope is logged, never the body (it can contain reset links).
    logger.info(
      { to, subject, ...(env.isProduction ? {} : { text }) },
      'Email not sent (RESEND_API_KEY is not set)',
    );
    return;
  }

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html, text }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 300)}`);
  }
};

/**
 * Sends an email without making the request wait for it.
 * On Vercel, waitUntil keeps the function alive until the send finishes, even though the
 * response has already gone out. A failed email is logged, never surfaced to the user.
 */
export const sendEmail = (email) => {
  const pending = deliver(email).catch((err) => {
    logger.error({ err, to: email.to, subject: email.subject }, 'Failed to send email');
  });
  waitUntil(pending);
  return pending;
};
