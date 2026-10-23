/*
 * MOCK DATA — design-time only.
 * Shaped like the future API responses so swapping is mechanical:
 *   currentUser      -> GET /api/auth/me
 *   tickets          -> GET /api/tickets            (list, paginated)
 *   getTicketByNumber-> GET /api/tickets/:ticketNumber (detail with messages + activity)
 * Status / priority values match backend/models/Ticket.js enums.
 * Replace these imports with real API data when you wire things up.
 */

// Dates relative to "now" so the UI always reads naturally ("25m ago")
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours) => minutesAgo(hours * 60);
const daysAgo = (days) => hoursAgo(days * 24);

export const currentUser = {
  _id: 'u_1001',
  name: 'Jane Cooper',
  email: 'jane.cooper@acme.io',
  mobile: '+919876543210',
  role: 'user',
  createdAt: daysAgo(220),
};

const agents = {
  priya: { _id: 'a_01', name: 'Priya Sharma', role: 'agent' },
  marcus: { _id: 'a_02', name: 'Marcus Lee', role: 'agent' },
  aisha: { _id: 'a_03', name: 'Aisha Khan', role: 'agent' },
};

const me = { _id: currentUser._id, name: currentUser.name, role: 'user' };

export const categories = [
  'Billing & payments',
  'Account & login',
  'Technical issue',
  'Feature request',
  'Other',
];

