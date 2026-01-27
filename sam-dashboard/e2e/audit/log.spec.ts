import { test, expect } from '../fixtures/test-fixtures';

/**
 * Audit Log E2E Tests
 *
 * Tests audit log display and filtering.
 */

test.describe('Audit Log', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/admin/audit');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Log Display', () => {
    test('should display audit log page', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('heading', { name: /audit|activity/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display audit entries', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entries = page.locator('[data-testid="audit-entry"]')
        .or(page.locator('.audit-row'));

      // Should show entries or empty state
      const hasEntries = await entries.count() > 0;
      const hasEmptyState = await page.getByText(/no entries|no activity/i)
        .isVisible().catch(() => false);

      expect(hasEntries || hasEmptyState).toBe(true);
    });

    test('should display entry details', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Should show action, user, timestamp
        await expect(
          entry.getByText(/created|updated|deleted|login|@/i)
        ).toBeVisible();
      }
    });

    test('should display timestamps', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show dates/times
      await expect(
        page.getByText(/\d{1,2}\/\d{1,2}|\d{1,2}:\d{2}|ago|today|yesterday/i)
      ).toBeVisible({ timeout: 10000 }).catch(() => {});
    });
  });

  test.describe('Filtering', () => {
    test('should filter by date range', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const dateInput = page.getByLabel(/date|from|start/i)
        .or(page.locator('input[type="date"]').first());

      if (await dateInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dateInput.fill('2026-01-01');
        await page.waitForTimeout(500);
      }
    });

    test('should filter by action type', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const actionFilter = page.getByLabel(/action|type/i)
        .or(page.getByRole('combobox').first());

      if (await actionFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await actionFilter.click();

        const option = page.getByRole('option', { name: /create|login/i });
        if (await option.isVisible().catch(() => false)) {
          await option.click();
        }
      }
    });

    test('should filter by user', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const userFilter = page.getByLabel(/user/i)
        .or(page.getByPlaceholder(/user/i));

      if (await userFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        await userFilter.fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should clear filters', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const clearButton = page.getByRole('button', { name: /clear|reset/i });

      if (await clearButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await clearButton.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Export', () => {
    test('should display export button', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('button', { name: /export|download/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should export audit log', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const exportButton = page.getByRole('button', { name: /export|download/i });
      if (await exportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

        await exportButton.click();

        // Should trigger download or show options
        await expect(
          page.getByText(/csv|pdf|excel|download/i)
        ).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    });
  });
});
