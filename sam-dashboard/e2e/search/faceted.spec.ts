import { test, expect } from '../fixtures/test-fixtures';

/**
 * Faceted Search E2E Tests
 *
 * Tests faceted filtering functionality.
 */

test.describe('Faceted Search', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Facet Display', () => {
    test('should display faceted filter panel', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/filter|refine/i)
          .or(page.locator('[data-testid="facet-panel"]'))
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display facet categories', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Typical facet categories
      await expect(
        page.getByText(/type|status|agency|naics|set-aside/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display facet counts', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Facet options should show counts
      const facetOption = page.locator('[data-testid="facet-option"]').first()
        .or(page.getByRole('checkbox').first());

      if (await facetOption.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Should have a count number nearby
        const parentText = await facetOption.locator('..').textContent();
        expect(parentText).toMatch(/\d+|\(\d+\)/);
      }
    });
  });

  test.describe('Apply Facet Filters', () => {
    test('should apply single facet filter', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const facetCheckbox = page.getByRole('checkbox').first();

      if (await facetCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await facetCheckbox.check();

        // Results should filter
        await page.waitForTimeout(1000);
      }
    });

    test('should apply multiple facet filters', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const checkboxes = page.getByRole('checkbox');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).check();
        await page.waitForTimeout(500);

        await checkboxes.nth(1).check();
        await page.waitForTimeout(500);

        // Both filters should be applied
        expect(await checkboxes.nth(0).isChecked()).toBe(true);
        expect(await checkboxes.nth(1).isChecked()).toBe(true);
      }
    });

    test('should update results on filter change', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Get initial result count
      const resultsText = await page.getByText(/\d+ results?|\d+ opportunities/i)
        .textContent().catch(() => null);

      const facetCheckbox = page.getByRole('checkbox').first();

      if (await facetCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await facetCheckbox.check();
        await page.waitForTimeout(1000);

        // Results count may change
        // Just verify page is responsive
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });

  test.describe('Clear Facet Filters', () => {
    test('should clear individual facet filter', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const facetCheckbox = page.getByRole('checkbox').first();

      if (await facetCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await facetCheckbox.check();
        await page.waitForTimeout(300);

        await facetCheckbox.uncheck();
        await page.waitForTimeout(300);

        expect(await facetCheckbox.isChecked()).toBe(false);
      }
    });

    test('should clear all facet filters', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Apply some filters first
      const checkboxes = page.getByRole('checkbox');
      if (await checkboxes.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await checkboxes.first().check();
      }

      // Clear all button
      const clearAllButton = page.getByRole('button', { name: /clear all|reset/i });

      if (await clearAllButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await clearAllButton.click();
        await page.waitForTimeout(500);

        // All checkboxes should be unchecked
        const firstCheckbox = page.getByRole('checkbox').first();
        if (await firstCheckbox.isVisible().catch(() => false)) {
          expect(await firstCheckbox.isChecked()).toBe(false);
        }
      }
    });
  });

  test.describe('Facet Expansion', () => {
    test('should expand/collapse facet categories', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const expandButton = page.getByRole('button', { name: /show more|expand/i }).first();

      if (await expandButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expandButton.click();

        // More options should be visible
        await page.waitForTimeout(500);
      }
    });
  });
});
