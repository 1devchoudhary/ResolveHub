// Static content for the demo dataset. Kept apart from the seeding logic so it reads like data.

export const DEMO_PASSWORD = 'Demo@1234';

export const STAFF = [
  { key: 'admin', name: 'Aditi Verma', email: 'demo.admin@resolvehub.dev', role: 'admin' },
  { key: 'priya', name: 'Priya Sharma', email: 'demo.agent@resolvehub.dev', role: 'agent' },
  { key: 'marcus', name: 'Marcus Chen', email: 'marcus.chen@resolvehub.dev', role: 'agent' },
  { key: 'aisha', name: 'Aisha Khan', email: 'aisha.khan@resolvehub.dev', role: 'agent' },
];

export const CUSTOMERS = [
  { key: 'rohan', name: 'Rohan Mehta', email: 'demo.customer@resolvehub.dev' },
  { key: 'ananya', name: 'Ananya Rao', email: 'ananya.rao@example.com' },
  { key: 'vikram', name: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { key: 'sara', name: 'Sara Thomas', email: 'sara.thomas@example.com' },
  { key: 'liam', name: 'Liam Fernandes', email: 'liam.fernandes@example.com' },
  { key: 'meera', name: 'Meera Iyer', email: 'meera.iyer@example.com' },
  { key: 'karan', name: 'Karan Malhotra', email: 'karan.malhotra@example.com' },
];

// category names match the reference data inserted by the categories migration
export const TICKETS = [
  {
    category: 'Billing & payments',
    priority: 'high',
    subject: 'Charged twice for the October invoice',
    description:
      'My card was charged twice for invoice INV-2291 on the 3rd. Both charges show as settled on my bank statement. Could you refund the duplicate?',
    reply:
      'Sorry about that! I can see both charges. I have started a refund for the duplicate; it usually reaches your account in 3–5 business days.',
    followUp: 'Thanks, could you send me the refund reference so I can track it with my bank?',
    note: 'Gateway retried after a timeout. Second capture is the duplicate, refund ref RF-88214.',
    resolution:
      'The refund reference is RF-88214. I am marking this resolved, but just reply here if it has not arrived by Friday.',
  },
  {
    category: 'Technical issue',
    priority: 'urgent',
    subject: 'Webhook deliveries failing with 401',
    description:
      'Since this morning every webhook to our endpoint fails with 401 Unauthorized. Nothing changed on our side. Our order sync is down.',
    reply:
      "Thanks for flagging this. It looks like your signing secret was rotated during last night's maintenance. Can you confirm which secret your endpoint validates against?",
    followUp: 'We validate against the secret ending in ...a91f.',
    note: 'Secret rotation job ran for workspace 4471 by mistake. Escalated to platform team.',
    resolution:
      'I rotated your signing secret back and replayed the failed events: all 214 were delivered. Sorry for the disruption.',
  },
  {
    category: 'Account & login',
    priority: 'medium',
    subject: 'Not receiving the two-factor code by SMS',
    description:
      'I enabled two-factor authentication last week but the SMS codes stopped arriving yesterday. I am locked out on my new phone.',
    reply:
      'Let us get you back in. Could you confirm the last four digits of the mobile number on the account?',
    followUp: 'It ends in 4310.',
    note: 'SMS provider shows carrier blocking for this number range. Suggest authenticator app.',
    resolution:
      'Your carrier was blocking our SMS sender. I have reset 2FA so you can sign in and switch to an authenticator app, which is more reliable.',
  },
  {
    category: 'Feature request',
    priority: 'low',
    subject: 'Export tickets to CSV',
    description:
      'It would help our monthly reporting if we could export all tickets with their status and resolution time to a CSV file.',
    reply:
      'Great suggestion, thank you. I have shared it with the product team and added your use case to the request.',
    followUp: 'Thanks! Any rough idea of timing?',
    note: 'Linked to roadmap item PRD-112 (reporting exports). 14 requests so far.',
    resolution:
      'CSV export is now on the roadmap for next quarter. I will close this for now and we will email you when it ships.',
  },
  {
    category: 'Technical issue',
    priority: 'high',
    subject: 'Dashboard is very slow to load',
    description:
      'The analytics dashboard takes more than 30 seconds to load since Monday. Other pages are fine. We are on the Business plan.',
    reply:
      'Thanks for the details. Does it happen for every date range, or only for the last 90 days?',
    followUp: 'Only for 90 days and longer. 30 days loads in a couple of seconds.',
    note: 'Long-range queries hitting the unindexed events partition. Fix scheduled with the data team.',
    resolution:
      'We added an index that the long date ranges were missing. The 90-day view now loads in under 2 seconds on our side. Can you confirm?',
  },
  {
    category: 'Billing & payments',
    priority: 'medium',
    subject: 'Need a GST invoice with our company details',
    description:
      'Our finance team needs the invoices to show our company name and GSTIN. Where can I add these so they appear on future invoices?',
    reply:
      "You can add both under Settings, then Billing, then Tax details. Would you like me to reissue last month's invoice once they are saved?",
    followUp: 'Yes please, I have added them now.',
    note: 'Reissued INV-2240 with GSTIN 27AABCU9603R1ZM.',
    resolution:
      'Done: the reissued invoice is attached to your billing page and all future invoices will include your GSTIN.',
  },
  {
    category: 'Account & login',
    priority: 'low',
    subject: 'How do I change the email on my account?',
    description:
      'I am moving from my personal email to my work email. How can I change the email address I use to log in?',
    reply:
      'For security we change login emails through support. Could you reply from the new address so we can verify it?',
    followUp: 'Replying from my work email now.',
    note: 'Verified ownership of both addresses. Updated.',
    resolution: 'Your login email is now your work address. Your password has not changed.',
  },
  {
    category: 'Technical issue',
    priority: 'medium',
    subject: 'CSV import fails on rows with accents',
    description:
      'Importing our customer list fails at row 42 with "invalid character". That row has the name José. Files without accents import fine.',
    reply:
      'Thanks, that is a really helpful clue. Was the file saved as UTF-8, or exported from Excel as a regular CSV?',
    followUp: 'It was exported straight from Excel.',
    note: 'Excel exports Windows-1252 by default. Importer should detect encoding; filed BUG-781.',
    resolution:
      'Excel saves CSVs in an older encoding by default. Choosing "CSV UTF-8" when saving fixes it, and we have also filed a fix so the importer detects this automatically.',
  },
  {
    category: 'Other',
    priority: 'low',
    subject: 'Do you offer a discount for non-profits?',
    description:
      'We are a registered education non-profit. Do you offer discounted pricing for organisations like ours?',
    reply:
      'We do: registered non-profits get 40% off any plan. Could you share your registration certificate?',
    followUp: 'Attached our 80G certificate.',
    note: 'Approved NGO discount. Coupon NGO40 applied to the account.',
    resolution: 'Your 40% non-profit discount is applied and will show on your next invoice.',
  },
  {
    category: 'Feature request',
    priority: 'medium',
    subject: 'Dark mode for the agent workspace',
    description:
      'Our agents work late shifts. A dark mode for the agent workspace would really help with eye strain.',
    reply:
      'Good news: dark mode is already available. Use the moon icon in the top bar and it follows your system setting by default.',
    followUp: 'Oh, I missed that, thank you!',
    note: 'Third request this month that missed the toggle. Suggest an onboarding tooltip.',
    resolution: 'Glad that helps! Closing this one.',
  },
  {
    category: 'Technical issue',
    priority: 'urgent',
    subject: 'API returning 500 errors for order creation',
    description:
      'POST /v2/orders started returning 500 about 20 minutes ago for roughly half of our requests. Request ids: 7f2c-11, 7f2c-19.',
    reply:
      'We are seeing this too and the team is investigating right now. I will update you here within 30 minutes.',
    followUp: 'Thanks, still seeing failures on our side.',
    note: 'Incident INC-204: bad deploy on orders service, rollback in progress.',
    resolution:
      'The faulty deploy has been rolled back and error rates are back to normal. Failed requests are safe to retry: none of them created orders.',
  },
  {
    category: 'Billing & payments',
    priority: 'low',
    subject: 'Switch from monthly to annual billing',
    description:
      'We would like to move to annual billing to get the discount. Will we be charged the full year straight away?',
    reply:
      'Yes, annual is billed upfront, and we credit the unused part of your current month. Shall I switch it now?',
    followUp: 'Please go ahead.',
    note: 'Switched to annual, prorated credit applied.',
    resolution:
      'You are now on annual billing with the prorated credit applied. You saved 18% compared to monthly.',
  },
];
