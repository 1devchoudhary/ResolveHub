import pool from '../../config/db.js';

// ---- Refresh tokens ---------------------------------------------------------------------

export const insertRefreshToken = async (
  { userId, tokenHash, familyId, expiresAt, userAgent, ip },
  db = pool,
) => {
  const { rows } = await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [userId, tokenHash, familyId, expiresAt, userAgent, ip],
  );
  return rows[0];
};

// FOR UPDATE: two concurrent refreshes with the same token are serialised, so only one wins
export const findRefreshTokenForUpdate = async (tokenHash, db) => {
  const { rows } = await db.query(
    `SELECT id,
            user_id AS "userId",
            family_id AS "familyId",
            expires_at AS "expiresAt",
            revoked_at AS "revokedAt",
            replaced_by AS "replacedBy"
     FROM refresh_tokens
     WHERE token_hash = $1
     FOR UPDATE`,
    [tokenHash],
  );
  return rows[0] ?? null;
};

export const markRotated = (id, replacedBy, db = pool) =>
  db.query('UPDATE refresh_tokens SET revoked_at = now(), replaced_by = $2 WHERE id = $1', [
    id,
    replacedBy,
  ]);

export const revokeFamily = (familyId, db = pool) =>
  db.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL',
    [familyId],
  );

export const revokeByHash = (tokenHash, db = pool) =>
  db.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash],
  );

// Signs the user out everywhere, optionally keeping the session making the request
export const revokeAllForUser = (userId, { exceptFamilyId = null } = {}, db = pool) =>
  db.query(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL
       AND ($2::uuid IS NULL OR family_id <> $2::uuid)`,
    [userId, exceptFamilyId],
  );

export const findFamilyIdByHash = async (tokenHash, db = pool) => {
  const { rows } = await db.query(
    `SELECT family_id AS "familyId", user_id AS "userId" FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] ?? null;
};

// ---- Password reset tokens --------------------------------------------------------------

export const insertPasswordResetToken = async ({ userId, tokenHash, expiresAt }, db = pool) => {
  // Requesting a new link invalidates any earlier unused ones
  await db.query(
    'UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL',
    [userId],
  );
  await db.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
};

// Atomically claims a valid token: it can only ever be used once, even under concurrent requests
export const consumePasswordResetToken = async (tokenHash, db = pool) => {
  const { rows } = await db.query(
    `UPDATE password_reset_tokens SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id AS "userId"`,
    [tokenHash],
  );
  return rows[0] ?? null;
};
