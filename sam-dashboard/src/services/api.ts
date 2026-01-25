import { Opportunity } from '../components/domain/opportunity';

const API_BASE = '/api';

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const response = await fetch(`${API_BASE}/opportunities`);
  if (!response.ok) {
    throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerIngest(): Promise<void> {
  const response = await fetch(`${API_BASE}/ingest`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to trigger ingest: ${response.statusText}`);
  }
}
