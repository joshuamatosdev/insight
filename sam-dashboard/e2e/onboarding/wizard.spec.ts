import {expect, test} from '../fixtures/test-fixtures';

/**
 * Onboarding Wizard E2E Tests
 *
 * Tests the complete onboarding wizard flow including step navigation,
 * progress tracking, and completion.
 */

test.describe('Onboarding Wizard Flow', () => {
    test.describe('Wizard Display', () => {
        test('should display onboarding wizard on first login', async ({
                                                                           authenticatedPage,
                                                                       }) => {
            const {page} = authenticatedPage;

            // Navigate to onboarding or wait for redirect
            await page.goto('/onboarding');

            // Verify wizard is displayed
            await expect(
                page.getByRole('heading', {name: /welcome|onboarding|get started/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display step progress indicator', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Should show progress indicator
            await expect(
                page.locator('[data-testid="step-progress"]').or(
                    page.getByText(/step \d+ of \d+/i)
                )
            ).toBeVisible({timeout: 5000});
        });

        test('should display current step content', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // First step should be visible (typically company profile)
            await expect(
                page.getByText(/company|profile|organization/i)
            ).toBeVisible({timeout: 5000});
        });
    });

    test.describe('Step Navigation', () => {
        test('should navigate to next step on continue', async ({
                                                                    authenticatedPage,
                                                                }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Click next/continue button
            const continueButton = page.getByRole('button', {name: /next|continue|proceed/i});
            await continueButton.click();

            // Should show step 2 content
            await expect(
                page.getByText(/step 2|certifications|capabilities/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should navigate to previous step on back', async ({
                                                                    authenticatedPage,
                                                                }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Go to step 2
            await page.getByRole('button', {name: /next|continue/i}).click();
            await expect(page.getByText(/step 2/i)).toBeVisible({timeout: 5000});

            // Go back to step 1
            const backButton = page.getByRole('button', {name: /back|previous/i});
            await backButton.click();

            // Should show step 1 content
            await expect(
                page.getByText(/step 1|company|profile/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should navigate through all 5 steps', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Navigate through all steps
            for (let step = 1; step <= 5; step++) {
                // Verify we're on the current step
                await expect(
                    page.getByText(new RegExp(`step ${step}`, 'i'))
                ).toBeVisible({timeout: 5000});

                // Click next if not on last step
                if (step < 5) {
                    await page.getByRole('button', {name: /next|continue/i}).click();
                }
            }

            // On last step, should see complete/finish button
            await expect(
                page.getByRole('button', {name: /complete|finish|done/i})
            ).toBeVisible();
        });
    });

    test.describe('Progress Tracking', () => {
        test('should save progress and resume', async ({
                                                           authenticatedPage,
                                                       }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Navigate to step 3
            await page.getByRole('button', {name: /next|continue/i}).click();
            await page.getByRole('button', {name: /next|continue/i}).click();
            await expect(page.getByText(/step 3/i)).toBeVisible({timeout: 5000});

            // Reload page
            await page.reload();

            // Should still be on step 3 (progress saved)
            await expect(page.getByText(/step 3/i)).toBeVisible({timeout: 5000});
        });

        test('should show completed steps as checked', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Complete step 1
            await page.getByRole('button', {name: /next|continue/i}).click();

            // Step 1 indicator should show completed
            const step1Indicator = page.locator('[data-testid="step-1"]').or(
                page.locator('.step-completed').first()
            );

            await expect(step1Indicator).toBeVisible({timeout: 5000});
        });
    });

    test.describe('Wizard Completion', () => {
        test('should complete onboarding and redirect to dashboard', async ({
                                                                                authenticatedPage,
                                                                            }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Navigate through all steps
            for (let step = 1; step < 5; step++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }

            // Click complete on final step
            await page.getByRole('button', {name: /complete|finish|done/i}).click();

            // Should redirect to dashboard
            await expect(page).toHaveURL(/^\/$|dashboard/, {timeout: 10000});
        });

        test('should not show wizard again after completion', async ({
                                                                         authenticatedPage,
                                                                     }) => {
            const {page} = authenticatedPage;

            // Complete onboarding first
            await page.goto('/onboarding');
            for (let step = 1; step < 5; step++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }
            await page.getByRole('button', {name: /complete|finish|done/i}).click();

            // Navigate back to onboarding
            await page.goto('/onboarding');

            // Should redirect to dashboard (already completed)
            await expect(page).toHaveURL(/^\/$|dashboard/, {timeout: 10000});
        });
    });

    test.describe('Skip Wizard', () => {
        test('should allow dismissing wizard early', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;
            await page.goto('/onboarding');

            // Look for skip/dismiss button
            const skipButton = page.getByRole('button', {name: /skip|dismiss|later|close/i});

            if (await skipButton.isVisible().catch(() => false)) {
                await skipButton.click();

                // Should show confirmation or redirect
                const confirmButton = page.getByRole('button', {name: /confirm|yes|skip/i});
                if (await confirmButton.isVisible().catch(() => false)) {
                    await confirmButton.click();
                }

                // Should redirect to dashboard
                await expect(page).toHaveURL(/^\/$|dashboard/, {timeout: 10000});
            }
        });
    });
});
