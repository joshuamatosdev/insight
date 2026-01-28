import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
    fetchOpportunities,
    fetchSbirAgencies,
    fetchSbirAwards,
    fetchSbirOpportunities,
    fetchSbirStats,
    searchSbirAwards,
    triggerFullIngest,
    triggerIngest,
    triggerSbirGovIngest,
    triggerSbirIngest,
} from './api';
import type {Opportunity} from '../components/domain/opportunity';
import type {SbirAward, SbirStats} from '../components/domain/sbir';

// ==================== Test Fixtures ====================

function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-123',
    title: 'Test Opportunity',
    solicitationNumber: 'SOL-2024-001',
    type: 'solicitation',
    naicsCode: '541512',
    postedDate: '2024-01-15',
    responseDeadLine: '2024-02-15',
    url: 'https://sam.gov/opp/123',
    ...overrides,
  };
}

function createMockSbirAward(overrides: Partial<SbirAward> = {}): SbirAward {
  return {
    id: 'award-123',
    firm: 'Test Corp',
    awardTitle: 'Innovative Research',
    agency: 'DOD',
    branch: 'Army',
    phase: 'I',
    program: 'SBIR',
    agencyTrackingNumber: 'ATN-001',
    contract: 'W31P4Q-24-C-0001',
    proposalAwardDate: '2024-01-01',
    contractEndDate: '2025-01-01',
    solicitationNumber: 'SOL-2024-001',
    solicitationYear: 2024,
    topicCode: 'A24-001',
    awardYear: 2024,
    awardAmount: 150000,
    uei: 'UEI123456789',
    hubzoneOwned: false,
    sociallyEconomicallyDisadvantaged: false,
    womenOwned: false,
    numberEmployees: 25,
    companyUrl: 'https://testcorp.com',
    city: 'Arlington',
    state: 'VA',
    zip: '22201',
    pocName: 'John Doe',
    pocEmail: 'john@testcorp.com',
    pocPhone: '555-0100',
    piName: 'Jane Smith',
    piEmail: 'jane@testcorp.com',
    researchKeywords: 'AI, Machine Learning',
    abstractText: 'Research abstract text',
    awardLink: 'https://sbir.gov/award/123',
    isSbir: true,
    isSttr: false,
    ...overrides,
  };
}

function createMockSbirStats(overrides: Partial<SbirStats> = {}): SbirStats {
  return {
    totalAwards: 100,
    sbirCount: 75,
    sttrCount: 25,
    agencies: ['DOD', 'HHS', 'NASA'],
    phases: ['I', 'II', 'III'],
    ...overrides,
  };
}

// ==================== Mock Setup ====================

const AUTH_STORAGE_KEY = 'sam_auth_state';

interface MockFetchOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: unknown;
}

interface TestMocks {
  fetchMock: ReturnType<typeof vi.fn>;
}

/**
 * Sets up all mocks for a test
 * Uses Object.defineProperty to properly mock window.localStorage
 */
function setupMocks(token: string | null, fetchOptions: MockFetchOptions = {}): TestMocks {
  // Mock localStorage using Object.defineProperty for proper window.localStorage access
  const mockStorage: Record<string, string> = {};
  if (token !== null) {
    mockStorage[AUTH_STORAGE_KEY] = JSON.stringify({ token });
  }

  const localStorageMock = {
    getItem: vi.fn((key: string) => mockStorage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    }),
    key: vi.fn((index: number) => Object.keys(mockStorage).at(index) ?? null),
    get length() {
      return Object.keys(mockStorage).length;
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });

  // Mock fetch
  const { ok = true, status = 200, statusText = 'OK', json = {} } = fetchOptions;

  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(json),
  });

  vi.stubGlobal('fetch', fetchMock);

  return { fetchMock };
}

