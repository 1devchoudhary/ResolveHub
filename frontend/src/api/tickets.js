import { api } from './client';

export const ticketsApi = {
  list: (params) => api('/tickets', { query: params }),
  stats: () => api('/tickets/stats'),
  activity: (limit = 8) => api('/tickets/activity', { query: { limit } }).then((d) => d.items),
  get: (number) => api(`/tickets/${number}`).then((d) => d.ticket),
  create: (input) => api('/tickets', { method: 'POST', body: input }).then((d) => d.ticket),
  reply: (number, input) =>
    api(`/tickets/${number}/messages`, { method: 'POST', body: input }).then((d) => d.ticket),
  update: (number, changes) =>
    api(`/tickets/${number}`, { method: 'PATCH', body: changes }).then((d) => d.ticket),
};

export const categoriesApi = {
  list: () => api('/categories').then((d) => d.items),
  create: (input) => api('/categories', { method: 'POST', body: input }).then((d) => d.category),
  update: (id, changes) =>
    api(`/categories/${id}`, { method: 'PATCH', body: changes }).then((d) => d.category),
};

export const agentsApi = {
  list: () => api('/agents').then((d) => d.items),
};
