import { Page } from '@playwright/test';
import { Opportunity } from '../../src/components/domain/opportunity/Opportunity.types';

/**
 * Mock opportunity data for E2E tests
 */

// ============================================================================
// Mock Data
// ============================================================================

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Software Development Services for Federal Agency',
    solicitationNumber: 'FA8528-24-R-0001',
    type: 'Solicitation',
    naicsCode: '541511',
    postedDate: '2024-01-15',
    responseDeadLine: '2024-02-15',
    url: 'https://sam.gov/opp/1234567890',
    isSbir: false,
    isSttr: false,
    sbirPhase: null,
  },
  {
    id: '2',
    title: 'Cloud Infrastructure Modernization',
    solicitationNumber: 'W912HZ-24-R-0002',
    type: 'Presolicitation',
    naicsCode: '541512',
    postedDate: '2024-01-10',
    responseDeadLine: '2024-03-01',
    url: 'https://sam.gov/opp/2345678901',
    isSbir: false,
    isSttr: false,
    sbirPhase: null,
  },
  {
    id: '3',
    title: 'Cybersecurity Assessment Services',
    solicitationNumber: 'GSA-24-SS-0003',
    type: 'Sources Sought',
    naicsCode: '541519',
    postedDate: '2024-01-20',
    responseDeadLine: '2024-02-28',
    url: 'https://sam.gov/opp/3456789012',
    isSbir: false,
    isSttr: false,
    sbirPhase: null,
  },
  {
    id: '4',
    title: 'AI/ML Research and Development - Phase I',
    solicitationNumber: 'DARPA-SBIR-24-0001',
    type: 'SBIR',
    naicsCode: '541715',
    postedDate: '2024-01-05',
    responseDeadLine: '2024-04-01',
    url: 'https://sam.gov/opp/4567890123',
    isSbir: true,
    isSttr: false,
    sbirPhase: 'I',
  },
  {
    id: '5',
    title: 'Quantum Computing Research Partnership',
    solicitationNumber: 'NSF-STTR-24-0001',
    type: 'STTR',
    naicsCode: '541715',
    postedDate: '2024-01-12',
    responseDeadLine: '2024-03-15',
    url: 'https://sam.gov/opp/5678901234',
    isSbir: false,
    isSttr: true,
    sbirPhase: 'II',
  },
  {
    id: '6',
    title: 'Data Analytics Platform Development',
    solicitationNumber: 'VA-24-SOL-0006',
    type: 'Solicitation',
    naicsCode: '541511',
    postedDate: '2024-01-18',
    responseDeadLine: '2024-02-25',
    url: 'https://sam.gov/opp/6789012345',
    isSbir: false,
    isSttr: false,
    sbirPhase: null,
  },
  {
    id: '7',
    title: 'Medical Device Innovation - SBIR Phase III',
    solicitationNumber: 'HHS-SBIR-24-0007',
    type: 'SBIR',
    naicsCode: '541714',
    postedDate: '2024-01-22',
    responseDeadLine: '2024-05-01',
    url: 'https://sam.gov/opp/7890123456',
    isSbir: true,
    isSttr: false,
    sbirPhase: 'III',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Setup API route mocks for opportunity-related endpoints
 */
export async function mockOpportunitiesApi(page: Page, opportunities: Opportunity[] = mockOpportunities): Promise<void> {
  await page.route('**/api/opportunities*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(opportunities),
    });
  });
}

/**
 * Setup API route mock for ingest endpoint
 */
export async function mockIngestApi(page: Page): Promise<void> {
  await page.route('**/api/ingest*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Data refreshed' }),
    });
  });
}

/**
 * Setup all API mocks needed for opportunity tests
 */
export async function setupOpportunityMocks(page: Page, opportunities: Opportunity[] = mockOpportunities): Promise<void> {
  await mockOpportunitiesApi(page, opportunities);
  await mockIngestApi(page);
}

/**
 * Get opportunities filtered by type
 */
export function getOpportunitiesByType(type: string): Opportunity[] {
  const typeLower = type.toLowerCase();
  return mockOpportunities.filter((o) => o.type.toLowerCase().includes(typeLower));
}

/**
 * Get SBIR/STTR opportunities
 */
export function getSbirOpportunities(): Opportunity[] {
  return mockOpportunities.filter((o) => o.isSbir === true || o.isSttr === true);
}

/**
 * Get opportunities by NAICS code
 */
export function getOpportunitiesByNaics(naicsCode: string): Opportunity[] {
  return mockOpportunities.filter((o) => o.naicsCode === naicsCode);
}

/**
 * Search opportunities by keyword
 */
export function searchOpportunities(keyword: string): Opportunity[] {
  const query = keyword.toLowerCase();
  return mockOpportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(query) ||
      o.solicitationNumber.toLowerCase().includes(query) ||
      o.naicsCode.includes(query)
  );
}

/**
 * Create an opportunity with custom properties
 */
export function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: `mock-${Date.now()}`,
    title: 'Mock Opportunity',
    solicitationNumber: 'MOCK-24-0001',
    type: 'Solicitation',
    naicsCode: '541511',
    postedDate: new Date().toISOString().split('T')[0] ?? '',
    responseDeadLine: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
    url: 'https://sam.gov/opp/mock',
    isSbir: false,
    isSttr: false,
    sbirPhase: null,
    ...overrides,
  };
}

/**
 * Create multiple mock opportunities
 */
export function createMockOpportunities(count: number, overrides: Partial<Opportunity> = {}): Opportunity[] {
  return Array.from({ length: count }, (_, index) =>
    createMockOpportunity({
      id: `mock-${index}`,
      title: `Mock Opportunity ${index + 1}`,
      solicitationNumber: `MOCK-24-${String(index + 1).padStart(4, '0')}`,
      ...overrides,
    })
  );
}
