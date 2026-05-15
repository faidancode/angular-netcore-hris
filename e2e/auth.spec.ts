import { test, expect } from '@playwright/test';

import { mockLoginResponse } from './fixtures/auth.fixture';

test.describe('Authentication Flow', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLoginResponse),
      });
    });

    await page.goto('/login');

    await page.getByLabel('Email Address').fill('admin@example.com');
    await page.getByLabel('Password').fill('password');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/dashboard/);

    await expect(page.locator('body')).toContainText('Dashboard');

    const refreshToken = await page.evaluate(() => localStorage.getItem('hris_refresh_token'));

    expect(refreshToken).toBe('mock-refresh-token');
  });

  test('should logout and redirect to login', async ({ page }) => {
    // ✅ STEP 1: Setup route intercept SEBELUM navigasi
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLoginResponse),
      });
    });

    // ✅ STEP 2: Inject localStorage SEBELUM navigasi (pakai addInitScript)
    await page.addInitScript(() => {
      localStorage.setItem('hris_refresh_token', 'mock-refresh-token');
    });

    await page.goto('/dashboard');

    // ✅ STEP 3: Tunggu UI stabil — pastikan user sudah ter-render
    // Hindari klik saat komponen masih re-render "Anonymous" → "Admin User"
    await expect(page.getByText('Admin User')).toBeVisible();
    await page.waitForLoadState('networkidle');

    await page.getByTestId('shell-profile-trigger').click();

    // STEP 5: Scope locator ke .profile-dropdown agar tidak ambigu
    const logoutBtn = page.locator('.profile-dropdown').getByRole('button', { name: /logout/i });

    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // ✅ STEP 6: Verifikasi redirect dan state bersih
    await expect(page).toHaveURL(/login/);
    const refreshToken = await page.evaluate(() => localStorage.getItem('hris_refresh_token'));
    expect(refreshToken).toBeNull();
  });
});
