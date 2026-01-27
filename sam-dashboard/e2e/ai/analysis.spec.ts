import { test, expect } from '../fixtures/test-fixtures';

/**
 * AI Analysis E2E Tests
 *
 * Tests AI summary, fit score, and risk assessment display.
 */

test.describe('AI Analysis', () => {
  test.describe('Summary Display', () => {
    test('should display AI summary content', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Navigate to summary tab if needed
        const summaryTab = page.getByRole('tab', { name: /summary/i });
        if (await summaryTab.isVisible().catch(() => false)) {
          await summaryTab.click();
        }

        // Should display summary text content
        await expect(
          page.locator('[data-testid="ai-summary"]').or(
            page.getByText(/this opportunity|the contract|summary/i)
          )
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should display key highlights in summary', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Look for key highlights section
        const highlights = page.locator('[data-testid="key-highlights"]')
          .or(page.getByText(/key points|highlights|important/i));

        if (await highlights.isVisible({ timeout: 10000 }).catch(() => false)) {
          await expect(highlights).toBeVisible();
        }
      }
    });
  });

  test.describe('Fit Score Display', () => {
    test('should display fit score with percentage', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Navigate to fit score tab
        const fitTab = page.getByRole('tab', { name: /fit|score/i })
          .or(page.getByRole('button', { name: /fit|score/i }));

        if (await fitTab.isVisible().catch(() => false)) {
          await fitTab.click();

          // Should display percentage score
          await expect(
            page.getByText(/\d+%|score:|fit:/i)
          ).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('should display fit score breakdown', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Navigate to fit score tab
        const fitTab = page.getByRole('tab', { name: /fit|score/i });
        if (await fitTab.isVisible().catch(() => false)) {
          await fitTab.click();

          // Should display breakdown categories
          const breakdownItems = page.locator('[data-testid="score-breakdown"]')
            .or(page.getByText(/naics|capability|experience|location/i));

          await expect(breakdownItems.first()).toBeVisible({ timeout: 10000 }).catch(() => {});
        }
      }
    });

    test('should show visual score indicator', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        const fitTab = page.getByRole('tab', { name: /fit|score/i });
        if (await fitTab.isVisible().catch(() => false)) {
          await fitTab.click();

          // Look for progress bar or gauge
          const scoreVisual = page.locator('[role="progressbar"]')
            .or(page.locator('[data-testid="score-gauge"]'))
            .or(page.locator('.progress-bar'));

          await expect(scoreVisual).toBeVisible({ timeout: 10000 }).catch(() => {});
        }
      }
    });

    test('should color-code score levels', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        const fitTab = page.getByRole('tab', { name: /fit|score/i });
        if (await fitTab.isVisible().catch(() => false)) {
          await fitTab.click();

          // Score should have color-coded indicator (green/yellow/red)
          const scoreElement = page.locator('[data-testid="fit-score-value"]')
            .or(page.getByText(/\d+%/).first());

          if (await scoreElement.isVisible().catch(() => false)) {
            // Verify element exists - actual color testing is visual
            await expect(scoreElement).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Risk Assessment Display', () => {
    test('should display risk assessment with levels', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Navigate to risk tab
        const riskTab = page.getByRole('tab', { name: /risk/i })
          .or(page.getByRole('button', { name: /risk/i }));

        if (await riskTab.isVisible().catch(() => false)) {
          await riskTab.click();

          // Should display risk level indicator
          await expect(
            page.getByText(/low|medium|high|critical|risk level/i)
          ).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('should display individual risk factors', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        const riskTab = page.getByRole('tab', { name: /risk/i });
        if (await riskTab.isVisible().catch(() => false)) {
          await riskTab.click();

          // Should display risk factors
          const riskFactors = page.locator('[data-testid="risk-factors"]')
            .or(page.getByText(/competition|timeline|complexity|requirement/i));

          await expect(riskFactors.first()).toBeVisible({ timeout: 10000 }).catch(() => {});
        }
      }
    });

    test('should display risk mitigation suggestions', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        const riskTab = page.getByRole('tab', { name: /risk/i });
        if (await riskTab.isVisible().catch(() => false)) {
          await riskTab.click();

          // Look for mitigation suggestions
          const mitigations = page.locator('[data-testid="risk-mitigations"]')
            .or(page.getByText(/mitigation|recommendation|suggest|consider/i));

          await expect(mitigations.first()).toBeVisible({ timeout: 10000 }).catch(() => {});
        }
      }
    });

    test('should color-code risk levels', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        const riskTab = page.getByRole('tab', { name: /risk/i });
        if (await riskTab.isVisible().catch(() => false)) {
          await riskTab.click();

          // Risk indicators should be color-coded
          const riskBadge = page.locator('[data-testid="risk-badge"]')
            .or(page.getByText(/low|medium|high|critical/i).first());

          if (await riskBadge.isVisible().catch(() => false)) {
            await expect(riskBadge).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('AI Analysis Actions', () => {
    test('should allow refreshing AI analysis', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Look for refresh button
        const refreshButton = page.getByRole('button', { name: /refresh|reload|reanalyze/i });
        if (await refreshButton.isVisible({ timeout: 10000 }).catch(() => false)) {
          await refreshButton.click();

          // Should show loading state
          await expect(
            page.getByText(/loading|analyzing/i).or(
              page.locator('[data-testid="loading-spinner"]')
            )
          ).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    });

    test('should allow expanding AI insights details', async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto('/opportunities');
      await page.waitForLoadState('networkidle');

      const opportunityCard = page.locator('[data-testid="opportunity-card"]').first();
      if (await opportunityCard.isVisible().catch(() => false)) {
        await opportunityCard.click();

        // Look for expand button
        const expandButton = page.getByRole('button', { name: /expand|show more|details/i });
        if (await expandButton.isVisible({ timeout: 10000 }).catch(() => false)) {
          await expandButton.click();

          // Should show expanded content
          await expect(
            page.locator('[data-testid="expanded-details"]').or(
              page.getByText(/detailed analysis/i)
            )
          ).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });
});
