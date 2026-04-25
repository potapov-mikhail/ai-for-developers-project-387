import { test, expect } from './fixtures/db';
import type { Page } from '@playwright/test';

/**
 * Returns a date for tomorrow in UTC.
 */
function getTomorrowUTC() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { dateStr, day, month, year };
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
    // Click the right arrow button (→)
    await page.locator('button').filter({ hasText: '→' }).click();
  }
  await expect(page.getByText(targetLabel)).toBeVisible();
}

async function selectDay(page: Page, day: number) {
  // Find enabled buttons with the exact day text in the calendar grid
  const dayButton = page
    .locator('.grid.grid-cols-7 button:not([disabled])')
    .filter({ hasText: new RegExp(`^${day}$`) });
  await dayButton.first().click();
}

async function selectFirstSlot(page: Page) {
  // Wait for slots to load — look for buttons containing time pattern
  const slotButton = page.locator('button').filter({ hasText: /\d{2}:\d{2} - \d{2}:\d{2}/ });
  await expect(slotButton.first()).toBeVisible({ timeout: 10_000 });
  await slotButton.first().click();
}

async function completeBooking(page: Page, name: string, email: string) {
  const tomorrow = getTomorrowUTC();
  await page.goto('/booking');
  await navigateToMonth(page, tomorrow.month, tomorrow.year);
  await selectDay(page, tomorrow.day);
  await selectFirstSlot(page);

  await page.getByRole('button', { name: 'Продолжить' }).click();

  await page.getByPlaceholder('Имя').fill(name);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByRole('button', { name: 'Подтвердить запись' }).click();

  await expect(page.getByText('Бронь подтверждена. До встречи!')).toBeVisible({ timeout: 10_000 });
}

test.describe('Booking Flow', () => {
  test('booking page loads with calendar', async ({ page }) => {
    await page.goto('/booking');

    await expect(page.locator('h1')).toHaveText('Запись на звонок');
    await expect(page.getByText('Календарь')).toBeVisible();
  });

  test('selecting a future date loads slots', async ({ page }) => {
    const tomorrow = getTomorrowUTC();
    await page.goto('/booking');

    await navigateToMonth(page, tomorrow.month, tomorrow.year);
    await selectDay(page, tomorrow.day);

    // Slots should appear with time pattern
    const slotButton = page.locator('button').filter({ hasText: /\d{2}:\d{2} - \d{2}:\d{2}/ });
    await expect(slotButton.first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Статус слотов')).toBeVisible();
  });

  test('past dates are disabled', async ({ page }) => {
    await page.goto('/booking');

    // Get all disabled buttons in the calendar grid
    const disabledButtons = page.locator('.grid.grid-cols-7 button[disabled]');
    // There should be at least one disabled button (past dates or non-current-month dates)
    await expect(disabledButtons.first()).toBeVisible();
  });

  test('select slot and continue to form', async ({ page }) => {
    const tomorrow = getTomorrowUTC();
    await page.goto('/booking');

    await navigateToMonth(page, tomorrow.month, tomorrow.year);
    await selectDay(page, tomorrow.day);
    await selectFirstSlot(page);

    await page.getByRole('button', { name: 'Продолжить' }).click();

    // Form step should be visible
    await expect(page.getByText('Подтверждение записи')).toBeVisible();
    await expect(page.getByPlaceholder('Имя')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('full booking happy path', async ({ page }) => {
    await completeBooking(page, 'Иван Петров', 'ivan@example.com');
  });

  test('"Book another" resets the flow', async ({ page }) => {
    await completeBooking(page, 'Анна Иванова', 'anna@example.com');

    await page.getByRole('button', { name: 'Забронировать еще' }).click();

    await expect(page.getByText('Календарь')).toBeVisible();
  });

  test('back button from confirm returns to slot selection', async ({ page }) => {
    const tomorrow = getTomorrowUTC();
    await page.goto('/booking');

    await navigateToMonth(page, tomorrow.month, tomorrow.year);
    await selectDay(page, tomorrow.day);
    await selectFirstSlot(page);

    await page.getByRole('button', { name: 'Продолжить' }).click();
    await expect(page.getByText('Подтверждение записи')).toBeVisible();

    // Click back ("Изменить")
    await page.getByRole('button', { name: 'Изменить' }).click();

    // Should see slot list again
    await expect(page.getByText('Статус слотов')).toBeVisible();
  });

  test('month navigation works', async ({ page }) => {
    await page.goto('/booking');

    const monthLabel = page.getByText(/\d{4} г\./);
    const currentMonthText = await monthLabel.textContent();

    // Click next month (→)
    await page.locator('button').filter({ hasText: '→' }).click();
    const nextMonthText = await monthLabel.textContent();
    expect(nextMonthText).not.toBe(currentMonthText);

    // Click prev month (←)
    await page.locator('button').filter({ hasText: '←' }).click();
    const backText = await monthLabel.textContent();
    expect(backText).toBe(currentMonthText);
  });
});
