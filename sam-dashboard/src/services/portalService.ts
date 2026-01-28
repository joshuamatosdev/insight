/**
 * Portal Service - Type-safe using openapi-fetch
 *
 * Handles:
 * - Sprint management
 * - Feature requests
 * - Messaging
 * - Milestones
 * - Scope tracking
 */

import {apiClient} from './apiClient';
import type {
    CreateCommentRequest,
    CreateFeatureRequestRequest,
    CreateMilestoneRequest,
    CreateScopeChangeRequest,
    CreateScopeItemRequest,
    CreateSprintRequest,
    CreateSprintTaskRequest,
    FeatureRequest,
    FeatureRequestComment,
    FeatureRequestFilters,
    InboxSummary,
    MarkAsReadRequest,
    Message,
    MessageFilters,
    MessageThread,
    Milestone,
    MilestoneFilters,
    MilestoneTimeline,
    ScopeChange,
    ScopeChangeFilters,
    ScopeItem,
    ScopeItemFilters,
    ScopeSummary,
    SendMessageRequest,
    Sprint,
    SprintFilters,
    SprintTask,
    UpdateFeatureRequestRequest,
    UpdateMilestoneRequest,
    UpdateScopeChangeRequest,
    UpdateScopeItemRequest,
    UpdateSprintRequest,
    UpdateSprintTaskRequest,
} from '../types/portal';

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ============ Sprint Management ============

/**
 * Fetch sprints with optional filters
 */
export async function fetchSprints(
    page: number = 0,
    size: number = 20,
    filters?: SprintFilters
): Promise<Page<Sprint>> {
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.contractId !== undefined) {
        queryParams.contractId = filters.contractId;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.startDateFrom !== undefined) {
        queryParams.startDateFrom = filters.startDateFrom;
    }
    if (filters?.startDateTo !== undefined) {
        queryParams.startDateTo = filters.startDateTo;
    }

    const {data, error} = await apiClient.GET('/portal/sprints', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Sprint>;
}

/**
 * Fetch a single sprint by ID
 */
