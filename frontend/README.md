# ResolveHub frontend

React 19 + Vite single-page app with three role-based portals (customer `/app`, agent `/agent`,
admin `/admin`). See the [root README](../README.md) for the full project overview and
[docs/architecture.md](../docs/architecture.md) for how the pieces fit together.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:5173, proxying `/api` to the API on :8000 |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint (React hooks + refresh rules) |
| `npm run format` | Prettier |

Point the dev proxy at another API with `VITE_API_PROXY_TARGET=http://localhost:8010 npm run dev`.

## Structure

```
src/
├── api/            fetch client (token refresh, error shape) + one module per resource
├── context/        AuthProvider: session restore, login/logout
├── hooks/queries/  TanStack Query hooks (cache keys, polling, mutations)
├── components/     ui/ primitives (design system), tickets/ shared ticket views
├── layouts/        PortalLayout shell + per-portal nav config
└── pages/          customer/, staff/ (agent + admin ticket screens), admin/
```
