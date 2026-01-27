/**
 * Scope item status
 */
export type ScopeItemStatus = 'ACTIVE' | 'COMPLETED' | 'REMOVED' | 'ON_HOLD';

/**
 * Scope change type
 */
export type ScopeChangeType = 'ADDITION' | 'MODIFICATION' | 'REMOVAL' | 'CLARIFICATION';

/**
 * Scope change status
 */
export type ScopeChangeStatus =
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IMPLEMENTED';

/**
 * Scope item (work breakdown element)
 */
export interface ScopeItem {
  id: string;
  contractId: string;
  parentId: string | null;
  wbsCode: string;
  title: string;
  description: string | null;
  status: ScopeItemStatus;
  estimatedHours: number | null;
  actualHours: number | null;
  percentComplete: number;
  assigneeId: string | null;
  assigneeName: string | null;
  startDate: string | null;
  endDate: string | null;
  children: ScopeItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Scope change request
 */
export interface ScopeChange {
  id: string;
  contractId: string;
  scopeItemId: string | null;
  changeType: ScopeChangeType;
  status: ScopeChangeStatus;
  title: string;
  description: string;
  justification: string | null;
  impactAnalysis: string | null;
  estimatedCostImpact: number | null;
  estimatedScheduleImpact: number | null;
  requesterId: string;
  requesterName: string;
  approverId: string | null;
  approverName: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  implementedAt: string | null;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a scope item
 */
export interface CreateScopeItemRequest {
  contractId: string;
  parentId?: string;
  wbsCode: string;
  title: string;
  description?: string;
  estimatedHours?: number;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Request to update a scope item
 */
export interface UpdateScopeItemRequest {
  wbsCode?: string;
  title?: string;
  description?: string;
  status?: ScopeItemStatus;
  estimatedHours?: number;
  actualHours?: number;
  percentComplete?: number;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Request to create a scope change
 */
export interface CreateScopeChangeRequest {
  contractId: string;
  scopeItemId?: string;
  changeType: ScopeChangeType;
  title: string;
  description: string;
  justification?: string;
  impactAnalysis?: string;
  estimatedCostImpact?: number;
  estimatedScheduleImpact?: number;
}

/**
 * Request to update a scope change
 */
export interface UpdateScopeChangeRequest {
  title?: string;
  description?: string;
  justification?: string;
  impactAnalysis?: string;
  estimatedCostImpact?: number;
  estimatedScheduleImpact?: number;
  status?: ScopeChangeStatus;
}

/**
 * Filters for scope items
 */
export interface ScopeItemFilters {
  contractId?: string;
  status?: ScopeItemStatus;
  assigneeId?: string;
  parentId?: string;
}

/**
 * Filters for scope changes
 */
export interface ScopeChangeFilters {
  contractId?: string;
  status?: ScopeChangeStatus;
  changeType?: ScopeChangeType;
  requesterId?: string;
}

/**
 * Scope summary statistics
 */
export interface ScopeSummary {
  totalItems: number;
  completedItems: number;
  activeItems: number;
  onHoldItems: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  overallPercentComplete: number;
  pendingChanges: number;
  approvedChanges: number;
}
