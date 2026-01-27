/**
 * Feature request status
 */
export type FeatureRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'IN_DEVELOPMENT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'DEFERRED';

/**
 * Feature request priority
 */
export type FeatureRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Feature request category
 */
export type FeatureRequestCategory =
  | 'ENHANCEMENT'
  | 'NEW_FEATURE'
  | 'BUG_FIX'
  | 'PERFORMANCE'
  | 'USABILITY'
  | 'INTEGRATION'
  | 'OTHER';

/**
 * Feature request entity
 */
export interface FeatureRequest {
  id: string;
  contractId: string;
  title: string;
  description: string;
  category: FeatureRequestCategory;
  status: FeatureRequestStatus;
  priority: FeatureRequestPriority;
  submitterId: string;
  submitterName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  voteCount: number;
  hasVoted: boolean;
  estimatedEffort: string | null;
  targetRelease: string | null;
  tags: string[];
  attachmentUrls: string[];
  comments: FeatureRequestComment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Comment on a feature request
 */
export interface FeatureRequestComment {
  id: string;
  featureRequestId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a feature request
 */
export interface CreateFeatureRequestRequest {
  contractId: string;
  title: string;
  description: string;
  category: FeatureRequestCategory;
  priority?: FeatureRequestPriority;
  tags?: string[];
}

/**
 * Request to update a feature request
 */
export interface UpdateFeatureRequestRequest {
  title?: string;
  description?: string;
  category?: FeatureRequestCategory;
  status?: FeatureRequestStatus;
  priority?: FeatureRequestPriority;
  assigneeId?: string;
  estimatedEffort?: string;
  targetRelease?: string;
  tags?: string[];
}

/**
 * Request to add a comment
 */
export interface CreateCommentRequest {
  content: string;
}

/**
 * Filters for feature requests
 */
export interface FeatureRequestFilters {
  contractId?: string;
  status?: FeatureRequestStatus;
  priority?: FeatureRequestPriority;
  category?: FeatureRequestCategory;
  submitterId?: string;
  search?: string;
}
