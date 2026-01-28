/**
 * Milestone status
 */
export type MilestoneStatus =
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'DELAYED'
    | 'AT_RISK'
    | 'CANCELLED';

/**
 * Milestone type
 */
export type MilestoneType =
    | 'DELIVERABLE'
    | 'REVIEW'
    | 'APPROVAL'
    | 'PAYMENT'
    | 'PHASE_COMPLETION'
    | 'CONTRACT_START'
    | 'CONTRACT_END'
    | 'OTHER';

/**
 * Milestone entity
 */
export interface Milestone {
    id: string;
    contractId: string;
    name: string;
    description: string | null;
    type: MilestoneType;
    status: MilestoneStatus;
    plannedDate: string;
    actualDate: string | null;
    completedDate: string | null;
    percentComplete: number;
    assigneeId: string | null;
    assigneeName: string | null;
    dependencies: string[];
    deliverables: MilestoneDeliverable[];
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Deliverable associated with a milestone
 */
export interface MilestoneDeliverable {
    id: string;
    milestoneId: string;
    name: string;
    description: string | null;
    status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    submittedAt: string | null;
    approvedAt: string | null;
    fileUrl: string | null;
}

/**
 * Request to create a milestone
 */
export interface CreateMilestoneRequest {
    contractId: string;
    name: string;
    description?: string;
    type: MilestoneType;
    plannedDate: string;
    assigneeId?: string;
    dependencies?: string[];
}

/**
 * Request to update a milestone
 */
export interface UpdateMilestoneRequest {
    name?: string;
    description?: string;
    type?: MilestoneType;
    status?: MilestoneStatus;
    plannedDate?: string;
    actualDate?: string;
    percentComplete?: number;
    assigneeId?: string;
    dependencies?: string[];
    notes?: string;
}

/**
 * Filters for milestones
 */
export interface MilestoneFilters {
    contractId?: string;
    status?: MilestoneStatus;
    type?: MilestoneType;
    dateFrom?: string;
    dateTo?: string;
}

/**
 * Timeline view data
 */
export interface MilestoneTimeline {
    milestones: Milestone[];
    startDate: string;
    endDate: string;
    criticalPath: string[];
}
