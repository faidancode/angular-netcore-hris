import { test, expect } from '@playwright/test';
import { mockLoginResponse } from './fixtures/auth.fixture';

const withPermissions = (permissions: { action: string; subject: string }[]) => ({
  ...mockLoginResponse,
  data: {
    ...mockLoginResponse.data,
    permissions,
  },
});

test.describe('Permission Guard', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/departments');

    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to forbidden when permission is missing', async ({ page }) => {
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(withPermissions([{ action: 'read', subject: 'User' }])),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('hris_refresh_token', 'mock-refresh-token');
    });

    await page.goto('/departments');

    await expect(page).toHaveURL(/forbidden/);
  });

  test('should allow access when permission exists', async ({ page }) => {
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(withPermissions([{ action: 'read', subject: 'Department' }])),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('hris_refresh_token', 'mock-refresh-token');
    });

    await page.goto('/departments');

    await expect(page).toHaveURL(/departments/);
  });
});
