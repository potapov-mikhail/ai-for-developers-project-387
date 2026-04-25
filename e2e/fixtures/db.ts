import { test as base } from '@playwright/test';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TEST_DB = path.resolve(__dirname, '../../packages/backend/data/test-booking.db');
const MIGRATION_FILE = path.resolve(
  __dirname,
  '../../packages/backend/drizzle/0000_tricky_post.sql',
);

function openDb() {
  const dir = path.dirname(TEST_DB);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(TEST_DB);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  // Create tables if they don't exist (idempotent)
  const tableCheck = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bookings'")
    .get();

  if (!tableCheck) {
    const sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');
    const statements = sql.split('--> statement-breakpoint');
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed) sqlite.exec(trimmed);
    }
  }

  return sqlite;
}

function resetAndSeed(sqlite: ReturnType<typeof Database>) {
  sqlite.exec('DELETE FROM bookings');
  sqlite.exec('DELETE FROM event_types');
  sqlite.exec('DELETE FROM availability');

  // Seed availability 09:00-18:00 for all 7 days
  const insertAvail = sqlite.prepare(
    `INSERT INTO availability (id, day_of_week, start_time, end_time) VALUES (?, ?, '09:00', '18:00')`,
  );
  for (let day = 0; day < 7; day++) {
    insertAvail.run(crypto.randomUUID(), day);
  }

  // Seed one event type
  const eventTypeId = crypto.randomUUID();
  sqlite
    .prepare(
      `INSERT INTO event_types (id, name, description, duration_minutes, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      eventTypeId,
      '30-минутный звонок',
      'Короткий звонок для знакомства',
      30,
      new Date().toISOString(),
    );

  return eventTypeId;
}

export const test = base.extend<{ resetDb: string }>({
  resetDb: [
    async ({}, use) => {
      const sqlite = openDb();
      const eventTypeId = resetAndSeed(sqlite);
      sqlite.close();
      await use(eventTypeId);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
