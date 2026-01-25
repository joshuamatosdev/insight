import { Opportunity } from '../components/domain/opportunity';

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
