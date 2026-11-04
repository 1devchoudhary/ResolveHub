import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Force the test environment so the app can only ever connect to DATABASE_URL_TEST
    env: {
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'test-secret-that-is-long-enough-for-validation',
    },
    globalSetup: ['./tests/globalSetup.js'],
    setupFiles: ['./tests/setup.js'],
    // Integration tests share one database, so run files one at a time
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 15_000,
  },
});
