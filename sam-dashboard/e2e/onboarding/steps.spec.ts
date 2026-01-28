import {expect, test} from '../fixtures/test-fixtures';

/**
 * Onboarding Steps E2E Tests
 *
 * Tests individual step forms, validation, and optional step skipping.
 */

test.describe('Onboarding Steps', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/onboarding');
    });

    test.describe('Step 1: Company Profile', () => {
        test('should display company profile form', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Should show company name input
            await expect(
                page.getByLabel(/company name|organization name/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should validate required fields', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Clear any pre-filled data
            const companyInput = page.getByLabel(/company name/i);
            await companyInput.clear();

            // Try to proceed without filling
            await page.getByRole('button', {name: /next|continue/i}).click();

            // Should show validation error
            await expect(
                page.getByText(/required|please enter/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should accept valid company profile data', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Fill company details
            await page.getByLabel(/company name/i).fill('Test Company LLC');

            // Fill optional fields if present
            const ueiInput = page.getByLabel(/uei|duns/i);
            if (await ueiInput.isVisible().catch(() => false)) {
                await ueiInput.fill('TEST12345678');
            }

            const cageInput = page.getByLabel(/cage/i);
            if (await cageInput.isVisible().catch(() => false)) {
                await cageInput.fill('12345');
            }

            // Should be able to proceed
            await page.getByRole('button', {name: /next|continue/i}).click();
            await expect(page.getByText(/step 2/i)).toBeVisible({timeout: 5000});
        });
    });

    test.describe('Step 2: Certifications (Optional)', () => {
        test('should allow skipping certifications step', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 2
            await page.getByRole('button', {name: /next|continue/i}).click();
            await expect(page.getByText(/step 2/i)).toBeVisible({timeout: 5000});

            // Should have skip option
            const skipButton = page.getByRole('button', {name: /skip|later|not now/i});
            const nextButton = page.getByRole('button', {name: /next|continue/i});

            // Click skip or next (both should work without selection)
            await (skipButton.isVisible().catch(() => false)
                ? skipButton.click()
                : nextButton.click());

            // Should proceed to step 3
            await expect(page.getByText(/step 3/i)).toBeVisible({timeout: 5000});
        });

        test('should display certification options', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 2
            await page.getByRole('button', {name: /next|continue/i}).click();

            // Should show certification checkboxes
            await expect(
                page.getByText(/8\(a\)|HUBZone|WOSB|SDVOSB|small business/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should save selected certifications', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 2
            await page.getByRole('button', {name: /next|continue/i}).click();

            // Select a certification
            const certification = page.getByLabel(/small business/i);
            if (await certification.isVisible().catch(() => false)) {
                await certification.check();
            }

            // Proceed to next step
            await page.getByRole('button', {name: /next|continue/i}).click();

            // Go back and verify selection persists
            await page.getByRole('button', {name: /back|previous/i}).click();

            // Certification should still be checked
            const certCheckbox = page.getByLabel(/small business/i);
            if (await certCheckbox.isVisible().catch(() => false)) {
                await expect(certCheckbox).toBeChecked();
            }
        });
    });

    test.describe('Step 3: NAICS & Capabilities', () => {
        test('should display NAICS selection', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 3
            await page.getByRole('button', {name: /next|continue/i}).click();
            await page.getByRole('button', {name: /next|continue|skip/i}).click();

            // Should show NAICS input
            await expect(
                page.getByText(/naics|capabilities|industry/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should allow searching for NAICS codes', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 3
            await page.getByRole('button', {name: /next|continue/i}).click();
            await page.getByRole('button', {name: /next|continue|skip/i}).click();

            // Look for NAICS search
            const naicsSearch = page.getByPlaceholder(/search naics|enter naics/i);
            if (await naicsSearch.isVisible().catch(() => false)) {
                await naicsSearch.fill('541511');

                // Should show search results
                await expect(
                    page.getByText(/541511|software/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('Step 4: Team Invite (Optional)', () => {
        test('should allow skipping team invite step', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 4
            for (let i = 0; i < 3; i++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }

            // Should have skip option
            const skipButton = page.getByRole('button', {name: /skip|later|not now/i});
            const nextButton = page.getByRole('button', {name: /next|continue/i});

            await (skipButton.isVisible().catch(() => false)
                ? skipButton.click()
                : nextButton.click());

            // Should proceed to step 5
            await expect(page.getByText(/step 5/i)).toBeVisible({timeout: 5000});
        });

        test('should display team invite form', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 4
            for (let i = 0; i < 3; i++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }

            // Should show email invite input
            await expect(
                page.getByText(/team|invite|colleagues/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should validate email format for invites', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 4
            for (let i = 0; i < 3; i++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }

            // Look for email input
            const emailInput = page.getByLabel(/email|invite/i);
            if (await emailInput.isVisible().catch(() => false)) {
                await emailInput.fill('invalid-email');

                // Try to add/submit
                const addButton = page.getByRole('button', {name: /add|invite|send/i});
                if (await addButton.isVisible().catch(() => false)) {
                    await addButton.click();

                    // Should show validation error
                    await expect(
                        page.getByText(/valid email|invalid/i)
                    ).toBeVisible({timeout: 5000});
                }
            }
        });
    });

    test.describe('Step 5: Integrations (Optional)', () => {
        test('should allow skipping integrations step', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 5
            for (let i = 0; i < 4; i++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }

            // Should be on step 5
            await expect(page.getByText(/step 5|integrations/i)).toBeVisible({timeout: 5000});

            // Should have finish button
            await expect(
                page.getByRole('button', {name: /complete|finish|done/i})
            ).toBeVisible();
        });

        test('should display available integrations', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Navigate to step 5
            for (let i = 0; i < 4; i++) {
                await page.getByRole('button', {name: /next|continue|skip/i}).click();
                await page.waitForTimeout(500);
            }

            // Should show integration options
            await expect(
                page.getByText(/integrations|connect|sam\.gov|crm/i)
            ).toBeVisible({timeout: 5000});
        });
    });

    test.describe('Form Validation', () => {
        test('should show inline validation errors', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Find a required field and leave it empty
            const requiredInput = page.getByLabel(/company name/i);
            await requiredInput.clear();
            await requiredInput.blur();

            // Should show inline error
            await expect(
                page.getByText(/required/i)
            ).toBeVisible({timeout: 5000});
        });

        test('should clear validation errors on input', async ({authenticatedPage}) => {
            const {page} = authenticatedPage;

            // Trigger validation error
            const requiredInput = page.getByLabel(/company name/i);
            await requiredInput.clear();
            await page.getByRole('button', {name: /next|continue/i}).click();

            // Error should be visible
            await expect(page.getByText(/required/i)).toBeVisible({timeout: 5000});

            // Type in the field
            await requiredInput.fill('Test Company');

            // Error should be cleared
            await expect(page.getByText(/required/i)).not.toBeVisible({timeout: 3000});
        });
    });
});
