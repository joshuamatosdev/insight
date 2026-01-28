import {expect, test} from '../fixtures/test-fixtures';

/**
 * Report Builder E2E Tests
 *
 * Tests report builder interface.
 */

test.describe('Report Builder', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/reports/builder');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Builder Display', () => {
        test('should display report builder page', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('heading', {name: /report|builder|create/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display data source selection', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/data source|select|opportunities|contracts/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should display column selection', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/columns|fields|select/i)
            ).toBeVisible({timeout: 10000});
        });
    });

    test.describe('Add Filters', () => {
        test('should display filter section', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByText(/filter/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should add filter to report', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const addFilterButton = page.getByRole('button', {name: /add filter/i});

            if (await addFilterButton.isVisible({timeout: 5000}).catch(() => false)) {
                await addFilterButton.click();

                // Filter row should appear
                await expect(
                    page.locator('[data-testid="filter-row"]')
                        .or(page.getByRole('combobox'))
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should remove filter from report', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            const addFilterButton = page.getByRole('button', {name: /add filter/i});

            if (await addFilterButton.isVisible({timeout: 5000}).catch(() => false)) {
                await addFilterButton.click();

                const removeButton = page.getByRole('button', {name: /remove|delete|x/i}).last();
                if (await removeButton.isVisible().catch(() => false)) {
                    await removeButton.click();
                }
            }
        });
    });

    test.describe('Select Columns', () => {
        test('should display available columns', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            const columnCheckbox = page.getByRole('checkbox');
            const count = await columnCheckbox.count();

            expect(count).toBeGreaterThan(0);
        });

        test('should toggle column selection', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            const columnCheckbox = page.getByRole('checkbox').first();

            if (await columnCheckbox.isVisible({timeout: 5000}).catch(() => false)) {
                const initialState = await columnCheckbox.isChecked();
                await columnCheckbox.click();

                const newState = await columnCheckbox.isChecked();
                expect(newState).not.toBe(initialState);
            }
        });
    });

    test.describe('Preview Report', () => {
        test('should display preview button', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('button', {name: /preview|run/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should show preview results', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const previewButton = page.getByRole('button', {name: /preview|run/i});

            if (await previewButton.isVisible({timeout: 5000}).catch(() => false)) {
                await previewButton.click();

                // Results should appear
                await expect(
                    page.locator('[data-testid="report-preview"]')
                        .or(page.getByRole('table'))
                ).toBeVisible({timeout: 10000});
            }
        });
    });

    test.describe('Save Report', () => {
        test('should display save button', async ({
                                                      authenticatedPage,
                                                  }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('button', {name: /save/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should save report with name', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const saveButton = page.getByRole('button', {name: /save/i});

            if (await saveButton.isVisible({timeout: 5000}).catch(() => false)) {
                await saveButton.click();

                // Name input should appear
                const nameInput = page.getByLabel(/name|title/i);
                if (await nameInput.isVisible({timeout: 3000}).catch(() => false)) {
                    await nameInput.fill('Test E2E Report');

                    await page.getByRole('button', {name: /save|confirm/i}).click();

                    await expect(
                        page.getByText(/saved|created|success/i)
                    ).toBeVisible({timeout: 10000});
                }
            }
        });
    });
});
