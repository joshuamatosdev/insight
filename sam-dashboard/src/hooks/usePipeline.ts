import {useCallback, useEffect, useState} from 'react';
import type {
    AddOpportunityRequest,
    CreatePipelineRequest,
    Pipeline,
    PipelineOpportunity,
    PipelineSummary,
    SetBidDecisionRequest,
    UpdatePipelineOpportunityRequest,
    UpdatePipelineRequest,
} from '../types/pipeline';
import {
    addOpportunityToPipeline as addOpportunityApi,
    archivePipeline as archivePipelineApi,
    createPipeline as createPipelineApi,
    deletePipeline as deletePipelineApi,
    fetchApproachingDeadlines,
    fetchPipeline,
    fetchPipelineOpportunities,
    fetchPipelineOpportunity,
    fetchPipelines,
    fetchPipelineSummary,
    fetchStaleOpportunities,
    moveOpportunityToStage as moveOpportunityApi,
    removeOpportunityFromPipeline as removeOpportunityApi,
    setBidDecision as setBidDecisionApi,
    setDefaultPipeline as setDefaultPipelineApi,
    updatePipeline as updatePipelineApi,
    updatePipelineOpportunity as updateOpportunityApi,
} from '../services/pipelineService';

// ============ usePipelines Hook ============

export interface UsePipelinesReturn {
  pipelines: Pipeline[];
  isLoading: boolean;
  error: Error | null;
  includeArchived: boolean;
  setIncludeArchived: (value: boolean) => void;
  refresh: () => Promise<void>;
  create: (request: CreatePipelineRequest) => Promise<Pipeline>;
  update: (id: string, request: UpdatePipelineRequest) => Promise<Pipeline>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
}

