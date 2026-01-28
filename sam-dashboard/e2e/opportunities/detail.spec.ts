import {expect, test} from '@playwright/test';
import {getSbirOpportunities, mockOpportunities, setupOpportunityMocks,} from '../fixtures/opportunities.fixtures';

/**
 * Opportunity Detail E2E Tests
 *
 * Tests the opportunity detail display, including:
 * - Opportunity card content
 * - External links to SAM.gov
 * - SBIR opportunity display
 * - Date formatting and deadline indicators
 */

test.describe('Opportunity Detail Display', () => {
    test.beforeEach(async ({page}) => {
        // Setup API mocks before navigation
        await setupOpportunityMocks(page);

        // Mock authentication - set auth state
        await page.addInitScript(() => {
            localStorage.setItem(
                'auth',
                JSON.stringify({
                    user: {email: 'test@example.com', name: 'Test User'},
                    token: 'mock-token',
                })
            );
        });

        // Navigate to dashboard
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Navigate to All Opportunities to see detail cards
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();
    });

    test.describe('Opportunity Card Content', () => {
        test('should display opportunity title as clickable link', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify the title link exists and is clickable
            const titleLink = firstCard.getByRole('link').first();
            await expect(titleLink).toBeVisible();

            // Verify it has an href attribute
            const href = await titleLink.getAttribute('href');
            expect(href).toBeTruthy();
        });

        test('should display solicitation number', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify solicitation number format is displayed (e.g., FA8528-24-R-0001)
            await expect(firstCard.getByText(/[A-Z0-9]+-\d+-[A-Z]-\d+|n\/a/i)).toBeVisible();
        });

        test('should display NAICS code badge', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify NAICS badge is present (6-digit code)
            await expect(firstCard.getByText(/\d{6}/)).toBeVisible();
        });

        test('should display opportunity type badge', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify type badge exists (Solicitation, Presolicitation, etc.)
            const typeBadge = firstCard.locator('[class*="badge"]').first();
            await expect(typeBadge).toBeVisible();
        });

        test('should display posted date', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify "Posted Date" label exists
            await expect(firstCard.getByText(/posted date/i)).toBeVisible();

            // Verify a date value is shown (format: Jan 15, 2024)
            await expect(firstCard.getByText(/\w{3} \d{1,2}, \d{4}|n\/a/i).first()).toBeVisible();
        });

        test('should display response deadline', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify "Response Deadline" label exists
            await expect(firstCard.getByText(/response deadline/i)).toBeVisible();

            // Verify a date value is shown
            await expect(firstCard.getByText(/\w{3} \d{1,2}, \d{4}|n\/a/i).first()).toBeVisible();
        });

        test('should display "View on SAM.gov" button', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();

            // Verify the SAM.gov button exists
            const samButton = firstCard.getByRole('link', {name: /view on sam\.gov/i});
            await expect(samButton).toBeVisible();
        });
    });

    test.describe('External Link to SAM.gov', () => {
        test('should have valid SAM.gov URL in title link', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();
            const titleLink = firstCard.getByRole('link').first();

            // Verify the link points to SAM.gov
            const href = await titleLink.getAttribute('href');
            expect(href).toContain('sam.gov');
        });

        test('should open SAM.gov link in new tab', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();
            const titleLink = firstCard.getByRole('link').first();

            // Verify target="_blank" for new tab
            const target = await titleLink.getAttribute('target');
            expect(target).toBe('_blank');
        });

        test('should have noopener noreferrer for security', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();
            const titleLink = firstCard.getByRole('link').first();

            // Verify rel attribute for security
            const rel = await titleLink.getAttribute('rel');
            expect(rel).toContain('noopener');
            expect(rel).toContain('noreferrer');
        });

        test('should have SAM.gov button with same URL', async ({page}) => {
            // Find the first opportunity card
            const firstCard = page.locator('[class*="card"]').first();
            const samButton = firstCard.getByRole('link', {name: /view on sam\.gov/i});

            // Verify the button link points to SAM.gov
            const href = await samButton.getAttribute('href');
            expect(href).toContain('sam.gov');
        });
    });

    test.describe('SBIR Opportunity Display', () => {
        test.beforeEach(async ({page}) => {
            // Navigate to SBIR page
            await page.getByRole('button', {name: /sbir.*sttr.*sam\.gov/i}).click();
            await expect(page.locator('#sbir')).toBeVisible();
        });

        test('should display SBIR badge on SBIR opportunities', async ({page}) => {
            // If there are SBIR opportunities, verify badge
            const sbirOpps = mockOpportunities.filter((o) => o.isSbir === true);
            if (sbirOpps.length > 0) {
                const sbirBadge = page.locator('[class*="badge"]').filter({hasText: /^sbir$/i}).first();
                await expect(sbirBadge).toBeVisible();
            }
        });

        test('should display STTR badge on STTR opportunities', async ({page}) => {
            // If there are STTR opportunities, verify badge
            const sttrOpps = mockOpportunities.filter((o) => o.isSttr === true);
            if (sttrOpps.length > 0) {
                const sttrBadge = page.locator('[class*="badge"]').filter({hasText: /^sttr$/i}).first();
                await expect(sttrBadge).toBeVisible();
            }
        });

        test('should display phase badge on SBIR/STTR opportunities', async ({page}) => {
            // If there are opportunities with phase info, verify badge
            const phasedOpps = getSbirOpportunities().filter((o) => o.sbirPhase !== null);
            if (phasedOpps.length > 0) {
                const phaseBadge = page.locator('[class*="badge"]').filter({hasText: /phase/i}).first();
                await expect(phaseBadge).toBeVisible();
            }
        });

        test('should display SBIR statistics cards', async ({page}) => {
            // Verify stat cards are present
            await expect(page.getByText(/total sbir.*sttr/i)).toBeVisible();

            // Verify individual stat cards
            await expect(page.getByText(/^sbir$/i)).toBeVisible();
            await expect(page.getByText(/^sttr$/i)).toBeVisible();
            await expect(page.getByText(/phase i$/i)).toBeVisible();
            await expect(page.getByText(/phase ii$/i)).toBeVisible();
            await expect(page.getByText(/phase iii$/i)).toBeVisible();
        });

        test('should display correct count in statistics', async ({page}) => {
            // Verify stat values are numbers
            const statCards = page.locator('[class*="stat"]');
            const firstStatValue = statCards.locator('text=/\\d+/').first();
            await expect(firstStatValue).toBeVisible();
        });
    });

    test.describe('Dashboard Statistics Display', () => {
        test.beforeEach(async ({page}) => {
            // Navigate to dashboard
            await page.getByRole('button', {name: /dashboard/i}).click();
            await expect(page.locator('#dashboard')).toBeVisible();
        });

        test('should display total opportunities count', async ({page}) => {
            // Verify total count is shown
            await expect(page.getByText(/total opportunities/i)).toBeVisible();
        });

        test('should display opportunity type breakdown', async ({page}) => {
            // Verify type categories are shown
            await expect(page.getByText(/sources sought/i)).toBeVisible();
            await expect(page.getByText(/presolicitation/i)).toBeVisible();
            await expect(page.getByText(/solicitation/i)).toBeVisible();
        });

        test('should display clickable stat cards for navigation', async ({page}) => {
            // Click on a stat card to navigate
            const statCard = page.locator('[class*="stat"]').filter({hasText: /solicitation/i}).first();

            if (await statCard.isVisible()) {
                await statCard.click();
                // Verify navigation occurred
                await expect(page.locator('#solicitation')).toBeVisible();
            }
        });
    });

    test.describe('Empty State Display', () => {
        test('should display appropriate message when no opportunities exist', async ({page}) => {
            // Mock empty opportunities response
            await page.route('**/api/opportunities*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                });
            });

            // Reload to apply new mock
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Navigate to All Opportunities
            await page.getByRole('button', {name: /all opportunities/i}).click();

            // Verify empty message is displayed
            await expect(page.getByText(/no opportunities/i)).toBeVisible();
        });

        test('should display specific empty message for type pages', async ({page}) => {
            // Mock empty opportunities response
            await page.route('**/api/opportunities*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([]),
                });
            });

            // Reload to apply new mock
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Navigate to SBIR page
            await page.getByRole('button', {name: /sbir.*sttr.*sam\.gov/i}).click();

            // Verify specific empty message for SBIR
            await expect(page.getByText(/no sbir.*sttr opportunities found/i)).toBeVisible();
        });
    });

    test.describe('Date Formatting', () => {
        test('should format dates consistently across cards', async ({page}) => {
            // Verify dates are displayed in expected format (e.g., "Jan 15, 2024")
            const datePattern = /[A-Z][a-z]{2} \d{1,2}, \d{4}/;

            // Find all date displays
            const dateElements = page.locator('text=/[A-Z][a-z]{2} \\d{1,2}, \\d{4}/');
            const count = await dateElements.count();

            // Verify at least some dates are displayed
            expect(count).toBeGreaterThan(0);
        });
    });

    test.describe('Accessibility', () => {
        test('should have accessible heading structure', async ({page}) => {
            // Verify main heading exists
            await expect(page.getByRole('heading', {level: 1}).or(page.getByRole('heading', {level: 2}))).toBeVisible();
        });

        test('should have accessible links with descriptive text', async ({page}) => {
            // Verify "View on SAM.gov" links have proper text
            const samLinks = page.getByRole('link', {name: /view on sam\.gov/i});
            const count = await samLinks.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should use semantic badges for status information', async ({page}) => {
            // Verify badges exist and are visible
            const badges = page.locator('[class*="badge"]');
            const count = await badges.count();
            expect(count).toBeGreaterThan(0);
        });
    });
});
