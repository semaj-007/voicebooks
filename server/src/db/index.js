import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });

export const db = new Database(config.databaseFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const here = path.dirname(fileURLToPath(import.meta.url));
db.exec(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));

// Roles are reference data. "admin" cannot be chosen at sign-up.
const seedRole = db.prepare(
  'INSERT OR IGNORE INTO roles (name, label, description, self_assignable) VALUES (?, ?, ?, ?)'
);
[
  ['business_owner', 'Business owner', 'Run your business finances and see the full picture.', 1],
  ['accountant', 'Accountant', 'Review books, reports and compliance for your practice.', 1],
  ['bookkeeper', 'Bookkeeper', 'Capture transactions and keep records tidy.', 1],
  ['admin', 'Administrator', 'Platform administration.', 0],
].forEach((r) => seedRole.run(...r));
