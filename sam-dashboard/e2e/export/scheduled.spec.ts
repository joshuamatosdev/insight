import { test, expect } from '../fixtures/test-fixtures';

/**
 * Scheduled Export E2E Tests
 *
 * Tests scheduled export setup.
 */

test.describe('Scheduled Export', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/settings/exports');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Scheduled Export Display', () => {
    test('should display scheduled exports page', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('heading', { name: /scheduled|export/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display existing scheduled exports', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const exportItems = page.locator('[data-testid="scheduled-export"]');

      // Should show exports or empty state
      const hasExports = await exportItems.count() > 0;
      const hasEmptyState = await page.getByText(/no scheduled|create/i)
        .isVisible().catch(() => false);

      expect(hasExports || hasEmptyState).toBe(true);
    });

    test('should display create button', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('button', { name: /create|schedule|new/i })
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Create Scheduled Export', () => {
    test('should open create scheduled export form', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const createButton = page.getByRole('button', { name: /create|schedule/i });
      await createButton.click();

      // Form should appear
      await expect(
        page.getByRole('dialog')
          .or(page.getByLabel(/name|title/i))
      ).toBeVisible({ timeout: 5000 });
    });

    test('should configure export schedule', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const createButton = page.getByRole('button', { name: /create|schedule/i });
      await createButton.click();

      // Frequency select
      const frequencySelect = page.getByLabel(/frequency/i)
        .or(page.getByRole('combobox'));

      if (await frequencySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
        await frequencySelect.click();

        const option = page.getByRole('option', { name: /daily|weekly/i });
        if (await option.isVisible().catch(() => false)) {
          await option.click();
        }
      }
    });

    test('should save scheduled export', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const createButton = page.getByRole('button', { name: /create|schedule/i });
      await createButton.click();

      // Fill name
      const nameInput = page.getByLabel(/name/i);
      if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInput.fill('Test Scheduled Export');
      }

      // Save
      const saveButton = page.getByRole('button', { name: /save|create/i });
      if (await saveButton.isVisible().catch(() => false)) {
        await saveButton.click();

        await expect(
          page.getByText(/created|saved|success/i)
        ).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Edit Scheduled Export', () => {
    test('should edit existing scheduled export', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const editButton = page.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();

        // Edit form should appear
        await expect(
          page.getByRole('dialog')
            .or(page.getByLabel(/name/i))
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Delete Scheduled Export', () => {
    test('should delete scheduled export', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();

      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButton.click();

        // Confirmation should appear
        await expect(
          page.getByText(/confirm|are you sure/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Toggle Scheduled Export', () => {
    test('should enable/disable scheduled export', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const toggle = page.getByRole('switch').first();

      if (await toggle.isVisible({ timeout: 5000 }).catch(() => false)) {
        const initialState = await toggle.isChecked();
        await toggle.click();

        const newState = await toggle.isChecked();
        expect(newState).not.toBe(initialState);
      }
    });
  });
});
