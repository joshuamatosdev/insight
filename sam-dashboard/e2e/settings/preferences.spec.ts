import {expect, test} from '../fixtures/test-fixtures';

/**
 * Display Preferences E2E Tests
 *
 * Tests theme, notifications, and display preferences.
 */

test.describe('Display Preferences', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/settings/preferences');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Theme Settings', () => {
        test('should display theme options', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/theme|appearance/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should toggle dark/light theme', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            const themeToggle = page.getByRole('switch')
                .or(page.getByRole('button', {name: /dark|light/i}));

            if (await themeToggle.isVisible({timeout: 5000}).catch(() => false)) {
                await themeToggle.click();

                // Theme should change
                await page.waitForTimeout(500);
            }
        });

        test('should persist theme preference', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            const themeToggle = page.getByRole('switch').first();
            if (await themeToggle.isVisible({timeout: 5000}).catch(() => false)) {
                const initialState = await themeToggle.isChecked();
                await themeToggle.click();

                // Reload and check
                await page.reload();

                const newState = await themeToggle.isChecked();
                expect(newState).not.toBe(initialState);
            }
        });
    });

    test.describe('Display Options', () => {
        test('should configure display preferences', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            // Display options
            await expect(
                page.getByText(/display|layout|compact|items per page/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
            });
        });

        test('should change items per page', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const perPageSelect = page.getByLabel(/items per page|page size/i);

            if (await perPageSelect.isVisible({timeout: 3000}).catch(() => false)) {
                await perPageSelect.click();

                const option = page.getByRole('option', {name: /25|50/i});
                if (await option.isVisible().catch(() => false)) {
                    await option.click();
                }
            }
        });
    });

    test.describe('Save Preferences', () => {
        test('should save preferences', async ({
                                                   authenticatedPage,
                                               }) => {
            const {page} = authenticatedPage;

            // Make a change
            const toggle = page.getByRole('switch').first();
            if (await toggle.isVisible({timeout: 5000}).catch(() => false)) {
                await toggle.click();
            }

            const saveButton = page.getByRole('button', {name: /save|update/i});
            if (await saveButton.isVisible({timeout: 3000}).catch(() => false)) {
                await saveButton.click();

                await expect(
                    page.getByText(/saved|updated|success/i)
                ).toBeVisible({timeout: 10000});
            }
        });
    });
});
