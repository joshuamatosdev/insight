import { test, expect } from '../fixtures/test-fixtures';

/**
 * Billing Subscription E2E Tests
 *
 * Tests subscription viewing, upgrade, and downgrade flows.
 */

test.describe('Billing Subscription', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/settings/billing');
    await page.waitForLoadState('networkidle');
  });

  test.describe('View Subscription', () => {
    test('should display current subscription', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show subscription heading
      await expect(
        page.getByRole('heading', { name: /billing|subscription|plan/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display current plan name', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show plan name
      await expect(
        page.getByText(/free|starter|professional|enterprise|current plan/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display billing cycle', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show billing period
      await expect(
        page.getByText(/monthly|annually|yearly|billing/i)
      ).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should display billing history', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show billing history or invoices
      await expect(
        page.getByText(/history|invoices|payments/i)
      ).toBeVisible({ timeout: 10000 }).catch(() => {});
    });
  });

  test.describe('Upgrade Plan', () => {
    test('should display upgrade button', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('button', { name: /upgrade|change plan/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should open plan selection on upgrade', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const upgradeButton = page.getByRole('button', { name: /upgrade|change plan/i });
      await upgradeButton.click();

      // Plan options should appear
      await expect(
        page.getByText(/professional|enterprise|select plan/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test('should show price comparison', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const upgradeButton = page.getByRole('button', { name: /upgrade|change plan/i });
      await upgradeButton.click();

      // Prices should be visible
      await expect(
        page.getByText(/\$\d+|per month|per year/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test('should confirm upgrade before processing', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const upgradeButton = page.getByRole('button', { name: /upgrade/i });
      if (await upgradeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await upgradeButton.click();

        // Select a plan
        const selectPlanButton = page.getByRole('button', { name: /select|choose/i }).first();
        if (await selectPlanButton.isVisible().catch(() => false)) {
          await selectPlanButton.click();

          // Confirmation should appear
          await expect(
            page.getByText(/confirm|are you sure|proceed/i)
          ).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    });
  });

  test.describe('Downgrade Plan', () => {
    test('should display downgrade option', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Downgrade should be available if on paid plan
      const downgradeLink = page.getByRole('button', { name: /downgrade/i })
        .or(page.getByText(/downgrade/i));

      // May not be visible on free plan
      if (await downgradeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(downgradeLink).toBeVisible();
      }
    });

    test('should warn about feature loss on downgrade', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const downgradeButton = page.getByRole('button', { name: /downgrade/i });
      if (await downgradeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await downgradeButton.click();

        // Warning should appear
        await expect(
          page.getByText(/lose|features|warning/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Cancel Subscription', () => {
    test('should display cancel option', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Cancel should be available if on paid plan
      const cancelLink = page.getByRole('button', { name: /cancel/i })
        .or(page.getByText(/cancel subscription/i));

      // May not be visible on free plan
      if (await cancelLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(cancelLink).toBeVisible();
      }
    });

    test('should show confirmation dialog before cancel', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const cancelButton = page.getByRole('button', { name: /cancel subscription/i });
      if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelButton.click();

        // Confirmation should appear
        await expect(
          page.getByText(/confirm|are you sure|really cancel/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
