package com.samgov.ingestor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response for MFA setup initiation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaSetupResponse {

    /**
     * TOTP secret (for manual entry)
     */
    private String secret;

    /**
     * QR code data URL for authenticator app
     */
    private String qrCodeUrl;

    /**
     * TOTP provisioning URI (otpauth://...)
     */
    private String provisioningUri;

    /**
     * Backup codes (only returned on setup completion)
     */
    private List<String> backupCodes;

    /**
     * Whether setup is complete
     */
    private boolean setupComplete;
}
