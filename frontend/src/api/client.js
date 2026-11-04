// Thin fetch wrapper used by every API module.
// - attaches the in-memory access token
// - unwraps the backend's { success, message, data } envelope
// - on an expired access token, refreshes once (shared by concurrent requests) and retries

const BASE_URL = '/api';

// The access token lives only in memory: never in localStorage, where any XSS could read it.
// A page reload restores it from the httpOnly refresh cookie (see AuthProvider).
let accessToken = null;
let onSessionExpired = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (handler) => {
  onSessionExpired = handler;
};

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    // Per-field messages from validation, e.g. { email: 'Email is required' }
    this.errors = errors ?? {};
  }
}

const buildUrl = (path, query) => {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

const parse = async (response) => {
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed (${response.status})`,
      body?.errors,
    );
  }
  return body;
};

const send = (path, { method, body, query, signal }) =>
  fetch(buildUrl(path, query), {
    method,
    signal,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One refresh at a time: if five requests expire together, they all wait on the same call.
let refreshInFlight = null;

const doRefresh = async () => {
  const attempt = () => send('/auth/refresh', { method: 'POST' }).then(parse);
  try {
    return await attempt();
  } catch (err) {
    // Another tab may have rotated the shared cookie a moment ago: retry once with the new one.
    // "No session" means there was no cookie at all, so there's nothing to retry.
    if (err instanceof ApiError && err.status === 401 && err.message !== 'No session') {
      await wait(400);
      return attempt();
    }
    throw err;
  }
};

export const refreshSession = () => {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh()
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

/**
 * api('/tickets', { query: { status: 'open' } }) -> data
 * Throws ApiError with .status and .errors on failure.
 */
export const api = async (path, { method = 'GET', body, query, signal, raw = false } = {}) => {
  let response = await send(path, { method, body, query, signal });

  // Expired access token: refresh and retry the original request once
  if (response.status === 401 && accessToken && !path.startsWith('/auth/refresh')) {
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      onSessionExpired();
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
    response = await send(path, { method, body, query, signal });
  }

  const parsed = await parse(response);
  return raw ? parsed : parsed.data;
};
