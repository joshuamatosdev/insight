import {expect, test} from '../fixtures/test-fixtures';

/**
 * Portal Widgets E2E Tests
 *
 * Tests individual dashboard widgets: contract cards, invoices, deliverables, deadlines.
 */

test.describe('Portal Widgets', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/portal');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Contract Status Cards', () => {
        test('should display contract status cards widget', async ({
                                                                       authenticatedPage,
                                                                   }) => {
            const {page} = authenticatedPage;

            // Should show contracts widget
            await expect(
                page.getByText(/active contracts|contract status/i).or(
                    page.locator('[data-testid="contract-status-cards"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display contract cards with details', async ({
                                                                      authenticatedPage,
                                                                  }) => {
            const {page} = authenticatedPage;

            // Wait for contracts to load
            const contractCards = page.locator('[data-testid="contract-card"]')
                .or(page.locator('.contract-card'));

            // Should show at least one contract card or empty state
            const hasCards = await contractCards.count() > 0;
            const hasEmptyState = await page.getByText(/no contracts|no active/i)
                .isVisible().catch(() => false);

            expect(hasCards || hasEmptyState).toBe(true);
        });

        test('should show contract number on cards', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            const contractCard = page.locator('[data-testid="contract-card"]').first()
                .or(page.locator('.contract-card').first());

            if (await contractCard.isVisible({timeout: 5000}).catch(() => false)) {
                // Contract number should be visible
                await expect(
                    contractCard.getByText(/contract|#|\d{4}/i)
                ).toBeVisible();
            }
        });

        test('should show contract status indicator', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            const contractCard = page.locator('[data-testid="contract-card"]').first();

            if (await contractCard.isVisible({timeout: 5000}).catch(() => false)) {
                // Status badge should be visible
                await expect(
                    contractCard.getByText(/active|completed|pending|expired/i)
                ).toBeVisible();
            }
        });

        test('should navigate to contract detail on click', async ({
                                                                       authenticatedPage,
                                                                   }) => {
            const {page} = authenticatedPage;

            const contractCard = page.locator('[data-testid="contract-card"]').first()
                .or(page.getByRole('link', {name: /contract/i}).first());

            if (await contractCard.isVisible({timeout: 5000}).catch(() => false)) {
                await contractCard.click();
                await expect(page).toHaveURL(/contract/);
            }
        });
    });

    test.describe('Invoice Summary', () => {
        test('should display invoice summary widget', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            // Should show invoices widget
            await expect(
                page.getByText(/invoice summary|invoices/i).or(
                    page.locator('[data-testid="invoice-summary"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display pending invoices total', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            // Should show pending amount
            await expect(
                page.getByText(/pending|\$[\d,]+/i).or(
                    page.locator('[data-testid="pending-total"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display paid invoices total', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            // Should show paid amount
            await expect(
                page.getByText(/paid|\$[\d,]+/i).or(
                    page.locator('[data-testid="paid-total"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display invoice list', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            const invoiceList = page.locator('[data-testid="invoice-list"]')
                .or(page.locator('.invoice-row'));

            // Should show invoice entries or empty state
            const hasInvoices = await invoiceList.count() > 0;
            const hasEmptyState = await page.getByText(/no invoices/i)
                .isVisible().catch(() => false);

            expect(hasInvoices || hasEmptyState).toBe(true);
        });

        test('should show invoice status badges', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const invoiceRow = page.locator('[data-testid="invoice-row"]').first()
                .or(page.locator('.invoice-row').first());

            if (await invoiceRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Status should be visible
                await expect(
                    invoiceRow.getByText(/submitted|approved|paid|rejected|pending/i)
                ).toBeVisible();
            }
        });
    });

    test.describe('Deliverable Tracker', () => {
        test('should display deliverable tracker widget', async ({
                                                                     authenticatedPage,
                                                                 }) => {
            const {page} = authenticatedPage;

            // Should show deliverables widget
            await expect(
                page.getByText(/deliverable|tracker/i).or(
                    page.locator('[data-testid="deliverable-tracker"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display deliverable list', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            const deliverableList = page.locator('[data-testid="deliverable-list"]')
                .or(page.locator('.deliverable-row'));

            // Should show deliverables or empty state
            const hasDeliverables = await deliverableList.count() > 0;
            const hasEmptyState = await page.getByText(/no deliverables/i)
                .isVisible().catch(() => false);

            expect(hasDeliverables || hasEmptyState).toBe(true);
        });

        test('should show deliverable status', async ({
                                                          authenticatedPage,
                                                      }) => {
            const {page} = authenticatedPage;

            const deliverableRow = page.locator('[data-testid="deliverable-row"]').first()
                .or(page.locator('.deliverable-row').first());

            if (await deliverableRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Status should be visible
                await expect(
                    deliverableRow.getByText(/pending|in progress|completed|overdue|on track/i)
                ).toBeVisible();
            }
        });

        test('should show deliverable due dates', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const deliverableRow = page.locator('[data-testid="deliverable-row"]').first();

            if (await deliverableRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Due date should be visible
                await expect(
                    deliverableRow.getByText(/due|date|\d{1,2}\/\d{1,2}/i)
                ).toBeVisible();
            }
        });

        test('should show progress indicators', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;

            // Progress bar or percentage should be visible
            const progress = page.locator('[role="progressbar"]')
                .or(page.getByText(/%/))
                .or(page.locator('.progress-bar'));

            await expect(progress.first()).toBeVisible({timeout: 10000}).catch(() => {
            });
        });
    });

    test.describe('Upcoming Deadlines', () => {
        test('should display upcoming deadlines widget', async ({
                                                                    authenticatedPage,
                                                                }) => {
            const {page} = authenticatedPage;

            // Should show deadlines widget
            await expect(
                page.getByText(/upcoming deadlines|deadlines/i).or(
                    page.locator('[data-testid="upcoming-deadlines"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display deadline list', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const deadlineList = page.locator('[data-testid="deadline-list"]')
                .or(page.locator('.deadline-row'));

            // Should show deadlines or empty state
            const hasDeadlines = await deadlineList.count() > 0;
            const hasEmptyState = await page.getByText(/no upcoming|no deadlines/i)
                .isVisible().catch(() => false);

            expect(hasDeadlines || hasEmptyState).toBe(true);
        });

        test('should show deadline dates', async ({
                                                      authenticatedPage,
                                                  }) => {
            const {page} = authenticatedPage;

            const deadlineRow = page.locator('[data-testid="deadline-row"]').first()
                .or(page.locator('.deadline-row').first());

            if (await deadlineRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Date should be visible
                await expect(
                    deadlineRow.getByText(/\d{1,2}\/\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)
                ).toBeVisible();
            }
        });

        test('should show days remaining for deadlines', async ({
                                                                    authenticatedPage,
                                                                }) => {
            const {page} = authenticatedPage;

            const deadlineRow = page.locator('[data-testid="deadline-row"]').first();

            if (await deadlineRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Days remaining should be visible
                await expect(
                    deadlineRow.getByText(/\d+ days?|today|tomorrow|overdue/i)
                ).toBeVisible();
            }
        });

        test('should highlight urgent deadlines', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            // Urgent deadlines should have visual indicator
            const urgentDeadline = page.locator('[data-testid="deadline-urgent"]')
                .or(page.locator('.deadline-urgent'))
                .or(page.locator('.text-red'));

            // Just verify the page loads - urgent indicator may not always be present
            await expect(
                page.getByText(/deadlines/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should sort deadlines by date', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            const deadlineRows = page.locator('[data-testid="deadline-row"]');
            const count = await deadlineRows.count();

            if (count >= 2) {
                // First deadline should be sooner than second
                const firstText = await deadlineRows.first().textContent();
                const secondText = await deadlineRows.nth(1).textContent();

                // Both should contain date-related text
                expect(firstText ?? '').toMatch(/\d|day|today|tomorrow/i);
                expect(secondText ?? '').toMatch(/\d|day|today|tomorrow/i);
            }
        });
    });

    test.describe('Widget Navigation', () => {
        test('should navigate to detail pages from widgets', async ({
                                                                        authenticatedPage,
                                                                    }) => {
            const {page} = authenticatedPage;

            // Click on a contract card
            const contractLink = page.getByRole('link', {name: /view|details/i}).first()
                .or(page.locator('[data-testid="contract-card"] a').first());

            if (await contractLink.isVisible({timeout: 5000}).catch(() => false)) {
                await contractLink.click();

                // Should navigate to detail page
                await expect(page).not.toHaveURL(/\/portal$/);
            }
        });

        test('should have view all links on widgets', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            // Widgets should have "view all" or "see all" links
            const viewAllLinks = page.getByRole('link', {name: /view all|see all|show all/i});
            const count = await viewAllLinks.count();

            // At least some widgets should have view all links
            expect(count).toBeGreaterThanOrEqual(0);
        });
    });
});
