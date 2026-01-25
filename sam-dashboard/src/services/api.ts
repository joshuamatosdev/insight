import { Opportunity } from '../components/domain/opportunity';
import { SbirAward, SbirStats } from '../components/domain/sbir';

const API_BASE = '/api';

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const response = await fetch(`${API_BASE}/opportunities`);
  if (!response.ok) {
    throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSbirOpportunities(phase?: string): Promise<Opportunity[]> {
  const url = phase 
    ? `${API_BASE}/opportunities/sbir?phase=${phase}`
    : `${API_BASE}/opportunities/sbir`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SBIR opportunities: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerIngest(): Promise<void> {
  const response = await fetch(`${API_BASE}/ingest`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to trigger ingest: ${response.statusText}`);
  }
}

export async function triggerFullIngest(): Promise<void> {
  const response = await fetch(`${API_BASE}/ingest/full`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to trigger full ingest: ${response.statusText}`);
  }
}

export async function triggerSbirIngest(): Promise<void> {
  const response = await fetch(`${API_BASE}/ingest/sbir`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to trigger SBIR ingest: ${response.statusText}`);
  }
}

// ==================== SBIR.gov API ====================

export async function fetchSbirAwards(agency?: string, phase?: string): Promise<SbirAward[]> {
  const params = new URLSearchParams();
  if (agency) params.append('agency', agency);
  if (phase) params.append('phase', phase);
  
  const url = params.toString() 
    ? `${API_BASE}/sbir/awards?${params}`
    : `${API_BASE}/sbir/awards`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SBIR awards: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSbirStats(): Promise<SbirStats> {
  const response = await fetch(`${API_BASE}/sbir/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch SBIR stats: ${response.statusText}`);
  }
  return response.json();
}

export async function searchSbirAwards(keyword: string): Promise<SbirAward[]> {
  const response = await fetch(`${API_BASE}/sbir/awards/search?q=${encodeURIComponent(keyword)}`);
  if (!response.ok) {
    throw new Error(`Failed to search SBIR awards: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerSbirGovIngest(): Promise<void> {
  const response = await fetch(`${API_BASE}/sbir/ingest`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to trigger SBIR.gov ingest: ${response.statusText}`);
  }
}

export async function fetchSbirAgencies(): Promise<Record<string, number>> {
  const response = await fetch(`${API_BASE}/sbir/agencies`);
  if (!response.ok) {
    throw new Error(`Failed to fetch SBIR agencies: ${response.statusText}`);
  }
  return response.json();
}
