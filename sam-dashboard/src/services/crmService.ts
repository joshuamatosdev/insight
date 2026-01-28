/**
 * CRM Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {
    Contact,
    ContactFilters,
    CreateContactRequest,
    CreateInteractionRequest,
    CreateOrganizationRequest,
    Interaction,
    InteractionFilters,
    Organization,
    OrganizationFilters,
    UpcomingFollowup,
    UpdateContactRequest,
    UpdateInteractionRequest,
    UpdateOrganizationRequest,
} from '../types/crm';

interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ============ Contacts ============

export async function fetchContacts(
    page: number = 0,
    size: number = 20,
    filters?: ContactFilters
): Promise<Page<Contact>> {
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }
    if (filters?.contactType !== undefined) {
        queryParams.contactType = filters.contactType;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.organizationId !== undefined) {
        queryParams.organizationId = filters.organizationId;
    }

    const {data, error} = await apiClient.GET('/crm/contacts', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Contact>;
}

export async function fetchContact(id: string): Promise<Contact> {
    const {data, error} = await apiClient.GET('/crm/contacts/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contact;
}

export async function createContact(request: CreateContactRequest): Promise<Contact> {
    const {data, error} = await apiClient.POST('/crm/contacts', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contact;
}

export async function updateContact(id: string, request: UpdateContactRequest): Promise<Contact> {
    const {data, error} = await apiClient.PUT('/crm/contacts/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/crm/contacts/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function searchContacts(keyword: string, page: number = 0, size: number = 20): Promise<Page<Contact>> {
    const {data, error} = await apiClient.GET('/crm/contacts/search', {
        params: {query: {keyword, page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Contact>;
}

export async function fetchContactsByOrganization(
    organizationId: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Contact>> {
    const {data, error} = await apiClient.GET('/crm/organizations/{organizationId}/contacts', {
        params: {path: {organizationId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Contact>;
}

// ============ Organizations ============

export async function fetchOrganizations(
    page: number = 0,
    size: number = 20,
    filters?: OrganizationFilters
): Promise<Page<Organization>> {
    const queryParams: Record<string, string | number> = {page, size};

    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }
    if (filters?.organizationType !== undefined) {
        queryParams.organizationType = filters.organizationType;
    }
    if (filters?.status !== undefined) {
        queryParams.status = filters.status;
    }
    if (filters?.businessSize !== undefined) {
        queryParams.businessSize = filters.businessSize;
    }

    const {data, error} = await apiClient.GET('/crm/organizations', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Organization>;
}

export async function fetchOrganization(id: string): Promise<Organization> {
    const {data, error} = await apiClient.GET('/crm/organizations/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Organization;
}

export async function createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
    const {data, error} = await apiClient.POST('/crm/organizations', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Organization;
}

export async function updateOrganization(id: string, request: UpdateOrganizationRequest): Promise<Organization> {
    const {data, error} = await apiClient.PUT('/crm/organizations/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Organization;
}

export async function deleteOrganization(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/crm/organizations/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function searchOrganizations(
    keyword: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Organization>> {
    const {data, error} = await apiClient.GET('/crm/organizations/search', {
        params: {query: {keyword, page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Organization>;
}

// ============ Interactions ============

export async function fetchInteractions(
    page: number = 0,
    size: number = 20,
    filters?: InteractionFilters
): Promise<Page<Interaction>> {
    const queryParams: Record<string, string | number | boolean> = {page, size};

    if (filters?.search !== undefined && filters.search !== '') {
        queryParams.search = filters.search;
    }
    if (filters?.interactionType !== undefined) {
        queryParams.interactionType = filters.interactionType;
    }
    if (filters?.outcome !== undefined) {
        queryParams.outcome = filters.outcome;
    }
    if (filters?.contactId !== undefined) {
        queryParams.contactId = filters.contactId;
    }
    if (filters?.organizationId !== undefined) {
        queryParams.organizationId = filters.organizationId;
    }
    if (filters?.followUpRequired !== undefined) {
        queryParams.followUpRequired = filters.followUpRequired;
    }
    if (filters?.startDate !== undefined) {
        queryParams.startDate = filters.startDate;
    }
    if (filters?.endDate !== undefined) {
        queryParams.endDate = filters.endDate;
    }

    const {data, error} = await apiClient.GET('/crm/interactions', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Interaction>;
}

export async function fetchInteraction(id: string): Promise<Interaction> {
    const {data, error} = await apiClient.GET('/crm/interactions/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Interaction;
}

export async function createInteraction(request: CreateInteractionRequest): Promise<Interaction> {
    const {data, error} = await apiClient.POST('/crm/interactions', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Interaction;
}

export async function updateInteraction(id: string, request: UpdateInteractionRequest): Promise<Interaction> {
    const {data, error} = await apiClient.PUT('/crm/interactions/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Interaction;
}

export async function deleteInteraction(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/crm/interactions/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function fetchInteractionsByContact(
    contactId: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Interaction>> {
    const {data, error} = await apiClient.GET('/crm/contacts/{contactId}/interactions', {
        params: {path: {contactId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Interaction>;
}

export async function fetchInteractionsByOrganization(
    organizationId: string,
    page: number = 0,
    size: number = 20
): Promise<Page<Interaction>> {
    const {data, error} = await apiClient.GET('/crm/organizations/{organizationId}/interactions', {
        params: {path: {organizationId}, query: {page, size}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Page<Interaction>;
}

export async function fetchUpcomingFollowups(): Promise<UpcomingFollowup[]> {
    const {data, error} = await apiClient.GET('/crm/interactions/followups/upcoming');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as UpcomingFollowup[];
}

export async function markFollowupComplete(interactionId: string): Promise<Interaction> {
    const {data, error} = await apiClient.PATCH('/crm/interactions/{interactionId}/followup/complete', {
        params: {path: {interactionId}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Interaction;
}

// ============ Recent Activity ============

export async function fetchRecentActivity(limit: number = 10): Promise<Interaction[]> {
    const {data, error} = await apiClient.GET('/crm/activity/recent', {
        params: {query: {limit}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Interaction[];
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
    const {data, error} = await apiClient.GET('/crm/stats');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as CrmStats;
}
