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

  const response = await apiClient.get(`${CRM_BASE}/contacts?${params.toString()}`);
  return response as Page<Contact>;
}

export async function fetchContact(id: string): Promise<Contact> {
  const response = await apiClient.get(`${CRM_BASE}/contacts/${id}`);
  return response as Contact;
}

export async function createContact(request: CreateContactRequest): Promise<Contact> {
  const response = await apiClient.post(`${CRM_BASE}/contacts`, request);
  return response as Contact;
}

export async function updateContact(id: string, request: UpdateContactRequest): Promise<Contact> {
  const response = await apiClient.put(`${CRM_BASE}/contacts/${id}`, request);
  return response as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`${CRM_BASE}/contacts/${id}`);
}

export async function searchContacts(keyword: string, page: number = 0, size: number = 20): Promise<Page<Contact>> {
  const params = new URLSearchParams();
  params.set('keyword', keyword);
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get(`${CRM_BASE}/contacts/search?${params.toString()}`);
  return response as Page<Contact>;
}

export async function fetchContactsByOrganization(
  organizationId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Contact>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get(`${CRM_BASE}/organizations/${organizationId}/contacts?${params.toString()}`);
  return response as Page<Contact>;
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

  const response = await apiClient.get(`${CRM_BASE}/organizations?${params.toString()}`);
  return response as Page<Organization>;
}

export async function fetchOrganization(id: string): Promise<Organization> {
  const response = await apiClient.get(`${CRM_BASE}/organizations/${id}`);
  return response as Organization;
}

export async function createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
  const response = await apiClient.post(`${CRM_BASE}/organizations`, request);
  return response as Organization;
}

export async function updateOrganization(id: string, request: UpdateOrganizationRequest): Promise<Organization> {
  const response = await apiClient.put(`${CRM_BASE}/organizations/${id}`, request);
  return response as Organization;
}

export async function deleteOrganization(id: string): Promise<void> {
  await apiClient.delete(`${CRM_BASE}/organizations/${id}`);
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

  const response = await apiClient.get(`${CRM_BASE}/organizations/search?${params.toString()}`);
  return response as Page<Organization>;
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

  const response = await apiClient.get(`${CRM_BASE}/interactions?${params.toString()}`);
  return response as Page<Interaction>;
}

export async function fetchInteraction(id: string): Promise<Interaction> {
  const response = await apiClient.get(`${CRM_BASE}/interactions/${id}`);
  return response as Interaction;
}

export async function createInteraction(request: CreateInteractionRequest): Promise<Interaction> {
  const response = await apiClient.post(`${CRM_BASE}/interactions`, request);
  return response as Interaction;
}

export async function updateInteraction(id: string, request: UpdateInteractionRequest): Promise<Interaction> {
  const response = await apiClient.put(`${CRM_BASE}/interactions/${id}`, request);
  return response as Interaction;
}

export async function deleteInteraction(id: string): Promise<void> {
  await apiClient.delete(`${CRM_BASE}/interactions/${id}`);
}

export async function fetchInteractionsByContact(
  contactId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Interaction>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get(`${CRM_BASE}/contacts/${contactId}/interactions?${params.toString()}`);
  return response as Page<Interaction>;
}

export async function fetchInteractionsByOrganization(
  organizationId: string,
  page: number = 0,
  size: number = 20
): Promise<Page<Interaction>> {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('size', size.toString());

  const response = await apiClient.get(`${CRM_BASE}/organizations/${organizationId}/interactions?${params.toString()}`);
  return response as Page<Interaction>;
}

export async function fetchUpcomingFollowups(): Promise<UpcomingFollowup[]> {
  const response = await apiClient.get(`${CRM_BASE}/interactions/followups/upcoming`);
  return response as UpcomingFollowup[];
}

export async function markFollowupComplete(interactionId: string): Promise<Interaction> {
  const response = await apiClient.patch(`${CRM_BASE}/interactions/${interactionId}/followup/complete`);
  return response as Interaction;
}

// ============ Recent Activity ============

export async function fetchRecentActivity(limit: number = 10): Promise<Interaction[]> {
  const params = new URLSearchParams();
  params.set('limit', limit.toString());

  const response = await apiClient.get(`${CRM_BASE}/activity/recent?${params.toString()}`);
  return response as Interaction[];
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
  const response = await apiClient.get(`${CRM_BASE}/stats`);
  return response as CrmStats;
}
