import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { query } from '../src/config/db.js';
import { testOutbox } from '../src/lib/mailer.js';
import { makeUser, signedInUser } from './helpers/factories.js';

const newTicket = {
  subject: 'Invoice charged twice',
  description: 'My card was charged twice for the October invoice. Please refund one.',
  categoryId: 1,
  priority: 'high',
};

const createTicket = (auth, body = newTicket) =>
  request(app).post('/api/tickets').set(auth).send(body);

const getTicket = (auth, number) => request(app).get(`/api/tickets/${number}`).set(auth);

describe('creating tickets', () => {
  it('creates a ticket, records the event and auto-assigns the least-loaded agent', async () => {
    const busy = await makeUser({ role: 'agent', name: 'Busy Agent' });
    const free = await makeUser({ role: 'agent', name: 'Free Agent' });
    const customer = await signedInUser();

    // Give the first agent some existing work
    const first = await createTicket(customer.auth);
    expect(first.body.data.ticket.assignee.id).toBe(busy.id);

    const res = await createTicket(customer.auth);

    expect(res.status).toBe(201);
    expect(res.body.data.ticket).toMatchObject({
      number: expect.stringMatching(/^RH-\d+$/),
      status: 'open',
      priority: 'high',
      category: { id: 1 },
      assignee: { id: free.id, name: 'Free Agent' },
    });

    const detail = await getTicket(customer.auth, res.body.data.ticket.number);
    expect(detail.body.data.ticket.events.map((e) => e.type)).toEqual(['created', 'assigned']);
    expect(detail.body.data.ticket.events[1]).toMatchObject({ actor: null, to: 'Free Agent' });
  });

  it('stays unassigned when there are no active agents', async () => {
    const customer = await signedInUser();
    const res = await createTicket(customer.auth);
    expect(res.body.data.ticket.assignee).toBeNull();
  });

  it('sends a confirmation email to the customer', async () => {
    const customer = await signedInUser();
    testOutbox.length = 0;
    await createTicket(customer.auth);

    await expect.poll(() => testOutbox.map((m) => m.to)).toContain(customer.user.email);
  });

  it('validates the input', async () => {
    const customer = await signedInUser();
    const res = await createTicket(customer.auth, { subject: 'x', categoryId: 999 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('subject');
    expect(res.body.errors).toHaveProperty('description');
  });

  it('only customers can open tickets', async () => {
    const agent = await signedInUser({ role: 'agent' });
    expect((await createTicket(agent.auth)).status).toBe(403);
  });
});

describe('access control', () => {
  it("hides other customers' tickets behind a 404", async () => {
    const owner = await signedInUser();
    const stranger = await signedInUser();
    const { number } = (await createTicket(owner.auth)).body.data.ticket;

    expect((await getTicket(stranger.auth, number)).status).toBe(404);

    const list = await request(app).get('/api/tickets').set(stranger.auth);
    expect(list.body.data.total).toBe(0);
  });

  it('lets staff see every ticket', async () => {
    const owner = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });
    const { number } = (await createTicket(owner.auth)).body.data.ticket;

    expect((await getTicket(agent.auth, number)).status).toBe(200);
  });

  it('requires authentication', async () => {
    expect((await request(app).get('/api/tickets')).status).toBe(401);
  });
});

describe('conversation', () => {
  it('keeps internal notes away from the customer', async () => {
    const customer = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(agent.auth)
      .send({ body: 'Customer seems to be on the legacy plan', isInternal: true });
    await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(agent.auth)
      .send({ body: 'Refund issued, sorry about that!' });

    const asCustomer = (await getTicket(customer.auth, number)).body.data.ticket;
    const asAgent = (await getTicket(agent.auth, number)).body.data.ticket;

    expect(asCustomer.messages.map((m) => m.body)).toEqual(['Refund issued, sorry about that!']);
    expect(asAgent.messages).toHaveLength(2);
  });

  it('records the first response and moves the ticket along', async () => {
    const customer = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    const replied = await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(agent.auth)
      .send({ body: 'Could you share the transaction id?', status: 'pending' });

    expect(replied.status).toBe(201);
    expect(replied.body.data.ticket).toMatchObject({ status: 'pending' });
    expect(replied.body.data.ticket.firstResponseAt).toBeTruthy();

    // The customer answers: the ticket goes back to the agent
    const answered = await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(customer.auth)
      .send({ body: 'It is TXN-4471.' });
    expect(answered.body.data.ticket.status).toBe('in-progress');
  });

  it('an agent replying to an unassigned ticket takes ownership', async () => {
    const customer = await signedInUser();
    const { number } = (await createTicket(customer.auth)).body.data.ticket;
    const agent = await signedInUser({ role: 'agent' });

    const res = await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(agent.auth)
      .send({ body: 'Looking into it now.' });

    expect(res.body.data.ticket.assignee).toMatchObject({ id: agent.user.id });
    expect(res.body.data.ticket.status).toBe('in-progress');
  });

  it('customers cannot post internal notes', async () => {
    const customer = await signedInUser();
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    const res = await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(customer.auth)
      .send({ body: 'sneaky', isInternal: true });
    expect(res.status).toBe(403);
  });

  it('closed tickets take no more replies', async () => {
    const customer = await signedInUser();
    const { number } = (await createTicket(customer.auth)).body.data.ticket;
    await request(app)
      .patch(`/api/tickets/${number}`)
      .set(customer.auth)
      .send({ status: 'closed' });

    const res = await request(app)
      .post(`/api/tickets/${number}/messages`)
      .set(customer.auth)
      .send({ body: 'one more thing' });
    expect(res.status).toBe(409);
  });
});

