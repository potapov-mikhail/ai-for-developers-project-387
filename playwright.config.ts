import { defineConfig } from '@playwright/test';
import path from 'path';

const testDbPath = path.resolve(__dirname, 'packages/backend/data/test-booking.db');

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    timezoneId: 'UTC',
    locale: 'ru-RU',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: [
    {
      command: 'npm -w @booking/backend run dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: {
        BOOKING_DB_PATH: testDbPath,
      },
    },
    {
      command: 'npm -w @booking/frontend run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
