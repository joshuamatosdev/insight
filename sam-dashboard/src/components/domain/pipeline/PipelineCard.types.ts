import type { PipelineOpportunity, BidDecision, PipelineStage } from '../../../types/pipeline';

export interface PipelineCardProps {
  opportunity: PipelineOpportunity;
  onClick?: (opportunity: PipelineOpportunity) => void;
  onEdit?: (opportunity: PipelineOpportunity) => void;
  onDelete?: (opportunity: PipelineOpportunity) => void;
  onMoveToStage?: (opportunity: PipelineOpportunity, stageId: string) => void;
  onDecision?: (opportunity: PipelineOpportunity, decision: BidDecision) => void;
  stages?: PipelineStage[];
  isDragging?: boolean;
  showActions?: boolean;
}
