import { apiClient } from './apiClient';
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactFilters,
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationFilters,
  Interaction,
  CreateInteractionRequest,
  UpdateInteractionRequest,
  InteractionFilters,
  UpcomingFollowup,
} from '../types/crm';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const CRM_BASE = '/crm';

// ============ Contacts ============

export async function fetchContacts(
  page: number = 0,
  size: number = 20,
  filters?: ContactFilters
): Promise<Page<Contact>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }
  if (filters?.contactType !== undefined) {
    params.set('contactType', filters.contactType);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.organizationId !== undefined) {
    params.set('organizationId', filters.organizationId);
  }

  const response = await apiClient.get<Page<Contact>>(`${CRM_BASE}/contacts?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchContact(id: string): Promise<Contact> {
  const response = await apiClient.get<Contact>(`${CRM_BASE}/contacts/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createContact(request: CreateContactRequest): Promise<Contact> {
  const response = await apiClient.post<Contact, CreateContactRequest>(`${CRM_BASE}/contacts`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateContact(id: string, request: UpdateContactRequest): Promise<Contact> {
  const response = await apiClient.put<Contact, UpdateContactRequest>(`${CRM_BASE}/contacts/${id}`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function deleteContact(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${CRM_BASE}/contacts/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function searchContacts(keyword: string, page: number = 0, size: number = 20): Promise<Page<Contact>> {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get<Page<Contact>>(`${CRM_BASE}/contacts/search?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchContactsByOrganization(
  organizationId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Contact>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get<Page<Contact>>(
    `${CRM_BASE}/organizations/${organizationId}/contacts?${params.toString()}`
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

// ============ Organizations ============

export async function fetchOrganizations(
  page: number = 0,
  size: number = 20,
  filters?: OrganizationFilters
): Promise<Page<Organization>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }
  if (filters?.organizationType !== undefined) {
    params.set('organizationType', filters.organizationType);
  }
  if (filters?.status !== undefined) {
    params.set('status', filters.status);
  }
  if (filters?.businessSize !== undefined) {
    params.set('businessSize', filters.businessSize);
  }

  const response = await apiClient.get<Page<Organization>>(`${CRM_BASE}/organizations?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchOrganization(id: string): Promise<Organization> {
  const response = await apiClient.get<Organization>(`${CRM_BASE}/organizations/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
  const response = await apiClient.post<Organization, CreateOrganizationRequest>(
    `${CRM_BASE}/organizations`,
    request
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateOrganization(id: string, request: UpdateOrganizationRequest): Promise<Organization> {
  const response = await apiClient.put<Organization, UpdateOrganizationRequest>(
    `${CRM_BASE}/organizations/${id}`,
    request
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function deleteOrganization(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${CRM_BASE}/organizations/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function searchOrganizations(
  keyword: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Organization>> {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get<Page<Organization>>(`${CRM_BASE}/organizations/search?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

// ============ Interactions ============

export async function fetchInteractions(
  page: number = 0,
  size: number = 20,
  filters?: InteractionFilters
): Promise<Page<Interaction>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  if (filters?.search !== undefined && filters.search !== '') {
    params.set('search', filters.search);
  }
  if (filters?.interactionType !== undefined) {
    params.set('interactionType', filters.interactionType);
  }
  if (filters?.outcome !== undefined) {
    params.set('outcome', filters.outcome);
  }
  if (filters?.contactId !== undefined) {
    params.set('contactId', filters.contactId);
  }
  if (filters?.organizationId !== undefined) {
    params.set('organizationId', filters.organizationId);
  }
  if (filters?.followUpRequired !== undefined) {
    params.set('followUpRequired', filters.followUpRequired.toString());
  }
  if (filters?.startDate !== undefined) {
    params.set('startDate', filters.startDate);
  }
  if (filters?.endDate !== undefined) {
    params.set('endDate', filters.endDate);
  }

  const response = await apiClient.get<Page<Interaction>>(`${CRM_BASE}/interactions?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchInteraction(id: string): Promise<Interaction> {
  const response = await apiClient.get<Interaction>(`${CRM_BASE}/interactions/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createInteraction(request: CreateInteractionRequest): Promise<Interaction> {
  const response = await apiClient.post<Interaction, CreateInteractionRequest>(`${CRM_BASE}/interactions`, request);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function updateInteraction(id: string, request: UpdateInteractionRequest): Promise<Interaction> {
  const response = await apiClient.put<Interaction, UpdateInteractionRequest>(
    `${CRM_BASE}/interactions/${id}`,
    request
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function deleteInteraction(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${CRM_BASE}/interactions/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function fetchInteractionsByContact(
  contactId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Interaction>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get<Page<Interaction>>(
    `${CRM_BASE}/contacts/${contactId}/interactions?${params.toString()}`
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchInteractionsByOrganization(
  organizationId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Interaction>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get<Page<Interaction>>(
    `${CRM_BASE}/organizations/${organizationId}/interactions?${params.toString()}`
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchUpcomingFollowups(): Promise<UpcomingFollowup[]> {
  const response = await apiClient.get<UpcomingFollowup[]>(`${CRM_BASE}/interactions/followups/upcoming`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function markFollowupComplete(interactionId: string): Promise<Interaction> {
  const response = await apiClient.patch<Interaction, Record<string, never>>(
    `${CRM_BASE}/interactions/${interactionId}/followup/complete`,
    {}
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

// ============ Recent Activity ============

export async function fetchRecentActivity(limit: number = 10): Promise<Interaction[]> {
  const params = new URLSearchParams();
  params.set('limit', limit.toString());

  const response = await apiClient.get<Interaction[]>(`${CRM_BASE}/activity/recent?${params.toString()}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

// ============ Statistics ============

export interface CrmStats {
  totalContacts: number;
  totalOrganizations: number;
  totalInteractions: number;
  pendingFollowups: number;
  overdueFollowups: number;
  recentInteractions: number;
}

export async function fetchCrmStats(): Promise<CrmStats> {
  const response = await apiClient.get<CrmStats>(`${CRM_BASE}/stats`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
