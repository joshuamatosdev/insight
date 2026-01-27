import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useOpportunities } from './useOpportunities';
import * as api from '../services/api';
import { Opportunity } from '../components/domain/opportunity';

// Mock the API module
vi.mock('../services/api', () => ({
  fetchOpportunities: vi.fn(),
  triggerIngest: vi.fn(),
}));

// Mock opportunity data factory
function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: '1',
    title: 'Test Opportunity',
    solicitationNumber: 'SOL-001',
    type: 'Solicitation',
    naicsCode: '541512',
    postedDate: '2024-01-15',
    responseDeadLine: '2024-12-31',
    url: 'https://sam.gov/opp/1',
    sbirPhase: null,
    isSbir: false,
    isSttr: false,
    source: 'SAM.gov',
    ...overrides,
  };
}

describe('useOpportunities', () => {
  const mockOpportunities: Opportunity[] = [
    createMockOpportunity({ id: '1', title: 'Opportunity 1' }),
    createMockOpportunity({ id: '2', title: 'Opportunity 2' }),
    createMockOpportunity({ id: '3', title: 'Opportunity 3' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should return loading state initially', () => {
      vi.mocked(api.fetchOpportunities).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      const { result } = renderHook(() => useOpportunities());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.opportunities).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should have empty opportunities array initially', () => {
      vi.mocked(api.fetchOpportunities).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useOpportunities());

      expect(result.current.opportunities).toEqual([]);
    });

    it('should have null error initially', () => {
      vi.mocked(api.fetchOpportunities).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useOpportunities());

      expect(result.current.error).toBe(null);
    });
  });

  describe('Fetch Opportunities on Mount', () => {
    it('should fetch opportunities on mount', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(api.fetchOpportunities).toHaveBeenCalledTimes(1);
      });
    });

    it('should return opportunities after successful fetch', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.opportunities).toEqual(mockOpportunities);
      });
    });

    it('should set loading to false after fetch completes', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      vi.mocked(api.fetchOpportunities).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.error).not.toBe(null);
        expect(result.current.error?.message).toBe(errorMessage);
      });
    });

    it('should set loading to false on error', async () => {
      vi.mocked(api.fetchOpportunities).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should keep opportunities empty on error', async () => {
      vi.mocked(api.fetchOpportunities).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.opportunities).toEqual([]);
      });
    });

    it('should wrap non-Error objects in Error', async () => {
      vi.mocked(api.fetchOpportunities).mockRejectedValue('string error');

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.error).not.toBe(null);
        expect(result.current.error?.message).toBe('Failed to fetch opportunities');
      });
    });
  });

  describe('Refresh Function', () => {
    it('should provide a refresh function', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(typeof result.current.refresh).toBe('function');
      });
    });

    it('should re-fetch opportunities when refresh is called', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the call count and call refresh
      vi.mocked(api.fetchOpportunities).mockClear();
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      await act(async () => {
        await result.current.refresh();
      });

      expect(api.fetchOpportunities).toHaveBeenCalledTimes(1);
    });

    it('should update opportunities with new data on refresh', async () => {
      const initialData = [createMockOpportunity({ id: '1', title: 'Initial' })];
      const refreshedData = [
        createMockOpportunity({ id: '1', title: 'Initial' }),
        createMockOpportunity({ id: '2', title: 'New' }),
      ];

      vi.mocked(api.fetchOpportunities).mockResolvedValue(initialData);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.opportunities).toEqual(initialData);
      });

      vi.mocked(api.fetchOpportunities).mockResolvedValue(refreshedData);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.opportunities).toEqual(refreshedData);
    });

    it('should set loading state during refresh', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Make the next call slow
      let resolvePromise: (value: Opportunity[]) => void;
      vi.mocked(api.fetchOpportunities).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      act(() => {
        result.current.refresh();
      });

      // Should be loading during refresh
      expect(result.current.isLoading).toBe(true);

      // Resolve and verify loading is false
      await act(async () => {
        resolvePromise(mockOpportunities);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear previous error on refresh', async () => {
      vi.mocked(api.fetchOpportunities).mockRejectedValue(new Error('Initial error'));

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.error).not.toBe(null);
      });

      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Ingest Function', () => {
    it('should provide an ingest function', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(typeof result.current.ingest).toBe('function');
      });
    });

    it('should call triggerIngest API when ingest is called', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);
      vi.mocked(api.triggerIngest).mockResolvedValue(undefined);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.ingest();
      });

      expect(api.triggerIngest).toHaveBeenCalledTimes(1);
    });

    it('should refresh opportunities after successful ingest', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);
      vi.mocked(api.triggerIngest).mockResolvedValue(undefined);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      vi.mocked(api.fetchOpportunities).mockClear();

      await act(async () => {
        await result.current.ingest();
      });

      // fetchOpportunities should be called again after ingest
      expect(api.fetchOpportunities).toHaveBeenCalledTimes(1);
    });

    it('should set loading state during ingest', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      let resolveIngest: () => void;
      vi.mocked(api.triggerIngest).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveIngest = resolve;
          })
      );

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.ingest();
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve ingest and the subsequent fetch
      await act(async () => {
        resolveIngest();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle ingest errors', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);
      vi.mocked(api.triggerIngest).mockRejectedValue(new Error('Ingest failed'));

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.ingest();
      });

      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toBe('Ingest failed');
    });

    it('should wrap non-Error ingest errors', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);
      vi.mocked(api.triggerIngest).mockRejectedValue('string error');

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.ingest();
      });

      expect(result.current.error?.message).toBe('Failed to ingest data');
    });

    it('should set loading to false on ingest error', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);
      vi.mocked(api.triggerIngest).mockRejectedValue(new Error('Ingest failed'));

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.ingest();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Return Type', () => {
    it('should return all expected properties', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('opportunities');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refresh');
      expect(result.current).toHaveProperty('ingest');
    });

    it('should have correct types for return values', async () => {
      vi.mocked(api.fetchOpportunities).mockResolvedValue(mockOpportunities);

      const { result } = renderHook(() => useOpportunities());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.opportunities)).toBe(true);
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(
        result.current.error === null || result.current.error instanceof Error
      ).toBe(true);
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.ingest).toBe('function');
    });
  });
});