// ==================== Tests ====================

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ==================== fetchOpportunities ====================

  describe('fetchOpportunities()', () => {
    it('should fetch opportunities from correct endpoint', async () => {
      const mockOpportunities = [createMockOpportunity()];
      const { fetchMock } = setupMocks(null, { json: mockOpportunities });

      const result = await fetchOpportunities();

      expect(fetchMock).toHaveBeenCalledWith('/api/opportunities', expect.any(Object));
      expect(result).toEqual(mockOpportunities);
    });

    it('should include auth token in headers when available', async () => {
      const mockOpportunities = [createMockOpportunity()];
      const { fetchMock } = setupMocks('test-auth-token', { json: mockOpportunities });

      await fetchOpportunities();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/opportunities',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-auth-token',
          }),
        })
      );
    });

    it('should not include Authorization header when no token exists', async () => {
      const { fetchMock } = setupMocks(null, { json: [] });

      await fetchOpportunities();

      const callArgs = fetchMock.mock.calls.at(0);
      expect(callArgs).toBeDefined();
      const headers = callArgs?.[1]?.headers as Record<string, string> | undefined;
      expect(headers?.Authorization).toBeUndefined();
    });

    it('should handle empty response', async () => {
      setupMocks(null, { json: [] });

      const result = await fetchOpportunities();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should throw error on network failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Internal Server Error' });

      await expect(fetchOpportunities()).rejects.toThrow(
        'Failed to fetch opportunities: Internal Server Error'
      );
    });

    it('should throw error on non-200 response', async () => {
      setupMocks(null, { ok: false, status: 404, statusText: 'Not Found' });

      await expect(fetchOpportunities()).rejects.toThrow(
        'Failed to fetch opportunities: Not Found'
      );
    });
  });

  // ==================== fetchSbirOpportunities ====================

  describe('fetchSbirOpportunities()', () => {
    it('should fetch without phase filter', async () => {
      const mockOpportunities = [createMockOpportunity({ isSbir: true })];
      const { fetchMock } = setupMocks(null, { json: mockOpportunities });

      const result = await fetchSbirOpportunities();

      expect(fetchMock).toHaveBeenCalledWith('/api/opportunities/sbir', expect.any(Object));
      expect(result).toEqual(mockOpportunities);
    });

    it('should fetch with phase filter', async () => {
      const mockOpportunities = [createMockOpportunity({ isSbir: true, sbirPhase: 'I' })];
      const { fetchMock } = setupMocks(null, { json: mockOpportunities });

      const result = await fetchSbirOpportunities('I');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/opportunities/sbir?phase=I',
        expect.any(Object)
      );
      expect(result).toEqual(mockOpportunities);
    });

    it('should include auth token in headers', async () => {
      const { fetchMock } = setupMocks('sbir-token', { json: [] });

      await fetchSbirOpportunities();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer sbir-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Service Unavailable' });

      await expect(fetchSbirOpportunities('II')).rejects.toThrow(
        'Failed to fetch SBIR opportunities: Service Unavailable'
      );
    });
  });

  // ==================== triggerIngest ====================

  describe('triggerIngest()', () => {
    it('should call POST endpoint', async () => {
      const { fetchMock } = setupMocks(null, { json: {} });

      await triggerIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ingest',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should require authentication with token', async () => {
      const { fetchMock } = setupMocks('ingest-token', { json: {} });

      await triggerIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ingest',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer ingest-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Forbidden' });

      await expect(triggerIngest()).rejects.toThrow('Failed to trigger ingest: Forbidden');
    });
  });

  // ==================== triggerFullIngest ====================

  describe('triggerFullIngest()', () => {
    it('should call POST endpoint for full ingest', async () => {
      const { fetchMock } = setupMocks(null, { json: {} });

      await triggerFullIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ingest/full',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should include authentication', async () => {
      const { fetchMock } = setupMocks('full-ingest-token', { json: {} });

      await triggerFullIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ingest/full',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer full-ingest-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Unauthorized' });

      await expect(triggerFullIngest()).rejects.toThrow(
        'Failed to trigger full ingest: Unauthorized'
      );
    });
  });

  // ==================== triggerSbirIngest ====================

  describe('triggerSbirIngest()', () => {
    it('should call POST endpoint for SBIR ingest', async () => {
      const { fetchMock } = setupMocks(null, { json: {} });

      await triggerSbirIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ingest/sbir',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Bad Gateway' });

      await expect(triggerSbirIngest()).rejects.toThrow(
        'Failed to trigger SBIR ingest: Bad Gateway'
      );
    });
  });

  // ==================== fetchSbirAwards ====================

  describe('fetchSbirAwards()', () => {
    it('should fetch awards without filters', async () => {
      const mockAwards = [createMockSbirAward()];
      const { fetchMock } = setupMocks(null, { json: mockAwards });

      const result = await fetchSbirAwards();

      expect(fetchMock).toHaveBeenCalledWith('/api/sbir/awards', expect.any(Object));
      expect(result).toEqual(mockAwards);
    });

    it('should fetch awards with agency filter', async () => {
      const mockAwards = [createMockSbirAward({ agency: 'NASA' })];
      const { fetchMock } = setupMocks(null, { json: mockAwards });

      const result = await fetchSbirAwards('NASA');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/awards?agency=NASA',
        expect.any(Object)
      );
      expect(result).toEqual(mockAwards);
    });

    it('should fetch awards with phase filter', async () => {
      const mockAwards = [createMockSbirAward({ phase: 'II' })];
      const { fetchMock } = setupMocks(null, { json: mockAwards });

      const result = await fetchSbirAwards(undefined, 'II');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/awards?phase=II',
        expect.any(Object)
      );
      expect(result).toEqual(mockAwards);
    });

    it('should fetch awards with both agency and phase filters', async () => {
      const mockAwards = [createMockSbirAward({ agency: 'DOD', phase: 'I' })];
      const { fetchMock } = setupMocks(null, { json: mockAwards });

      const result = await fetchSbirAwards('DOD', 'I');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/awards?agency=DOD&phase=I',
        expect.any(Object)
      );
      expect(result).toEqual(mockAwards);
    });

    it('should include auth token in headers', async () => {
      const { fetchMock } = setupMocks('awards-token', { json: [] });

      await fetchSbirAwards();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer awards-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Internal Server Error' });

      await expect(fetchSbirAwards('NASA', 'II')).rejects.toThrow(
        'Failed to fetch SBIR awards: Internal Server Error'
      );
    });
  });

  // ==================== fetchSbirStats ====================

  describe('fetchSbirStats()', () => {
    it('should fetch stats from correct endpoint', async () => {
      const mockStats = createMockSbirStats();
      const { fetchMock } = setupMocks(null, { json: mockStats });

      const result = await fetchSbirStats();

      expect(fetchMock).toHaveBeenCalledWith('/api/sbir/stats', expect.any(Object));
      expect(result).toEqual(mockStats);
    });

    it('should include auth token in headers', async () => {
      const { fetchMock } = setupMocks('stats-token', { json: createMockSbirStats() });

      await fetchSbirStats();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/stats',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer stats-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Service Unavailable' });

      await expect(fetchSbirStats()).rejects.toThrow(
        'Failed to fetch SBIR stats: Service Unavailable'
      );
    });
  });

  // ==================== searchSbirAwards ====================

  describe('searchSbirAwards()', () => {
    it('should search with keyword', async () => {
      const mockAwards = [createMockSbirAward({ awardTitle: 'AI Research' })];
      const { fetchMock } = setupMocks(null, { json: mockAwards });

      const result = await searchSbirAwards('AI');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/awards/search?q=AI',
        expect.any(Object)
      );
      expect(result).toEqual(mockAwards);
    });

    it('should encode special characters in keyword', async () => {
      const { fetchMock } = setupMocks(null, { json: [] });

      await searchSbirAwards('machine learning & AI');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/awards/search?q=machine%20learning%20%26%20AI',
        expect.any(Object)
      );
    });

    it('should include auth token in headers', async () => {
      const { fetchMock } = setupMocks('search-token', { json: [] });

      await searchSbirAwards('research');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer search-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Bad Request' });

      await expect(searchSbirAwards('test')).rejects.toThrow(
        'Failed to search SBIR awards: Bad Request'
      );
    });
  });

  // ==================== triggerSbirGovIngest ====================

  describe('triggerSbirGovIngest()', () => {
    it('should call POST endpoint for SBIR.gov ingest', async () => {
      const { fetchMock } = setupMocks(null, { json: {} });

      await triggerSbirGovIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/ingest',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should include authentication', async () => {
      const { fetchMock } = setupMocks('sbir-gov-token', { json: {} });

      await triggerSbirGovIngest();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/ingest',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer sbir-gov-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Gateway Timeout' });

      await expect(triggerSbirGovIngest()).rejects.toThrow(
        'Failed to trigger SBIR.gov ingest: Gateway Timeout'
      );
    });
  });

  // ==================== fetchSbirAgencies ====================

  describe('fetchSbirAgencies()', () => {
    it('should fetch agencies from correct endpoint', async () => {
      const mockAgencies = { DOD: 50, NASA: 30, HHS: 20 };
      const { fetchMock } = setupMocks(null, { json: mockAgencies });

      const result = await fetchSbirAgencies();

      expect(fetchMock).toHaveBeenCalledWith('/api/sbir/agencies', expect.any(Object));
      expect(result).toEqual(mockAgencies);
    });

    it('should include auth token in headers', async () => {
      const { fetchMock } = setupMocks('agencies-token', { json: {} });

      await fetchSbirAgencies();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sbir/agencies',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer agencies-token',
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      setupMocks(null, { ok: false, statusText: 'Not Found' });

      await expect(fetchSbirAgencies()).rejects.toThrow(
        'Failed to fetch SBIR agencies: Not Found'
      );
    });
  });

  // ==================== Auth Token Edge Cases ====================

  describe('Authentication Edge Cases', () => {
    it('should handle malformed JSON in localStorage gracefully', async () => {
      // Custom setup for malformed JSON
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue('not valid json'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: vi.fn().mockResolvedValue([]),
        })
      );

      // Should not throw and should still make request without auth
      const result = await fetchOpportunities();

      expect(result).toEqual([]);
    });

    it('should handle missing token property in stored auth state', async () => {
      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(JSON.stringify({ user: 'test@example.com' })),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue([]),
      });
      vi.stubGlobal('fetch', fetchMock);

      await fetchOpportunities();

      const callArgs = fetchMock.mock.calls.at(0);
      expect(callArgs).toBeDefined();
      const headers = callArgs?.[1]?.headers as Record<string, string> | undefined;
      expect(headers?.Authorization).toBeUndefined();
    });

    it('should handle localStorage throwing an error', async () => {
      const localStorageMock = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('localStorage is disabled');
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: vi.fn().mockResolvedValue([]),
        })
      );

      // Should not throw and should still make request without auth
      const result = await fetchOpportunities();

      expect(result).toEqual([]);
    });
  });
});
