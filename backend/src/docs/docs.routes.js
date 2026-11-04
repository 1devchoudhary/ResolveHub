import { Router } from 'express';
import { openApiDocument } from './openapi.js';

const router = Router();

// Pinned version, loaded from a CDN only on this page
const SCALAR_SRC = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.74.0';

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ResolveHub API reference</title>
  </head>
  <body>
    <script id="api-reference" data-url="/api/docs/openapi.json"></script>
    <script src="${SCALAR_SRC}"></script>
  </body>
</html>`;

router.get('/openapi.json', (_req, res) => res.json(openApiDocument));

// The rest of the API keeps helmet's strict CSP; only this page may load the viewer from the CDN
router.get('/', (_req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://cdn.jsdelivr.net 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "font-src 'self' data: https://cdn.jsdelivr.net https://fonts.scalar.com https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  );
  res.type('html').send(page);
});

export default router;
