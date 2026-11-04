// OpenAPI 3.1 description of the API, served at /api/docs/openapi.json and rendered at /api/docs.
// Kept as a JS object (not YAML) so it needs no parser and can reuse constants.
import { PRIORITIES, STATUSES } from '../modules/tickets/ticket.stateMachine.js';

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const success = (data, description = 'OK') => ({
  description,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { const: true },
          message: { type: 'string' },
          data,
        },
      },
    },
  },
});

const error = (description) => ({
  description,
  content: { 'application/json': { schema: ref('Error') } },
});

const json = (schema) => ({ required: true, content: { 'application/json': { schema } } });

const errors = {
  400: error('Validation failed: `errors` maps each invalid field to a message'),
  401: error('Missing, invalid or expired access token'),
  403: error('Signed in, but not allowed to do this'),
  404: error('Not found (also used for tickets you are not allowed to see)'),
  409: error('Conflict, e.g. a duplicate email or an illegal status change'),
  429: error('Rate limited: see the Retry-After header'),
};

const pick = (...codes) => Object.fromEntries(codes.map((code) => [code, errors[code]]));

const ticketNumber = {
  name: 'number',
  in: 'path',
  required: true,
  description: 'Ticket number, with or without the prefix: `RH-1042` or `1042`',
  schema: { type: 'string', example: 'RH-1042' },
};

const page = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  {
    name: 'limit',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
];

const paginated = (item) => ({
  type: 'object',
  properties: {
    items: { type: 'array', items: ref(item) },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    total: { type: 'integer' },
  },
});

