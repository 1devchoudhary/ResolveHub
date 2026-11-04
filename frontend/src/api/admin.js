import { api } from './client';

export const adminApi = {
  analytics: (days) => api('/admin/analytics', { query: { days } }),
  users: (params) => api('/admin/users', { query: params }),
  createStaff: (input) => api('/admin/users', { method: 'POST', body: input }).then((d) => d.user),
  updateUser: (id, changes) =>
    api(`/admin/users/${id}`, { method: 'PATCH', body: changes }).then((d) => d.user),
};
