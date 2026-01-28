/**
 * usePortal Hook
 *
 * React hook for managing Contractor Portal data with caching and state management.
 * Provides a unified interface for sprints, feature requests, messaging, milestones, and scope.
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {
    CreateFeatureRequestRequest,
    CreateMilestoneRequest,
    CreateScopeChangeRequest,
    CreateScopeItemRequest,
    CreateSprintRequest,
    CreateSprintTaskRequest,
    FeatureRequest,
    FeatureRequestFilters,
    InboxSummary,
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
import * as portalService from '../services/portalService';

// ============ Sprint Hook ============

interface UseSprintsReturn {
  sprints: Sprint[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: SprintFilters) => void;
  createSprint: (request: CreateSprintRequest) => Promise<Sprint>;
  updateSprint: (id: string, request: UpdateSprintRequest) => Promise<Sprint>;
  deleteSprint: (id: string) => Promise<void>;
}

export function useSprints(
  initialFilters?: SprintFilters,
  pageSize: number = 20
): UseSprintsReturn {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<SprintFilters>(initialFilters ?? {});

  const loadSprints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await portalService.fetchSprints(page, pageSize, filters);
      setSprints(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sprints'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  const createSprintFn = useCallback(async (request: CreateSprintRequest) => {
    const sprint = await portalService.createSprint(request);
    await loadSprints();
    return sprint;
  }, [loadSprints]);

  const updateSprintFn = useCallback(async (id: string, request: UpdateSprintRequest) => {
    const sprint = await portalService.updateSprint(id, request);
    await loadSprints();
    return sprint;
  }, [loadSprints]);

  const deleteSprintFn = useCallback(async (id: string) => {
    await portalService.deleteSprint(id);
    await loadSprints();
  }, [loadSprints]);

  return {
    sprints,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    refresh: loadSprints,
    setPage,
    setFilters,
    createSprint: createSprintFn,
    updateSprint: updateSprintFn,
    deleteSprint: deleteSprintFn,
  };
}

// ============ Single Sprint Hook ============

interface UseSprintReturn {
  sprint: Sprint | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateSprint: (request: UpdateSprintRequest) => Promise<Sprint>;
  createTask: (request: CreateSprintTaskRequest) => Promise<SprintTask>;
  updateTask: (taskId: string, request: UpdateSprintTaskRequest) => Promise<SprintTask>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newOrder: number) => Promise<SprintTask>;
}

export function useSprint(sprintId: string | null): UseSprintReturn {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSprint = useCallback(async () => {
    if (sprintId === null) {
      setSprint(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await portalService.fetchSprint(sprintId);
      setSprint(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sprint'));
    } finally {
      setIsLoading(false);
    }
  }, [sprintId]);

  useEffect(() => {
    loadSprint();
  }, [loadSprint]);

  const updateSprintFn = useCallback(async (request: UpdateSprintRequest) => {
    if (sprintId === null) {
      throw new Error('No sprint selected');
    }
    const updated = await portalService.updateSprint(sprintId, request);
    setSprint(updated);
    return updated;
  }, [sprintId]);

  const createTaskFn = useCallback(async (request: CreateSprintTaskRequest) => {
    const task = await portalService.createSprintTask(request);
    await loadSprint();
    return task;
  }, [loadSprint]);

  const updateTaskFn = useCallback(async (
    taskId: string,
    request: UpdateSprintTaskRequest
  ) => {
    if (sprintId === null) {
      throw new Error('No sprint selected');
    }
    const task = await portalService.updateSprintTask(sprintId, taskId, request);
    await loadSprint();
    return task;
  }, [sprintId, loadSprint]);

  const deleteTaskFn = useCallback(async (taskId: string) => {
    if (sprintId === null) {
      throw new Error('No sprint selected');
    }
    await portalService.deleteSprintTask(sprintId, taskId);
    await loadSprint();
  }, [sprintId, loadSprint]);

  const moveTaskFn = useCallback(async (
    taskId: string,
    newStatus: string,
    newOrder: number
  ) => {
    if (sprintId === null) {
      throw new Error('No sprint selected');
    }
    const task = await portalService.moveSprintTask(sprintId, taskId, newStatus, newOrder);
    await loadSprint();
    return task;
  }, [sprintId, loadSprint]);

  return {
    sprint,
    isLoading,
    error,
    refresh: loadSprint,
    updateSprint: updateSprintFn,
    createTask: createTaskFn,
    updateTask: updateTaskFn,
    deleteTask: deleteTaskFn,
    moveTask: moveTaskFn,
  };
}

// ============ Feature Requests Hook ============

interface UseFeatureRequestsReturn {
  featureRequests: FeatureRequest[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: FeatureRequestFilters) => void;
  createFeatureRequest: (request: CreateFeatureRequestRequest) => Promise<FeatureRequest>;
  updateFeatureRequest: (id: string, request: UpdateFeatureRequestRequest) => Promise<FeatureRequest>;
  deleteFeatureRequest: (id: string) => Promise<void>;
  voteFeatureRequest: (id: string) => Promise<FeatureRequest>;
  unvoteFeatureRequest: (id: string) => Promise<FeatureRequest>;
}

export function useFeatureRequests(
  initialFilters?: FeatureRequestFilters,
  pageSize: number = 20
): UseFeatureRequestsReturn {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<FeatureRequestFilters>(initialFilters ?? {});

  const loadFeatureRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await portalService.fetchFeatureRequests(page, pageSize, filters);
      setFeatureRequests(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch feature requests'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadFeatureRequests();
  }, [loadFeatureRequests]);

  const createFn = useCallback(async (request: CreateFeatureRequestRequest) => {
    const fr = await portalService.createFeatureRequest(request);
    await loadFeatureRequests();
    return fr;
  }, [loadFeatureRequests]);

  const updateFn = useCallback(async (id: string, request: UpdateFeatureRequestRequest) => {
    const fr = await portalService.updateFeatureRequest(id, request);
    await loadFeatureRequests();
    return fr;
  }, [loadFeatureRequests]);

  const deleteFn = useCallback(async (id: string) => {
    await portalService.deleteFeatureRequest(id);
    await loadFeatureRequests();
  }, [loadFeatureRequests]);

  const voteFn = useCallback(async (id: string) => {
    const fr = await portalService.voteFeatureRequest(id);
    await loadFeatureRequests();
    return fr;
  }, [loadFeatureRequests]);

  const unvoteFn = useCallback(async (id: string) => {
    const fr = await portalService.unvoteFeatureRequest(id);
    await loadFeatureRequests();
    return fr;
  }, [loadFeatureRequests]);

  return {
    featureRequests,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    refresh: loadFeatureRequests,
    setPage,
    setFilters,
    createFeatureRequest: createFn,
    updateFeatureRequest: updateFn,
    deleteFeatureRequest: deleteFn,
    voteFeatureRequest: voteFn,
    unvoteFeatureRequest: unvoteFn,
  };
}

// ============ Messaging Hook ============

interface UseMessagingReturn {
  threads: MessageThread[];
  messages: Message[];
  summary: InboxSummary | null;
  selectedThread: MessageThread | null;
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: MessageFilters) => void;
  selectThread: (threadId: string | null) => Promise<void>;
  sendMessage: (request: SendMessageRequest) => Promise<Message>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  archiveMessage: (messageId: string) => Promise<void>;
}

export function useMessaging(
  initialFilters?: MessageFilters,
  pageSize: number = 20
): UseMessagingReturn {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<InboxSummary | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<MessageFilters>(initialFilters ?? {});

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [threadsData, summaryData] = await Promise.all([
        portalService.fetchMessageThreads(page, pageSize, filters),
        portalService.fetchInboxSummary(),
      ]);
      setThreads(threadsData.content);
      setTotalPages(threadsData.totalPages);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectThreadFn = useCallback(async (threadId: string | null) => {
    if (threadId === null) {
      setSelectedThread(null);
      setMessages([]);
      return;
    }

    try {
      const thread = await portalService.fetchMessageThread(threadId);
      setSelectedThread(thread);
      setMessages(thread.messages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch thread'));
    }
  }, []);

  const sendMessageFn = useCallback(async (request: SendMessageRequest) => {
    const message = await portalService.sendMessage(request);
    await loadData();
    if (selectedThread !== null && request.threadId === selectedThread.id) {
      await selectThreadFn(selectedThread.id);
    }
    return message;
  }, [loadData, selectedThread, selectThreadFn]);

  const markAsReadFn = useCallback(async (messageIds: string[]) => {
    await portalService.markAsRead({ messageIds });
    await loadData();
  }, [loadData]);

  const archiveMessageFn = useCallback(async (messageId: string) => {
    await portalService.archiveMessage(messageId);
    await loadData();
  }, [loadData]);

  return {
    threads,
    messages,
    summary,
    selectedThread,
    isLoading,
    error,
    page,
    totalPages,
    refresh: loadData,
    setPage,
    setFilters,
    selectThread: selectThreadFn,
    sendMessage: sendMessageFn,
    markAsRead: markAsReadFn,
    archiveMessage: archiveMessageFn,
  };
}

// ============ Milestones Hook ============

interface UseMilestonesReturn {
  milestones: Milestone[];
  timeline: MilestoneTimeline | null;
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: MilestoneFilters) => void;
  loadTimeline: (contractId: string) => Promise<void>;
  createMilestone: (request: CreateMilestoneRequest) => Promise<Milestone>;
  updateMilestone: (id: string, request: UpdateMilestoneRequest) => Promise<Milestone>;
  deleteMilestone: (id: string) => Promise<void>;
}

export function useMilestones(
  initialFilters?: MilestoneFilters,
  pageSize: number = 20
): UseMilestonesReturn {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [timeline, setTimeline] = useState<MilestoneTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<MilestoneFilters>(initialFilters ?? {});

  const loadMilestones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await portalService.fetchMilestones(page, pageSize, filters);
      setMilestones(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch milestones'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const loadTimelineFn = useCallback(async (contractId: string) => {
    try {
      const data = await portalService.fetchMilestoneTimeline(contractId);
      setTimeline(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch timeline'));
    }
  }, []);

  const createFn = useCallback(async (request: CreateMilestoneRequest) => {
    const milestone = await portalService.createMilestone(request);
    await loadMilestones();
    return milestone;
  }, [loadMilestones]);

  const updateFn = useCallback(async (id: string, request: UpdateMilestoneRequest) => {
    const milestone = await portalService.updateMilestone(id, request);
    await loadMilestones();
    return milestone;
  }, [loadMilestones]);

  const deleteFn = useCallback(async (id: string) => {
    await portalService.deleteMilestone(id);
    await loadMilestones();
  }, [loadMilestones]);

  return {
    milestones,
    timeline,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    refresh: loadMilestones,
    setPage,
    setFilters,
    loadTimeline: loadTimelineFn,
    createMilestone: createFn,
    updateMilestone: updateFn,
    deleteMilestone: deleteFn,
  };
}

// ============ Scope Management Hook ============

interface UseScopeReturn {
  scopeItems: ScopeItem[];
  scopeChanges: ScopeChange[];
  summary: ScopeSummary | null;
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setItemFilters: (filters: ScopeItemFilters) => void;
  setChangeFilters: (filters: ScopeChangeFilters) => void;
  loadSummary: (contractId: string) => Promise<void>;
  createScopeItem: (request: CreateScopeItemRequest) => Promise<ScopeItem>;
  updateScopeItem: (id: string, request: UpdateScopeItemRequest) => Promise<ScopeItem>;
  deleteScopeItem: (id: string) => Promise<void>;
  createScopeChange: (request: CreateScopeChangeRequest) => Promise<ScopeChange>;
  updateScopeChange: (id: string, request: UpdateScopeChangeRequest) => Promise<ScopeChange>;
  approveScopeChange: (id: string) => Promise<ScopeChange>;
  rejectScopeChange: (id: string) => Promise<ScopeChange>;
}

export function useScope(
  initialItemFilters?: ScopeItemFilters,
  initialChangeFilters?: ScopeChangeFilters,
  pageSize: number = 20
): UseScopeReturn {
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>([]);
  const [summary, setSummary] = useState<ScopeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [itemFilters, setItemFilters] = useState<ScopeItemFilters>(initialItemFilters ?? {});
  const [changeFilters, setChangeFilters] = useState<ScopeChangeFilters>(
    initialChangeFilters ?? {}
  );

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [itemsData, changesData] = await Promise.all([
        portalService.fetchScopeItems(page, pageSize, itemFilters),
        portalService.fetchScopeChanges(0, pageSize, changeFilters),
      ]);
      setScopeItems(itemsData.content);
      setScopeChanges(changesData.content);
      setTotalPages(itemsData.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scope data'));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, itemFilters, changeFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadSummaryFn = useCallback(async (contractId: string) => {
    try {
      const data = await portalService.fetchScopeSummary(contractId);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scope summary'));
    }
  }, []);

  const createItemFn = useCallback(async (request: CreateScopeItemRequest) => {
    const item = await portalService.createScopeItem(request);
    await loadData();
    return item;
  }, [loadData]);

  const updateItemFn = useCallback(async (id: string, request: UpdateScopeItemRequest) => {
    const item = await portalService.updateScopeItem(id, request);
    await loadData();
    return item;
  }, [loadData]);

  const deleteItemFn = useCallback(async (id: string) => {
    await portalService.deleteScopeItem(id);
    await loadData();
  }, [loadData]);

  const createChangeFn = useCallback(async (request: CreateScopeChangeRequest) => {
    const change = await portalService.createScopeChange(request);
    await loadData();
    return change;
  }, [loadData]);

  const updateChangeFn = useCallback(async (id: string, request: UpdateScopeChangeRequest) => {
    const change = await portalService.updateScopeChange(id, request);
    await loadData();
    return change;
  }, [loadData]);

  const approveFn = useCallback(async (id: string) => {
    const change = await portalService.approveScopeChange(id);
    await loadData();
    return change;
  }, [loadData]);

  const rejectFn = useCallback(async (id: string) => {
    const change = await portalService.rejectScopeChange(id);
    await loadData();
    return change;
  }, [loadData]);

  return {
    scopeItems,
    scopeChanges,
    summary,
    isLoading,
    error,
    page,
    totalPages,
    refresh: loadData,
    setPage,
    setItemFilters,
    setChangeFilters,
    loadSummary: loadSummaryFn,
    createScopeItem: createItemFn,
    updateScopeItem: updateItemFn,
    deleteScopeItem: deleteItemFn,
    createScopeChange: createChangeFn,
    updateScopeChange: updateChangeFn,
    approveScopeChange: approveFn,
    rejectScopeChange: rejectFn,
  };
}

// ============ Composite Portal Hook ============

interface UsePortalReturn {
  sprints: UseSprintsReturn;
  featureRequests: UseFeatureRequestsReturn;
  messaging: UseMessagingReturn;
  milestones: UseMilestonesReturn;
  scope: UseScopeReturn;
}

/**
 * Composite hook for managing all portal data
 */
export function usePortal(contractId?: string): UsePortalReturn {
  const sprintFilters = useMemo(
    () => (contractId !== undefined ? { contractId } : {}),
    [contractId]
  );
  const featureFilters = useMemo(
    () => (contractId !== undefined ? { contractId } : {}),
    [contractId]
  );
  const milestoneFilters = useMemo(
    () => (contractId !== undefined ? { contractId } : {}),
    [contractId]
  );
  const scopeItemFilters = useMemo(
    () => (contractId !== undefined ? { contractId } : {}),
    [contractId]
  );
  const scopeChangeFilters = useMemo(
    () => (contractId !== undefined ? { contractId } : {}),
    [contractId]
  );

  const sprints = useSprints(sprintFilters);
  const featureRequests = useFeatureRequests(featureFilters);
  const messaging = useMessaging();
  const milestones = useMilestones(milestoneFilters);
  const scope = useScope(scopeItemFilters, scopeChangeFilters);

  return {
    sprints,
    featureRequests,
    messaging,
    milestones,
    scope,
  };
}

export default usePortal;
