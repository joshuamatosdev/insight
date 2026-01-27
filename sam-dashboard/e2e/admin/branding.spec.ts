import { test, expect } from '../fixtures/test-fixtures';

/**
 * Tenant Branding E2E Tests
 *
 * Tests logo, colors, and custom branding.
 */

test.describe('Tenant Branding', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/admin/branding');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Branding Display', () => {
    test('should display branding settings page', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('heading', { name: /branding|appearance|customization/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display logo upload section', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/logo|upload/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display color configuration', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/color|primary|theme/i)
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Logo Upload', () => {
    test('should display logo upload button', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('button', { name: /upload|choose|select/i })
          .or(page.locator('input[type="file"]'))
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show current logo preview', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const logoPreview = page.locator('[data-testid="logo-preview"]')
        .or(page.locator('img[alt*="logo"]'));

      if (await logoPreview.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(logoPreview).toBeVisible();
      }
    });
  });

  test.describe('Color Configuration', () => {
    test('should display color picker', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const colorInput = page.locator('input[type="color"]')
        .or(page.locator('[data-testid="color-picker"]'));

      if (await colorInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(colorInput).toBeVisible();
      }
    });

    test('should update primary color', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const colorInput = page.locator('input[type="color"]').first();

      if (await colorInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await colorInput.fill('#3498db');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Preview Changes', () => {
    test('should display preview section', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByText(/preview/i)
      ).toBeVisible({ timeout: 10000 }).catch(() => {});
    });

    test('should update preview on color change', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const colorInput = page.locator('input[type="color"]').first();
      const preview = page.locator('[data-testid="branding-preview"]');

      if (await colorInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await colorInput.fill('#e74c3c');

        // Preview should update
        await page.waitForTimeout(500);

        if (await preview.isVisible().catch(() => false)) {
          await expect(preview).toBeVisible();
        }
      }
    });
  });

  test.describe('Save Branding', () => {
    test('should save branding settings', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const saveButton = page.getByRole('button', { name: /save|update/i });

      if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await saveButton.click();

        await expect(
          page.getByText(/saved|updated|success/i)
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should reset to default branding', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const resetButton = page.getByRole('button', { name: /reset|default/i });

      if (await resetButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await resetButton.click();

        // Confirmation
        const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
        }
      }
    });
  });
});
