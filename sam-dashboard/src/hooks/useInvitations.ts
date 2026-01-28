import {useCallback, useEffect, useState} from 'react';
import type {AcceptInvitationRequest, CreateInvitationRequest, Invitation, InvitationDetails,} from '../services';
import {
    acceptInvitation,
    createBulkInvitations,
    createInvitation,
    fetchInvitation,
    fetchInvitations,
    getInvitationByToken,
    resendInvitation,
    revokeInvitation,
} from '../services';

export interface UseInvitationsReturn {
  invitations: Invitation[];
  isLoading: boolean;
  error: Error | null;
  create: (data: CreateInvitationRequest) => Promise<Invitation>;
  createBulk: (invitations: CreateInvitationRequest[]) => Promise<Invitation[]>;
  resend: (id: string) => Promise<Invitation>;
  revoke: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInvitations(): UseInvitationsReturn {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvitations();
      setInvitations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invitations'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const create = useCallback(async (data: CreateInvitationRequest) => {
    const invitation = await createInvitation(data);
    await loadInvitations();
    return invitation;
  }, [loadInvitations]);

  const createBulk = useCallback(async (data: CreateInvitationRequest[]) => {
    const createdInvitations = await createBulkInvitations(data);
    await loadInvitations();
    return createdInvitations;
  }, [loadInvitations]);

  const resend = useCallback(async (id: string) => {
    const invitation = await resendInvitation(id);
    await loadInvitations();
    return invitation;
  }, [loadInvitations]);

  const revoke = useCallback(async (id: string) => {
    await revokeInvitation(id);
    await loadInvitations();
  }, [loadInvitations]);

  return {
    invitations,
    isLoading,
    error,
    create,
    createBulk,
    resend,
    revoke,
    refresh: loadInvitations,
  };
}

export interface UseInvitationReturn {
  invitation: Invitation | null;
  isLoading: boolean;
  error: Error | null;
  resend: () => Promise<Invitation>;
  revoke: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInvitation(id: string | null): UseInvitationReturn {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvitation = useCallback(async () => {
    if (id === null || id === '') {
      setInvitation(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvitation(id);
      setInvitation(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load invitation'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadInvitation();
  }, [loadInvitation]);

  const resend = useCallback(async () => {
    if (id === null) throw new Error('No invitation ID');
    const updated = await resendInvitation(id);
    setInvitation(updated);
    return updated;
  }, [id]);

  const revoke = useCallback(async () => {
    if (id === null) throw new Error('No invitation ID');
    await revokeInvitation(id);
    setInvitation(null);
  }, [id]);

  return {
    invitation,
    isLoading,
    error,
    resend,
    revoke,
    refresh: loadInvitation,
  };
}

export interface UseInvitationTokenReturn {
  details: InvitationDetails | null;
  isLoading: boolean;
  error: Error | null;
  isValid: boolean;
  accept: (data: AcceptInvitationRequest) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInvitationToken(token: string | null): UseInvitationTokenReturn {
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDetails = useCallback(async () => {
    if (token === null || token === '') {
      setDetails(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getInvitationByToken(token);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Invalid or expired invitation'));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const accept = useCallback(async (data: AcceptInvitationRequest) => {
    if (token === null) throw new Error('No token');
    await acceptInvitation(token, data);
  }, [token]);

  return {
    details,
    isLoading,
    error,
    isValid: details?.isValid ?? false,
    accept,
    refresh: loadDetails,
  };
}
