/**
 * E2E Test Fixtures
 *
 * This module exports all test fixtures, page objects, and mock data
 * for use in Playwright E2E tests.
 */

// Core test fixtures and page objects
export {
  test,
  expect,
  AuthPage,
  OpportunitiesPage,
  DashboardPage,
  waitForPageLoad,
  takeScreenshot,
  clearAuthStorage,
  isAuthenticated,
  mockAuthResponse,
  setupAuthMocks,
} from './test-fixtures';

export type { TestUser, AuthenticatedPageFixture } from './test-fixtures';

// Opportunity-specific fixtures and mock data
export {
  mockOpportunities,
  mockOpportunitiesApi,
  mockIngestApi,
  setupOpportunityMocks,
  getOpportunitiesByType,
  getSbirOpportunities,
  getOpportunitiesByNaics,
  searchOpportunities,
  createMockOpportunity,
  createMockOpportunities,
} from './opportunities.fixtures';
