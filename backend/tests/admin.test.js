import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { query } from '../src/config/db.js';
import { login, makeUser, signedInUser } from './helpers/factories.js';

const newTicket = {
  subject: 'Cannot log in',
  description: 'The login page says my password is wrong after the reset.',
  categoryId: 2,
};

describe('admin authorisation', () => {
  it('only admins can reach /api/admin', async () => {
    const agent = await signedInUser({ role: 'agent' });
    const customer = await signedInUser();

    expect((await request(app).get('/api/admin/analytics').set(agent.auth)).status).toBe(403);
    expect((await request(app).get('/api/admin/users').set(customer.auth)).status).toBe(403);
    expect((await request(app).get('/api/admin/users')).status).toBe(401);
  });
});

describe('GET /api/admin/analytics', () => {
  it('returns summary numbers, a gap-free daily series and per-agent performance', async () => {
    const admin = await signedInUser({ role: 'admin' });
    const agent = await makeUser({ role: 'agent' });
    const customer = await signedInUser();
    await request(app).post('/api/tickets').set(customer.auth).send(newTicket);

    const res = await request(app).get('/api/admin/analytics?days=7').set(admin.auth);

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toMatchObject({ active: 1, created: 1, resolved: 0 });
    expect(res.body.data.daily).toHaveLength(7);
    expect(res.body.data.daily.at(-1)).toMatchObject({ created: 1 });
    expect(res.body.data.agents).toEqual([
      expect.objectContaining({ id: agent.id, active: 1, resolved: 0 }),
    ]);
  });

  it('rejects unsupported ranges', async () => {
    const admin = await signedInUser({ role: 'admin' });
    const res = await request(app).get('/api/admin/analytics?days=13').set(admin.auth);
    expect(res.status).toBe(400);
  });
});

describe('team management', () => {
  it('creates an agent who can then sign in to the agent portal', async () => {
    const admin = await signedInUser({ role: 'admin' });
    const res = await request(app).post('/api/admin/users').set(admin.auth).send({
      name: 'New Agent',
      email: 'new.agent@example.com',
      mobile: '9811122233',
      password: 'Welc0meAgent',
      role: 'agent',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ role: 'agent', mobile: '+919811122233' });

    const signIn = await login(
      { email: 'new.agent@example.com', role: 'agent' },
      { password: 'Welc0meAgent' },
    );
    expect(signIn.res.status).toBe(200);
  });

  it('cannot create customers through the staff endpoint', async () => {
    const admin = await signedInUser({ role: 'admin' });
    const res = await request(app).post('/api/admin/users').set(admin.auth).send({
      name: 'X',
      email: 'x@example.com',
      mobile: '9811122233',
      password: 'Welc0meAgent',
      role: 'customer',
    });
    expect(res.status).toBe(400);
  });

  it('deactivating an agent signs them out and returns their tickets to the queue', async () => {
    const admin = await signedInUser({ role: 'admin' });
    const agent = await signedInUser({ role: 'agent' });
    const customer = await signedInUser();
    const { number } = (await request(app).post('/api/tickets').set(customer.auth).send(newTicket))
      .body.data.ticket;

    const res = await request(app)
      .patch(`/api/admin/users/${agent.user.id}`)
      .set(admin.auth)
      .send({ isActive: false });
    expect(res.status).toBe(200);

    const ticket = (await request(app).get(`/api/tickets/${number}`).set(admin.auth)).body.data
      .ticket;
    expect(ticket.assignee).toBeNull();
    expect(ticket.events.at(-1)).toMatchObject({ type: 'unassigned' });

    const refresh = await request(app).post('/api/auth/refresh').set('Cookie', agent.cookie);
    expect(refresh.status).toBe(401);
    expect((await login(agent.user)).res.status).toBe(403);
  });

  it('protects the admin themselves and the demo accounts', async () => {
    const admin = await signedInUser({ role: 'admin' });
    const demoAgent = await makeUser({ role: 'agent', isDemo: true });

    const self = await request(app)
      .patch(`/api/admin/users/${admin.user.id}`)
      .set(admin.auth)
      .send({ isActive: false });
    expect(self.status).toBe(400);

    const demo = await request(app)
      .patch(`/api/admin/users/${demoAgent.id}`)
      .set(admin.auth)
      .send({ isActive: false });
    expect(demo.status).toBe(403);
  });

  it('lists users with filters', async () => {
    const admin = await signedInUser({ role: 'admin' });
    await makeUser({ role: 'agent', name: 'Zara Agent' });
    await makeUser({ name: 'Zed Customer' });

    const agents = await request(app).get('/api/admin/users?role=agent').set(admin.auth);
    expect(agents.body.data.items.map((u) => u.name)).toEqual(['Zara Agent']);

    const search = await request(app).get('/api/admin/users?q=zed').set(admin.auth);
    expect(search.body.data.total).toBe(1);

    const { rows } = await query('SELECT count(*) FROM users');
    const all = await request(app).get('/api/admin/users?limit=100').set(admin.auth);
    expect(all.body.data.total).toBe(rows[0].count);
  });
});
