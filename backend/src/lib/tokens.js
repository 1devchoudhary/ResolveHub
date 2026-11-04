import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const ISSUER = 'resolvehub-api';
const AUDIENCE = 'resolvehub-app';
const ALGORITHM = 'HS256';

// Short-lived, stateless proof of identity sent as "Authorization: Bearer <token>"
export const signAccessToken = (user) =>
  jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: String(user.id),
    expiresIn: env.JWT_ACCESS_TTL,
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: ALGORITHM,
  });

// Pinning the algorithm stops "alg: none" and algorithm-confusion attacks
export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return { id: Number(payload.sub), role: payload.role };
};

// Opaque random tokens (refresh, password reset): 256 bits, URL-safe
export const generateToken = () => randomBytes(32).toString('base64url');

// Only hashes are stored. SHA-256 is enough here (unlike passwords): the input is already
// 256 bits of randomness, so there's nothing to brute-force.
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
