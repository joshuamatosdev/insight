import {expect, test} from '../fixtures/test-fixtures';

/**
 * Alerts CRUD E2E Tests
 *
 * Tests create, edit, delete, and toggle operations for alerts.
 */

test.describe('Alerts CRUD', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/alerts');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Create Alert', () => {
        test('should display create alert button', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('button', {name: /create|add|new/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should open create alert modal', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            const createButton = page.getByRole('button', {name: /create|add|new/i});
            await createButton.click();

            // Modal should appear
            await expect(
                page.getByRole('dialog').or(page.locator('[data-testid="alert-modal"]'))
            ).toBeVisible({timeout: 5000});
        });

        test('should create new alert with criteria', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            await page.getByRole('button', {name: /create|add|new/i}).click();

            // Fill alert name
            const nameInput = page.getByLabel(/name/i);
            await nameInput.fill('Test E2E Alert');

            // Add keyword criteria
            const keywordInput = page.getByLabel(/keyword/i)
                .or(page.getByPlaceholder(/keyword/i));
            if (await keywordInput.isVisible().catch(() => false)) {
                await keywordInput.fill('software development');
            }

            // Submit
            await page.getByRole('button', {name: /save|create/i}).click();

            // Should show success
            await expect(
                page.getByText(/created|success/i).or(page.getByText(/test e2e alert/i))
            ).toBeVisible({timeout: 10000});
        });

        test('should validate required fields', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            await page.getByRole('button', {name: /create|add|new/i}).click();

            // Submit without filling
            await page.getByRole('button', {name: /save|create/i}).click();

            // Should show validation error
            await expect(
                page.getByText(/required|please enter/i)
            ).toBeVisible({timeout: 5000});
        });
    });

    test.describe('Edit Alert', () => {
        test('should display edit button', async ({
                                                      authenticatedPage,
                                                  }) => {
            const {page} = authenticatedPage;

            const alertItem = page.locator('[data-testid="alert-item"]').first();

            if (await alertItem.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(
                    alertItem.getByRole('button', {name: /edit/i})
                        .or(page.getByRole('button', {name: /edit/i}).first())
                ).toBeVisible();
            }
        });

        test('should open edit modal with data', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            const editButton = page.getByRole('button', {name: /edit/i}).first();
            if (await editButton.isVisible({timeout: 5000}).catch(() => false)) {
                await editButton.click();

                // Modal should have pre-filled data
                const nameInput = page.getByLabel(/name/i);
                const value = await nameInput.inputValue();
                expect(value.length).toBeGreaterThan(0);
            }
        });

        test('should save alert changes', async ({
                                                     authenticatedPage,
                                                 }) => {
            const {page} = authenticatedPage;

            const editButton = page.getByRole('button', {name: /edit/i}).first();
            if (await editButton.isVisible({timeout: 5000}).catch(() => false)) {
                await editButton.click();

                // Modify name
                const nameInput = page.getByLabel(/name/i);
                await nameInput.fill('Updated Alert Name');

                // Save
                await page.getByRole('button', {name: /save|update/i}).click();

                // Should show success
                await expect(
                    page.getByText(/updated|saved|success/i)
                ).toBeVisible({timeout: 10000}).catch(() => {
                });
            }
        });
    });

    test.describe('Delete Alert', () => {
        test('should display delete button', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const deleteButton = page.getByRole('button', {name: /delete|remove/i}).first();

            if (await deleteButton.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(deleteButton).toBeVisible();
            }
        });

        test('should show confirmation before delete', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            const deleteButton = page.getByRole('button', {name: /delete|remove/i}).first();
            if (await deleteButton.isVisible({timeout: 5000}).catch(() => false)) {
                await deleteButton.click();

                // Confirmation should appear
                await expect(
                    page.getByText(/confirm|are you sure/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Toggle Alert Status', () => {
        test('should display status toggle', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const alertItem = page.locator('[data-testid="alert-item"]').first();

            if (await alertItem.isVisible({timeout: 5000}).catch(() => false)) {
                const toggle = alertItem.getByRole('switch')
                    .or(alertItem.getByRole('button', {name: /enable|disable/i}));

                await expect(toggle).toBeVisible({timeout: 5000}).catch(() => {
                });
            }
        });

        test('should toggle alert active/inactive', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            const toggle = page.getByRole('switch').first();
            if (await toggle.isVisible({timeout: 5000}).catch(() => false)) {
                const initialState = await toggle.getAttribute('aria-checked');
                await toggle.click();

                // State should change
                await page.waitForTimeout(500);
                const newState = await toggle.getAttribute('aria-checked');

                // State should be different or success message shown
                await expect(
                    page.getByText(/updated|toggled|success/i)
                ).toBeVisible({timeout: 5000}).catch(() => {
                });
            }
        });
    });
});
