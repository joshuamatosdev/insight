/**
 * MFA service for multi-factor authentication
 */

const API_BASE = '/api/v1/mfa';

export interface MfaStatus {
  enabled: boolean;
  remainingBackupCodes: number;
  lastVerifiedAt: string | null;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  provisioningUri: string;
  backupCodes: string[] | null;
  setupComplete: boolean;
}

export interface MfaVerifyRequest {
  code: string;
  isBackupCode?: boolean;
}

/**
 * Get MFA status for current user
 */
export async function fetchMfaStatus(token: string): Promise<MfaStatus> {
  const response = await fetch(`${API_BASE}/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok === false) {
    throw new Error('Failed to fetch MFA status');
  }

  return response.json();
}

/**
 * Start MFA setup - get secret and QR code
 */
export async function startMfaSetup(token: string): Promise<MfaSetupResponse> {
  const response = await fetch(`${API_BASE}/setup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok === false) {
    const error = await response.json();
    throw new Error(error.message ?? 'Failed to start MFA setup');
  }

  return response.json();
}

/**
 * Verify TOTP code and complete setup
 */
export async function verifyMfaSetup(
  token: string,
  code: string
): Promise<MfaSetupResponse> {
  const response = await fetch(`${API_BASE}/verify-setup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (response.ok === false) {
    const error = await response.json();
    throw new Error(error.message ?? 'Invalid verification code');
  }

  return response.json();
}

/**
 * Verify MFA code during login
 */
export async function verifyMfaCode(
  token: string,
  code: string,
  isBackupCode = false
): Promise<boolean> {
  const response = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, isBackupCode }),
  });

  if (response.ok === false) {
    const error = await response.json();
    throw new Error(error.message ?? 'Invalid code');
  }

  const result = await response.json();
  return result.valid === true;
}

/**
 * Generate new backup codes
 */
export async function generateBackupCodes(
  token: string,
  currentCode: string
): Promise<string[]> {
  const response = await fetch(`${API_BASE}/backup-codes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: currentCode }),
  });

  if (response.ok === false) {
    const error = await response.json();
    throw new Error(error.message ?? 'Failed to generate backup codes');
  }

  const result = await response.json();
  return result.codes;
}

/**
 * Disable MFA
 */
export async function disableMfa(
  token: string,
  code: string
): Promise<void> {
  const response = await fetch(`${API_BASE}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (response.ok === false) {
    const error = await response.json();
    throw new Error(error.message ?? 'Failed to disable MFA');
  }
}
