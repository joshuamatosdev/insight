/**
 * Portal Service - API calls for Contractor Portal features
 *
 * Handles:
 * - Sprint management
 * - Feature requests
 * - Messaging
 * - Milestones
 * - Scope tracking
 */

import { apiClient } from './apiClient';
import type {
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest,
  SprintFilters,
  SprintTask,
  CreateSprintTaskRequest,
  UpdateSprintTaskRequest,
  FeatureRequest,
  CreateFeatureRequestRequest,
  UpdateFeatureRequestRequest,
  FeatureRequestFilters,
  CreateCommentRequest,
  FeatureRequestComment,
  Message,
  MessageThread,
  SendMessageRequest,
  MarkAsReadRequest,
  MessageFilters,
  InboxSummary,
  Milestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  MilestoneFilters,
  MilestoneTimeline,
  ScopeItem,
  CreateScopeItemRequest,
  UpdateScopeItemRequest,
  ScopeItemFilters,
  ScopeChange,
  CreateScopeChangeRequest,
  UpdateScopeChangeRequest,
  ScopeChangeFilters,
  ScopeSummary,
} from '../types/portal';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const PORTAL_BASE = '/portal';

// ============ Sprint Management ============

/**
 * Fetch sprints with optional filters
 */
export async function fetchSprints(
  page: number = 0,
  size: number = 20,
  filters?: SprintFilters
): Promise<Page<Sprint>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.contractId !== undefined) {
    params.set('contractId', filters.contractId);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.startDateFrom !== undefined) {
    params.set('startDateFrom', filters.startDateFrom);
  }
  if (filters?.startDateTo !== undefined) {
    params.set('startDateTo', filters.startDateTo);
  }

  const result = await apiClient.get<Page<Sprint>>(
    `${PORTAL_BASE}/sprints?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch a single sprint by ID
 */
export async function fetchSprint(id: string): Promise<Sprint> {
  const result = await apiClient.get<Sprint>(`${PORTAL_BASE}/sprints/${id}`);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Create a new sprint
 */
export async function createSprint(request: CreateSprintRequest): Promise<Sprint> {
  const result = await apiClient.post<Sprint, CreateSprintRequest>(
    `${PORTAL_BASE}/sprints`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Update an existing sprint
 */
export async function updateSprint(
  id: string,
  request: UpdateSprintRequest
): Promise<Sprint> {
  const result = await apiClient.put<Sprint, UpdateSprintRequest>(
    `${PORTAL_BASE}/sprints/${id}`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Delete a sprint
 */
export async function deleteSprint(id: string): Promise<void> {
  const result = await apiClient.delete(`${PORTAL_BASE}/sprints/${id}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

/**
 * Create a sprint task
 */
export async function createSprintTask(
  request: CreateSprintTaskRequest
): Promise<SprintTask> {
  const result = await apiClient.post<SprintTask, CreateSprintTaskRequest>(
    `${PORTAL_BASE}/sprints/${request.sprintId}/tasks`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Update a sprint task
 */
export async function updateSprintTask(
  sprintId: string,
  taskId: string,
  request: UpdateSprintTaskRequest
): Promise<SprintTask> {
  const result = await apiClient.put<SprintTask, UpdateSprintTaskRequest>(
    `${PORTAL_BASE}/sprints/${sprintId}/tasks/${taskId}`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Delete a sprint task
 */
export async function deleteSprintTask(
  sprintId: string,
  taskId: string
): Promise<void> {
  const result = await apiClient.delete(
    `${PORTAL_BASE}/sprints/${sprintId}/tasks/${taskId}`
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

/**
 * Move a task to a different status column
 */
export async function moveSprintTask(
  sprintId: string,
  taskId: string,
  newStatus: string,
  newOrder: number
): Promise<SprintTask> {
  const result = await apiClient.put<SprintTask, UpdateSprintTaskRequest>(
    `${PORTAL_BASE}/sprints/${sprintId}/tasks/${taskId}`,
    { status: newStatus as SprintTask['status'], order: newOrder }
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

// ============ Feature Requests ============

/**
 * Fetch feature requests with optional filters
 */
export async function fetchFeatureRequests(
  page: number = 0,
  size: number = 20,
  filters?: FeatureRequestFilters
): Promise<Page<FeatureRequest>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.contractId !== undefined) {
    params.set('contractId', filters.contractId);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.priority !== undefined) {
    params.set('priority', filters.priority);
  }
  if (filters?.category !== undefined) {
    params.set('category', filters.category);
  }
  if (filters?.submitterId !== undefined) {
    params.set('submitterId', filters.submitterId);
  }
  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }

  const result = await apiClient.get<Page<FeatureRequest>>(
    `${PORTAL_BASE}/feature-requests?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch a single feature request by ID
 */
export async function fetchFeatureRequest(id: string): Promise<FeatureRequest> {
  const result = await apiClient.get<FeatureRequest>(
    `${PORTAL_BASE}/feature-requests/${id}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Create a new feature request
 */
export async function createFeatureRequest(
  request: CreateFeatureRequestRequest
): Promise<FeatureRequest> {
  const result = await apiClient.post<FeatureRequest, CreateFeatureRequestRequest>(
    `${PORTAL_BASE}/feature-requests`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Update an existing feature request
 */
export async function updateFeatureRequest(
  id: string,
  request: UpdateFeatureRequestRequest
): Promise<FeatureRequest> {
  const result = await apiClient.put<FeatureRequest, UpdateFeatureRequestRequest>(
    `${PORTAL_BASE}/feature-requests/${id}`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Delete a feature request
 */
export async function deleteFeatureRequest(id: string): Promise<void> {
  const result = await apiClient.delete(`${PORTAL_BASE}/feature-requests/${id}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

/**
 * Vote for a feature request
 */
export async function voteFeatureRequest(id: string): Promise<FeatureRequest> {
  const result = await apiClient.post<FeatureRequest, object>(
    `${PORTAL_BASE}/feature-requests/${id}/vote`,
    {}
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Remove vote from a feature request
 */
export async function unvoteFeatureRequest(id: string): Promise<FeatureRequest> {
  const result = await apiClient.delete<FeatureRequest>(
    `${PORTAL_BASE}/feature-requests/${id}/vote`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Add a comment to a feature request
 */
export async function addFeatureRequestComment(
  featureRequestId: string,
  request: CreateCommentRequest
): Promise<FeatureRequestComment> {
  const result = await apiClient.post<FeatureRequestComment, CreateCommentRequest>(
    `${PORTAL_BASE}/feature-requests/${featureRequestId}/comments`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

// ============ Messaging ============

/**
 * Fetch inbox summary
 */
export async function fetchInboxSummary(): Promise<InboxSummary> {
  const result = await apiClient.get<InboxSummary>(`${PORTAL_BASE}/messages/summary`);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch message threads
 */
export async function fetchMessageThreads(
  page: number = 0,
  size: number = 20,
  filters?: MessageFilters
): Promise<Page<MessageThread>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.contractId !== undefined) {
    params.set('contractId', filters.contractId);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.priority !== undefined) {
    params.set('priority', filters.priority);
  }
  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }
  if (filters?.dateFrom !== undefined) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters?.dateTo !== undefined) {
    params.set('dateTo', filters.dateTo);
  }

  const result = await apiClient.get<Page<MessageThread>>(
    `${PORTAL_BASE}/messages/threads?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch a single message thread with all messages
 */
export async function fetchMessageThread(threadId: string): Promise<MessageThread> {
  const result = await apiClient.get<MessageThread>(
    `${PORTAL_BASE}/messages/threads/${threadId}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch individual messages (for inbox view)
 */
export async function fetchMessages(
  page: number = 0,
  size: number = 20,
  filters?: MessageFilters
): Promise<Page<Message>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.priority !== undefined) {
    params.set('priority', filters.priority);
  }
  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }

  const result = await apiClient.get<Page<Message>>(
    `${PORTAL_BASE}/messages?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Send a new message
 */
export async function sendMessage(request: SendMessageRequest): Promise<Message> {
  const result = await apiClient.post<Message, SendMessageRequest>(
    `${PORTAL_BASE}/messages`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Mark messages as read
 */
export async function markAsRead(request: MarkAsReadRequest): Promise<void> {
  const result = await apiClient.post<void, MarkAsReadRequest>(
    `${PORTAL_BASE}/messages/mark-read`,
    request
  );
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

/**
 * Mark a single message as read
 */
export async function markMessageAsRead(messageId: string): Promise<Message> {
  const result = await apiClient.post<Message, object>(
    `${PORTAL_BASE}/messages/${messageId}/read`,
    {}
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Archive a message
 */
export async function archiveMessage(messageId: string): Promise<Message> {
  const result = await apiClient.post<Message, object>(
    `${PORTAL_BASE}/messages/${messageId}/archive`,
    {}
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

// ============ Milestones ============

/**
 * Fetch milestones with optional filters
 */
export async function fetchMilestones(
  page: number = 0,
  size: number = 20,
  filters?: MilestoneFilters
): Promise<Page<Milestone>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.contractId !== undefined) {
    params.set('contractId', filters.contractId);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.type !== undefined) {
    params.set('type', filters.type);
  }
  if (filters?.dateFrom !== undefined) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters?.dateTo !== undefined) {
    params.set('dateTo', filters.dateTo);
  }

  const result = await apiClient.get<Page<Milestone>>(
    `${PORTAL_BASE}/milestones?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch a single milestone by ID
 */
export async function fetchMilestone(id: string): Promise<Milestone> {
  const result = await apiClient.get<Milestone>(`${PORTAL_BASE}/milestones/${id}`);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Create a new milestone
 */
export async function createMilestone(
  request: CreateMilestoneRequest
): Promise<Milestone> {
  const result = await apiClient.post<Milestone, CreateMilestoneRequest>(
    `${PORTAL_BASE}/milestones`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Update an existing milestone
 */
export async function updateMilestone(
  id: string,
  request: UpdateMilestoneRequest
): Promise<Milestone> {
  const result = await apiClient.put<Milestone, UpdateMilestoneRequest>(
    `${PORTAL_BASE}/milestones/${id}`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id: string): Promise<void> {
  const result = await apiClient.delete(`${PORTAL_BASE}/milestones/${id}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

/**
 * Fetch milestone timeline view
 */
export async function fetchMilestoneTimeline(
  contractId: string
): Promise<MilestoneTimeline> {
  const result = await apiClient.get<MilestoneTimeline>(
    `${PORTAL_BASE}/milestones/timeline?contractId=${contractId}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

// ============ Scope Management ============

/**
 * Fetch scope items with optional filters
 */
export async function fetchScopeItems(
  page: number = 0,
  size: number = 20,
  filters?: ScopeItemFilters
): Promise<Page<ScopeItem>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.contractId !== undefined) {
    params.set('contractId', filters.contractId);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.assigneeId !== undefined) {
    params.set('assigneeId', filters.assigneeId);
  }
  if (filters?.parentId !== undefined) {
    params.set('parentId', filters.parentId);
  }

  const result = await apiClient.get<Page<ScopeItem>>(
    `${PORTAL_BASE}/scope-items?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch a single scope item by ID
 */
export async function fetchScopeItem(id: string): Promise<ScopeItem> {
  const result = await apiClient.get<ScopeItem>(`${PORTAL_BASE}/scope-items/${id}`);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Create a new scope item
 */
export async function createScopeItem(
  request: CreateScopeItemRequest
): Promise<ScopeItem> {
  const result = await apiClient.post<ScopeItem, CreateScopeItemRequest>(
    `${PORTAL_BASE}/scope-items`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Update an existing scope item
 */
export async function updateScopeItem(
  id: string,
  request: UpdateScopeItemRequest
): Promise<ScopeItem> {
  const result = await apiClient.put<ScopeItem, UpdateScopeItemRequest>(
    `${PORTAL_BASE}/scope-items/${id}`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Delete a scope item
 */
export async function deleteScopeItem(id: string): Promise<void> {
  const result = await apiClient.delete(`${PORTAL_BASE}/scope-items/${id}`);
  if (result.success === false) {
    throw new Error(result.error.message);
  }
}

/**
 * Fetch scope changes with optional filters
 */
export async function fetchScopeChanges(
  page: number = 0,
  size: number = 20,
  filters?: ScopeChangeFilters
): Promise<Page<ScopeChange>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.contractId !== undefined) {
    params.set('contractId', filters.contractId);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.changeType !== undefined) {
    params.set('changeType', filters.changeType);
  }
  if (filters?.requesterId !== undefined) {
    params.set('requesterId', filters.requesterId);
  }

  const result = await apiClient.get<Page<ScopeChange>>(
    `${PORTAL_BASE}/scope-changes?${params.toString()}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch a single scope change by ID
 */
export async function fetchScopeChange(id: string): Promise<ScopeChange> {
  const result = await apiClient.get<ScopeChange>(`${PORTAL_BASE}/scope-changes/${id}`);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Create a new scope change request
 */
export async function createScopeChange(
  request: CreateScopeChangeRequest
): Promise<ScopeChange> {
  const result = await apiClient.post<ScopeChange, CreateScopeChangeRequest>(
    `${PORTAL_BASE}/scope-changes`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Update an existing scope change
 */
export async function updateScopeChange(
  id: string,
  request: UpdateScopeChangeRequest
): Promise<ScopeChange> {
  const result = await apiClient.put<ScopeChange, UpdateScopeChangeRequest>(
    `${PORTAL_BASE}/scope-changes/${id}`,
    request
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Approve a scope change
 */
export async function approveScopeChange(id: string): Promise<ScopeChange> {
  const result = await apiClient.post<ScopeChange, object>(
    `${PORTAL_BASE}/scope-changes/${id}/approve`,
    {}
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Reject a scope change
 */
export async function rejectScopeChange(id: string): Promise<ScopeChange> {
  const result = await apiClient.post<ScopeChange, object>(
    `${PORTAL_BASE}/scope-changes/${id}/reject`,
    {}
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

/**
 * Fetch scope summary statistics
 */
export async function fetchScopeSummary(contractId: string): Promise<ScopeSummary> {
  const result = await apiClient.get<ScopeSummary>(
    `${PORTAL_BASE}/scope-items/summary?contractId=${contractId}`
  );
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}
