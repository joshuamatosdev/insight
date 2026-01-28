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

const PIPELINE_BASE = '/pipelines';

// ============ Pipeline CRUD ============

export async function fetchPipelines(includeArchived: boolean = false): Promise<Pipeline[]> {
  const params = new URLSearchParams();
  params.set('includeArchived', includeArchived.toString());

  const result = await apiClient.get<Pipeline[]>(`${PIPELINE_BASE}?${params.toString()}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function fetchPipeline(pipelineId: string): Promise<Pipeline> {
  const result = await apiClient.get<Pipeline>(`${PIPELINE_BASE}/${pipelineId}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function createPipeline(request: CreatePipelineRequest): Promise<Pipeline> {
  const result = await apiClient.post<Pipeline, CreatePipelineRequest>(`${PIPELINE_BASE}`, request);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function updatePipeline(
  pipelineId: string,
  request: UpdatePipelineRequest
): Promise<Pipeline> {
  const result = await apiClient.put<Pipeline, UpdatePipelineRequest>(
    `${PIPELINE_BASE}/${pipelineId}`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function setDefaultPipeline(pipelineId: string): Promise<void> {
  const result = await apiClient.post<void, Record<string, never>>(
    `${PIPELINE_BASE}/${pipelineId}/set-default`,
    {}
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

export async function archivePipeline(pipelineId: string): Promise<void> {
  const result = await apiClient.post<void, Record<string, never>>(
    `${PIPELINE_BASE}/${pipelineId}/archive`,
    {}
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

export async function deletePipeline(pipelineId: string): Promise<void> {
  const result = await apiClient.delete(`${PIPELINE_BASE}/${pipelineId}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

// ============ Stage Management ============

export async function addStage(
  pipelineId: string,
  request: CreateStageRequest
): Promise<PipelineStage> {
  const result = await apiClient.post<PipelineStage, CreateStageRequest>(
    `${PIPELINE_BASE}/${pipelineId}/stages`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function updateStage(
  pipelineId: string,
  stageId: string,
  request: UpdateStageRequest
): Promise<PipelineStage> {
  const result = await apiClient.put<PipelineStage, UpdateStageRequest>(
    `${PIPELINE_BASE}/${pipelineId}/stages/${stageId}`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function reorderStages(pipelineId: string, stageIds: string[]): Promise<void> {
  const result = await apiClient.post<void, string[]>(
    `${PIPELINE_BASE}/${pipelineId}/stages/reorder`,
    stageIds
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

export async function deleteStage(
  pipelineId: string,
  stageId: string,
  moveToStageId?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (moveToStageId !== undefined) {
    params.set('moveToStageId', moveToStageId);
  }
  const query = params.toString().length > 0 ? `?${params.toString()}` : '';

  const result = await apiClient.delete(`${PIPELINE_BASE}/${pipelineId}/stages/${stageId}${query}`);
  if (result.success === false) {
    throw new Error(result.error.message);
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
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());
  params.set('sortBy', sortBy);
  params.set('sortDir', sortDir);
  if (stageId !== undefined) {
    params.set('stageId', stageId);
  }

  const result = await apiClient.get<Page<PipelineOpportunity>>(
    `${PIPELINE_BASE}/${pipelineId}/opportunities?${params.toString()}`
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function fetchPipelineOpportunity(
  pipelineId: string,
  id: string
): Promise<PipelineOpportunity> {
  const result = await apiClient.get<PipelineOpportunity>(
    `${PIPELINE_BASE}/${pipelineId}/opportunities/${id}`
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function addOpportunityToPipeline(
  pipelineId: string,
  request: AddOpportunityRequest
): Promise<PipelineOpportunity> {
  const result = await apiClient.post<PipelineOpportunity, AddOpportunityRequest>(
    `${PIPELINE_BASE}/${pipelineId}/opportunities`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function updatePipelineOpportunity(
  pipelineId: string,
  id: string,
  request: UpdatePipelineOpportunityRequest
): Promise<PipelineOpportunity> {
  // The backend uses PATCH for partial updates
  const result = await apiClient.patch<PipelineOpportunity, UpdatePipelineOpportunityRequest>(
    `${PIPELINE_BASE}/${pipelineId}/opportunities/${id}`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function moveOpportunityToStage(
  pipelineId: string,
  id: string,
  stageId: string
): Promise<PipelineOpportunity> {
  const params = new URLSearchParams();
  params.set('stageId', stageId);

  const result = await apiClient.post<PipelineOpportunity, Record<string, never>>(
    `${PIPELINE_BASE}/${pipelineId}/opportunities/${id}/move?${params.toString()}`,
    {}
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function setBidDecision(
  pipelineId: string,
  id: string,
  request: SetBidDecisionRequest
): Promise<PipelineOpportunity> {
  const result = await apiClient.post<PipelineOpportunity, SetBidDecisionRequest>(
    `${PIPELINE_BASE}/${pipelineId}/opportunities/${id}/decision`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function removeOpportunityFromPipeline(
  pipelineId: string,
  id: string
): Promise<void> {
  const result = await apiClient.delete(`${PIPELINE_BASE}/${pipelineId}/opportunities/${id}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

// ============ Analytics ============

export async function fetchPipelineSummary(pipelineId: string): Promise<PipelineSummary> {
  const result = await apiClient.get<PipelineSummary>(`${PIPELINE_BASE}/${pipelineId}/summary`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function fetchApproachingDeadlines(
  pipelineId: string,
  daysAhead: number = 7
): Promise<PipelineOpportunity[]> {
  const params = new URLSearchParams();
  params.set('daysAhead', daysAhead.toString());

  const result = await apiClient.get<PipelineOpportunity[]>(
    `${PIPELINE_BASE}/${pipelineId}/approaching-deadlines?${params.toString()}`
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export async function fetchStaleOpportunities(
  pipelineId: string,
  staleDays: number = 14
): Promise<PipelineOpportunity[]> {
  const params = new URLSearchParams();
  params.set('staleDays', staleDays.toString());

  const result = await apiClient.get<PipelineOpportunity[]>(
    `${PIPELINE_BASE}/${pipelineId}/stale?${params.toString()}`
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
  return result.data;
}

// ============ Teaming Partners (CRM Integration) ============

export async function fetchTeamingPartners(pipelineOpportunityId: string): Promise<TeamingPartner[]> {
  // This would integrate with the CRM service to get teaming partners
  // For now, we parse the teamingPartners string from the opportunity
  // A full implementation would call a dedicated endpoint
  const result = await apiClient.get<TeamingPartner[]>(
    `/crm/teaming-partners?pipelineOpportunityId=${pipelineOpportunityId}`
  );
  if (result.success === false) {
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
  return result.data;
}
