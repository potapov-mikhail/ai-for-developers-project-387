import { test, expect } from './fixtures/db';
import type { Page } from '@playwright/test';

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
    await page.locator('button').filter({ hasText: '→' }).click();
  }
}

async function selectDay(page: Page, day: number) {
  await page
    .locator('.grid.grid-cols-7 button:not([disabled])')
    .filter({ hasText: new RegExp(`^${day}$`) })
    .first()
    .click();
}

async function waitForSlots(page: Page) {
  const slotButton = page.locator('button').filter({ hasText: /\d{2}:\d{2} - \d{2}:\d{2}/ });
  await expect(slotButton.first()).toBeVisible({ timeout: 10_000 });
  return slotButton;
}

test.describe('Slot Conflicts', () => {
  test('booked slot disappears from slot list', async ({ page }) => {
    const tomorrow = getTomorrowUTC();

    // Book the first slot
    await page.goto('/booking');
    await navigateToMonth(page, tomorrow.month, tomorrow.year);
    await selectDay(page, tomorrow.day);

    const slotButtons = await waitForSlots(page);
    const firstSlotText = await slotButtons.first().textContent();
    const slotTimeMatch = firstSlotText?.match(/(\d{2}:\d{2} - \d{2}:\d{2})/);
    const bookedSlotTime = slotTimeMatch?.[1];

    await slotButtons.first().click();
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await page.getByPlaceholder('Имя').fill('Конфликт Тест');
    await page.getByPlaceholder('Email').fill('conflict@test.com');
    await page.getByRole('button', { name: 'Подтвердить запись' }).click();

    await expect(page.getByText('Бронь подтверждена. До встречи!')).toBeVisible({
      timeout: 10_000,
    });

    // Click "Book another" and go to the same date
    await page.getByRole('button', { name: 'Забронировать еще' }).click();

    await navigateToMonth(page, tomorrow.month, tomorrow.year);
    await selectDay(page, tomorrow.day);
    await waitForSlots(page);

    // The booked slot time should no longer be in the list
    if (bookedSlotTime) {
      const remaining = page.locator('button').filter({ hasText: bookedSlotTime });
      await expect(remaining).toHaveCount(0);
    }
  });

  test('double booking returns conflict via API', async ({ page, resetDb }) => {
    const tomorrow = getTomorrowUTC();

    // Book a slot via API to create a conflict
    const slotsRes = await page.request.get(
      `http://localhost:3000/api/v1/public/event-types/${resetDb}/slots?date=${tomorrow.dateStr}`,
    );
    const slots = await slotsRes.json();
    const targetSlot = slots[0];

    // First booking via API
    const bookRes = await page.request.post('http://localhost:3000/api/v1/public/bookings', {
      data: {
        eventTypeId: resetDb,
        startAt: targetSlot.startAt,
        guestName: 'API User',
        guestEmail: 'api@test.com',
      },
    });
    expect(bookRes.status()).toBe(201);

    // Second booking of the same slot via API — should return 409
    const conflictRes = await page.request.post('http://localhost:3000/api/v1/public/bookings', {
      data: {
        eventTypeId: resetDb,
        startAt: targetSlot.startAt,
        guestName: 'Conflict User',
        guestEmail: 'conflict@test.com',
      },
    });
    expect(conflictRes.status()).toBe(409);
  });
});
