#!/usr/bin/env node
/**
 * Seed script — creates the admin user.
 * Run: node scripts/seed.mjs
 * Make sure MONGODB_URI is set in .env.local
 */

import 'dotenv/config';
import { fileURLToPath } from 'url';
import path from 'path';

// Load .env.local
import fs from 'fs';
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
}

async function seed() {
  const res = await fetch('http://localhost:3000/api/seed', {
    method: 'POST',
    headers: { 'x-seed-secret': 'SEED_SECRET_MCQ_EXAM_2024' },
  });
  const data = await res.json();
  console.log('Seed result:', data);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
