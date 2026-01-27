/**
 * Sprint status enum
 */
export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * Sprint task status
 */
export type SprintTaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

/**
 * Sprint task priority
 */
export type SprintTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Individual task within a sprint
 */
export interface SprintTask {
  id: string;
  sprintId: string;
  title: string;
  description: string | null;
  status: SprintTaskStatus;
  priority: SprintTaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sprint entity
 */
export interface Sprint {
  id: string;
  contractId: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  plannedVelocity: number | null;
  actualVelocity: number | null;
  tasks: SprintTask[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a new sprint
 */
export interface CreateSprintRequest {
  contractId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  plannedVelocity?: number;
}

/**
 * Request to update an existing sprint
 */
export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
  plannedVelocity?: number;
  actualVelocity?: number;
}

/**
 * Request to create a sprint task
 */
export interface CreateSprintTaskRequest {
  sprintId: string;
  title: string;
  description?: string;
  status?: SprintTaskStatus;
  priority?: SprintTaskPriority;
  assigneeId?: string;
  estimatedHours?: number;
  dueDate?: string;
}

/**
 * Request to update a sprint task
 */
export interface UpdateSprintTaskRequest {
  title?: string;
  description?: string;
  status?: SprintTaskStatus;
  priority?: SprintTaskPriority;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  order?: number;
}

/**
 * Filters for fetching sprints
 */
export interface SprintFilters {
  contractId?: string;
  status?: SprintStatus;
  startDateFrom?: string;
  startDateTo?: string;
}
