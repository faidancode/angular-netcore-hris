import { test, expect } from '@playwright/test';
import { loginAndOpenDepartments } from './helpers/departments.helper';

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Department CRUD', () => {
  test('should display department list', async ({ page }) => {
    await loginAndOpenDepartments(page);

    await expect(page.getByText('Engineering')).toBeVisible();
    await expect(page.getByText('Human Resources')).toBeVisible();
  });

  test('should create department', async ({ page }) => {
    await page.route('**/departments', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: '3', name: 'Finance', isActive: true },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAndOpenDepartments(page);

    await page.getByRole('button', { name: /add department/i }).click();
    await page.getByLabel('Department Name').fill('Finance');
    await page.getByRole('button', { name: /create department/i }).click();

    await expect(page.getByText(/saved successfully/i)).toBeVisible();
  });

  test('should show validation error when name is empty', async ({ page }) => {
    await loginAndOpenDepartments(page);

    await page.getByRole('button', { name: /add department/i }).click();
    await page.getByLabel('Department Name').clear();
    await page.getByRole('button', { name: /create department/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test('should show conflict error when name already exists', async ({ page }) => {
    await page.route('**/departments', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Department name is already in use.',
          }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAndOpenDepartments(page);

    await page.getByRole('button', { name: /add department/i }).click();
    await page.getByLabel('Department Name').fill('Engineering');
    await page.getByRole('button', { name: /create department/i }).click();

    await expect(page.getByText(/already in use/i)).toBeVisible();
  });

  test('should update department', async ({ page }) => {
    await page.route('**/departments/1', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAndOpenDepartments(page);

    await page
      .getByRole('row', { name: /engineering/i })
      .locator('.action-icon-btn')
      .first()
      .click();

    await expect(page.getByLabel('Department Name')).toHaveValue('Engineering');
    await page.getByLabel('Department Name').fill('Engineering Updated');
    await page.getByRole('button', { name: /update department/i }).click();

    await expect(page.getByText(/saved successfully/i)).toBeVisible();
  });

  test('should cancel update department', async ({ page }) => {
    await loginAndOpenDepartments(page);

    await page
      .getByRole('row', { name: /engineering/i })
      .locator('.action-icon-btn')
      .first()
      .click();

    await expect(page.getByLabel('Department Name')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByLabel('Department Name')).not.toBeVisible();
  });

  test('should delete department', async ({ page }) => {
    await page.route('**/departments/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAndOpenDepartments(page);

    await page
      .getByRole('row', { name: /engineering/i })
      .locator('.action-icon-btn.delete')
      .click();

    await page.getByRole('button', { name: /hapus/i }).click();

    await expect(page.getByText(/berhasil dihapus/i)).toBeVisible();
  });

  test('should cancel delete department', async ({ page }) => {
    await loginAndOpenDepartments(page);

    await page
      .getByRole('row', { name: /engineering/i })
      .locator('.action-icon-btn.delete')
      .click();

    await page.getByRole('button', { name: /batal/i }).click();

    await expect(page.getByText('Engineering')).toBeVisible();
  });

  test('should search departments', async ({ page }) => {
    await loginAndOpenDepartments(page);

    await page.route('**/departments**', async (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const search = url.searchParams.get('search') ?? '';
        const filtered = search.toLowerCase() === 'engineering'
          ? [mockDepartments.data[0]]
          : mockDepartments.data;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockDepartments,
            data: filtered,
            meta: {
              ...mockDepartments.meta,
              total: filtered.length,
              totalPages: 1,
              hasNextPage: false,
            },
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.getByPlaceholder(/search units/i).fill('Engineering');
    await expect(page.getByText('Engineering')).toBeVisible();

    await expect(page.getByText('Human Resources')).not.toBeVisible();
  });
});
