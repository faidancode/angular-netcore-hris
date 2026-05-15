import { expect, Page } from '@playwright/test';
import { mockLoginResponse } from '../fixtures/auth.fixture';

const mockDepartments = {
  success: true,
  message: 'Success',
  data: [
    {
      id: '1',
      name: 'Engineering',
      description: '',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Human Resources',
      description: '',
      isActive: true,
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ],
  meta: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export async function loginAndOpenDepartments(page: Page) {
  await page.context().addInitScript(
    (data) => {
      window.localStorage.setItem('hris_refresh_token', data.token);
    },
    { token: 'mock-refresh-token' },
  );

  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLoginResponse),
    });
  });

  await page.route('**/departments**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDepartments),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/dashboard/);

  await expect(page.locator('.section-label')).toBeVisible({ timeout: 10000 });

  const employeesBtn = page.getByRole('button', { name: 'Employees' });
  await employeesBtn.waitFor({ state: 'visible' });
  await employeesBtn.click();

  const departmentLink = page.getByRole('link', { name: 'Department' });
  await expect(departmentLink).toBeVisible();
  await departmentLink.click();

  await expect(page).toHaveURL(/departments/);
}
