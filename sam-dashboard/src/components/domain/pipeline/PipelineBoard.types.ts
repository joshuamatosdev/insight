import type {BidDecision, Pipeline, PipelineOpportunity} from '../../../types/pipeline';

export interface PipelineBoardProps {
  pipeline: Pipeline;
  opportunities: PipelineOpportunity[];
  stageSummaries?: Map<string, { totalValue: number; weightedValue: number }>;
  onOpportunityClick?: (opportunity: PipelineOpportunity) => void;
  onOpportunityEdit?: (opportunity: PipelineOpportunity) => void;
  onOpportunityDelete?: (opportunity: PipelineOpportunity) => void;
  onOpportunityMove?: (opportunity: PipelineOpportunity, stageId: string) => void;
  onDecision?: (opportunity: PipelineOpportunity, decision: BidDecision) => void;
  isLoading?: boolean;
}
