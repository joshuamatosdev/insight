import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useState} from 'react';
import {queryKeys} from '../lib/query-keys';
import type {Contact, ContactFilters, CreateContactRequest, UpdateContactRequest} from '../types/crm';
import {
  createContact as createContactApi,
  deleteContact as deleteContactApi,
  fetchContact,
  fetchContacts,
  searchContacts,
  updateContact as updateContactApi,
} from '../services/crmService';

export interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  totalElements: number;
  filters: ContactFilters;
  setFilters: (filters: ContactFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  search: (keyword: string) => Promise<void>;
  create: (request: CreateContactRequest) => Promise<Contact>;
  update: (id: string, request: UpdateContactRequest) => Promise<Contact>;
  remove: (id: string) => Promise<void>;
}

export function useContacts(initialFilters?: ContactFilters): UseContactsReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ContactFilters>(initialFilters ?? {});
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.contacts.list({page, filters, searchKeyword}),
    queryFn: async () => {
      if (searchKeyword !== null && searchKeyword.length > 0) {
        return searchContacts(searchKeyword, page, 20);
      }
      return fetchContacts(page, 20, filters);
    },
  });

  const createMutation = useMutation({
    mutationFn: createContactApi,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contacts.all});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({id, request}: {id: string; request: UpdateContactRequest}) =>
      updateContactApi(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contacts.all});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactApi,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.contacts.all});
    },
  });

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const search = useCallback(async (keyword: string) => {
    setSearchKeyword(keyword.length > 0 ? keyword : null);
    setPage(0);
  }, []);

  const create = useCallback(
    async (request: CreateContactRequest): Promise<Contact> => {
      return createMutation.mutateAsync(request);
    },
    [createMutation]
  );

  const update = useCallback(
    async (id: string, request: UpdateContactRequest): Promise<Contact> => {
      return updateMutation.mutateAsync({id, request});
    },
    [updateMutation]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  return {
    contacts: query.data?.content ?? [],
    isLoading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error ?? null,
    page,
    totalPages: query.data?.totalPages ?? 0,
    totalElements: query.data?.totalElements ?? 0,
    filters,
    setFilters,
    setPage,
    refresh,
    search,
    create,
    update,
    remove,
  };
}

export interface UseContactReturn {
  contact: Contact | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (request: UpdateContactRequest) => Promise<Contact>;
}

export function useContact(id: string): UseContactReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: () => fetchContact(id),
    enabled: id !== '',
  });

  const updateMutation = useMutation({
    mutationFn: (request: UpdateContactRequest) => updateContactApi(id, request),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.contacts.detail(id), data);
      queryClient.invalidateQueries({queryKey: queryKeys.contacts.all});
    },
  });

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const update = useCallback(
    async (request: UpdateContactRequest): Promise<Contact> => {
      return updateMutation.mutateAsync(request);
    },
    [updateMutation]
  );

  return {
    contact: query.data ?? null,
    isLoading: query.isLoading || updateMutation.isPending,
    error: query.error ?? updateMutation.error ?? null,
    refresh,
    update,
  };
}
