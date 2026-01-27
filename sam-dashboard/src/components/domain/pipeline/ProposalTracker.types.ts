import type { PipelineOpportunity, PipelineStage } from '../../../types/pipeline';

export interface ProposalTrackerProps {
  opportunity: PipelineOpportunity;
  stages: PipelineStage[];
  onStageChange?: (stageId: string) => void;
}

export interface ProposalMilestone {
  id: string;
  name: string;
  dueDate: string | null;
  completedDate: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}
