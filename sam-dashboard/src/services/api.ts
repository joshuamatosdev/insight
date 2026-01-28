import { Opportunity } from '../components/domain/opportunity';
import { SbirAward, SbirStats } from '../components/domain/sbir';

const API_BASE = '/api/v1';
const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Gets the auth token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    const parsed = JSON.parse(stored);
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Creates headers with auth token if available
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (token !== null) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options?.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const response = await authFetch(`${API_BASE}/opportunities`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSbirOpportunities(phase?: string): Promise<Opportunity[]> {
  const url =
    phase !== undefined
      ? `${API_BASE}/opportunities/sbir?phase=${phase}`
      : `${API_BASE}/opportunities/sbir`;
  const response = await authFetch(url);
  if (response.ok === false) {
    throw new Error(`Failed to fetch SBIR opportunities: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerIngest(): Promise<void> {
  const response = await authFetch(`${API_BASE}/ingest`, { method: 'POST' });
  if (response.ok === false) {
    throw new Error(`Failed to trigger ingest: ${response.statusText}`);
  }
}

export async function triggerFullIngest(): Promise<void> {
  const response = await authFetch(`${API_BASE}/ingest/full`, { method: 'POST' });
  if (response.ok === false) {
    throw new Error(`Failed to trigger full ingest: ${response.statusText}`);
  }
}

export async function triggerSbirIngest(): Promise<void> {
  const response = await authFetch(`${API_BASE}/ingest/sbir`, { method: 'POST' });
  if (response.ok === false) {
    throw new Error(`Failed to trigger SBIR ingest: ${response.statusText}`);
  }
}

// ==================== SBIR.gov API ====================

export async function fetchSbirAwards(
  agency?: string,
  phase?: string
): Promise<SbirAward[]> {
  const params = new URLSearchParams();
  if (agency !== undefined) params.append('agency', agency);
  if (phase !== undefined) params.append('phase', phase);

  const url =
    params.toString().length > 0
      ? `${API_BASE}/sbir/awards?${params}`
      : `${API_BASE}/sbir/awards`;

  const response = await authFetch(url);
  if (response.ok === false) {
    throw new Error(`Failed to fetch SBIR awards: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSbirStats(): Promise<SbirStats> {
  const response = await authFetch(`${API_BASE}/sbir/stats`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch SBIR stats: ${response.statusText}`);
  }
  return response.json();
}

export async function searchSbirAwards(keyword: string): Promise<SbirAward[]> {
  const response = await authFetch(
    `${API_BASE}/sbir/awards/search?q=${encodeURIComponent(keyword)}`
  );
  if (response.ok === false) {
    throw new Error(`Failed to search SBIR awards: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerSbirGovIngest(): Promise<void> {
  const response = await authFetch(`${API_BASE}/sbir/ingest`, { method: 'POST' });
  if (response.ok === false) {
    throw new Error(`Failed to trigger SBIR.gov ingest: ${response.statusText}`);
  }
}

export async function fetchSbirAgencies(): Promise<Record<string, number>> {
  const response = await authFetch(`${API_BASE}/sbir/agencies`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch SBIR agencies: ${response.statusText}`);
  }
  return response.json();
}

// ==================== Opportunity Alerts API ====================

import type {
  OpportunityAlert,
  CreateAlertRequest,
  UpdateAlertRequest,
  PaginatedResponse,
} from '../pages/AlertsPage.types';

export async function fetchOpportunityAlerts(
  page: number = 0,
  size: number = 20
): Promise<PaginatedResponse<OpportunityAlert>> {
  const response = await authFetch(
    `${API_BASE}/opportunity-alerts?page=${page}&size=${size}`
  );
  if (response.ok === false) {
    throw new Error(`Failed to fetch opportunity alerts: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchOpportunityAlert(id: string): Promise<OpportunityAlert> {
  const response = await authFetch(`${API_BASE}/opportunity-alerts/${id}`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch opportunity alert: ${response.statusText}`);
  }
  return response.json();
}

export async function createOpportunityAlert(
  request: CreateAlertRequest
): Promise<OpportunityAlert> {
  const response = await authFetch(`${API_BASE}/opportunity-alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `Failed to create opportunity alert: ${response.statusText}`
    );
  }
  return response.json();
}

export async function updateOpportunityAlert(
  id: string,
  request: UpdateAlertRequest
): Promise<OpportunityAlert> {
  const response = await authFetch(`${API_BASE}/opportunity-alerts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (response.ok === false) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `Failed to update opportunity alert: ${response.statusText}`
    );
  }
  return response.json();
}

export async function deleteOpportunityAlert(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/opportunity-alerts/${id}`, {
    method: 'DELETE',
  });
  if (response.ok === false) {
    throw new Error(`Failed to delete opportunity alert: ${response.statusText}`);
  }
}

export async function toggleOpportunityAlert(id: string): Promise<OpportunityAlert> {
  const response = await authFetch(`${API_BASE}/opportunity-alerts/${id}/toggle`, {
    method: 'POST',
  });
  if (response.ok === false) {
    throw new Error(`Failed to toggle opportunity alert: ${response.statusText}`);
  }
  return response.json();
}
