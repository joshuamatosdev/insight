import type {BidDecision, PipelineOpportunity} from '../../../types/pipeline';

export interface BidDecisionFormProps {
    opportunity: PipelineOpportunity;
    onSubmit: (decision: BidDecision, notes: string, autoMoveStage: boolean) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface BidDecisionScoreItem {
    id: string;
    category: string;
    question: string;
    weight: number;
    score: number | null;
}
