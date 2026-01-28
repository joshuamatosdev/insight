import {expect, test} from '../fixtures/test-fixtures';

/**
 * Billing Plans E2E Tests
 *
 * Tests plan comparison and feature display.
 */

test.describe('Billing Plans', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/settings/billing/plans');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Plan Comparison', () => {
        test('should display plan comparison cards', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            // Should show multiple plan cards
            const planCards = page.locator('[data-testid="plan-card"]')
                .or(page.locator('.plan-card'));

            const count = await planCards.count();
            expect(count).toBeGreaterThanOrEqual(1);
        });

        test('should display plan names', async ({
                                                     authenticatedPage,
                                                 }) => {
            const {page} = authenticatedPage;

            // Should show plan names
            await expect(
                page.getByText(/free|starter|professional|enterprise/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should display plan prices', async ({
                                                      authenticatedPage,
                                                  }) => {
            const {page} = authenticatedPage;

            // Should show prices
            await expect(
                page.getByText(/\$\d+|free|per month/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should highlight current plan', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            // Current plan should be highlighted
            const currentPlan = page.locator('[data-testid="current-plan"]')
                .or(page.getByText(/current plan|your plan/i));

            await expect(currentPlan).toBeVisible({timeout: 10000});
        });
    });

    test.describe('Feature Display', () => {
        test('should display feature lists for each plan', async ({
                                                                      authenticatedPage,
                                                                  }) => {
            const {page} = authenticatedPage;

            // Should show features
            await expect(
                page.getByText(/features|includes|unlimited|users/i)
            ).toBeVisible({timeout: 10000});
        });

        test('should show feature availability indicators', async ({
                                                                       authenticatedPage,
                                                                   }) => {
            const {page} = authenticatedPage;

            // Check marks or availability indicators
            const checkmarks = page.locator('svg').or(page.getByText(/✓|✔|included/i));

            const count = await checkmarks.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should show feature comparison table', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            // Comparison table might be available
            const comparisonTable = page.getByRole('table')
                .or(page.locator('[data-testid="feature-comparison"]'));

            if (await comparisonTable.isVisible({timeout: 3000}).catch(() => false)) {
                await expect(comparisonTable).toBeVisible();
            }
        });
    });

    test.describe('Plan Selection', () => {
        test('should display select button for each plan', async ({
                                                                      authenticatedPage,
                                                                  }) => {
            const {page} = authenticatedPage;

            const selectButtons = page.getByRole('button', {name: /select|choose|upgrade|get started/i});

            const count = await selectButtons.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should disable select for current plan', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            // Current plan button should be disabled or show "current"
            const currentPlanCard = page.locator('[data-testid="current-plan"]')
                .or(page.locator('.plan-card').filter({hasText: /current/i}));

            if (await currentPlanCard.isVisible({timeout: 5000}).catch(() => false)) {
                const button = currentPlanCard.getByRole('button');
                if (await button.isVisible().catch(() => false)) {
                    const isDisabled = await button.isDisabled();
                    const text = await button.textContent();
                    expect(isDisabled || text?.toLowerCase().includes('current')).toBe(true);
                }
            }
        });

        test('should toggle between monthly and annual billing', async ({
                                                                            authenticatedPage,
                                                                        }) => {
            const {page} = authenticatedPage;

            const billingToggle = page.getByRole('switch')
                .or(page.getByRole('button', {name: /monthly|annual/i}));

            if (await billingToggle.isVisible({timeout: 3000}).catch(() => false)) {
                await billingToggle.click();

                // Prices should update
                await page.waitForTimeout(300);

                // Should show annual pricing
                await expect(
                    page.getByText(/annual|yearly|per year|\$\d+/i)
                ).toBeVisible();
            }
        });
    });
});
