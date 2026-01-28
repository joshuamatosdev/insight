/**
 * Invitation Service - Type-safe using openapi-fetch
 */

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

export async function fetchInvitations(): Promise<Invitation[]> {
    const {data, error} = await apiClient.GET('/invitations');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Invitation[];
}

export async function fetchInvitation(id: string): Promise<Invitation> {
    const {data, error} = await apiClient.GET('/invitations/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Invitation;
}

export async function createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    const {data: responseData, error} = await apiClient.POST('/invitations', {
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return responseData as Invitation;
}

export async function createBulkInvitations(
    invitations: CreateInvitationRequest[]
): Promise<Invitation[]> {
    const {data, error} = await apiClient.POST('/invitations/bulk', {
        body: {invitations},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Invitation[];
}

export async function resendInvitation(id: string): Promise<Invitation> {
    const {data, error} = await apiClient.POST('/invitations/{id}/resend', {
        params: {path: {id}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Invitation;
}

export async function revokeInvitation(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/invitations/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function getInvitationByToken(token: string): Promise<InvitationDetails> {
    const {data, error} = await apiClient.GET('/invitations/token/{token}', {
        params: {path: {token}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as InvitationDetails;
}

export async function acceptInvitation(
    token: string,
    data: AcceptInvitationRequest
): Promise<void> {
    const {error} = await apiClient.POST('/invitations/token/{token}/accept', {
        params: {path: {token}},
        body: data,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function validateInvitationToken(token: string): Promise<{valid: boolean}> {
    const {data, error} = await apiClient.GET('/invitations/token/{token}/validate', {
        params: {path: {token}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as {valid: boolean};
}
