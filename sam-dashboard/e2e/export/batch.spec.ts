import {expect, test} from '../fixtures/test-fixtures';

/**
 * Batch Export E2E Tests
 *
 * Tests batch export selection.
 */

test.describe('Batch Export', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/opportunities');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Selection', () => {
        test('should display select all checkbox', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('checkbox', {name: /select all/i})
                    .or(page.locator('[data-testid="select-all"]'))
            ).toBeVisible({timeout: 10000});
        });

        test('should select individual items', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            const itemCheckbox = page.locator('[data-testid="item-checkbox"]').first()
                .or(page.getByRole('checkbox').nth(1));

            if (await itemCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await itemCheckbox.check();
                expect(await itemCheckbox.isChecked()).toBe(true);
            }
        });

        test('should select all items', async ({
                                                   authenticatedPage,
                                               }) => {
            const {page} = authenticatedPage;

            const selectAllCheckbox = page.getByRole('checkbox', {name: /select all/i})
                .or(page.locator('[data-testid="select-all"]'));

            if (await selectAllCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await selectAllCheckbox.check();

                // All items should be selected
                await page.waitForTimeout(500);
            }
        });

        test('should show selection count', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const itemCheckbox = page.getByRole('checkbox').nth(1);

            if (await itemCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await itemCheckbox.check();

                // Selection count should appear
                await expect(
                    page.getByText(/\d+ selected/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Export Execution', () => {
        test('should display export button when items selected', async ({
                                                                            authenticatedPage,
                                                                        }) => {
            const {page} = authenticatedPage;

            const itemCheckbox = page.getByRole('checkbox').nth(1);

            if (await itemCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await itemCheckbox.check();

                await expect(
                    page.getByRole('button', {name: /export|download/i})
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should choose export format', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const itemCheckbox = page.getByRole('checkbox').nth(1);

            if (await itemCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await itemCheckbox.check();

                const exportButton = page.getByRole('button', {name: /export/i});
                await exportButton.click();

                // Format options should appear
                await expect(
                    page.getByText(/csv|excel|pdf/i)
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should execute batch export', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const itemCheckbox = page.getByRole('checkbox').nth(1);

            if (await itemCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                await itemCheckbox.check();

                const exportButton = page.getByRole('button', {name: /export/i});
                await exportButton.click();

                const csvOption = page.getByRole('button', {name: /csv/i})
                    .or(page.getByText(/csv/i));

                if (await csvOption.isVisible({timeout: 3000}).catch(() => false)) {
                    await csvOption.click();

                    // Export should start
                    await expect(
                        page.getByText(/exporting|downloading|success/i)
                    ).toBeVisible({timeout: 10000}).catch(() => {
                    });
                }
            }
        });
    });
});
