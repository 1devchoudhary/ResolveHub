import env from '../config/env.js';

// Small, dependency-free transactional templates. Each returns { subject, html, text }:
// the plain-text part matters for deliverability and for clients that block HTML.

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const layout = ({ heading, paragraphs, cta }) => `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f6fa;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2333">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
      <tr><td>
        <p style="margin:0 0 24px;font-weight:700;font-size:18px;color:#4f46e5">ResolveHub</p>
        <h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(heading)}</h1>
        ${paragraphs.map((p) => `<p style="margin:0 0 12px;line-height:1.6">${escapeHtml(p)}</p>`).join('')}
        ${
          cta
            ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="background:#4f46e5;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(cta.label)}</a></p>`
            : ''
        }
        <p style="margin:24px 0 0;font-size:12px;color:#7a7f99">You can turn off ticket notifications in your account settings.</p>
      </td></tr>
    </table>
  </body>
</html>`;

const build = ({ subject, heading, paragraphs, cta }) => ({
  subject,
  html: layout({ heading, paragraphs, cta }),
  text: [heading, '', ...paragraphs, ...(cta ? ['', `${cta.label}: ${cta.url}`] : [])].join('\n'),
});

const ticketUrl = (portal, ticketNumber) => {
  const base = { customer: '/app/tickets', agent: '/agent/tickets', admin: '/admin/tickets' }[
    portal
  ];
  return `${env.APP_URL}${base}/${ticketNumber}`;
};

export const passwordResetEmail = ({ name, token }) =>
  build({
    subject: 'Reset your ResolveHub password',
    heading: `Hi ${name}, reset your password`,
    paragraphs: [
      'We received a request to reset your password. The link below is valid for 30 minutes and can be used once.',
      "If you didn't ask for this, you can ignore this email: your password won't change.",
    ],
    cta: { label: 'Choose a new password', url: `${env.APP_URL}/reset-password?token=${token}` },
  });

export const ticketCreatedEmail = ({ name, ticket }) =>
  build({
    subject: `[${ticket.number}] We received your request`,
    heading: `Thanks ${name}, we're on it`,
    paragraphs: [
      `Your ticket "${ticket.subject}" has been created with the reference ${ticket.number}.`,
      "We'll email you as soon as an agent replies.",
    ],
    cta: { label: 'View ticket', url: ticketUrl('customer', ticket.number) },
  });

export const agentReplyEmail = ({ name, ticket, agentName, body }) =>
  build({
    subject: `[${ticket.number}] New reply from ${agentName}`,
    heading: `Hi ${name}, you have a new reply`,
    paragraphs: [`${agentName} replied to "${ticket.subject}":`, body.slice(0, 1_000)],
    cta: { label: 'Reply', url: ticketUrl('customer', ticket.number) },
  });

export const customerReplyEmail = ({ name, ticket, customerName, body }) =>
  build({
    subject: `[${ticket.number}] ${customerName} replied`,
    heading: `Hi ${name}, the customer replied`,
    paragraphs: [`${customerName} replied to "${ticket.subject}":`, body.slice(0, 1_000)],
    cta: { label: 'Open ticket', url: ticketUrl('agent', ticket.number) },
  });

export const ticketResolvedEmail = ({ name, ticket }) =>
  build({
    subject: `[${ticket.number}] Your ticket has been resolved`,
    heading: `Hi ${name}, your ticket is resolved`,
    paragraphs: [
      `We've marked "${ticket.subject}" as resolved.`,
      'If the problem is still there, open the ticket and reopen it within 7 days.',
    ],
    cta: { label: 'View ticket', url: ticketUrl('customer', ticket.number) },
  });

export const ticketAssignedEmail = ({ name, ticket }) =>
  build({
    subject: `[${ticket.number}] Assigned to you: ${ticket.subject}`,
    heading: `Hi ${name}, a ticket was assigned to you`,
    paragraphs: [`"${ticket.subject}" (${ticket.priority} priority) is now in your queue.`],
    cta: { label: 'Open ticket', url: ticketUrl('agent', ticket.number) },
  });
