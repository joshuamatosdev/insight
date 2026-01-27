import { useState, useCallback, useEffect } from 'react';
import type {
  Interaction,
  CreateInteractionRequest,
  UpdateInteractionRequest,
  InteractionFilters,
  UpcomingFollowup,
} from '../types/crm';
import {
  fetchInteractions,
  fetchInteraction,
  createInteraction as createInteractionApi,
  updateInteraction as updateInteractionApi,
  deleteInteraction as deleteInteractionApi,
  fetchInteractionsByContact,
  fetchInteractionsByOrganization,
  fetchUpcomingFollowups,
  markFollowupComplete as markFollowupCompleteApi,
} from '../services/crmService';

export interface UseInteractionsReturn {
  interactions: Interaction[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  filters: InteractionFilters;
  setFilters: (filters: InteractionFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  create: (request: CreateInteractionRequest) => Promise<Interaction>;
  update: (id: string, request: UpdateInteractionRequest) => Promise<Interaction>;
  remove: (id: string) => Promise<void>;
}

export function useInteractions(initialFilters?: InteractionFilters): UseInteractionsReturn {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<InteractionFilters>(initialFilters ?? {});

  const loadInteractions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchInteractions(page, 20, filters);
      setInteractions(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interactions';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    void loadInteractions();
  }, [loadInteractions]);

  const refresh = useCallback(async () => {
    await loadInteractions();
  }, [loadInteractions]);

  const create = useCallback(async (request: CreateInteractionRequest): Promise<Interaction> => {
    const newInteraction = await createInteractionApi(request);
    setInteractions((prev) => [newInteraction, ...prev]);
    setTotalElements((prev) => prev + 1);
    return newInteraction;
  }, []);

  const update = useCallback(async (id: string, request: UpdateInteractionRequest): Promise<Interaction> => {
    const updatedInteraction = await updateInteractionApi(id, request);
    setInteractions((prev) =>
      prev.map((i) => (i.id === id ? updatedInteraction : i))
    );
    return updatedInteraction;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteInteractionApi(id);
    setInteractions((prev) => prev.filter((i) => i.id !== id));
    setTotalElements((prev) => prev - 1);
  }, []);

  return {
    interactions,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    filters,
    setFilters,
    setPage,
    refresh,
    create,
    update,
    remove,
  };
}

export interface UseContactInteractionsReturn {
  interactions: Interaction[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  create: (request: CreateInteractionRequest) => Promise<Interaction>;
}

export function useContactInteractions(contactId: string): UseContactInteractionsReturn {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadInteractions = useCallback(async () => {
    if (contactId === '') {
      setInteractions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchInteractionsByContact(contactId, page, 20);
      setInteractions(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interactions';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [contactId, page]);

  useEffect(() => {
    void loadInteractions();
  }, [loadInteractions]);

  const refresh = useCallback(async () => {
    await loadInteractions();
  }, [loadInteractions]);

  const create = useCallback(async (request: CreateInteractionRequest): Promise<Interaction> => {
    const newInteraction = await createInteractionApi({ ...request, contactId });
    setInteractions((prev) => [newInteraction, ...prev]);
    return newInteraction;
  }, [contactId]);

  return {
    interactions,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    refresh,
    create,
  };
}

export interface UseOrganizationInteractionsReturn {
  interactions: Interaction[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  create: (request: CreateInteractionRequest) => Promise<Interaction>;
}

export function useOrganizationInteractions(organizationId: string): UseOrganizationInteractionsReturn {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadInteractions = useCallback(async () => {
    if (organizationId === '') {
      setInteractions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchInteractionsByOrganization(organizationId, page, 20);
      setInteractions(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interactions';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, page]);

  useEffect(() => {
    void loadInteractions();
  }, [loadInteractions]);

  const refresh = useCallback(async () => {
    await loadInteractions();
  }, [loadInteractions]);

  const create = useCallback(async (request: CreateInteractionRequest): Promise<Interaction> => {
    const newInteraction = await createInteractionApi({ ...request, organizationId });
    setInteractions((prev) => [newInteraction, ...prev]);
    return newInteraction;
  }, [organizationId]);

  return {
    interactions,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    refresh,
    create,
  };
}

export interface UseUpcomingFollowupsReturn {
  followups: UpcomingFollowup[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  markComplete: (interactionId: string) => Promise<void>;
}

export function useUpcomingFollowups(): UseUpcomingFollowupsReturn {
  const [followups, setFollowups] = useState<UpcomingFollowup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFollowups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUpcomingFollowups();
      setFollowups(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load followups';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFollowups();
  }, [loadFollowups]);

  const refresh = useCallback(async () => {
    await loadFollowups();
  }, [loadFollowups]);

  const markComplete = useCallback(async (interactionId: string): Promise<void> => {
    await markFollowupCompleteApi(interactionId);
    setFollowups((prev) => prev.filter((f) => f.id !== interactionId));
  }, []);

  return {
    followups,
    isLoading,
    error,
    refresh,
    markComplete,
  };
}

export interface UseInteractionReturn {
  interaction: Interaction | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (request: UpdateInteractionRequest) => Promise<Interaction>;
}

export function useInteraction(id: string): UseInteractionReturn {
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInteraction = useCallback(async () => {
    if (id === '') {
      setInteraction(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchInteraction(id);
      setInteraction(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interaction';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadInteraction();
  }, [loadInteraction]);

  const refresh = useCallback(async () => {
    await loadInteraction();
  }, [loadInteraction]);

  const update = useCallback(async (request: UpdateInteractionRequest): Promise<Interaction> => {
    const updatedInteraction = await updateInteractionApi(id, request);
    setInteraction(updatedInteraction);
    return updatedInteraction;
  }, [id]);

  return {
    interaction,
    isLoading,
    error,
    refresh,
    update,
  };
}
