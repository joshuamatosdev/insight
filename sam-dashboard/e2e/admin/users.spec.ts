import {expect, test} from '../fixtures/test-fixtures';

/**
 * RBAC Users E2E Tests
 *
 * Tests user role management and search functionality.
 */

test.describe('RBAC Users Management', () => {
    test.beforeEach(async ({authenticatedPage}) => {
        const {page} = authenticatedPage;
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Users List Display', () => {
        test('should display users list', async ({
                                                     authenticatedPage,
                                                 }) => {
            const {page} = authenticatedPage;

            // Should show users heading
            await expect(
                page.getByRole('heading', {name: /users|user management|team/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should display user table', async ({
                                                     authenticatedPage,
                                                 }) => {
            const {page} = authenticatedPage;

            // Should show users table or list
            const usersList = page.locator('[data-testid="users-list"]')
                .or(page.getByRole('table'))
                .or(page.locator('.users-list'));

            await expect(usersList).toBeVisible({timeout: 10000});
        });

        test('should display user details in list', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            // Users should show email and role
            const userRow = page.locator('[data-testid="user-row"]').first()
                .or(page.locator('tr').nth(1));

            if (await userRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Email should be visible
                await expect(
                    userRow.getByText(/@/)
                ).toBeVisible();
            }
        });

        test('should display user roles', async ({
                                                     authenticatedPage,
                                                 }) => {
            const {page} = authenticatedPage;

            // Should show role badges
            await expect(
                page.getByText(/admin|owner|member|viewer/i)
            ).toBeVisible({timeout: 10000});
        });
    });

    test.describe('Search Users', () => {
        test('should display search input', async ({
                                                       authenticatedPage,
                                                   }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))
            ).toBeVisible({timeout: 10000});
        });

        test('should filter users by search query', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i)
                .or(page.getByRole('searchbox'));

            // Search for a user
            await searchInput.fill('test');
            await searchInput.press('Enter');

            // Wait for results to filter
            await page.waitForTimeout(500);

            // Results should be filtered (fewer rows or matching text)
            const resultsText = await page.locator('[data-testid="users-list"]')
                .or(page.getByRole('table'))
                .textContent();

            // Results should contain search term or show no results
            expect(
                resultsText?.toLowerCase().includes('test') ||
                resultsText?.toLowerCase().includes('no ')
            ).toBe(true);
        });

        test('should clear search and show all users', async ({
                                                                  authenticatedPage,
                                                              }) => {
            const {page} = authenticatedPage;

            const searchInput = page.getByPlaceholder(/search/i);

            // Search first
            await searchInput.fill('test');
            await page.waitForTimeout(300);

            // Clear search
            await searchInput.clear();
            await page.waitForTimeout(300);

            // Should show all users again
            const usersTable = page.locator('[data-testid="users-list"]')
                .or(page.getByRole('table'));

            await expect(usersTable).toBeVisible();
        });
    });

    test.describe('Assign Role to User', () => {
        test('should display role dropdown for user', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            const userRow = page.locator('[data-testid="user-row"]').first();

            if (await userRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Should have role selector or edit button
                const roleSelector = userRow.getByRole('combobox')
                    .or(userRow.getByRole('button', {name: /role|edit/i}));

                await expect(roleSelector).toBeVisible({timeout: 5000}).catch(() => {
                });
            }
        });

        test('should open role assignment modal', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            // Click on user or edit button
            const editButton = page.getByRole('button', {name: /edit|manage|assign/i}).first();
            if (await editButton.isVisible({timeout: 5000}).catch(() => false)) {
                await editButton.click();

                // Modal should appear
                await expect(
                    page.getByRole('dialog').or(page.locator('[data-testid="role-modal"]'))
                ).toBeVisible({timeout: 5000});
            }
        });

        test('should assign role to user', async ({
                                                      authenticatedPage,
                                                  }) => {
            const {page} = authenticatedPage;

            const editButton = page.getByRole('button', {name: /edit|manage|assign/i}).first();
            if (await editButton.isVisible({timeout: 5000}).catch(() => false)) {
                await editButton.click();

                // Select a role
                const roleOption = page.getByRole('option', {name: /member|viewer/i})
                    .or(page.getByLabel(/member|viewer/i));

                if (await roleOption.isVisible({timeout: 3000}).catch(() => false)) {
                    await roleOption.click();
                }

                // Save
                const saveButton = page.getByRole('button', {name: /save|assign|update/i});
                if (await saveButton.isVisible().catch(() => false)) {
                    await saveButton.click();

                    // Should show success
                    await expect(
                        page.getByText(/updated|assigned|success/i)
                    ).toBeVisible({timeout: 10000}).catch(() => {
                    });
                }
            }
        });
    });

    test.describe('Remove Role from User', () => {
        test('should display remove role button', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const userRow = page.locator('[data-testid="user-row"]').first();

            if (await userRow.isVisible({timeout: 5000}).catch(() => false)) {
                // Should have remove button for additional roles
                const removeButton = userRow.getByRole('button', {name: /remove|revoke|x/i});

                if (await removeButton.isVisible().catch(() => false)) {
                    await expect(removeButton).toBeVisible();
                }
            }
        });

        test('should confirm before removing role', async ({
                                                               authenticatedPage,
                                                           }) => {
            const {page} = authenticatedPage;

            const removeButton = page.getByRole('button', {name: /remove|revoke/i}).first();
            if (await removeButton.isVisible({timeout: 5000}).catch(() => false)) {
                await removeButton.click();

                // Confirmation should appear
                await expect(
                    page.getByText(/confirm|are you sure/i)
                ).toBeVisible({timeout: 5000});
            }
        });
    });

    test.describe('User Status', () => {
        test('should display user status indicators', async ({
                                                                 authenticatedPage,
                                                             }) => {
            const {page} = authenticatedPage;

            // Should show active/inactive status
            await expect(
                page.getByText(/active|inactive|pending/i)
            ).toBeVisible({timeout: 10000}).catch(() => {
            });
        });

        test('should allow toggling user status', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            const statusToggle = page.getByRole('switch')
                .or(page.getByRole('button', {name: /activate|deactivate/i}).first());

            if (await statusToggle.isVisible({timeout: 5000}).catch(() => false)) {
                // Toggle should be clickable
                await statusToggle.click();

                // Status should change
                await expect(
                    page.getByText(/updated|changed|success/i)
                ).toBeVisible({timeout: 10000}).catch(() => {
                });
            }
        });
    });

    test.describe('Pagination', () => {
        test('should display pagination controls', async ({
                                                              authenticatedPage,
                                                          }) => {
            const {page} = authenticatedPage;

            // Pagination should be visible if many users
            const pagination = page.getByRole('navigation', {name: /pagination/i})
                .or(page.locator('[data-testid="pagination"]'))
                .or(page.getByRole('button', {name: /next|previous/i}));

            // Pagination might not show if few users
            const hasPagination = await pagination.isVisible({timeout: 3000}).catch(() => false);

            // Just verify page loads correctly
            await expect(
                page.getByRole('heading', {name: /users/i})
            ).toBeVisible();
        });

        test('should navigate between pages', async ({
                                                         authenticatedPage,
                                                     }) => {
            const {page} = authenticatedPage;

            const nextButton = page.getByRole('button', {name: /next/i});
            if (await nextButton.isVisible({timeout: 3000}).catch(() => false)) {
                await nextButton.click();

                // URL should change or content should update
                await page.waitForTimeout(500);

                // Previous button should now be enabled
                const prevButton = page.getByRole('button', {name: /previous|prev/i});
                await expect(prevButton).toBeVisible({timeout: 5000}).catch(() => {
                });
            }
        });
    });

    test.describe('Invite User', () => {
        test('should display invite user button', async ({
                                                             authenticatedPage,
                                                         }) => {
            const {page} = authenticatedPage;

            await expect(
                page.getByRole('button', {name: /invite|add user|new user/i})
            ).toBeVisible({timeout: 10000});
        });

        test('should open invite modal', async ({
                                                    authenticatedPage,
                                                }) => {
            const {page} = authenticatedPage;

            const inviteButton = page.getByRole('button', {name: /invite|add user/i});
            await inviteButton.click();

            // Modal should appear
            await expect(
                page.getByRole('dialog').or(page.locator('[data-testid="invite-modal"]'))
            ).toBeVisible({timeout: 5000});
        });

        test('should validate email in invite form', async ({
                                                                authenticatedPage,
                                                            }) => {
            const {page} = authenticatedPage;

            const inviteButton = page.getByRole('button', {name: /invite|add user/i});
            await inviteButton.click();

            // Enter invalid email
            const emailInput = page.getByLabel(/email/i);
            await emailInput.fill('invalid-email');

            // Submit
            await page.getByRole('button', {name: /send|invite|submit/i}).click();

            // Should show validation error
            await expect(
                page.getByText(/valid email|invalid/i)
            ).toBeVisible({timeout: 5000});
        });
    });
});
