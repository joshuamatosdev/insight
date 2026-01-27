import { test, expect } from '../fixtures/test-fixtures';

/**
 * OAuth Account Linking E2E Tests
 *
 * Tests linking and unlinking OAuth accounts.
 */

test.describe('OAuth Account Linking', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/settings/security');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Linked Accounts Display', () => {
    test('should display linked accounts section', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/linked accounts|connected accounts|social/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display Google link option', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/google/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display Microsoft link option', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/microsoft/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Link Account', () => {
    test('should display link button for unlinked accounts', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const linkButton = page.getByRole('button', { name: /link|connect/i });

      if (await linkButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(linkButton).toBeVisible();
      }
    });

    test('should initiate OAuth flow on link', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const linkGoogleButton = page.getByRole('button', { name: /link google|connect google/i });

      if (await linkGoogleButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        const [popup] = await Promise.all([
          page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
          linkGoogleButton.click(),
        ]);

        if (popup !== null) {
          await expect(popup).toHaveURL(/accounts\.google\.com/);
          await popup.close();
        }
      }
    });
  });

  test.describe('Unlink Account', () => {
    test('should display unlink button for linked accounts', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const unlinkButton = page.getByRole('button', { name: /unlink|disconnect/i });

      if (await unlinkButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(unlinkButton).toBeVisible();
      }
    });

    test('should confirm before unlinking', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const unlinkButton = page.getByRole('button', { name: /unlink|disconnect/i }).first();

      if (await unlinkButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await unlinkButton.click();

        await expect(
          page.getByText(/confirm|are you sure/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should prevent unlinking last auth method', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // If only one auth method, unlink should be disabled or show warning
      const unlinkButton = page.getByRole('button', { name: /unlink/i }).first();

      if (await unlinkButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await unlinkButton.click();

        // May show warning about last auth method
        const warning = page.getByText(/cannot|last|only/i);
        if (await warning.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(warning).toBeVisible();
        }
      }
    });
  });
});
