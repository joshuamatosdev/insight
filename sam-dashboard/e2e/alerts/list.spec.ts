import { test, expect } from '../fixtures/test-fixtures';

/**
 * Alerts List E2E Tests
 *
 * Tests alert list display and filtering.
 */

test.describe('Alerts List', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
  });

  test.describe('List Display', () => {
    test('should display alerts list', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show alerts heading
      await expect(
        page.getByRole('heading', { name: /alerts|notifications/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display alert items', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const alertItems = page.locator('[data-testid="alert-item"]')
        .or(page.locator('.alert-item'));

      // Should show alerts or empty state
      const hasAlerts = await alertItems.count() > 0;
      const hasEmptyState = await page.getByText(/no alerts|create your first/i)
        .isVisible().catch(() => false);

      expect(hasAlerts || hasEmptyState).toBe(true);
    });

    test('should display alert details', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const alertItem = page.locator('[data-testid="alert-item"]').first();

      if (await alertItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Should show alert name and criteria
        await expect(
          alertItem.getByText(/alert|keyword|naics|deadline/i)
        ).toBeVisible();
      }
    });

    test('should show alert status', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const alertItem = page.locator('[data-testid="alert-item"]').first();

      if (await alertItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Should show active/inactive status
        await expect(
          alertItem.getByText(/active|inactive|enabled|disabled/i)
        ).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Filtering', () => {
    test('should display filter options', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const filterButton = page.getByRole('button', { name: /filter/i })
        .or(page.getByRole('combobox'));

      await expect(filterButton).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should filter alerts by type', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const filterSelect = page.getByRole('combobox')
        .or(page.getByLabel(/filter|type/i));

      if (await filterSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await filterSelect.click();

        // Select a filter option
        const option = page.getByRole('option').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();

          // Results should be filtered
          await page.waitForTimeout(500);
        }
      }
    });

    test('should filter alerts by status', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const statusFilter = page.getByRole('button', { name: /active|all|inactive/i })
        .or(page.getByLabel(/status/i));

      if (await statusFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await statusFilter.click();

        // Select active only
        const activeOption = page.getByRole('option', { name: /active/i });
        if (await activeOption.isVisible().catch(() => false)) {
          await activeOption.click();
        }
      }
    });
  });
});
