import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { query } from '../src/config/db.js';
import { testOutbox } from '../src/lib/mailer.js';
import { PASSWORD, login, makeUser, refreshCookieFrom, signedInUser } from './helpers/factories.js';

const refresh = (cookie) => {
  const req = request(app).post('/api/auth/refresh');
  return cookie ? req.set('Cookie', cookie) : req;
};

describe('POST /api/auth/login', () => {
  it('signs a customer in with an access token and an httpOnly refresh cookie', async () => {
    const user = await makeUser();
    const { res, cookie } = await login(user);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user).toMatchObject({ id: user.id, role: 'customer' });
    expect(cookie).toBeTruthy();

    const setCookie = res.headers['set-cookie'].join(';');
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Path=\/api\/auth/);
    expect(setCookie).toMatch(/SameSite=Lax/i);
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const user = await makeUser();
    const wrongPassword = await login(user, { password: 'Wrong1Pass' });
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: PASSWORD });

    expect(wrongPassword.res.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPassword.res.body.message).toBe(unknown.body.message);
  });

  it('only lets each role in through its own portal', async () => {
    const agent = await makeUser({ role: 'agent' });

    expect((await login(agent, { portal: 'customer' })).res.status).toBe(401);
    expect((await login(agent, { portal: 'admin' })).res.status).toBe(401);
    expect((await login(agent, { portal: 'agent' })).res.status).toBe(200);
  });

  it('blocks deactivated accounts once the password is correct', async () => {
    const user = await makeUser();
    await query('UPDATE users SET is_active = false WHERE id = $1', [user.id]);

    const { res } = await login(user);
    expect(res.status).toBe(403);
  });

  it('rate-limits repeated attempts for the same email', async () => {
    const user = await makeUser();
    const statuses = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await login(user, { password: 'Wrong1Pass' })).res.status);
    }

    expect(statuses.slice(0, 10).every((status) => status === 401)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe('POST /api/auth/refresh', () => {
  it('rotates the refresh token and returns a new access token', async () => {
    const { cookie } = await signedInUser();
    const res = await refresh(cookie);
    const rotated = refreshCookieFrom(res);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(rotated).toBeTruthy();
    expect(rotated).not.toBe(cookie);
  });

  it('revokes the whole session family when an old token is replayed', async () => {
    const { cookie: original } = await signedInUser();
    const rotated = refreshCookieFrom(await refresh(original));

    // Pretend the rotation happened long ago, outside the multi-tab grace window
    await query(`UPDATE refresh_tokens SET revoked_at = now() - interval '1 minute'`);

    expect((await refresh(original)).status).toBe(401);
    // The legitimate, newest token is now dead too
    expect((await refresh(rotated)).status).toBe(401);
  });

  it('tolerates two tabs refreshing with the same token at the same moment', async () => {
    const { cookie } = await signedInUser();
    const first = await refresh(cookie);
    const second = await refresh(cookie);

    expect(first.status).toBe(200);
    expect(second.status).toBe(401);
    // ...but the winning tab's session survives
    expect((await refresh(refreshCookieFrom(first))).status).toBe(200);
  });

  it('rejects a request without a cookie', async () => {
    expect((await refresh()).status).toBe(401);
  });
});

describe('session lifecycle', () => {
  it('returns the current user from /me', async () => {
    const { user, auth } = await signedInUser();
    const res = await request(app).get('/api/auth/me').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
  });

  it('rejects /me without a valid access token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect(
      (await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt')).status,
    ).toBe(401);
  });

  it('logout revokes the refresh token', async () => {
    const { cookie } = await signedInUser();
    const res = await request(app).post('/api/auth/logout').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect((await refresh(cookie)).status).toBe(401);
  });

  it('changing the password keeps this session and signs out the others', async () => {
    const user = await makeUser();
    const here = await login(user);
    const elsewhere = await login(user);

    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${here.accessToken}`)
      .set('Cookie', here.cookie)
      .send({ currentPassword: PASSWORD, newPassword: 'N3wPassword' });

    expect(res.status).toBe(200);
    expect((await refresh(here.cookie)).status).toBe(200);
    expect((await refresh(elsewhere.cookie)).status).toBe(401);
    expect((await login(user, { password: 'N3wPassword' })).res.status).toBe(200);
  });

  it('demo accounts cannot change their password', async () => {
    const { auth, cookie } = await signedInUser({ isDemo: true });
    const res = await request(app)
      .post('/api/auth/change-password')
      .set(auth)
      .set('Cookie', cookie)
      .send({ currentPassword: PASSWORD, newPassword: 'N3wPassword' });

    expect(res.status).toBe(403);
  });
});

describe('password reset', () => {
  it('emails a single-use link that sets a new password and signs out every session', async () => {
    const user = await makeUser();
    const { cookie } = await login(user);
    testOutbox.length = 0;

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    expect(forgot.status).toBe(200);

    // The email is sent after the response; wait for it to land in the outbox
    await expect.poll(() => testOutbox.length).toBe(1);
    const token = testOutbox[0].text.match(/token=([\w-]+)/)[1];

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'Res3tPassword' });
    expect(reset.status).toBe(200);

    expect((await refresh(cookie)).status).toBe(401);
    expect((await login(user, { password: 'Res3tPassword' })).res.status).toBe(200);

    const reused = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'An0therPassword' });
    expect(reused.status).toBe(400);
  });

  it('answers the same for unknown emails and sends nothing', async () => {
    testOutbox.length = 0;
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(testOutbox).toHaveLength(0);
  });
});

describe('PATCH /api/users/me', () => {
  it('updates the profile and normalises the mobile number', async () => {
    const { auth } = await signedInUser();
    const res = await request(app)
      .patch('/api/users/me')
      .set(auth)
      .send({ name: 'New Name', mobile: '0 91234 56789', emailNotifications: false });

    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({
      name: 'New Name',
      mobile: '+919123456789',
      emailNotifications: false,
    });
  });

  it('rejects an empty update', async () => {
    const { auth } = await signedInUser();
    const res = await request(app).patch('/api/users/me').set(auth).send({});
    expect(res.status).toBe(400);
  });
});
