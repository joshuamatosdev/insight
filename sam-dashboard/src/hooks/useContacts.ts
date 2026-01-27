import { useState, useCallback, useEffect } from 'react';
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactFilters,
} from '../types/crm';
import {
  fetchContacts,
  fetchContact,
  createContact as createContactApi,
  updateContact as updateContactApi,
  deleteContact as deleteContactApi,
  searchContacts,
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<ContactFilters>(initialFilters ?? {});

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchContacts(page, 20, filters);
      setContacts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contacts';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const refresh = useCallback(async () => {
    await loadContacts();
  }, [loadContacts]);

  const search = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchContacts(keyword, page, 20);
      setContacts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const create = useCallback(async (request: CreateContactRequest): Promise<Contact> => {
    const newContact = await createContactApi(request);
    setContacts((prev) => [newContact, ...prev]);
    setTotalElements((prev) => prev + 1);
    return newContact;
  }, []);

  const update = useCallback(async (id: string, request: UpdateContactRequest): Promise<Contact> => {
    const updatedContact = await updateContactApi(id, request);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? updatedContact : c))
    );
    return updatedContact;
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteContactApi(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setTotalElements((prev) => prev - 1);
  }, []);

  return {
    contacts,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
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
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContact = useCallback(async () => {
    if (id === '') {
      setContact(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchContact(id);
      setContact(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contact';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadContact();
  }, [loadContact]);

  const refresh = useCallback(async () => {
    await loadContact();
  }, [loadContact]);

  const update = useCallback(async (request: UpdateContactRequest): Promise<Contact> => {
    const updatedContact = await updateContactApi(id, request);
    setContact(updatedContact);
    return updatedContact;
  }, [id]);

  return {
    contact,
    isLoading,
    error,
    refresh,
    update,
  };
}