export async function fetchSprint(id: string): Promise<Sprint> {
    const {data, error} = await apiClient.GET('/portal/sprints/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Sprint;
}

/**
 * Create a new sprint
 */
export async function createSprint(request: CreateSprintRequest): Promise<Sprint> {
    const {data, error} = await apiClient.POST('/portal/sprints', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Sprint;
}

/**
 * Update an existing sprint
 */
export async function updateSprint(
    id: string,
    request: UpdateSprintRequest
): Promise<Sprint> {
    const {data, error} = await apiClient.PUT('/portal/sprints/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Sprint;
}

/**
 * Delete a sprint
 */
export async function deleteSprint(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/sprints/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

/**
 * Create a sprint task
 */
export async function createSprintTask(
    request: CreateSprintTaskRequest
): Promise<SprintTask> {
    const {data, error} = await apiClient.POST('/portal/sprints/{sprintId}/tasks', {
        params: {path: {sprintId: request.sprintId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SprintTask;
}

/**
 * Update a sprint task
 */
export async function updateSprintTask(
    sprintId: string,
    taskId: string,
    request: UpdateSprintTaskRequest
): Promise<SprintTask> {
    const {data, error} = await apiClient.PUT('/portal/sprints/{sprintId}/tasks/{taskId}', {
        params: {path: {sprintId, taskId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SprintTask;
}

/**
 * Delete a sprint task
 */
export async function deleteSprintTask(
    sprintId: string,
    taskId: string
): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/sprints/{sprintId}/tasks/{taskId}', {
        params: {path: {sprintId, taskId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
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
    const {data, error} = await apiClient.PUT('/portal/sprints/{sprintId}/tasks/{taskId}', {
        params: {path: {sprintId, taskId}},
        body: {status: newStatus as SprintTask['status'], order: newOrder},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SprintTask;
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
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.contractId !== undefined) {
        queryParams.contractId = filters.contractId;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.priority !== undefined) {
        queryParams.priority = filters.priority;
    }
    if (filters?.category !== undefined) {
        queryParams.category = filters.category;
    }
    if (filters?.submitterId !== undefined) {
        queryParams.submitterId = filters.submitterId;
    }
    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }

    const {data, error} = await apiClient.GET('/portal/feature-requests', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<FeatureRequest>;
}

/**
 * Fetch a single feature request by ID
 */
export async function fetchFeatureRequest(id: string): Promise<FeatureRequest> {
    const {data, error} = await apiClient.GET('/portal/feature-requests/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FeatureRequest;
}

/**
 * Create a new feature request
 */
export async function createFeatureRequest(
    request: CreateFeatureRequestRequest
): Promise<FeatureRequest> {
    const {data, error} = await apiClient.POST('/portal/feature-requests', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FeatureRequest;
}

/**
 * Update an existing feature request
 */
export async function updateFeatureRequest(
    id: string,
    request: UpdateFeatureRequestRequest
): Promise<FeatureRequest> {
    const {data, error} = await apiClient.PUT('/portal/feature-requests/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FeatureRequest;
}

/**
 * Delete a feature request
 */
export async function deleteFeatureRequest(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/feature-requests/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

/**
 * Vote for a feature request
 */
export async function voteFeatureRequest(id: string): Promise<FeatureRequest> {
    const {data, error} = await apiClient.POST('/portal/feature-requests/{id}/vote', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FeatureRequest;
}

/**
 * Remove vote from a feature request
 */
export async function unvoteFeatureRequest(id: string): Promise<FeatureRequest> {
    const {data, error} = await apiClient.DELETE('/portal/feature-requests/{id}/vote', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FeatureRequest;
}

/**
 * Add a comment to a feature request
 */
export async function addFeatureRequestComment(
    featureRequestId: string,
    request: CreateCommentRequest
): Promise<FeatureRequestComment> {
    const {data, error} = await apiClient.POST('/portal/feature-requests/{featureRequestId}/comments', {
        params: {path: {featureRequestId}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as FeatureRequestComment;
}

// ============ Messaging ============

/**
 * Fetch inbox summary
 */
export async function fetchInboxSummary(): Promise<InboxSummary> {
    const {data, error} = await apiClient.GET('/portal/messages/summary');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as InboxSummary;
}

/**
 * Fetch message threads
 */
export async function fetchMessageThreads(
    page: number = 0,
    size: number = 20,
    filters?: MessageFilters
): Promise<Page<MessageThread>> {
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.contractId !== undefined) {
        queryParams.contractId = filters.contractId;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.priority !== undefined) {
        queryParams.priority = filters.priority;
    }
    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }
    if (filters?.dateFrom !== undefined) {
        queryParams.dateFrom = filters.dateFrom;
    }
    if (filters?.dateTo !== undefined) {
        queryParams.dateTo = filters.dateTo;
    }

    const {data, error} = await apiClient.GET('/portal/messages/threads', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<MessageThread>;
}

/**
 * Fetch a single message thread with all messages
 */
export async function fetchMessageThread(threadId: string): Promise<MessageThread> {
    const {data, error} = await apiClient.GET('/portal/messages/threads/{threadId}', {
        params: {path: {threadId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as MessageThread;
}

/**
 * Fetch individual messages (for inbox view)
 */
export async function fetchMessages(
    page: number = 0,
    size: number = 20,
    filters?: MessageFilters
): Promise<Page<Message>> {
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.priority !== undefined) {
        queryParams.priority = filters.priority;
    }
    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }

    const {data, error} = await apiClient.GET('/portal/messages', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Message>;
}

/**
 * Send a new message
 */
export async function sendMessage(request: SendMessageRequest): Promise<Message> {
    const {data, error} = await apiClient.POST('/portal/messages', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Message;
}

/**
 * Mark messages as read
 */
export async function markAsRead(request: MarkAsReadRequest): Promise<void> {
    const {error} = await apiClient.POST('/portal/messages/mark-read', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

/**
 * Mark a single message as read
 */
export async function markMessageAsRead(messageId: string): Promise<Message> {
    const {data, error} = await apiClient.POST('/portal/messages/{messageId}/read', {
        params: {path: {messageId}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Message;
}

/**
 * Archive a message
 */
export async function archiveMessage(messageId: string): Promise<Message> {
    const {data, error} = await apiClient.POST('/portal/messages/{messageId}/archive', {
        params: {path: {messageId}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Message;
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
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.contractId !== undefined) {
        queryParams.contractId = filters.contractId;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.type !== undefined) {
        queryParams.type = filters.type;
    }
    if (filters?.dateFrom !== undefined) {
        queryParams.dateFrom = filters.dateFrom;
    }
    if (filters?.dateTo !== undefined) {
        queryParams.dateTo = filters.dateTo;
    }

    const {data, error} = await apiClient.GET('/portal/milestones', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Milestone>;
}

/**
 * Fetch a single milestone by ID
 */
export async function fetchMilestone(id: string): Promise<Milestone> {
    const {data, error} = await apiClient.GET('/portal/milestones/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Milestone;
}

/**
 * Create a new milestone
 */
export async function createMilestone(
    request: CreateMilestoneRequest
): Promise<Milestone> {
    const {data, error} = await apiClient.POST('/portal/milestones', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Milestone;
}

/**
 * Update an existing milestone
 */
export async function updateMilestone(
    id: string,
    request: UpdateMilestoneRequest
): Promise<Milestone> {
    const {data, error} = await apiClient.PUT('/portal/milestones/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Milestone;
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/milestones/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

/**
 * Fetch milestone timeline view
 */
export async function fetchMilestoneTimeline(
    contractId: string
): Promise<MilestoneTimeline> {
    const {data, error} = await apiClient.GET('/portal/milestones/timeline', {
        params: {query: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as MilestoneTimeline;
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
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.contractId !== undefined) {
        queryParams.contractId = filters.contractId;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.assigneeId !== undefined) {
        queryParams.assigneeId = filters.assigneeId;
    }
    if (filters?.parentId !== undefined) {
        queryParams.parentId = filters.parentId;
    }

    const {data, error} = await apiClient.GET('/portal/scope-items', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<ScopeItem>;
}

/**
 * Fetch a single scope item by ID
 */
export async function fetchScopeItem(id: string): Promise<ScopeItem> {
    const {data, error} = await apiClient.GET('/portal/scope-items/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeItem;
}

/**
 * Create a new scope item
 */
export async function createScopeItem(
    request: CreateScopeItemRequest
): Promise<ScopeItem> {
    const {data, error} = await apiClient.POST('/portal/scope-items', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeItem;
}

/**
 * Update an existing scope item
 */
export async function updateScopeItem(
    id: string,
    request: UpdateScopeItemRequest
): Promise<ScopeItem> {
    const {data, error} = await apiClient.PUT('/portal/scope-items/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeItem;
}

/**
 * Delete a scope item
 */
export async function deleteScopeItem(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/scope-items/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
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
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.contractId !== undefined) {
        queryParams.contractId = filters.contractId;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.changeType !== undefined) {
        queryParams.changeType = filters.changeType;
    }
    if (filters?.requesterId !== undefined) {
        queryParams.requesterId = filters.requesterId;
    }

    const {data, error} = await apiClient.GET('/portal/scope-changes', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<ScopeChange>;
}

/**
 * Fetch a single scope change by ID
 */
export async function fetchScopeChange(id: string): Promise<ScopeChange> {
    const {data, error} = await apiClient.GET('/portal/scope-changes/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeChange;
}

/**
 * Create a new scope change request
 */
export async function createScopeChange(
    request: CreateScopeChangeRequest
): Promise<ScopeChange> {
    const {data, error} = await apiClient.POST('/portal/scope-changes', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeChange;
}

/**
 * Update an existing scope change
 */
export async function updateScopeChange(
    id: string,
    request: UpdateScopeChangeRequest
): Promise<ScopeChange> {
    const {data, error} = await apiClient.PUT('/portal/scope-changes/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeChange;
}

/**
 * Approve a scope change
 */
export async function approveScopeChange(id: string): Promise<ScopeChange> {
    const {data, error} = await apiClient.POST('/portal/scope-changes/{id}/approve', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeChange;
}

/**
 * Reject a scope change
 */
export async function rejectScopeChange(id: string): Promise<ScopeChange> {
    const {data, error} = await apiClient.POST('/portal/scope-changes/{id}/reject', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeChange;
}

/**
 * Fetch scope summary statistics
 */
export async function fetchScopeSummary(contractId: string): Promise<ScopeSummary> {
    const {data, error} = await apiClient.GET('/portal/scope-items/summary', {
        params: {query: {contractId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ScopeSummary;
}
