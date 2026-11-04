import request from 'supertest';
import app from '../../src/app.js';
import { createUser } from '../../src/modules/users/user.repository.js';
import { hashPassword } from '../../src/modules/auth/auth.service.js';

export const PASSWORD = 'Str0ngPass';

let sequence = 0;

// Inserts a user directly (staff accounts can't sign up through the API)
export const makeUser = async ({ role = 'customer', isDemo = false, ...overrides } = {}) => {
  sequence += 1;
  const user = await createUser({
    name: overrides.name ?? `${role} ${sequence}`,
    email: overrides.email ?? `${role}${sequence}@example.com`,
    mobile: overrides.mobile ?? `+9198${String(sequence).padStart(8, '0')}`,
    passwordHash: await hashPassword(overrides.password ?? PASSWORD),
    role,
    isDemo,
  });
  return user;
};

// Reads the refresh token out of a Set-Cookie header
export const refreshCookieFrom = (res) => {
  const cookie = (res.headers['set-cookie'] ?? []).find((c) => c.startsWith('rh_refresh='));
  return cookie ? cookie.split(';')[0] : null;
};

export const login = async (user, { portal = user.role, password = PASSWORD } = {}) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password, portal });
  return { res, accessToken: res.body.data?.accessToken, cookie: refreshCookieFrom(res) };
};

// Creates a user and signs them in; returns what a test needs to make authenticated calls
export const signedInUser = async (options) => {
  const user = await makeUser(options);
  const { accessToken, cookie } = await login(user);
  return { user, accessToken, cookie, auth: { Authorization: `Bearer ${accessToken}` } };
};
