import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { query } from '../src/config/db.js';
import { seedDemoData } from '../src/modules/demo/demo.seed.js';
import { DEMO_PASSWORD } from '../src/modules/demo/demo.data.js';

describe('demo reset cron', () => {
  it('requires the cron secret', async () => {
    const missing = await request(app).get('/api/internal/cron/reset-demo');
    const wrong = await request(app)
      .get('/api/internal/cron/reset-demo')
      .set('Authorization', 'Bearer nope');
    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
  });

  it('resets the demo data when called with the secret', async () => {
    const res = await request(app)
      .get('/api/internal/cron/reset-demo')
      .set('Authorization', 'Bearer test-cron-secret');
    expect(res.status).toBe(200);
    expect(res.body.data.tickets).toBe(36);
  });
});

describe('demo seed', () => {
  it('creates a consistent dataset the demo accounts can sign in to', async () => {
    const summary = await seedDemoData();
    expect(summary.tickets).toBe(36);

    // Lifecycle timestamps agree with the status of every ticket
    const { rows: inconsistent } = await query(`
      SELECT id FROM tickets
      WHERE (status = 'open' AND first_response_at IS NOT NULL)
         OR (status IN ('resolved', 'closed') AND resolved_at IS NULL)
         OR (status = 'closed' AND closed_at IS NULL)
         OR (first_response_at < created_at)`);
    expect(inconsistent).toEqual([]);

    for (const [portal, email] of [
      ['customer', 'demo.customer@resolvehub.dev'],
      ['agent', 'demo.agent@resolvehub.dev'],
      ['admin', 'demo.admin@resolvehub.dev'],
    ]) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: DEMO_PASSWORD, portal });
      expect(res.status, portal).toBe(200);
    }
  });

  it('is deterministic, so every reset looks the same', async () => {
    await seedDemoData({ now: new Date('2026-11-01T00:00:00Z') });
    const first = await query('SELECT subject, status, assignee_id FROM tickets ORDER BY id');
    await seedDemoData({ now: new Date('2026-11-01T00:00:00Z') });
    const second = await query('SELECT subject, status, assignee_id FROM tickets ORDER BY id');

    expect(second.rows).toEqual(first.rows);
  });
});
