package com.samgov.ingestor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to verify MFA code
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaVerifyRequest {

    /**
     * TOTP code from authenticator app (6 digits)
     */
    @NotBlank(message = "Code is required")
    @Size(min = 6, max = 8, message = "Code must be 6-8 characters")
    private String code;

    /**
     * Whether this is a backup code (not TOTP)
     */
    private boolean isBackupCode;
}
