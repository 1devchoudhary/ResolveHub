import { afterAll, beforeEach } from 'vitest';
import { closePool } from '../src/config/db.js';
import { resetDatabase } from './helpers/db.js';

// Every test starts from an empty database (reference data such as categories is kept)
beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closePool();
});
