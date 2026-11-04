import { api } from './client';

export const authApi = {
  register: (input) => api('/auth/register', { method: 'POST', body: input }),
  login: ({ email, password, portal }) =>
    api('/auth/login', { method: 'POST', body: { email, password, portal } }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  me: () => api('/auth/me'),
  forgotPassword: (email) =>
    api('/auth/forgot-password', { method: 'POST', body: { email }, raw: true }),
  resetPassword: ({ token, password }) =>
    api('/auth/reset-password', { method: 'POST', body: { token, password }, raw: true }),
  changePassword: ({ currentPassword, newPassword }) =>
    api('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      raw: true,
    }),
  updateProfile: (changes) => api('/users/me', { method: 'PATCH', body: changes }),
};
