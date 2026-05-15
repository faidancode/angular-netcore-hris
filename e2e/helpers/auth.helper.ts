import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.route('**/auth/login', async (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          permissions: [{ action: 'manage', subject: 'all' }],
        },
      }),
    });
  });

  await page.goto('/login');

  await page.getByLabel('Email Address').fill('admin@example.com');
  await page.getByLabel('Password').fill('password');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/dashboard/);

  await page.waitForLoadState('networkidle');
}
