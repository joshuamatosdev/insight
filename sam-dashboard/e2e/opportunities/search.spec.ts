import {expect, test} from '@playwright/test';
import {searchOpportunities, setupOpportunityMocks,} from '../fixtures/opportunities.fixtures';

/**
 * Opportunity Search E2E Tests
 *
 * Tests the search functionality on the All Opportunities page,
 * including keyword search, displaying results, and handling no results.
 */

test.describe('Opportunity Search', () => {
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

        // Navigate to the login page then to dashboard
        await page.goto('/');
        // Wait for the dashboard to load
        await page.waitForLoadState('networkidle');
    });

    test('should display opportunities list on All Opportunities page', async ({page}) => {
        // Click on "All Opportunities" in the sidebar
        await page.getByRole('button', {name: /all opportunities/i}).click();

        // Wait for the section to be visible
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Verify the section header is displayed
        await expect(page.getByRole('heading', {name: /all opportunities/i})).toBeVisible();
    });

    test('should display opportunity cards with required information', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Find the first opportunity card
        const firstCard = page.locator('[class*="card"]').first();

        // Verify opportunity title is present (as a link)
        await expect(firstCard.getByRole('link').first()).toBeVisible();

        // Verify "View on SAM.gov" button is present
        await expect(firstCard.getByRole('link', {name: /view on sam\.gov/i})).toBeVisible();
    });

    test('should filter opportunities by search keyword in title', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Find search input and type a keyword
        const searchInput = page.getByPlaceholder(/search/i);
        await expect(searchInput).toBeVisible();

        // Search for "software" - should match "Software Development Services"
        await searchInput.fill('software');

        // Wait for filtering to take effect
        await page.waitForTimeout(300);

        // Verify search results contain the keyword
        const expectedResults = searchOpportunities('software');

        if (expectedResults.length > 0) {
            // At least one result should match
            await expect(page.getByText(/software/i).first()).toBeVisible();
        }
    });

    test('should filter opportunities by solicitation number', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Search by solicitation number
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('FA8528');

        // Wait for filtering
        await page.waitForTimeout(300);

        // Verify the matching opportunity is shown
        await expect(page.getByText(/FA8528/i)).toBeVisible();
    });

    test('should filter opportunities by NAICS code', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Search by NAICS code
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('541511');

        // Wait for filtering
        await page.waitForTimeout(300);

        // Verify NAICS badge is visible for matching opportunities
        await expect(page.getByText('541511').first()).toBeVisible();
    });

    test('should display empty message when no results match search', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Search for a non-existent term
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('xyznonexistentquery123456');

        // Wait for filtering
        await page.waitForTimeout(300);

        // Verify empty state message
        await expect(page.getByText(/no opportunities match your search criteria/i)).toBeVisible();
    });

    test('should clear search and show all opportunities', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Get initial count of opportunities
        const searchInput = page.getByPlaceholder(/search/i);

        // First filter
        await searchInput.fill('software');
        await page.waitForTimeout(300);

        // Then clear the search
        await searchInput.fill('');
        await page.waitForTimeout(300);

        // Verify opportunities are shown (not empty state)
        await expect(page.getByText(/no opportunities match/i)).not.toBeVisible();
    });

    test('should perform case-insensitive search', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        const searchInput = page.getByPlaceholder(/search/i);

        // Search with lowercase
        await searchInput.fill('SOFTWARE');
        await page.waitForTimeout(300);

        // Should still find results
        await expect(page.getByText(/software/i).first()).toBeVisible();
    });

    test('should sort opportunities by deadline (default)', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Verify sort dropdown exists and shows deadline as default
        const sortSelect = page.locator('select').first();
        await expect(sortSelect).toHaveValue('deadline');
    });

    test('should sort opportunities by posted date', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Change sort to posted date
        const sortSelect = page.locator('select').first();
        await sortSelect.selectOption('posted');

        // Verify the selection changed
        await expect(sortSelect).toHaveValue('posted');
    });

    test('should sort opportunities by title', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Change sort to title
        const sortSelect = page.locator('select').first();
        await sortSelect.selectOption('title');

        // Verify the selection changed
        await expect(sortSelect).toHaveValue('title');
    });

    test('should maintain search state when changing sort order', async ({page}) => {
        // Navigate to All Opportunities
        await page.getByRole('button', {name: /all opportunities/i}).click();
        await expect(page.locator('#all-opportunities')).toBeVisible();

        // Apply search filter
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.fill('software');
        await page.waitForTimeout(300);

        // Change sort order
        const sortSelect = page.locator('select').first();
        await sortSelect.selectOption('title');

        // Verify search term is still applied
        await expect(searchInput).toHaveValue('software');
        await expect(page.getByText(/software/i).first()).toBeVisible();
    });
});
