import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import {Opportunity} from '../components/domain/opportunity';
import {queryKeys} from '../lib/query-keys';
import {fetchOpportunities, triggerIngest} from '../services/api';

interface UseOpportunitiesReturn {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  ingest: () => Promise<void>;
}

export function useOpportunities(): UseOpportunitiesReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.opportunities.list(),
    queryFn: fetchOpportunities,
  });

  const ingestMutation = useMutation({
    mutationFn: triggerIngest,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.opportunities.all});
    },
  });

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const ingest = useCallback(async () => {
    await ingestMutation.mutateAsync();
  }, [ingestMutation]);

  return {
    opportunities: query.data ?? [],
    isLoading: query.isLoading || ingestMutation.isPending,
    error: query.error ?? ingestMutation.error ?? null,
    refresh,
    ingest,
  };
}

export default useOpportunities;
