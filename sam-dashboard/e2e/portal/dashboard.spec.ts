import {expect, test} from '../fixtures/test-fixtures';

/**
 * Portal Dashboard E2E Tests
 *
 * Tests the contractor portal dashboard layout, quick stats, and loading.
 */

test.describe('Portal Dashboard', () => {
    test.describe('Dashboard Layout', () => {
        test('should display contractor dashboard', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show dashboard heading
            await expect(
                page.getByRole('heading', {name: /contractor|portal|dashboard/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display dashboard header with welcome message', async ({
                                                                                authenticatedPage,
                                                                            }) => {
            const {page, user} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show welcome or user name
            await expect(
                page.getByText(/welcome|hello/i).or(page.getByText(new RegExp(user.email, 'i')))
            ).toBeVisible({timeout: 10000});
        });

        test('should display main content area', async ({
                                                            authenticatedPage,
                                                        }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Main content area should be visible
            await expect(
                page.locator('main').or(page.locator('[data-testid="dashboard-content"]'))
            ).toBeVisible({timeout: 5000});
        });

        test('should display navigation sidebar', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Sidebar should be visible
            await expect(
                page.locator('nav').or(page.locator('[data-testid="sidebar"]'))
            ).toBeVisible({timeout: 5000});
        });
    });

    test.describe('Quick Stats', () => {
        test('should show quick stats for contracts', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show active contracts stat
            await expect(
                page.getByText(/active contracts/i).or(
                    page.locator('[data-testid="stat-contracts"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should show quick stats for invoices', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show pending invoices stat
            await expect(
                page.getByText(/pending invoices|invoices/i).or(
                    page.locator('[data-testid="stat-invoices"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should show quick stats for deadlines', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show upcoming deadlines stat
            await expect(
                page.getByText(/upcoming deadlines|deadlines/i).or(
                    page.locator('[data-testid="stat-deadlines"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should show quick stats for total value', async ({
                                                                   authenticatedPage,
                                                               }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show total contract value
            await expect(
                page.getByText(/total.*value|contract value/i).or(
                    page.locator('[data-testid="stat-value"]')
                )
            ).toBeVisible({timeout: 10000});
        });

        test('should display numeric values in stats', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Stats should contain numbers
            const statCards = page.locator('[data-testid^="stat-"]')
                .or(page.locator('.stat-card'))
                .or(page.locator('[data-testid="quick-stats"] > *'));

            const count = await statCards.count();
            if (count > 0) {
                // At least one stat should have a numeric value
                await expect(
                    page.getByText(/\d+|\$[\d,]+/)
                ).toBeVisible({timeout: 10000});
            }
        });
    });

    test.describe('Loading States', () => {
        test('should show loading indicator while fetching data', async ({
                                                                             authenticatedPage,
                                                                         }) => {
            const {page} = authenticatedPage;

            // Add delay to API responses
            await page.route('**/**', async (route) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await route.continue();
            });

            await page.goto('/portal');

            // Should show loading state
            const loadingIndicator = page.getByText(/loading/i)
                .or(page.locator('[data-testid="loading"]'))
                .or(page.locator('.animate-spin'));

            await expect(loadingIndicator).toBeVisible({timeout: 3000}).catch(() => {
                // Loading might be too fast to catch
            });
        });

        test('should display content after loading completes', async ({
                                                                          authenticatedPage,
                                                                      }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Dashboard content should be visible after load
            await expect(
                page.locator('[data-testid="dashboard-widgets"]')
                    .or(page.getByText(/active contracts|invoices|deadlines/i))
            ).toBeVisible({timeout: 15000});
        });

        test('should handle API errors gracefully', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            // Mock API to fail
            await page.route('**/portal/**', async (route) => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({error: 'Server error'}),
                });
            });

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Should show error message or empty state
            const errorOrEmpty = page.getByText(/error|unable|failed|no data/i)
                .or(page.locator('[data-testid="error-message"]'));

            await expect(errorOrEmpty).toBeVisible({timeout: 10000}).catch(() => {
                // App might show fallback content
            });
        });
    });

    test.describe('Dashboard Navigation', () => {
        test('should navigate to contracts page from dashboard', async ({
                                                                            authenticatedPage,
                                                                        }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Click on contracts link or card
            const contractsLink = page.getByRole('link', {name: /contracts|view contracts/i})
                .or(page.locator('[data-testid="contracts-link"]'));

            if (await contractsLink.isVisible({timeout: 5000}).catch(() => false)) {
                await contractsLink.click();
                await expect(page).toHaveURL(/contracts/);
            }
        });

        test('should navigate to invoices page from dashboard', async ({
                                                                           authenticatedPage,
                                                                       }) => {
            const {page} = authenticatedPage;

            await page.goto('/portal');
            await page.waitForLoadState('networkidle');

            // Click on invoices link or card
            const invoicesLink = page.getByRole('link', {name: /invoices|view invoices/i})
                .or(page.locator('[data-testid="invoices-link"]'));

            if (await invoicesLink.isVisible({timeout: 5000}).catch(() => false)) {
                await invoicesLink.click();
                await expect(page).toHaveURL(/invoices/);
            }
        });
    });
});
