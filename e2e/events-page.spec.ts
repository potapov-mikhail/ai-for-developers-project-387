import { test, expect } from './fixtures/db';
import type { Page } from '@playwright/test';

function getTomorrowUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  return { day, month, year };
}

const MONTH_NAMES = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

async function navigateToMonth(page: Page, targetMonth: number, targetYear: number) {
  const targetLabel = `${MONTH_NAMES[targetMonth]} ${targetYear} г.`;
  for (let i = 0; i < 3; i++) {
    const currentLabel = await page.getByText(/\d{4} г\./).textContent();
    if (currentLabel?.trim() === targetLabel) break;
    await page.locator('button').filter({ hasText: '→' }).click();
  }
}

test.describe('Events Page', () => {
  test('shows empty state when no bookings', async ({ page }) => {
    await page.goto('/events');

    await expect(page.locator('h1')).toHaveText('Предстоящие события');
    await expect(page.getByText('Нет предстоящих событий.')).toBeVisible();
  });

  test('booking appears on events page after creation', async ({ page }) => {
    const tomorrow = getTomorrowUTC();
    await page.goto('/booking');

    await navigateToMonth(page, tomorrow.month, tomorrow.year);

    // Select day
    await page
      .locator('.grid.grid-cols-7 button:not([disabled])')
      .filter({ hasText: new RegExp(`^${tomorrow.day}$`) })
      .first()
      .click();

    // Wait for slots and select first
    const slotButton = page.locator('button').filter({ hasText: /\d{2}:\d{2} - \d{2}:\d{2}/ });
    await expect(slotButton.first()).toBeVisible({ timeout: 10_000 });
    await slotButton.first().click();

    await page.getByRole('button', { name: 'Продолжить' }).click();

    // Fill form
    await page.getByPlaceholder('Имя').fill('Тест Гость');
    await page.getByPlaceholder('Email').fill('guest@test.com');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    await expect(page.getByText('Бронь подтверждена. До встречи!')).toBeVisible({
      timeout: 10_000,
    });

    // Navigate to events page
    await page.goto('/events');

    // Booking should be visible
    await expect(page.getByText('Тест Гость')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('guest@test.com')).toBeVisible();
  });
});
