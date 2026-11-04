// npm run seed -- --yes
// Replaces ALL data in the database from DATABASE_URL_POOLED with the demo dataset.
import env from '../src/config/env.js';
import { closePool } from '../src/config/db.js';
import { seedDemoData } from '../src/modules/demo/demo.seed.js';
import { DEMO_PASSWORD, STAFF, CUSTOMERS } from '../src/modules/demo/demo.data.js';

if (!process.argv.includes('--yes')) {
  console.error('This deletes every user and ticket in the target database.');
  console.error('Run again with --yes to continue:  npm run seed -- --yes');
  process.exit(1);
}

const host = new URL(env.DATABASE_URL).host;
console.log(`Seeding demo data into ${host} ...`);

try {
  const summary = await seedDemoData();
  console.log(
    `Done: ${summary.users} users, ${summary.tickets} tickets, ${summary.categories} categories.`,
  );
  console.log(`\nDemo logins (password: ${DEMO_PASSWORD})`);
  for (const person of [...STAFF, CUSTOMERS[0]]) {
    console.log(`  ${(person.role ?? 'customer').padEnd(9)} ${person.email}`);
  }
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await closePool();
}
