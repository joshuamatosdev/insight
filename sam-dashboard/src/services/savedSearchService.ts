import { apiClient } from './apiClient';

export interface SavedSearch {
  id: string;
  name: string;
  description: string | null;
  query: string;
  filters: SavedSearchFilters;
  isDefault: boolean;
  notifyOnNewResults: boolean;
  notifyFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
  lastExecutedAt: string | null;
  resultCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearchFilters {
  keywords?: string[];
  naicsCodes?: string[];
  pscCodes?: string[];
  setAsides?: string[];
  states?: string[];
  agencies?: string[];
  opportunityTypes?: string[];
  postedDateRange?: { start: string; end: string };
  responseDateRange?: { start: string; end: string };
  valueRange?: { min: number; max: number };
}

export interface CreateSavedSearchRequest {
  name: string;
  description?: string;
  query: string;
  filters: SavedSearchFilters;
  isDefault?: boolean;
  notifyOnNewResults?: boolean;
  notifyFrequency?: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
}

export interface UpdateSavedSearchRequest {
  name?: string;
  description?: string;
  query?: string;
  filters?: SavedSearchFilters;
  isDefault?: boolean;
  notifyOnNewResults?: boolean;
  notifyFrequency?: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';
}

export interface SearchResult {
  id: string;
  noticeId: string;
  title: string;
  agency: string;
  postedDate: string;
  responseDeadline: string | null;
  type: string;
  setAside: string | null;
  naicsCode: string | null;
  score: number;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const SAVED_SEARCH_BASE = '/saved-searches';

export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const response = await apiClient.get(SAVED_SEARCH_BASE);
  return response as SavedSearch[];
}

export async function fetchSavedSearch(id: string): Promise<SavedSearch> {
  const response = await apiClient.get(`${SAVED_SEARCH_BASE}/${id}`);
  return response as SavedSearch;
}

export async function createSavedSearch(data: CreateSavedSearchRequest): Promise<SavedSearch> {
  const response = await apiClient.post(SAVED_SEARCH_BASE, data);
  return response as SavedSearch;
}

export async function updateSavedSearch(
  id: string,
  data: UpdateSavedSearchRequest
): Promise<SavedSearch> {
  const response = await apiClient.put(`${SAVED_SEARCH_BASE}/${id}`, data);
  return response as SavedSearch;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await apiClient.delete(`${SAVED_SEARCH_BASE}/${id}`);
}

export async function executeSavedSearch(
  id: string,
  page: number = 0,
  size: number = 20
): Promise<Page<SearchResult>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());
  const response = await apiClient.get(`${SAVED_SEARCH_BASE}/${id}/execute?${params.toString()}`);
  return response as Page<SearchResult>;
}

export async function setDefaultSearch(id: string): Promise<SavedSearch> {
  const response = await apiClient.patch(`${SAVED_SEARCH_BASE}/${id}/default`);
  return response as SavedSearch;
}

export async function duplicateSavedSearch(id: string, newName: string): Promise<SavedSearch> {
  const response = await apiClient.post(`${SAVED_SEARCH_BASE}/${id}/duplicate`, { name: newName });
  return response as SavedSearch;
}
