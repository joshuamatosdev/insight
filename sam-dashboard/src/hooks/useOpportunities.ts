import { useState, useEffect, useCallback } from 'react';
import { Opportunity } from '../components/domain/opportunity';
import { fetchOpportunities, triggerIngest } from '../services/api';

interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  ingest: () => Promise<void>;
}

export function useOpportunities(): UseOpportunitiesReturn {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOpportunities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOpportunities();
      setOpportunities(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch opportunities'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadOpportunities();
  }, [loadOpportunities]);

  const ingest = useCallback(async () => {
    try {
      setIsLoading(true);
      await triggerIngest();
      await loadOpportunities();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to ingest data'));
      setIsLoading(false);
    }
  }, [loadOpportunities]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return { opportunities, isLoading, error, refresh, ingest };
}

export default useOpportunities;
