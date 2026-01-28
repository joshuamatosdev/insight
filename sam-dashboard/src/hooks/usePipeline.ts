import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {queryKeys} from '../lib/query-keys';
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
    const queryClient = useQueryClient();
    const [includeArchived, setIncludeArchived] = useState(initialIncludeArchived);

    const query = useQuery({
        queryKey: [...queryKeys.pipelines.list(), {includeArchived}],
        queryFn: () => fetchPipelines(includeArchived),
    });

    const createMutation = useMutation({
        mutationFn: createPipelineApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.all});
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: UpdatePipelineRequest }) =>
            updatePipelineApi(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.all});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePipelineApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.all});
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: setDefaultPipelineApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.all});
        },
    });

    const archiveMutation = useMutation({
        mutationFn: archivePipelineApi,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.all});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const create = useCallback(
        async (request: CreatePipelineRequest): Promise<Pipeline> => {
            return createMutation.mutateAsync(request);
        },
        [createMutation]
    );

    const update = useCallback(
        async (id: string, request: UpdatePipelineRequest): Promise<Pipeline> => {
            return updateMutation.mutateAsync({id, request});
        },
        [updateMutation]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            await deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    const setDefault = useCallback(
        async (id: string): Promise<void> => {
            await setDefaultMutation.mutateAsync(id);
        },
        [setDefaultMutation]
    );

    const archive = useCallback(
        async (id: string): Promise<void> => {
            await archiveMutation.mutateAsync(id);
        },
        [archiveMutation]
    );

    const isLoading =
        query.isLoading ||
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        setDefaultMutation.isPending ||
        archiveMutation.isPending;

    const error =
        query.error ??
        createMutation.error ??
        updateMutation.error ??
        deleteMutation.error ??
        setDefaultMutation.error ??
        archiveMutation.error ??
        null;

    return {
        pipelines: query.data ?? [],
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
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.pipelines.detail(pipelineId),
        queryFn: () => fetchPipeline(pipelineId),
        enabled: pipelineId !== '',
    });

    const updateMutation = useMutation({
        mutationFn: (request: UpdatePipelineRequest) => updatePipelineApi(pipelineId, request),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.pipelines.detail(pipelineId), data);
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.all});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const update = useCallback(
        async (request: UpdatePipelineRequest): Promise<Pipeline> => {
            return updateMutation.mutateAsync(request);
        },
        [updateMutation]
    );

    return {
        pipeline: query.data ?? null,
        isLoading: query.isLoading || updateMutation.isPending,
        error: query.error ?? updateMutation.error ?? null,
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
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [stageFilter, setStageFilter] = useState<string | undefined>(undefined);

    const query = useQuery({
        queryKey: [...queryKeys.pipelines.opportunities(pipelineId), {page, stageFilter}],
        queryFn: () => fetchPipelineOpportunities(pipelineId, page, 50, stageFilter),
        enabled: pipelineId !== '',
    });

    const addMutation = useMutation({
        mutationFn: (request: AddOpportunityRequest) => addOpportunityApi(pipelineId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: UpdatePipelineOpportunityRequest }) =>
            updateOpportunityApi(pipelineId, id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => removeOpportunityApi(pipelineId, id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const moveMutation = useMutation({
        mutationFn: ({id, stageId}: { id: string; stageId: string }) =>
            moveOpportunityApi(pipelineId, id, stageId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const decisionMutation = useMutation({
        mutationFn: ({id, request}: { id: string; request: SetBidDecisionRequest }) =>
            setBidDecisionApi(pipelineId, id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const add = useCallback(
        async (request: AddOpportunityRequest): Promise<PipelineOpportunity> => {
            return addMutation.mutateAsync(request);
        },
        [addMutation]
    );

    const update = useCallback(
        async (id: string, request: UpdatePipelineOpportunityRequest): Promise<PipelineOpportunity> => {
            return updateMutation.mutateAsync({id, request});
        },
        [updateMutation]
    );

    const remove = useCallback(
        async (id: string): Promise<void> => {
            await removeMutation.mutateAsync(id);
        },
        [removeMutation]
    );

    const moveToStage = useCallback(
        async (id: string, stageId: string): Promise<PipelineOpportunity> => {
            return moveMutation.mutateAsync({id, stageId});
        },
        [moveMutation]
    );

    const setDecision = useCallback(
        async (id: string, request: SetBidDecisionRequest): Promise<PipelineOpportunity> => {
            return decisionMutation.mutateAsync({id, request});
        },
        [decisionMutation]
    );

    const isLoading =
        query.isLoading ||
        addMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending ||
        moveMutation.isPending ||
        decisionMutation.isPending;

    const error =
        query.error ??
        addMutation.error ??
        updateMutation.error ??
        removeMutation.error ??
        moveMutation.error ??
        decisionMutation.error ??
        null;

    return {
        opportunities: query.data?.content ?? [],
        isLoading,
        error,
        page,
        totalPages: query.data?.totalPages ?? 0,
        totalElements: query.data?.totalElements ?? 0,
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
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [...queryKeys.pipelines.opportunities(pipelineId), opportunityId],
        queryFn: () => fetchPipelineOpportunity(pipelineId, opportunityId),
        enabled: pipelineId !== '' && opportunityId !== '',
    });

    const updateMutation = useMutation({
        mutationFn: (request: UpdatePipelineOpportunityRequest) =>
            updateOpportunityApi(pipelineId, opportunityId, request),
        onSuccess: (data) => {
            queryClient.setQueryData(
                [...queryKeys.pipelines.opportunities(pipelineId), opportunityId],
                data
            );
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const moveMutation = useMutation({
        mutationFn: (stageId: string) => moveOpportunityApi(pipelineId, opportunityId, stageId),
        onSuccess: (data) => {
            queryClient.setQueryData(
                [...queryKeys.pipelines.opportunities(pipelineId), opportunityId],
                data
            );
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const decisionMutation = useMutation({
        mutationFn: (request: SetBidDecisionRequest) =>
            setBidDecisionApi(pipelineId, opportunityId, request),
        onSuccess: (data) => {
            queryClient.setQueryData(
                [...queryKeys.pipelines.opportunities(pipelineId), opportunityId],
                data
            );
            queryClient.invalidateQueries({queryKey: queryKeys.pipelines.opportunities(pipelineId)});
        },
    });

    const refresh = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const update = useCallback(
        async (request: UpdatePipelineOpportunityRequest): Promise<PipelineOpportunity> => {
            return updateMutation.mutateAsync(request);
        },
        [updateMutation]
    );

    const moveToStage = useCallback(
        async (stageId: string): Promise<PipelineOpportunity> => {
            return moveMutation.mutateAsync(stageId);
        },
        [moveMutation]
    );

    const setDecision = useCallback(
        async (request: SetBidDecisionRequest): Promise<PipelineOpportunity> => {
            return decisionMutation.mutateAsync(request);
        },
        [decisionMutation]
    );

    const isLoading =
        query.isLoading || updateMutation.isPending || moveMutation.isPending || decisionMutation.isPending;

    const error =
        query.error ?? updateMutation.error ?? moveMutation.error ?? decisionMutation.error ?? null;

    return {
        opportunity: query.data ?? null,
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
    const summaryQuery = useQuery({
        queryKey: [...queryKeys.pipelines.detail(pipelineId), 'summary'],
        queryFn: () => fetchPipelineSummary(pipelineId),
        enabled: pipelineId !== '',
    });

    const deadlinesQuery = useQuery({
        queryKey: [...queryKeys.pipelines.detail(pipelineId), 'deadlines', deadlineDays],
        queryFn: () => fetchApproachingDeadlines(pipelineId, deadlineDays),
        enabled: pipelineId !== '',
    });

    const staleQuery = useQuery({
        queryKey: [...queryKeys.pipelines.detail(pipelineId), 'stale', staleDays],
        queryFn: () => fetchStaleOpportunities(pipelineId, staleDays),
        enabled: pipelineId !== '',
    });

    const refresh = useCallback(async () => {
        await Promise.all([summaryQuery.refetch(), deadlinesQuery.refetch(), staleQuery.refetch()]);
    }, [summaryQuery, deadlinesQuery, staleQuery]);

    const isLoading = summaryQuery.isLoading || deadlinesQuery.isLoading || staleQuery.isLoading;
    const error = summaryQuery.error ?? deadlinesQuery.error ?? staleQuery.error ?? null;

    return {
        summary: summaryQuery.data ?? null,
        approachingDeadlines: deadlinesQuery.data ?? [],
        staleOpportunities: staleQuery.data ?? [],
        isLoading,
        error,
        refresh,
    };
}
