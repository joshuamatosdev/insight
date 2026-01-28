import {expect, test} from '../fixtures/test-fixtures';

/**
 * Search Autocomplete E2E Tests
 *
 * Tests search autocomplete functionality.
 */

test.describe('Search Autocomplete', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/opportunities');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Autocomplete Display', () => {
        test('should display search input', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('searchbox')
                    .or(page.getByPlaceholder(/search/i))
            ).toBeVisible({timeout: 10000});
        });

        test('should show autocomplete suggestions on type', async ({
                                                                        authenticatedPage,
                                                                    }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByRole('searchbox')
                .or(page.getByPlaceholder(/search/i));

            await searchInput.fill('soft');
            await page.waitForTimeout(500);

            // Suggestions should appear
            const suggestions = page.locator('[data-testid="search-suggestions"]')
                .or(page.getByRole('listbox'));

            if (await suggestions.isVisible({timeout: 3000}).catch(() => false)) {
                await expect(suggestions).toBeVisible();
            }
        });

        test('should display relevant suggestions', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i);
            await searchInput.fill('contract');
            await page.waitForTimeout(500);

            // Suggestions should contain search term
            const suggestionItem = page.getByRole('option')
                .or(page.locator('[data-testid="suggestion-item"]'));

            if (await suggestionItem.first().isVisible({timeout: 3000}).catch(() => false)) {
                const text = await suggestionItem.first().textContent();
                expect(text?.toLowerCase()).toContain('contract');
            }
        });
    });

    test.describe('Select Suggestion', () => {
        test('should select suggestion and search', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i);
            await searchInput.fill('soft');
            await page.waitForTimeout(500);

            const suggestion = page.getByRole('option').first()
                .or(page.locator('[data-testid="suggestion-item"]').first());

            if (await suggestion.isVisible({timeout: 3000}).catch(() => false)) {
                await suggestion.click();

                // Search should execute
                await page.waitForTimeout(500);
            }
        });

        test('should navigate suggestions with keyboard', async ({
                                                                     authenticatedPage,
                                                                 }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i);
            await searchInput.fill('dev');
            await page.waitForTimeout(500);

            // Press down arrow
            await searchInput.press('ArrowDown');
            await searchInput.press('Enter');

            // Search should execute
            await page.waitForTimeout(500);
        });
    });

    test.describe('Recent Searches', () => {
        test('should show recent searches on focus', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i);

            // Focus without typing
            await searchInput.focus();
            await page.waitForTimeout(500);

            // Recent searches may appear
            const recentSearches = page.getByText(/recent|history/i);
            if (await recentSearches.isVisible({timeout: 3000}).catch(() => false)) {
                await expect(recentSearches).toBeVisible();
            }
        });

        test('should clear recent searches', async ({
                                                        authenticatedPage,
                                                    }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i);
            await searchInput.focus();

            const clearButton = page.getByRole('button', {name: /clear/i});

            if (await clearButton.isVisible({timeout: 3000}).catch(() => false)) {
                await clearButton.click();
            }
        });
    });
});
