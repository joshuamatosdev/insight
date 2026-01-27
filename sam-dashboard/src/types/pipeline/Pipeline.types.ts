/**
 * Pipeline types for the Pipeline Management UI
 * Based on backend PipelineService DTOs
 */

export type StageType = 'INITIAL' | 'IN_PROGRESS' | 'WON' | 'LOST';

export type BidDecision = 'PENDING' | 'BID' | 'NO_BID' | 'WATCH';

export interface PipelineStage {
  id: string;
  name: string;
  description: string | null;
  position: number;
  color: string | null;
  stageType: StageType;
  probability: number | null;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isArchived: boolean;
  stages: PipelineStage[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineOpportunity {
  id: string;
  pipelineId: string;
  opportunityId: string;
  solicitationNumber: string | null;
  opportunityTitle: string | null;
  stageId: string;
  stageName: string;
  ownerId: string | null;
  ownerName: string | null;
  internalName: string | null;
  notes: string | null;
  decision: BidDecision;
  decisionDate: string | null;
  decisionNotes: string | null;
  estimatedValue: number | null;
  probabilityOfWin: number | null;
  weightedValue: number | null;
  captureManager: string | null;
  proposalManager: string | null;
  teamingPartners: string | null;
  winThemes: string | null;
  discriminators: string | null;
  internalDeadline: string | null;
  reviewDate: string | null;
  responseDeadline: string | null;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageSummary {
  stageId: string;
  stageName: string;
  color: string | null;
  stageType: StageType;
  opportunityCount: number;
  totalValue: number;
  weightedValue: number;
}

export interface PipelineSummary {
  pipelineId: string;
  pipelineName: string;
  totalOpportunities: number;
  totalValue: number;
  totalWeightedValue: number;
  bidCount: number;
  noBidCount: number;
  pendingCount: number;
  stages: StageSummary[];
}

// Request types

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  stages?: CreateStageRequest[];
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
}

export interface CreateStageRequest {
  name: string;
  description?: string;
  position?: number;
  color?: string;
  stageType?: StageType;
  probability?: number;
}

export interface UpdateStageRequest {
  name?: string;
  description?: string;
  color?: string;
  stageType?: StageType;
  probability?: number;
}

export interface AddOpportunityRequest {
  opportunityId: string;
  stageId?: string;
  ownerId?: string;
  internalName?: string;
  notes?: string;
  estimatedValue?: number;
}

export interface UpdatePipelineOpportunityRequest {
  internalName?: string;
  notes?: string;
  estimatedValue?: number;
  probabilityOfWin?: number;
  captureManager?: string;
  proposalManager?: string;
  teamingPartners?: string;
  winThemes?: string;
  discriminators?: string;
  internalDeadline?: string;
  reviewDate?: string;
  ownerId?: string;
}

export interface SetBidDecisionRequest {
  decision: BidDecision;
  notes?: string;
  autoMoveStage?: boolean;
}

// Filter types

export interface PipelineFilters {
  includeArchived?: boolean;
}

export interface PipelineOpportunityFilters {
  stageId?: string;
  search?: string;
}

// Paginated response

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Teaming partner type for CRM integration
export interface TeamingPartner {
  id: string;
  name: string;
  organizationId?: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}
