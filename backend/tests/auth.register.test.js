import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { query } from '../src/config/db.js';

const validUser = {
  name: 'Ananya Rao',
  email: 'Ananya@Example.com ',
  mobile: '098765 43210',
  password: 'Str0ngPass',
  agreeToTerms: true,
};

const register = (body) => request(app).post('/api/auth/register').send(body);

describe('POST /api/auth/register', () => {
  it('creates a customer and returns it without the password hash', async () => {
    const res = await register(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      name: 'Ananya Rao',
      email: 'ananya@example.com',
      mobile: '+919876543210',
      role: 'customer',
    });
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('signs the new customer in straight away', async () => {
    const res = await register(validUser);

    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.headers['set-cookie'].join(';')).toMatch(/rh_refresh=/);
  });

  it('stores a bcrypt hash, never the plain password', async () => {
    await register(validUser);
    const { rows } = await query('SELECT password_hash FROM users');

    // $2b$<cost>$...: the cost is lowered in tests (BCRYPT_ROUNDS) to keep the suite fast
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(rows[0].password_hash).not.toContain(validUser.password);
  });

  it('ignores a role sent by the client', async () => {
    const res = await register({ ...validUser, role: 'admin' });
    expect(res.body.data.user.role).toBe('customer');
  });

  it('returns one message per invalid field', async () => {
    const res = await register({ name: '  ', email: 'x@y', mobile: '12345', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Object.keys(res.body.errors).sort()).toEqual(
      ['agreeToTerms', 'email', 'mobile', 'name', 'password'].sort(),
    );
  });

  it('handles a request with no body', async () => {
    const res = await request(app).post('/api/auth/register');
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('rejects a duplicate email with 409', async () => {
    await register(validUser);
    const res = await register({ ...validUser, mobile: '9123456789' });

    expect(res.status).toBe(409);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('treats differently formatted copies of the same mobile as duplicates', async () => {
    await register(validUser);
    const res = await register({
      ...validUser,
      email: 'other@example.com',
      mobile: '+91 98765-43210',
    });

    expect(res.status).toBe(409);
    expect(res.body.errors).toHaveProperty('mobile');
  });
});

describe('error handling', () => {
  it('answers unknown routes with a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Request body is not valid JSON');
  });

  it('serves the OpenAPI document and the reference page', async () => {
    const spec = await request(app).get('/api/docs/openapi.json');
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe('3.1.0');
    expect(Object.keys(spec.body.paths)).toContain('/tickets/{number}/messages');

    const docs = await request(app).get('/api/docs');
    expect(docs.headers['content-type']).toMatch(/html/);
  });

  it('returns a request id on every response', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});