const session = {
  type: 'object',
  properties: { user: ref('User'), accessToken: { type: 'string' } },
};

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'ResolveHub API',
    version: '1.0.0',
    description: [
      'REST API behind ResolveHub, a customer support and ticketing system.',
      '',
      '**Auth:** sign in to get a short-lived access token (send it as `Authorization: Bearer …`).',
      'A rotating refresh token is set as an httpOnly cookie scoped to `/api/auth`; call',
      '`POST /auth/refresh` to get a new access token.',
      '',
      '**Responses:** always `{ success, message, data }`, or `{ success: false, message, errors? }`.',
      '',
      '**Demo accounts** (password `Demo@1234`): `demo.customer@resolvehub.dev`,',
      '`demo.agent@resolvehub.dev`, `demo.admin@resolvehub.dev`.',
    ].join('\n'),
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth', description: 'Sessions, signup and password reset' },
    { name: 'Tickets', description: 'Customers see their own tickets; staff see all' },
    { name: 'Reference', description: 'Categories and agents' },
    { name: 'Admin', description: 'Analytics and team management (admins only)' },
    { name: 'System' },
  ],
  components: {
    securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { const: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: { email: 'Please enter a valid email' },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          mobile: { type: 'string', example: '+919876543210' },
          role: { enum: ['customer', 'agent', 'admin'] },
          isActive: { type: 'boolean' },
          isDemo: { type: 'boolean' },
          emailNotifications: { type: 'boolean' },
          lastLoginAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Person: {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1042 },
          number: { type: 'string', example: 'RH-1042' },
          subject: { type: 'string' },
          description: { type: 'string' },
          status: { enum: STATUSES },
          priority: { enum: PRIORITIES },
          category: ref('Person'),
          customer: ref('Person'),
          assignee: { oneOf: [ref('Person'), { type: 'null' }] },
          replyCount: { type: 'integer', description: 'List responses only' },
          firstResponseAt: { type: ['string', 'null'], format: 'date-time' },
          resolvedAt: { type: ['string', 'null'], format: 'date-time' },
          closedAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TicketDetail: {
        allOf: [
          ref('Ticket'),
          {
            type: 'object',
            properties: {
              messages: { type: 'array', items: ref('Message') },
              events: { type: 'array', items: ref('Event') },
              allowedStatuses: {
                type: 'array',
                items: { enum: STATUSES },
                description: 'Statuses the current viewer may move this ticket to',
              },
            },
          },
        ],
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          body: { type: 'string' },
          isInternal: { type: 'boolean', description: 'Staff-only note; never sent to customers' },
          author: ref('Person'),
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Event: {
        type: 'object',
        description: 'Audit trail entry. `actor` is null when the system did it.',
        properties: {
          id: { type: 'integer' },
          type: {
            enum: ['created', 'assigned', 'unassigned', 'status_changed', 'priority_changed'],
          },
          from: { type: ['string', 'null'] },
          to: { type: ['string', 'null'] },
          actor: { oneOf: [ref('Person'), { type: 'null' }] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Liveness and database check',
        responses: { 200: { description: 'API and database are up' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create a customer account and sign in',
        requestBody: json({
          type: 'object',
          required: ['name', 'email', 'mobile', 'password', 'agreeToTerms'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            mobile: { type: 'string', description: 'Any Indian format; stored as +91XXXXXXXXXX' },
            password: { type: 'string', description: '8+ chars, upper and lower case, ≤ 72 bytes' },
            agreeToTerms: { const: true },
          },
        }),
        responses: { 201: success(session, 'Account created'), ...pick(400, 409, 429) },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in to a portal',
        description:
          'Each portal only accepts its own role. A mismatch looks like a wrong password.',
        requestBody: json({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'demo.agent@resolvehub.dev' },
            password: { type: 'string', example: 'Demo@1234' },
            portal: { enum: ['customer', 'agent', 'admin'], default: 'customer' },
          },
        }),
        responses: { 200: success(session, 'Signed in'), ...pick(400, 401, 403, 429) },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate the refresh cookie and get a new access token',
        description:
          'Reusing an already-rotated refresh token revokes the whole session family (token theft detection).',
        responses: { 200: success(session), ...pick(401, 429) },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke the refresh token',
        responses: { 200: success({}) },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'The signed-in user',
        security: [{ bearer: [] }],
        responses: {
          200: success({ type: 'object', properties: { user: ref('User') } }),
          ...pick(401),
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password (signs out other devices)',
        security: [{ bearer: [] }],
        requestBody: json({
          type: 'object',
          properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } },
        }),
        responses: { 200: success({}), ...pick(400, 401, 403) },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Email a reset link',
        description: 'Always returns the same response, whether or not the email exists.',
        requestBody: json({ type: 'object', properties: { email: { type: 'string' } } }),
        responses: { 200: success({}), ...pick(400, 429) },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Set a new password with a single-use token',
        requestBody: json({
          type: 'object',
          properties: { token: { type: 'string' }, password: { type: 'string' } },
        }),
        responses: { 200: success({}), ...pick(400, 429) },
      },
    },
    '/users/me': {
      patch: {
        tags: ['Auth'],
        summary: 'Update profile and notification preference',
        security: [{ bearer: [] }],
        requestBody: json({
          type: 'object',
          properties: {
            name: { type: 'string' },
            mobile: { type: 'string' },
            emailNotifications: { type: 'boolean' },
          },
        }),
        responses: {
          200: success({ type: 'object', properties: { user: ref('User') } }),
          ...pick(400, 401, 403, 409),
        },
      },
    },
    '/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'List, filter and search tickets',
        security: [{ bearer: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { enum: [...STATUSES, 'active', 'done'] },
            description: '`active` = open/in-progress/pending, `done` = resolved/closed',
          },
          { name: 'priority', in: 'query', schema: { enum: PRIORITIES } },
          {
            name: 'assignee',
            in: 'query',
            schema: { type: 'string', example: 'me' },
            description: 'Staff only: `me`, `unassigned` or an agent id',
          },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string' },
            description: 'Full-text search (Postgres tsvector), or a ticket number like RH-1042',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { enum: ['updated', 'newest', 'oldest', 'priority'], default: 'updated' },
          },
          ...page,
        ],
        responses: { 200: success(paginated('Ticket')), ...pick(400, 401) },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Open a ticket (customers); auto-assigns the least-loaded agent',
        security: [{ bearer: [] }],
        requestBody: json({
          type: 'object',
          required: ['subject', 'description', 'categoryId'],
          properties: {
            subject: { type: 'string', minLength: 3, maxLength: 150 },
            description: { type: 'string', minLength: 10, maxLength: 5000 },
            categoryId: { type: 'integer' },
            priority: { enum: PRIORITIES, default: 'medium' },
          },
        }),
        responses: {
          201: success({ type: 'object', properties: { ticket: ref('TicketDetail') } }),
          ...pick(400, 401, 403, 429),
        },
      },
    },
    '/tickets/stats': {
      get: {
        tags: ['Tickets'],
        summary: 'Dashboard counts for the current viewer',
        security: [{ bearer: [] }],
        responses: { 200: success({ type: 'object' }), ...pick(401) },
      },
    },
    '/tickets/activity': {
      get: {
        tags: ['Tickets'],
        summary: 'Latest audit events across visible tickets',
        security: [{ bearer: [] }],
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', maximum: 50 } }],
        responses: { 200: success({ type: 'object' }), ...pick(401) },
      },
    },
    '/tickets/{number}': {
      get: {
        tags: ['Tickets'],
        summary: 'Ticket with conversation and audit trail',
        description: 'Internal notes are only included for staff.',
        security: [{ bearer: [] }],
        parameters: [ticketNumber],
        responses: {
          200: success({ type: 'object', properties: { ticket: ref('TicketDetail') } }),
          ...pick(401, 404),
        },
      },
      patch: {
        tags: ['Tickets'],
        summary: 'Change status, priority or assignee',
        description:
          'Customers may only close, or reopen a ticket resolved in the last 7 days. Every change is audited.',
        security: [{ bearer: [] }],
        parameters: [ticketNumber],
        requestBody: json({
          type: 'object',
          properties: {
            status: { enum: STATUSES },
            priority: { enum: PRIORITIES },
            assigneeId: { type: ['integer', 'null'] },
          },
        }),
        responses: {
          200: success({ type: 'object', properties: { ticket: ref('TicketDetail') } }),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/tickets/{number}/messages': {
      post: {
        tags: ['Tickets'],
        summary: 'Reply, or add an internal note (staff)',
        security: [{ bearer: [] }],
        parameters: [ticketNumber],
        requestBody: json({
          type: 'object',
          required: ['body'],
          properties: {
            body: { type: 'string', maxLength: 5000 },
            isInternal: { type: 'boolean', default: false },
            status: { enum: STATUSES, description: 'Staff only: change status in the same action' },
          },
        }),
        responses: {
          201: success({ type: 'object', properties: { ticket: ref('TicketDetail') } }),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Reference'],
        summary: 'Ticket categories (admins also see retired ones)',
        security: [{ bearer: [] }],
        responses: { 200: success({ type: 'object' }), ...pick(401) },
      },
      post: {
        tags: ['Reference'],
        summary: 'Add a category (admin)',
        security: [{ bearer: [] }],
        requestBody: json({ type: 'object', properties: { name: { type: 'string' } } }),
        responses: { 201: success({ type: 'object' }), ...pick(400, 401, 403, 409) },
      },
    },
    '/categories/{id}': {
      patch: {
        tags: ['Reference'],
        summary: 'Rename or retire a category (admin)',
        security: [{ bearer: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: json({
          type: 'object',
          properties: { name: { type: 'string' }, isActive: { type: 'boolean' } },
        }),
        responses: { 200: success({ type: 'object' }), ...pick(400, 401, 403, 404, 409) },
      },
    },
    '/agents': {
      get: {
        tags: ['Reference'],
        summary: 'Active agents with their open workload (staff)',
        security: [{ bearer: [] }],
        responses: { 200: success({ type: 'object' }), ...pick(401, 403) },
      },
    },
    '/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Volume, response times, categories and agent performance',
        security: [{ bearer: [] }],
        parameters: [{ name: 'days', in: 'query', schema: { enum: [7, 30, 90], default: 30 } }],
        responses: { 200: success({ type: 'object' }), ...pick(400, 401, 403) },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List users',
        security: [{ bearer: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { enum: ['customer', 'agent', 'admin'] } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          ...page,
        ],
        responses: { 200: success(paginated('User')), ...pick(401, 403) },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create an agent or admin',
        security: [{ bearer: [] }],
        requestBody: json({
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            mobile: { type: 'string' },
            password: { type: 'string' },
            role: { enum: ['agent', 'admin'] },
          },
        }),
        responses: { 201: success({ type: 'object' }), ...pick(400, 401, 403, 409) },
      },
    },
    '/admin/users/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Change role or (de)activate',
        description:
          "Deactivating revokes the user's sessions and returns an agent's active tickets to the queue.",
        security: [{ bearer: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: json({
          type: 'object',
          properties: { role: { enum: ['agent', 'admin'] }, isActive: { type: 'boolean' } },
        }),
        responses: { 200: success({ type: 'object' }), ...pick(400, 401, 403, 404) },
      },
    },
  },
};
