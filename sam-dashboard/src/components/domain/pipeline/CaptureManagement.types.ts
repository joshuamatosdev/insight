import type { PipelineOpportunity, UpdatePipelineOpportunityRequest } from '../../../types/pipeline';

export interface CaptureManagementProps {
  opportunity: PipelineOpportunity;
  onUpdate: (request: UpdatePipelineOpportunityRequest) => Promise<void>;
  isLoading?: boolean;
}