describe('updating tickets', () => {
  it('lets staff change status, priority and assignee, with an audit trail', async () => {
    const customer = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });
    const other = await makeUser({ role: 'agent', name: 'Other Agent' });
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    const res = await request(app)
      .patch(`/api/tickets/${number}`)
      .set(agent.auth)
      .send({ status: 'resolved', priority: 'urgent', assigneeId: other.id });

    expect(res.status).toBe(200);
    expect(res.body.data.ticket).toMatchObject({
      status: 'resolved',
      priority: 'urgent',
      assignee: { id: other.id },
    });
    expect(res.body.data.ticket.resolvedAt).toBeTruthy();
    expect(res.body.data.ticket.events.map((e) => e.type)).toEqual(
      expect.arrayContaining(['status_changed', 'priority_changed', 'assigned']),
    );
  });

  it('rejects assigning to someone who is not an active agent', async () => {
    const customer = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    const res = await request(app)
      .patch(`/api/tickets/${number}`)
      .set(agent.auth)
      .send({ assigneeId: customer.user.id });
    expect(res.status).toBe(400);
  });

  it('customers can close but not change priority', async () => {
    const customer = await signedInUser();
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    const priority = await request(app)
      .patch(`/api/tickets/${number}`)
      .set(customer.auth)
      .send({ priority: 'urgent' });
    expect(priority.status).toBe(403);

    const close = await request(app)
      .patch(`/api/tickets/${number}`)
      .set(customer.auth)
      .send({ status: 'closed' });
    expect(close.body.data.ticket.status).toBe('closed');
  });

  it('serialises concurrent updates to the same ticket', async () => {
    const customer = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });
    const { number } = (await createTicket(customer.auth)).body.data.ticket;

    const results = await Promise.all(
      ['low', 'urgent', 'medium'].map((priority) =>
        request(app).patch(`/api/tickets/${number}`).set(agent.auth).send({ priority }),
      ),
    );
    expect(results.every((r) => r.status === 200)).toBe(true);

    // Each change was recorded against the value that was really there before it
    const { rows } = await query(
      `SELECT from_value, to_value FROM ticket_events WHERE type = 'priority_changed' ORDER BY id`,
    );
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].from_value).toBe(rows[i - 1].to_value);
    }
  });
});

describe('listing and search', () => {
  it('filters, searches full text and by number, and paginates', async () => {
    const customer = await signedInUser();
    const agent = await signedInUser({ role: 'agent' });

    await createTicket(customer.auth, { ...newTicket, subject: 'Webhook deliveries failing' });
    await createTicket(customer.auth, {
      ...newTicket,
      subject: 'Cannot export invoices',
      priority: 'low',
    });
    const third = (
      await createTicket(customer.auth, {
        ...newTicket,
        subject: 'Dark mode request',
        priority: 'urgent',
      })
    ).body.data.ticket;

    const search = await request(app).get('/api/tickets?q=webhooks').set(agent.auth);
    expect(search.body.data.items.map((t) => t.subject)).toEqual(['Webhook deliveries failing']);

    const byNumber = await request(app).get(`/api/tickets?q=${third.number}`).set(agent.auth);
    expect(byNumber.body.data.items).toHaveLength(1);

    const urgent = await request(app).get('/api/tickets?priority=urgent').set(agent.auth);
    expect(urgent.body.data.total).toBe(1);

    const paged = await request(app).get('/api/tickets?limit=2&page=2&sort=oldest').set(agent.auth);
    expect(paged.body.data).toMatchObject({ page: 2, limit: 2, total: 3 });
    expect(paged.body.data.items).toHaveLength(1);

    const mine = await request(app).get('/api/tickets?assignee=me').set(agent.auth);
    expect(mine.body.data.total).toBe(3);
  });

  it('returns stats for the dashboard', async () => {
    const customer = await signedInUser();
    await createTicket(customer.auth);
    const res = await request(app).get('/api/tickets/stats').set(customer.auth);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total: 1, active: 1, resolved: 0 });
  });

  it('lists categories and agents', async () => {
    const agent = await signedInUser({ role: 'agent' });
    const categories = await request(app).get('/api/categories').set(agent.auth);
    const agents = await request(app).get('/api/agents').set(agent.auth);

    expect(categories.body.data.items.length).toBeGreaterThanOrEqual(5);
    expect(agents.body.data.items).toEqual([
      expect.objectContaining({ id: agent.user.id, openTickets: 0 }),
    ]);
  });
});
