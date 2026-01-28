import type {BidDecision, PipelineOpportunity, PipelineStage} from '../../../types/pipeline';

export interface PipelineStageColumnProps {
    stage: PipelineStage;
    opportunities: PipelineOpportunity[];
    onOpportunityClick?: (opportunity: PipelineOpportunity) => void;
    onOpportunityEdit?: (opportunity: PipelineOpportunity) => void;
    onOpportunityDelete?: (opportunity: PipelineOpportunity) => void;
    onOpportunityDrop?: (opportunity: PipelineOpportunity, stageId: string) => void;
    onDecision?: (opportunity: PipelineOpportunity, decision: BidDecision) => void;
    allStages?: PipelineStage[];
    totalValue?: number;
    weightedValue?: number;
}
