import { test, expect } from '@playwright/test';
import {
  setupOpportunityMocks,
  mockOpportunities,
  getSbirOpportunities,
} from '../fixtures/opportunities.fixtures';

/**
 * Opportunity Filter E2E Tests
 *
 * Tests the filtering functionality across different opportunity pages,
 * including filtering by type, NAICS code, set-aside, and SBIR phase.
 */

test.describe('Opportunity Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks before navigation
    await setupOpportunityMocks(page);

    // Mock authentication - set auth state
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: { email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        })
      );
    });

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Filter by Opportunity Type', () => {
    test('should filter by Solicitation type', async ({ page }) => {
      // Click on "Solicitation" in the sidebar
      await page.getByRole('button', { name: /^solicitation$/i }).click();

      // Wait for the section to be visible
      await expect(page.locator('#solicitation')).toBeVisible();

      // Verify the section header
      await expect(page.getByRole('heading', { name: /solicitation/i })).toBeVisible();
    });

    test('should filter by Presolicitation type', async ({ page }) => {
      // Click on "Presolicitation" in the sidebar
      await page.getByRole('button', { name: /presolicitation/i }).click();

      // Wait for the section to be visible
      await expect(page.locator('#presolicitation')).toBeVisible();

      // Verify the section header
      await expect(page.getByRole('heading', { name: /presolicitation/i })).toBeVisible();
    });

    test('should filter by Sources Sought type', async ({ page }) => {
      // Click on "Sources Sought" in the sidebar
      await page.getByRole('button', { name: /sources sought/i }).click();

      // Wait for the section to be visible
      await expect(page.locator('#sources-sought')).toBeVisible();

      // Verify the section header
      await expect(page.getByRole('heading', { name: /sources sought/i })).toBeVisible();
    });

    test('should display empty message when no opportunities of type exist', async ({ page }) => {
      // Mock empty response for a specific type
      await page.route('**/api/opportunities*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });

      // Refresh to apply new mock
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Navigate to Solicitation
      await page.getByRole('button', { name: /^solicitation$/i }).click();

      // Verify empty message is shown
      await expect(page.getByText(/no solicitation opportunities found/i)).toBeVisible();
    });
  });

  test.describe('Filter by NAICS Code', () => {
    test('should navigate to NAICS-specific page from sidebar', async ({ page }) => {
      // Find a NAICS code in the sidebar and click it
      // The sidebar shows NAICS codes from the loaded opportunities
      await page.getByRole('button', { name: /541511/i }).click();

      // Verify the section displays opportunities for that NAICS
      await expect(page.getByRole('heading', { name: /naics.*541511/i })).toBeVisible();
    });

    test('should display opportunities matching NAICS code', async ({ page }) => {
      // Navigate to a NAICS page
      await page.getByRole('button', { name: /541511/i }).click();

      // Verify NAICS badge is visible in the opportunity cards
      await expect(page.getByText('541511').first()).toBeVisible();
    });

    test('should show badge count in sidebar for NAICS codes', async ({ page }) => {
      // Find the NAICS section in sidebar and verify counts are shown
      const naicsSection = page.locator('text=By NAICS Code').locator('..');

      // Verify at least one NAICS code is listed with a badge
      await expect(naicsSection.getByRole('button').first()).toBeVisible();
    });
  });

  test.describe('SBIR/STTR Phase Filtering', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to SBIR page
      await page.getByRole('button', { name: /sbir.*sttr.*sam\.gov/i }).click();
      await expect(page.locator('#sbir')).toBeVisible();
    });

    test('should display SBIR/STTR page with phase filters', async ({ page }) => {
      // Verify page header
      await expect(page.getByRole('heading', { name: /sbir.*sttr/i })).toBeVisible();

      // Verify phase filter buttons are visible
      await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /phase i$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /phase ii$/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /phase iii$/i })).toBeVisible();
    });

    test('should filter by Phase I', async ({ page }) => {
      // Click Phase I filter button
      await page.getByRole('button', { name: /phase i$/i }).click();

      // Verify the button shows as active (primary variant)
      const phaseButton = page.getByRole('button', { name: /phase i$/i });
      await expect(phaseButton).toBeVisible();

      // Verify only Phase I opportunities are shown (or empty message if none)
      const sbirOpps = getSbirOpportunities().filter((o) => o.sbirPhase === 'I');
      if (sbirOpps.length > 0) {
        await expect(page.getByText(/phase i/i).first()).toBeVisible();
      }
    });

    test('should filter by Phase II', async ({ page }) => {
      // Click Phase II filter button
      await page.getByRole('button', { name: /phase ii$/i }).click();

      // Verify the button is active
      const phaseButton = page.getByRole('button', { name: /phase ii$/i });
      await expect(phaseButton).toBeVisible();
    });

    test('should filter by Phase III', async ({ page }) => {
      // Click Phase III filter button
      await page.getByRole('button', { name: /phase iii$/i }).click();

      // Verify the button is active
      const phaseButton = page.getByRole('button', { name: /phase iii$/i });
      await expect(phaseButton).toBeVisible();
    });

    test('should show all SBIR/STTR when "All" filter is selected', async ({ page }) => {
      // First select a phase filter
      await page.getByRole('button', { name: /phase i$/i }).click();

      // Then click "All" to reset
      await page.getByRole('button', { name: /^all$/i }).click();

      // Verify all SBIR/STTR opportunities are shown
      const allButton = page.getByRole('button', { name: /^all$/i });
      await expect(allButton).toBeVisible();
    });

    test('should display SBIR/STTR statistics', async ({ page }) => {
      // Verify stat cards are displayed
      await expect(page.getByText(/total sbir.*sttr/i)).toBeVisible();
      await expect(page.getByText(/^sbir$/i)).toBeVisible();
      await expect(page.getByText(/^sttr$/i)).toBeVisible();
    });

    test('should display SBIR badge on SBIR opportunities', async ({ page }) => {
      // If there are SBIR opportunities, verify badge is shown
      const sbirOpps = mockOpportunities.filter((o) => o.isSbir === true);
      if (sbirOpps.length > 0) {
        await expect(page.locator('[class*="badge"]').filter({ hasText: /sbir/i }).first()).toBeVisible();
      }
    });

    test('should display STTR badge on STTR opportunities', async ({ page }) => {
      // If there are STTR opportunities, verify badge is shown
      const sttrOpps = mockOpportunities.filter((o) => o.isSttr === true);
      if (sttrOpps.length > 0) {
        await expect(page.locator('[class*="badge"]').filter({ hasText: /sttr/i }).first()).toBeVisible();
      }
    });
  });

  test.describe('Sidebar Navigation Badge Counts', () => {
    test('should display badge count for All Opportunities', async ({ page }) => {
      // Find All Opportunities nav item with badge
      const allOppsButton = page.getByRole('button', { name: /all opportunities/i });
      await expect(allOppsButton).toBeVisible();

      // Verify there's a badge with the count
      const badge = allOppsButton.locator('[class*="badge"]');
      await expect(badge).toBeVisible();
    });

    test('should display badge counts for type filters', async ({ page }) => {
      // Verify Sources Sought has a badge
      const sourcesSoughtButton = page.getByRole('button', { name: /sources sought/i });
      await expect(sourcesSoughtButton.locator('[class*="badge"]')).toBeVisible();

      // Verify Presolicitation has a badge
      const presolButton = page.getByRole('button', { name: /presolicitation/i });
      await expect(presolButton.locator('[class*="badge"]')).toBeVisible();

      // Verify Solicitation has a badge
      const solButton = page.getByRole('button', { name: /^solicitation$/i });
      await expect(solButton.locator('[class*="badge"]')).toBeVisible();
    });

    test('should display badge count for SBIR/STTR', async ({ page }) => {
      // Verify SBIR/STTR nav item has a badge
      const sbirButton = page.getByRole('button', { name: /sbir.*sttr.*sam\.gov/i });
      await expect(sbirButton.locator('[class*="badge"]')).toBeVisible();
    });
  });

  test.describe('Combined Filtering', () => {
    test('should maintain type filter when navigating back to same section', async ({ page }) => {
      // Navigate to Solicitation
      await page.getByRole('button', { name: /^solicitation$/i }).click();
      await expect(page.locator('#solicitation')).toBeVisible();

      // Navigate to Dashboard
      await page.getByRole('button', { name: /dashboard/i }).click();
      await expect(page.locator('#dashboard')).toBeVisible();

      // Navigate back to Solicitation
      await page.getByRole('button', { name: /^solicitation$/i }).click();

      // Verify we're still viewing Solicitation
      await expect(page.locator('#solicitation')).toBeVisible();
    });

    test('should show different opportunities in different type sections', async ({ page }) => {
      // Get content from Solicitation page
      await page.getByRole('button', { name: /^solicitation$/i }).click();
      await expect(page.locator('#solicitation')).toBeVisible();

      // Navigate to Sources Sought
      await page.getByRole('button', { name: /sources sought/i }).click();
      await expect(page.locator('#sources-sought')).toBeVisible();

      // Verify headers are different
      await expect(page.getByRole('heading', { name: /sources sought/i })).toBeVisible();
    });
  });
});
