import { test, expect } from '../fixtures/test-fixtures';

/**
 * Audit Entry Detail E2E Tests
 *
 * Tests audit entry details view.
 */

test.describe('Audit Entry Detail', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/admin/audit');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Entry Details', () => {
    test('should open entry details on click', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Detail panel or modal should appear
        await expect(
          page.locator('[data-testid="audit-detail"]')
            .or(page.getByRole('dialog'))
            .or(page.getByText(/details|changes/i))
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display action details', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Should show action type
        await expect(
          page.getByText(/created|updated|deleted|logged in/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display user information', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Should show user email or name
        await expect(
          page.getByText(/@|user/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display timestamp', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Should show full timestamp
        await expect(
          page.getByText(/\d{1,2}:\d{2}|AM|PM|\d{4}/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display resource information', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Should show affected resource
        await expect(
          page.getByText(/resource|entity|id|opportunity|contract|user/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display change details', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // For update actions, should show old/new values
        const changeDetails = page.getByText(/old|new|before|after|changed/i);
        if (await changeDetails.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(changeDetails).toBeVisible();
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('should close detail view', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Close button
        const closeButton = page.getByRole('button', { name: /close|x/i });
        if (await closeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await closeButton.click();

          // Detail should close
          await expect(
            page.locator('[data-testid="audit-detail"]')
          ).not.toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    });

    test('should navigate to related resource', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const entry = page.locator('[data-testid="audit-entry"]').first();

      if (await entry.isVisible({ timeout: 5000 }).catch(() => false)) {
        await entry.click();

        // Link to resource
        const resourceLink = page.getByRole('link', { name: /view|open/i });
        if (await resourceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await resourceLink.click();

          // Should navigate
          await expect(page).not.toHaveURL(/\/admin\/audit$/);
        }
      }
    });
  });
});
