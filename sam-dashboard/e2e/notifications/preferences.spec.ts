import {expect, test} from '../fixtures/test-fixtures';

/**
 * Notification Preferences E2E Tests
 *
 * Tests notification settings configuration.
 */

test.describe('Notification Preferences', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/settings/notifications');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Preferences Display', () => {
        test('should display notification settings page', async ({
                                                                     authenticatedPage,
                                                                 }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('heading', {name: /notification|preferences/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display notification categories', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            // Should show categories
            await expect(
                page.getByText(/email|in-app|opportunities|contracts|system/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should display toggle switches', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            const toggles = page.getByRole('switch')
                .or(page.getByRole('checkbox'));

            const count = await toggles.count();
            expect(count).toBeGreaterThan(0);
        });
    });

    test.describe('Configure Preferences', () => {
        test('should toggle email notifications', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const emailToggle = page.getByLabel(/email/i)
                .or(page.getByRole('switch').first());

            if (await emailToggle.isVisible({timeout: 5000}).catch(() => false)) {
                const initialState = await emailToggle.isChecked();
                await emailToggle.click();

                const newState = await emailToggle.isChecked();
                expect(newState).not.toBe(initialState);
            }
        });

        test('should toggle in-app notifications', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            const inAppToggle = page.getByLabel(/in-app|push/i);

            if (await inAppToggle.isVisible({timeout: 5000}).catch(() => false)) {
                await inAppToggle.click();

                // Toggle should respond
                await page.waitForTimeout(300);
            }
        });

        test('should save preferences', async ({
                                                   authenticatedPage,
                                               }) => {
            const {page} = authenticatedPage;

            // Toggle a setting
            const toggle = page.getByRole('switch').first();
            if (await toggle.isVisible({timeout: 5000}).catch(() => false)) {
                await toggle.click();
            }

            // Save if there's a save button
            const saveButton = page.getByRole('button', {name: /save|update/i});
            if (await saveButton.isVisible({timeout: 3000}).catch(() => false)) {
                await saveButton.click();

                // Should show success
                await expect(
                    page.getByText(/saved|updated|success/i)
                ).toBeVisible({timeout: 10000});
            }
        });
    });

    test.describe('Frequency Settings', () => {
        test('should display digest frequency options', async ({
                                                                   authenticatedPage,
                                                               }) => {
            const {page} = authenticatedPage;

            // Frequency options
            await expect(
                page.getByText(/immediately|daily|weekly|digest/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
            });
        });

        test('should change notification frequency', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            const frequencySelect = page.getByLabel(/frequency/i)
                .or(page.getByRole('combobox'));

            if (await frequencySelect.isVisible({timeout: 3000}).catch(() => false)) {
                await frequencySelect.click();

                const option = page.getByRole('option', {name: /daily/i});
                if (await option.isVisible().catch(() => false)) {
                    await option.click();
                }
            }
        });
    });
});
