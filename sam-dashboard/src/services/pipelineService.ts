/**
 * Pipeline Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {
    AddOpportunityRequest,
    CreatePipelineRequest,
    CreateStageRequest,
    Page,
    Pipeline,
    PipelineOpportunity,
    PipelineStage,
    PipelineSummary,
    SetBidDecisionRequest,
    TeamingPartner,
    UpdatePipelineOpportunityRequest,
    UpdatePipelineRequest,
    UpdateStageRequest,
} from '../types/pipeline';

// ============ Pipeline CRUD ============

export async function fetchPipelines(includeArchived: boolean = false): Promise<Pipeline[]> {
    const {data, error} = await apiClient.GET('/pipelines', {
        params: {query: {includeArchived}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Pipeline[];
}

export async function fetchPipeline(pipelineId: string): Promise<Pipeline> {
    const {data, error} = await apiClient.GET('/pipelines/{pipelineId}', {
        params: {path: {pipelineId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Pipeline;
}

export async function createPipeline(request: CreatePipelineRequest): Promise<Pipeline> {
    const {data, error} = await apiClient.POST('/pipelines', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Pipeline;
}

export async function updatePipeline(
    pipelineId: string,
    request: UpdatePipelineRequest
): Promise<Pipeline> {
    const {data, error} = await apiClient.PUT('/pipelines/{pipelineId}', {
        params: {path: {pipelineId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Pipeline;
}

export async function setDefaultPipeline(pipelineId: string): Promise<void> {
    const {error} = await apiClient.POST('/pipelines/{pipelineId}/set-default', {
        params: {path: {pipelineId}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function archivePipeline(pipelineId: string): Promise<void> {
    const {error} = await apiClient.POST('/pipelines/{pipelineId}/archive', {
        params: {path: {pipelineId}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deletePipeline(pipelineId: string): Promise<void> {
    const {error} = await apiClient.DELETE('/pipelines/{pipelineId}', {
        params: {path: {pipelineId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

// ============ Stage Management ============

export async function addStage(
    pipelineId: string,
    request: CreateStageRequest
): Promise<PipelineStage> {
    const {data, error} = await apiClient.POST('/pipelines/{pipelineId}/stages', {
        params: {path: {pipelineId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineStage;
}

export async function updateStage(
    pipelineId: string,
    stageId: string,
    request: UpdateStageRequest
): Promise<PipelineStage> {
    const {data, error} = await apiClient.PUT('/pipelines/{pipelineId}/stages/{stageId}', {
        params: {path: {pipelineId, stageId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineStage;
}

export async function reorderStages(pipelineId: string, stageIds: string[]): Promise<void> {
    const {error} = await apiClient.POST('/pipelines/{pipelineId}/stages/reorder', {
        params: {path: {pipelineId}},
        body: stageIds,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteStage(
    pipelineId: string,
    stageId: string,
    moveToStageId?: string
): Promise<void> {
    const queryParams: Record<string, string> = {};
    if (moveToStageId !== undefined) {
        queryParams.moveToStageId = moveToStageId;
    }

    const {error} = await apiClient.DELETE('/pipelines/{pipelineId}/stages/{stageId}', {
        params: {path: {pipelineId, stageId}, query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

// ============ Pipeline Opportunity Management ============

export async function fetchPipelineOpportunities(
    pipelineId: string,
    page: number = 0,
    size: number = 50,
    stageId?: string,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
): Promise<Page<PipelineOpportunity>> {
    const queryParams: Record<string, string | number> = {page, size, sortBy, sortDir};
    if (stageId !== undefined) {
        queryParams.stageId = stageId;
    }

    const {data, error} = await apiClient.GET('/pipelines/{pipelineId}/opportunities', {
        params: {path: {pipelineId}, query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<PipelineOpportunity>;
}

export async function fetchPipelineOpportunity(
    pipelineId: string,
    id: string
): Promise<PipelineOpportunity> {
    const {data, error} = await apiClient.GET('/pipelines/{pipelineId}/opportunities/{id}', {
        params: {path: {pipelineId, id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity;
}

export async function addOpportunityToPipeline(
    pipelineId: string,
    request: AddOpportunityRequest
): Promise<PipelineOpportunity> {
    const {data, error} = await apiClient.POST('/pipelines/{pipelineId}/opportunities', {
        params: {path: {pipelineId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity;
}

export async function updatePipelineOpportunity(
    pipelineId: string,
    id: string,
    request: UpdatePipelineOpportunityRequest
): Promise<PipelineOpportunity> {
    // The backend uses PATCH for partial updates
    const {data, error} = await apiClient.PATCH('/pipelines/{pipelineId}/opportunities/{id}', {
        params: {path: {pipelineId, id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity;
}

export async function moveOpportunityToStage(
    pipelineId: string,
    id: string,
    stageId: string
): Promise<PipelineOpportunity> {
    const {data, error} = await apiClient.POST('/pipelines/{pipelineId}/opportunities/{id}/move', {
        params: {path: {pipelineId, id}, query: {stageId}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity;
}

export async function setBidDecision(
    pipelineId: string,
    id: string,
    request: SetBidDecisionRequest
): Promise<PipelineOpportunity> {
    const {data, error} = await apiClient.POST('/pipelines/{pipelineId}/opportunities/{id}/decision', {
        params: {path: {pipelineId, id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity;
}

export async function removeOpportunityFromPipeline(
    pipelineId: string,
    id: string
): Promise<void> {
    const {error} = await apiClient.DELETE('/pipelines/{pipelineId}/opportunities/{id}', {
        params: {path: {pipelineId, id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

// ============ Analytics ============

export async function fetchPipelineSummary(pipelineId: string): Promise<PipelineSummary> {
    const {data, error} = await apiClient.GET('/pipelines/{pipelineId}/summary', {
        params: {path: {pipelineId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineSummary;
}

export async function fetchApproachingDeadlines(
    pipelineId: string,
    daysAhead: number = 7
): Promise<PipelineOpportunity[]> {
    const {data, error} = await apiClient.GET('/pipelines/{pipelineId}/approaching-deadlines', {
        params: {path: {pipelineId}, query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity[];
}

export async function fetchStaleOpportunities(
    pipelineId: string,
    staleDays: number = 14
): Promise<PipelineOpportunity[]> {
    const {data, error} = await apiClient.GET('/pipelines/{pipelineId}/stale', {
        params: {path: {pipelineId}, query: {staleDays}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PipelineOpportunity[];
}

// ============ Teaming Partners (CRM Integration) ============

export async function fetchTeamingPartners(pipelineOpportunityId: string): Promise<TeamingPartner[]> {
    // This would integrate with the CRM service to get teaming partners
    // For now, we parse the teamingPartners string from the opportunity
    // A full implementation would call a dedicated endpoint
    const {data, error} = await apiClient.GET('/crm/teaming-partners', {
        params: {query: {pipelineOpportunityId}},
    });

    if (error !== undefined) {
        // Return empty array if endpoint doesn't exist yet
        return [];
    }

    return data as TeamingPartner[];
}