export const tickets = [
  {
    _id: 't_1048',
    ticketNumber: 'RH-1048',
    subject: 'Payment failed but the amount was debited from my card',
    description:
      'I tried to upgrade to the Pro plan this morning. Checkout showed "Payment failed", but my bank shows a debit of $49.00. I have attached a screenshot of the error and the bank statement line.',
    category: 'Billing & payments',
    priority: 'urgent',
    status: 'in-progress',
    assignedTo: agents.priya,
    attachments: [
      { name: 'checkout-error.png', size: '248 KB' },
      { name: 'bank-statement.jpg', size: '1.2 MB' },
    ],
    createdAt: hoursAgo(3),
    updatedAt: minutesAgo(25),
    messages: [
      {
        _id: 'm1',
        author: agents.priya,
        body: 'Hi Jane, thanks for the screenshots — that helps a lot. I can see the charge was captured by our payment provider but the subscription webhook timed out. I’m escalating this to our billing team now.',
        createdAt: hoursAgo(2),
        attachments: [],
      },
      {
        _id: 'm2',
        author: me,
        body: 'Thanks Priya! Should I try paying again, or wait?',
        createdAt: hoursAgo(1.5),
        attachments: [],
      },
      {
        _id: 'm3',
        author: agents.priya,
        body: 'Please don’t retry — I’ve manually activated Pro on your account and the duplicate hold will be released automatically. I’ll confirm here once billing closes it out.',
        createdAt: minutesAgo(25),
        attachments: [],
      },
    ],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: hoursAgo(3) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.priya.name, createdAt: hoursAgo(2.9) },
      { _id: 'e3', type: 'status_changed', actor: agents.priya, from: 'open', to: 'in-progress', createdAt: hoursAgo(2) },
      { _id: 'e4', type: 'priority_changed', actor: agents.priya, from: 'high', to: 'urgent', createdAt: hoursAgo(2) },
    ],
  },
  {
    _id: 't_1047',
    ticketNumber: 'RH-1047',
    subject: 'Password reset link says it has expired',
    description:
      'Every time I click the reset link from the email it says "This link has expired", even if I click it immediately.',
    category: 'Account & login',
    priority: 'high',
    status: 'pending',
    assignedTo: agents.marcus,
    attachments: [],
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(5),
    messages: [
      {
        _id: 'm1',
        author: agents.marcus,
        body: 'Hi Jane — sorry about that. Could you tell me which browser you’re using and whether the email opens inside an app (like Outlook or Gmail’s in-app browser)? Some of them pre-fetch links, which uses up the token.',
        createdAt: hoursAgo(5),
        attachments: [],
      },
    ],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: daysAgo(1) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.marcus.name, createdAt: daysAgo(1) },
      { _id: 'e3', type: 'status_changed', actor: agents.marcus, from: 'open', to: 'pending', createdAt: hoursAgo(5) },
    ],
  },
  {
    _id: 't_1046',
    ticketNumber: 'RH-1046',
    subject: 'CSV export is missing the “Region” and “Owner” columns',
    description: 'Since last week, exports from the Reports page no longer include Region and Owner.',
    category: 'Technical issue',
    priority: 'medium',
    status: 'open',
    assignedTo: null,
    attachments: [{ name: 'export-sample.png', size: '96 KB' }],
    createdAt: minutesAgo(40),
    updatedAt: minutesAgo(40),
    messages: [],
    activity: [{ _id: 'e1', type: 'created', actor: me, createdAt: minutesAgo(40) }],
  },
  {
    _id: 't_1045',
    ticketNumber: 'RH-1045',
    subject: 'Request: dark mode for the mobile app',
    description: 'Would love a dark theme on iOS — the web app already has one.',
    category: 'Feature request',
    priority: 'low',
    status: 'open',
    assignedTo: agents.aisha,
    attachments: [],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    messages: [],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: daysAgo(2) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.aisha.name, createdAt: daysAgo(2) },
    ],
  },
  {
    _id: 't_1044',
    ticketNumber: 'RH-1044',
    subject: 'Two-factor codes arrive several minutes late',
    description: 'SMS codes for 2FA take 3–5 minutes to arrive, by which time they have expired.',
    category: 'Account & login',
    priority: 'high',
    status: 'in-progress',
    assignedTo: agents.marcus,
    attachments: [],
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(20),
    messages: [
      {
        _id: 'm1',
        author: agents.marcus,
        body: 'We’ve identified a delay with one of our SMS carriers in your region and switched you to a backup route. Could you try logging in again?',
        createdAt: hoursAgo(20),
        attachments: [],
      },
    ],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: daysAgo(3) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.marcus.name, createdAt: daysAgo(3) },
      { _id: 'e3', type: 'status_changed', actor: agents.marcus, from: 'open', to: 'in-progress', createdAt: daysAgo(2) },
    ],
  },
  {
    _id: 't_1043',
    ticketNumber: 'RH-1043',
    subject: 'Invoice shows the wrong company address',
    description: 'Our October invoice has our old office address. We moved in August.',
    category: 'Billing & payments',
    priority: 'medium',
    status: 'resolved',
    assignedTo: agents.aisha,
    attachments: [],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
    messages: [
      {
        _id: 'm1',
        author: agents.aisha,
        body: 'All fixed! I’ve updated your billing address and re-issued the October invoice — you’ll find it under Settings → Billing.',
        createdAt: daysAgo(4),
        attachments: [{ name: 'invoice-oct-2026.pdf', size: '84 KB' }],
      },
    ],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: daysAgo(6) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.aisha.name, createdAt: daysAgo(6) },
      { _id: 'e3', type: 'status_changed', actor: agents.aisha, from: 'open', to: 'in-progress', createdAt: daysAgo(5) },
      { _id: 'e4', type: 'status_changed', actor: agents.aisha, from: 'in-progress', to: 'resolved', createdAt: daysAgo(4) },
    ],
  },
  {
    _id: 't_1042',
    ticketNumber: 'RH-1042',
    subject: 'Webhook deliveries failing with 401 Unauthorized',
    description: 'All webhook deliveries to our endpoint started failing with 401 since yesterday 14:00 UTC.',
    category: 'Technical issue',
    priority: 'high',
    status: 'resolved',
    assignedTo: agents.priya,
    attachments: [{ name: 'webhook-logs.txt', size: '12 KB' }],
    createdAt: daysAgo(9),
    updatedAt: daysAgo(8),
    messages: [
      {
        _id: 'm1',
        author: agents.priya,
        body: 'Your signing secret was rotated during a security update. I’ve generated a new one (see Settings → Webhooks) and replayed the failed events — all 214 delivered successfully.',
        createdAt: daysAgo(8),
        attachments: [],
      },
      {
        _id: 'm2',
        author: me,
        body: 'Confirmed on our side, everything is flowing again. Thank you!',
        createdAt: daysAgo(8),
        attachments: [],
      },
    ],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: daysAgo(9) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.priya.name, createdAt: daysAgo(9) },
      { _id: 'e3', type: 'status_changed', actor: agents.priya, from: 'open', to: 'in-progress', createdAt: daysAgo(9) },
      { _id: 'e4', type: 'status_changed', actor: agents.priya, from: 'in-progress', to: 'resolved', createdAt: daysAgo(8) },
    ],
  },
  {
    _id: 't_1041',
    ticketNumber: 'RH-1041',
    subject: 'Cancel the “Extra seats” add-on',
    description: 'We no longer need the 5 extra seats add-on. Please cancel it from next billing cycle.',
    category: 'Billing & payments',
    priority: 'low',
    status: 'closed',
    assignedTo: agents.aisha,
    attachments: [],
    createdAt: daysAgo(21),
    updatedAt: daysAgo(18),
    messages: [
      {
        _id: 'm1',
        author: agents.aisha,
        body: 'Done — the add-on is cancelled and won’t renew on Nov 1. Closing this ticket, but feel free to open a new one any time.',
        createdAt: daysAgo(19),
        attachments: [],
      },
    ],
    activity: [
      { _id: 'e1', type: 'created', actor: me, createdAt: daysAgo(21) },
      { _id: 'e2', type: 'assigned', actor: { name: 'Auto-assign' }, to: agents.aisha.name, createdAt: daysAgo(21) },
      { _id: 'e3', type: 'status_changed', actor: agents.aisha, from: 'open', to: 'resolved', createdAt: daysAgo(19) },
      { _id: 'e4', type: 'status_changed', actor: me, from: 'resolved', to: 'closed', createdAt: daysAgo(18) },
    ],
  },
];

export const getTicketByNumber = (ticketNumber) =>
  tickets.find((ticket) => ticket.ticketNumber === ticketNumber);
