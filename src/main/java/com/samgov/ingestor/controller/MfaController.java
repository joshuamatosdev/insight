package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.MfaSetupResponse;
import com.samgov.ingestor.dto.MfaVerifyRequest;
import com.samgov.ingestor.service.MfaService;
import com.samgov.ingestor.service.MfaService.MfaStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for MFA operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final MfaService mfaService;

    /**
     * Get MFA status for current user
     */
    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MfaStatus> getMfaStatus(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = extractUserId(userDetails);
        return ResponseEntity.ok(mfaService.getMfaStatus(userId));
    }

    /**
     * Start MFA setup - generates secret and QR code
     */
    @PostMapping("/setup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MfaSetupResponse> startSetup(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = extractUserId(userDetails);
        MfaSetupResponse response = mfaService.generateMfaSecret(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete MFA setup by verifying TOTP code
     */
    @PostMapping("/verify-setup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MfaSetupResponse> verifySetup(
        @Valid @RequestBody MfaVerifyRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = extractUserId(userDetails);
        MfaSetupResponse response = mfaService.verifyAndEnableMfa(userId, request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * Verify MFA code during login or sensitive operations
     */
    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VerifyResponse> verifyCode(
        @Valid @RequestBody MfaVerifyRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = extractUserId(userDetails);
        boolean valid = mfaService.verifyCode(userId, request.getCode(), request.isBackupCode());
        return ResponseEntity.ok(new VerifyResponse(valid));
    }

    /**
     * Generate new backup codes (requires MFA verification)
     */
    @PostMapping("/backup-codes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BackupCodesResponse> generateBackupCodes(
        @Valid @RequestBody MfaVerifyRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = extractUserId(userDetails);
        
        // Verify current MFA code before generating new backup codes
        boolean valid = mfaService.verifyCode(userId, request.getCode(), false);
        if (valid == false) {
            throw new IllegalArgumentException("Invalid MFA code");
        }
        
        List<String> codes = mfaService.generateBackupCodes(userId);
        return ResponseEntity.ok(new BackupCodesResponse(codes));
    }

    /**
     * Disable MFA (requires MFA verification)
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> disableMfa(
        @Valid @RequestBody MfaVerifyRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID userId = extractUserId(userDetails);
        mfaService.disableMfa(userId, request.getCode());
        return ResponseEntity.ok().build();
    }

    private UUID extractUserId(UserDetails userDetails) {
        // Assuming username is the user ID or email
        // This should be updated based on your UserDetails implementation
        return UUID.fromString(userDetails.getUsername());
    }

    // Response DTOs
    public record VerifyResponse(boolean valid) {}
    public record BackupCodesResponse(List<String> codes) {}
}
