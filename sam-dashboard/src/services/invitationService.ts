import {apiClient} from './apiClient';

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

const INVITATION_BASE = '/invitations';

export async function fetchInvitations(): Promise<Invitation[]> {
  const response = await apiClient.get<Invitation[]>(INVITATION_BASE);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function fetchInvitation(id: string): Promise<Invitation> {
  const response = await apiClient.get<Invitation>(`${INVITATION_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
  const response = await apiClient.post<Invitation, CreateInvitationRequest>(INVITATION_BASE, data);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function createBulkInvitations(
  invitations: CreateInvitationRequest[]
): Promise<Invitation[]> {
  const response = await apiClient.post<Invitation[], { invitations: CreateInvitationRequest[] }>(
    `${INVITATION_BASE}/bulk`,
    { invitations }
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function resendInvitation(id: string): Promise<Invitation> {
  const response = await apiClient.post<Invitation, Record<string, never>>(
    `${INVITATION_BASE}/${id}/resend`,
    {}
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function revokeInvitation(id: string): Promise<void> {
  const response = await apiClient.delete<void>(`${INVITATION_BASE}/${id}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function getInvitationByToken(token: string): Promise<InvitationDetails> {
  const response = await apiClient.get<InvitationDetails>(`${INVITATION_BASE}/token/${token}`);
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export async function acceptInvitation(
  token: string,
  data: AcceptInvitationRequest
): Promise<void> {
  const response = await apiClient.post<void, AcceptInvitationRequest>(
    `${INVITATION_BASE}/token/${token}/accept`,
    data
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
}

export async function validateInvitationToken(token: string): Promise<{ valid: boolean }> {
  const response = await apiClient.get<{ valid: boolean }>(
    `${INVITATION_BASE}/token/${token}/validate`
  );
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
