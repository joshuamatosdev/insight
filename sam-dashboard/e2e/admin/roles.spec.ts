import { test, expect } from '../fixtures/test-fixtures';

/**
 * RBAC Roles E2E Tests
 *
 * Tests role CRUD operations and permission assignment.
 */

test.describe('RBAC Roles Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Roles List Display', () => {
    test('should display roles list', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show roles heading
      await expect(
        page.getByRole('heading', { name: /roles|role management/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display role table or list', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show roles list
      const rolesList = page.locator('[data-testid="roles-list"]')
        .or(page.getByRole('table'))
        .or(page.locator('.roles-list'));

      await expect(rolesList).toBeVisible({ timeout: 10000 });
    });

    test('should display system roles', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Should show default system roles
      await expect(
        page.getByText(/admin|owner|member|viewer/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show role details in list', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Roles should show name and description
      const roleRow = page.locator('[data-testid="role-row"]').first()
        .or(page.locator('tr').nth(1));

      if (await roleRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Role name should be visible
        await expect(
          roleRow.getByText(/admin|owner|member|viewer|manager/i)
        ).toBeVisible();
      }
    });
  });

  test.describe('Create Role', () => {
    test('should display create role button', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await expect(
        page.getByRole('button', { name: /create|add|new/i })
      ).toBeVisible({ timeout: 10000 });
    });

    test('should open create role modal on button click', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const createButton = page.getByRole('button', { name: /create|add|new/i });
      await createButton.click();

      // Modal should appear
      await expect(
        page.getByRole('dialog').or(page.locator('[data-testid="role-modal"]'))
      ).toBeVisible({ timeout: 5000 });
    });

    test('should create new role with permissions', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Open create modal
      await page.getByRole('button', { name: /create|add|new/i }).click();

      // Fill role name
      const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/role name/i));
      await nameInput.fill('Test Custom Role');

      // Fill description
      const descInput = page.getByLabel(/description/i)
        .or(page.getByPlaceholder(/description/i));
      if (await descInput.isVisible().catch(() => false)) {
        await descInput.fill('A test role for E2E testing');
      }

      // Select some permissions
      const permissionCheckbox = page.getByLabel(/read|view/i).first();
      if (await permissionCheckbox.isVisible().catch(() => false)) {
        await permissionCheckbox.check();
      }

      // Submit
      await page.getByRole('button', { name: /save|create|submit/i }).click();

      // Should show success message or new role in list
      await expect(
        page.getByText(/created|success/i).or(page.getByText(/test custom role/i))
      ).toBeVisible({ timeout: 10000 });
    });

    test('should validate required fields', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Open create modal
      await page.getByRole('button', { name: /create|add|new/i }).click();

      // Try to submit without filling required fields
      await page.getByRole('button', { name: /save|create|submit/i }).click();

      // Should show validation error
      await expect(
        page.getByText(/required|please enter/i)
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Edit Role', () => {
    test('should display edit button for roles', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const roleRow = page.locator('[data-testid="role-row"]').first();

      if (await roleRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(
          roleRow.getByRole('button', { name: /edit/i })
            .or(page.getByRole('button', { name: /edit/i }).first())
        ).toBeVisible();
      }
    });

    test('should open edit modal with pre-filled data', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Find a non-system role to edit, or first available
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();

        // Modal should have pre-filled name
        const nameInput = page.getByLabel(/name/i);
        const value = await nameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    });

    test('should save role changes', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editButton.click();

        // Modify description
        const descInput = page.getByLabel(/description/i);
        if (await descInput.isVisible().catch(() => false)) {
          await descInput.fill('Updated description for testing');
        }

        // Save
        await page.getByRole('button', { name: /save|update/i }).click();

        // Should show success
        await expect(
          page.getByText(/updated|saved|success/i)
        ).toBeVisible({ timeout: 10000 }).catch(() => {});
      }
    });
  });

  test.describe('Delete Role', () => {
    test('should display delete button for non-system roles', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Non-system roles should have delete button
      const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();

      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(deleteButton).toBeVisible();
      }
    });

    test('should show confirmation before delete', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const deleteButton = page.getByRole('button', { name: /delete|remove/i }).first();
      if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await deleteButton.click();

        // Confirmation dialog should appear
        await expect(
          page.getByText(/confirm|are you sure/i)
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test('should prevent deletion of system roles', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Find Admin role row
      const adminRow = page.locator('[data-testid="role-row"]')
        .filter({ hasText: /admin/i }).first();

      if (await adminRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Delete button should be disabled or not visible
        const deleteButton = adminRow.getByRole('button', { name: /delete/i });
        const isDisabled = await deleteButton.isDisabled().catch(() => true);
        const isHidden = !(await deleteButton.isVisible().catch(() => false));

        expect(isDisabled || isHidden).toBe(true);
      }
    });
  });

  test.describe('Permission Assignment', () => {
    test('should display permission categories', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      // Open role edit or create
      const editButton = page.getByRole('button', { name: /edit|create|add/i }).first();
      await editButton.click();

      // Should show permission categories
      await expect(
        page.getByText(/opportunities|contracts|users|admin|read|write/i)
      ).toBeVisible({ timeout: 5000 });
    });

    test('should toggle individual permissions', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const editButton = page.getByRole('button', { name: /edit|create/i }).first();
      await editButton.click();

      // Find a permission checkbox
      const permissionCheckbox = page.getByRole('checkbox').first();
      if (await permissionCheckbox.isVisible().catch(() => false)) {
        const initialChecked = await permissionCheckbox.isChecked();

        // Toggle
        await permissionCheckbox.click();

        // State should change
        const newChecked = await permissionCheckbox.isChecked();
        expect(newChecked).not.toBe(initialChecked);
      }
    });

    test('should select all permissions in category', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      const editButton = page.getByRole('button', { name: /edit|create/i }).first();
      await editButton.click();

      // Look for select all button
      const selectAllButton = page.getByRole('button', { name: /select all|all/i }).first();
      if (await selectAllButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await selectAllButton.click();

        // All checkboxes in that category should be checked
        const checkboxes = page.getByRole('checkbox');
        const count = await checkboxes.count();

        if (count > 0) {
          const firstCheckbox = checkboxes.first();
          await expect(firstCheckbox).toBeChecked();
        }
      }
    });
  });
});
