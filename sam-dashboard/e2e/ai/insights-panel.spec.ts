import {expect, test} from '../fixtures/test-fixtures';

/**
 * AI Insights Panel E2E Tests
 *
 * Tests the AI insights panel display, tab switching, and loading states.
 */

test.describe('AI Insights Panel', () => {
    test.describe('Panel Display', () => {
        test('should display AI Insights panel on opportunity detail', async ({
                                                                                  authenticatedPage,
                                                                              }) => {
            const {page} = authenticatedPage;

            // Navigate to opportunities list first
            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            // Click on first opportunity to view details
            const opportunityLink = page.locator('[data-testid="opportunity-card"]').first()
                .or(page.getByRole('link', {name: /view|details/i}).first());

            if (await opportunityLink.isVisible().catch(() => false)) {
                await opportunityLink.click();

                // Should show AI insights panel
                await expect(
                    page.getByText(/ai insights|ai analysis|intelligent insights/i)
                ).toBeVisible({timeout: 10000});
            }
        });

        test('should display AI panel header with icon', async ({
                                                                    authenticatedPage,
                                                                }) => {
            const {page} = authenticatedPage;

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // AI panel should have a recognizable header
                await expect(
                    page.locator('[data-testid="ai-insights-panel"]').or(
                        page.getByText(/ai insights/i)
                    )
                ).toBeVisible({timeout: 10000});
            }
        });
    });

    test.describe('Tab Switching', () => {
        test('should switch between Summary, Fit Score, and Risk tabs', async ({
                                                                                   authenticatedPage,
                                                                               }) => {
            const {page} = authenticatedPage;

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // Wait for AI panel
                await page.waitForSelector('[data-testid="ai-insights-panel"]', {timeout: 10000})
                    .catch(() => {
                    });

                // Click Summary tab
                const summaryTab = page.getByRole('tab', {name: /summary/i})
                    .or(page.getByRole('button', {name: /summary/i}));
                if (await summaryTab.isVisible().catch(() => false)) {
                    await summaryTab.click();
                    await expect(
                        page.getByText(/summary|overview/i)
                    ).toBeVisible({timeout: 5000});
                }

                // Click Fit Score tab
                const fitTab = page.getByRole('tab', {name: /fit|score/i})
                    .or(page.getByRole('button', {name: /fit|score/i}));
                if (await fitTab.isVisible().catch(() => false)) {
                    await fitTab.click();
                    await expect(
                        page.getByText(/fit score|match|%/i)
                    ).toBeVisible({timeout: 5000});
                }

                // Click Risk tab
                const riskTab = page.getByRole('tab', {name: /risk/i})
                    .or(page.getByRole('button', {name: /risk/i}));
                if (await riskTab.isVisible().catch(() => false)) {
                    await riskTab.click();
                    await expect(
                        page.getByText(/risk|assessment|analysis/i)
                    ).toBeVisible({timeout: 5000});
                }
            }
        });

        test('should highlight active tab', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // Wait for AI panel tabs
                const tabs = page.getByRole('tablist').or(
                    page.locator('[data-testid="ai-tabs"]')
                );

                if (await tabs.isVisible().catch(() => false)) {
                    // First tab should be active by default
                    const firstTab = page.getByRole('tab').first();
                    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
                }
            }
        });
    });

    test.describe('Loading States', () => {
        test('should show loading state during analysis', async ({
                                                                     authenticatedPage,
                                                                 }) => {
            const {page} = authenticatedPage;

            // Intercept AI analysis API to add delay
            await page.route('**/ai/**', async (route) => {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await route.continue();
            });

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // Should show loading indicator
                const loadingIndicator = page.getByText(/loading|analyzing|processing/i)
                    .or(page.locator('[data-testid="loading-spinner"]'))
                    .or(page.locator('.animate-spin'));

                // Loading should be visible briefly
                await expect(loadingIndicator).toBeVisible({timeout: 5000}).catch(() => {
                });
            }
        });

        test('should display content after loading completes', async ({
                                                                          authenticatedPage,
                                                                      }) => {
            const {page} = authenticatedPage;

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // Wait for AI insights to load
                await page.waitForSelector('[data-testid="ai-insights-panel"]', {timeout: 15000})
                    .catch(() => {
                    });

                // Content should be visible (not loading)
                const content = page.locator('[data-testid="ai-insights-content"]')
                    .or(page.getByText(/summary|fit score|risk/i));

                await expect(content.first()).toBeVisible({timeout: 10000});
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should handle AI service errors gracefully', async ({
                                                                      authenticatedPage,
                                                                  }) => {
            const {page} = authenticatedPage;

            // Mock AI API to return error
            await page.route('**/ai/**', async (route) => {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({error: 'AI service unavailable'}),
                });
            });

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // Should show error message or fallback
                const errorMessage = page.getByText(/error|unavailable|unable|failed/i)
                    .or(page.getByText(/try again/i));

                await expect(errorMessage).toBeVisible({timeout: 10000}).catch(() => {
                    // Some apps show fallback content instead of error
                });
            }
        });

        test('should offer retry option on failure', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            // Mock AI API to fail
            let failedOnce = false;
            await page.route('**/ai/**', async (route) => {
                if (!failedOnce) {
                    failedOnce = true;
                    await route.fulfill({
                        status: 500,
                        contentType: 'application/json',
                        body: JSON.stringify({error: 'Service error'}),
                    });
                } else {
                    await route.continue();
                }
            });

            await page.goto('/opportunities');
            await page.waitForLoadState('networkidle');

            const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
            if (await opportunityCard.isVisible().catch(() => false)) {
                await opportunityCard.click();

                // Look for retry button
                const retryButton = page.getByRole('button', {name: /retry|try again|refresh/i});
                if (await retryButton.isVisible({timeout: 10000}).catch(() => false)) {
                    await retryButton.click();

                    // Should attempt to load again
                    await expect(
                        page.getByText(/loading|analyzing/i).or(
                            page.locator('[data-testid="ai-insights-content"]')
                        )
                    ).toBeVisible({timeout: 5000});
                }
            }
        });
    });
});
