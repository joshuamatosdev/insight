import { apiClient } from './apiClient';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  email: string;
  roles: string[];
  status: InvitationStatus;
  invitedById: string;
  invitedByName: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface CreateInvitationRequest {
  email: string;
  roles: string[];
  customMessage?: string;
}

export interface AcceptInvitationRequest {
  firstName: string;
  lastName: string;
  password: string;
}

export interface InvitationDetails {
  email: string;
  tenantName: string;
  invitedByName: string;
  roles: string[];
  expiresAt: string;
  isValid: boolean;
}

const INVITATION_BASE = '/api/invitations';

export async function fetchInvitations(): Promise<Invitation[]> {
  const response = await apiClient.get(INVITATION_BASE);
  return response as Invitation[];
}

export async function fetchInvitation(id: string): Promise<Invitation> {
  const response = await apiClient.get(`${INVITATION_BASE}/${id}`);
  return response as Invitation;
}

export async function createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
  const response = await apiClient.post(INVITATION_BASE, data);
  return response as Invitation;
}

export async function createBulkInvitations(
  invitations: CreateInvitationRequest[]
): Promise<Invitation[]> {
  const response = await apiClient.post(`${INVITATION_BASE}/bulk`, { invitations });
  return response as Invitation[];
}

export async function resendInvitation(id: string): Promise<Invitation> {
  const response = await apiClient.post(`${INVITATION_BASE}/${id}/resend`);
  return response as Invitation;
}

export async function revokeInvitation(id: string): Promise<void> {
  await apiClient.delete(`${INVITATION_BASE}/${id}`);
}

export async function getInvitationByToken(token: string): Promise<InvitationDetails> {
  const response = await apiClient.get(`${INVITATION_BASE}/token/${token}`);
  return response as InvitationDetails;
}

export async function acceptInvitation(
  token: string,
  data: AcceptInvitationRequest
): Promise<void> {
  await apiClient.post(`${INVITATION_BASE}/token/${token}/accept`, data);
}

export async function validateInvitationToken(token: string): Promise<{ valid: boolean }> {
  const response = await apiClient.get(`${INVITATION_BASE}/token/${token}/validate`);
  return response as { valid: boolean };
}
