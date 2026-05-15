// e2e/global-setup.ts
import { chromium } from '@playwright/test';
import { mockLoginResponse } from './fixtures/auth.fixture';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({ body: JSON.stringify(mockLoginResponse) });
  });

  await page.goto('http://localhost:4200/login');
  await page.getByLabel(/email/i).fill('admin@example.com');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/dashboard/);

  // Simpan state (localStorage, cookies, dll)
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
  await browser.close();
}