export function usePipelines(initialIncludeArchived: boolean = false): UsePipelinesReturn {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [includeArchived, setIncludeArchived] = useState(initialIncludeArchived);

  const loadPipelines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPipelines(includeArchived);
      setPipelines(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pipelines';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    void loadPipelines();
  }, [loadPipelines]);

  const refresh = useCallback(async () => {
    await loadPipelines();
  }, [loadPipelines]);

  const create = useCallback(async (request: CreatePipelineRequest): Promise<Pipeline> => {
    const newPipeline = await createPipelineApi(request);
    setPipelines((prev) => [...prev, newPipeline]);
    return newPipeline;
  }, []);

  const update = useCallback(
    async (id: string, request: UpdatePipelineRequest): Promise<Pipeline> => {
      const updatedPipeline = await updatePipelineApi(id, request);
      setPipelines((prev) =>
        prev.map((p) => (p.id === id ? updatedPipeline : p))
      );
      return updatedPipeline;
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    await deletePipelineApi(id);
    setPipelines((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setDefault = useCallback(async (id: string): Promise<void> => {
    await setDefaultPipelineApi(id);
    setPipelines((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
  }, []);

  const archive = useCallback(async (id: string): Promise<void> => {
    await archivePipelineApi(id);
    setPipelines((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p))
    );
  }, []);

  return {
    pipelines,
    isLoading,
    error,
    includeArchived,
    setIncludeArchived,
    refresh,
    create,
    update,
    remove,
    setDefault,
    archive,
  };
}

// ============ usePipeline Hook (Single Pipeline) ============

export interface UsePipelineReturn {
  pipeline: Pipeline | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (request: UpdatePipelineRequest) => Promise<Pipeline>;
}

export function usePipeline(pipelineId: string): UsePipelineReturn {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPipeline = useCallback(async () => {
    if (pipelineId === '') {
      setPipeline(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPipeline(pipelineId);
      setPipeline(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pipeline';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    void loadPipeline();
  }, [loadPipeline]);

  const refresh = useCallback(async () => {
    await loadPipeline();
  }, [loadPipeline]);

  const update = useCallback(
    async (request: UpdatePipelineRequest): Promise<Pipeline> => {
      const updatedPipeline = await updatePipelineApi(pipelineId, request);
      setPipeline(updatedPipeline);
      return updatedPipeline;
    },
    [pipelineId]
  );

  return {
    pipeline,
    isLoading,
    error,
    refresh,
    update,
  };
}

// ============ usePipelineOpportunities Hook ============

export interface UsePipelineOpportunitiesReturn {
  opportunities: PipelineOpportunity[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  stageFilter: string | undefined;
  setStageFilter: (stageId: string | undefined) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  add: (request: AddOpportunityRequest) => Promise<PipelineOpportunity>;
  update: (id: string, request: UpdatePipelineOpportunityRequest) => Promise<PipelineOpportunity>;
  remove: (id: string) => Promise<void>;
  moveToStage: (id: string, stageId: string) => Promise<PipelineOpportunity>;
  setDecision: (id: string, request: SetBidDecisionRequest) => Promise<PipelineOpportunity>;
}

export function usePipelineOpportunities(pipelineId: string): UsePipelineOpportunitiesReturn {
  const [opportunities, setOpportunities] = useState<PipelineOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);

  const loadOpportunities = useCallback(async () => {
    if (pipelineId === '') {
      setOpportunities([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPipelineOpportunities(pipelineId, page, 50, stageFilter);
      setOpportunities(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load opportunities';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId, page, stageFilter]);

  useEffect(() => {
    void loadOpportunities();
  }, [loadOpportunities]);

  const refresh = useCallback(async () => {
    await loadOpportunities();
  }, [loadOpportunities]);

  const add = useCallback(
    async (request: AddOpportunityRequest): Promise<PipelineOpportunity> => {
      const newOpp = await addOpportunityApi(pipelineId, request);
      setOpportunities((prev) => [newOpp, ...prev]);
      setTotalElements((prev) => prev + 1);
      return newOpp;
    },
    [pipelineId]
  );

  const update = useCallback(
    async (
      id: string,
      request: UpdatePipelineOpportunityRequest
    ): Promise<PipelineOpportunity> => {
      const updatedOpp = await updateOpportunityApi(pipelineId, id, request);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? updatedOpp : o))
      );
      return updatedOpp;
    },
    [pipelineId]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await removeOpportunityApi(pipelineId, id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setTotalElements((prev) => prev - 1);
    },
    [pipelineId]
  );

  const moveToStage = useCallback(
    async (id: string, stageId: string): Promise<PipelineOpportunity> => {
      const movedOpp = await moveOpportunityApi(pipelineId, id, stageId);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? movedOpp : o))
      );
      return movedOpp;
    },
    [pipelineId]
  );

  const setDecision = useCallback(
    async (id: string, request: SetBidDecisionRequest): Promise<PipelineOpportunity> => {
      const updatedOpp = await setBidDecisionApi(pipelineId, id, request);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? updatedOpp : o))
      );
      return updatedOpp;
    },
    [pipelineId]
  );

  return {
    opportunities,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    stageFilter,
    setStageFilter,
    setPage,
    refresh,
    add,
    update,
    remove,
    moveToStage,
    setDecision,
  };
}

// ============ usePipelineOpportunity Hook (Single Opportunity) ============

export interface UsePipelineOpportunityReturn {
  opportunity: PipelineOpportunity | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (request: UpdatePipelineOpportunityRequest) => Promise<PipelineOpportunity>;
  moveToStage: (stageId: string) => Promise<PipelineOpportunity>;
  setDecision: (request: SetBidDecisionRequest) => Promise<PipelineOpportunity>;
}

export function usePipelineOpportunity(
  pipelineId: string,
  opportunityId: string
): UsePipelineOpportunityReturn {
  const [opportunity, setOpportunity] = useState<PipelineOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOpportunity = useCallback(async () => {
    if (pipelineId === '' || opportunityId === '') {
      setOpportunity(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPipelineOpportunity(pipelineId, opportunityId);
      setOpportunity(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load opportunity';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId, opportunityId]);

  useEffect(() => {
    void loadOpportunity();
  }, [loadOpportunity]);

  const refresh = useCallback(async () => {
    await loadOpportunity();
  }, [loadOpportunity]);

  const update = useCallback(
    async (request: UpdatePipelineOpportunityRequest): Promise<PipelineOpportunity> => {
      const updatedOpp = await updateOpportunityApi(pipelineId, opportunityId, request);
      setOpportunity(updatedOpp);
      return updatedOpp;
    },
    [pipelineId, opportunityId]
  );

  const moveToStage = useCallback(
    async (stageId: string): Promise<PipelineOpportunity> => {
      const movedOpp = await moveOpportunityApi(pipelineId, opportunityId, stageId);
      setOpportunity(movedOpp);
      return movedOpp;
    },
    [pipelineId, opportunityId]
  );

  const setDecision = useCallback(
    async (request: SetBidDecisionRequest): Promise<PipelineOpportunity> => {
      const updatedOpp = await setBidDecisionApi(pipelineId, opportunityId, request);
      setOpportunity(updatedOpp);
      return updatedOpp;
    },
    [pipelineId, opportunityId]
  );

  return {
    opportunity,
    isLoading,
    error,
    refresh,
    update,
    moveToStage,
    setDecision,
  };
}

// ============ usePipelineSummary Hook ============

export interface UsePipelineSummaryReturn {
  summary: PipelineSummary | null;
  approachingDeadlines: PipelineOpportunity[];
  staleOpportunities: PipelineOpportunity[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePipelineSummary(
  pipelineId: string,
  deadlineDays: number = 7,
  staleDays: number = 14
): UsePipelineSummaryReturn {
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [approachingDeadlines, setApproachingDeadlines] = useState<PipelineOpportunity[]>([]);
  const [staleOpportunities, setStaleOpportunities] = useState<PipelineOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSummary = useCallback(async () => {
    if (pipelineId === '') {
      setSummary(null);
      setApproachingDeadlines([]);
      setStaleOpportunities([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [summaryResult, deadlinesResult, staleResult] = await Promise.all([
        fetchPipelineSummary(pipelineId),
        fetchApproachingDeadlines(pipelineId, deadlineDays),
        fetchStaleOpportunities(pipelineId, staleDays),
      ]);
      setSummary(summaryResult);
      setApproachingDeadlines(deadlinesResult);
      setStaleOpportunities(staleResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load summary';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId, deadlineDays, staleDays]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const refresh = useCallback(async () => {
    await loadSummary();
  }, [loadSummary]);

  return {
    summary,
    approachingDeadlines,
    staleOpportunities,
    isLoading,
    error,
    refresh,
  };
}
