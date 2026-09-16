#!/usr/bin/env node
/**
 * This script runs Prisma migrations.
 * Can be used in production via: DATABASE_URL=xxx npx node scripts/run-migration.js
 */

const { spawn } = require('child_process');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

// Run prisma migrate deploy
const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  env: { ...process.env, DATABASE_URL: dbUrl },
  stdio: 'inherit',
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Migration failed with code ${code}`);
    process.exit(code);
  }
  console.log('Migration completed successfully!');
  process.exit(0);
});
