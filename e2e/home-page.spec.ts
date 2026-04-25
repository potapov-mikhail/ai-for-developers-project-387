import { test, expect } from './fixtures/db';

test.describe('Home Page', () => {
  test('renders landing with heading and CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('Calendar');
    await expect(page.getByText('БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Записаться →' })).toBeVisible();
  });

  test('CTA navigates to /booking', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Записаться →' }).click();
    await expect(page).toHaveURL('/booking');
    await expect(page.locator('h1')).toHaveText('Запись на звонок');
  });
});
