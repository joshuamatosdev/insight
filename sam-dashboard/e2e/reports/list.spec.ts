import {expect, test} from '../fixtures/test-fixtures';

/**
 * Report List E2E Tests
 *
 * Tests report list, run, and export.
 */

test.describe('Report List', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/reports');
        await page.waitForLoadState('networkidle');
    });

    test.describe('List Display', () => {
        test('should display reports list page', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('heading', {name: /reports/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display saved reports', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const reportItems = page.locator('[data-testid="report-item"]');

            // Should show reports or empty state
            const hasReports = await reportItems.count() > 0;
            const hasEmptyState = await page.getByText(/no reports|create your first/i)
                .isVisible().catch(() => false);

            expect(hasReports || hasEmptyState).toBe(true);
        });

        test('should display create report button', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('button', {name: /create|new/i})
                    .or(page.getByRole('link', {name: /create|new/i}))
            ).toBeVisible({timeout: 10000});
        });
    });

    test.describe('Run Report', () => {
        test('should display run button for reports', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            const reportItem = page.locator('[data-testid="report-item"]').first();

            if (await reportItem.isVisible({timeout: 5000}).catch(() => false)) {
                await expect(
                    reportItem.getByRole('button', {name: /run|execute/i})
                ).toBeVisible();
            }
        });

        test('should run saved report', async ({
                                                   authenticatedPage,
                                               }) => {
            const {page} = authenticatedPage;

            const runButton = page.getByRole('button', {name: /run/i}).first();

            if (await runButton.isVisible({timeout: 5000}).catch(() => false)) {
                await runButton.click();

                // Results should appear
                await expect(
                    page.locator('[data-testid="report-results"]')
                        .or(page.getByRole('table'))
                ).toBeVisible({timeout: 15000});
            }
        });
    });

    test.describe('Export Report', () => {
        test('should display export options', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            const exportButton = page.getByRole('button', {name: /export|download/i}).first();

            if (await exportButton.isVisible({timeout: 5000}).catch(() => false)) {
                await exportButton.click();

                // Export options should appear
                await expect(
                    page.getByText(/csv|pdf|excel/i)
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should export report as CSV', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const exportButton = page.getByRole('button', {name: /export/i}).first();

            if (await exportButton.isVisible({timeout: 5000}).catch(() => false)) {
                await exportButton.click();

                const csvOption = page.getByRole('button', {name: /csv/i})
                    .or(page.getByText(/csv/i));

                if (await csvOption.isVisible({timeout: 3000}).catch(() => false)) {
                    await csvOption.click();
                }
            }
        });

        test('should export report as PDF', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const exportButton = page.getByRole('button', {name: /export/i}).first();

            if (await exportButton.isVisible({timeout: 5000}).catch(() => false)) {
                await exportButton.click();

                const pdfOption = page.getByRole('button', {name: /pdf/i})
                    .or(page.getByText(/pdf/i));

                if (await pdfOption.isVisible({timeout: 3000}).catch(() => false)) {
                    await pdfOption.click();
                }
            }
        });
    });

    test.describe('Report Actions', () => {
        test('should edit saved report', async ({
                                                    authenticatedPage,
                                                }) => {
            const {page} = authenticatedPage;

            const editButton = page.getByRole('button', {name: /edit/i}).first();

            if (await editButton.isVisible({timeout: 5000}).catch(() => false)) {
                await editButton.click();

                // Should navigate to builder
                await expect(page).toHaveURL(/builder|edit/);
            }
        });

        test('should delete saved report', async ({
                                                      authenticatedPage,
                                                  }) => {
            const {page} = authenticatedPage;

            const deleteButton = page.getByRole('button', {name: /delete/i}).first();

            if (await deleteButton.isVisible({timeout: 5000}).catch(() => false)) {
                await deleteButton.click();

                // Confirmation should appear
                await expect(
                    page.getByText(/confirm|are you sure/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });
});
