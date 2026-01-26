package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.MfaService;
import com.samgov.ingestor.service.MfaService.MfaSetupResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/mfa")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class MfaController {

    private final MfaService mfaService;

    @GetMapping("/status")
    public ResponseEntity<MfaStatusResponse> getMfaStatus() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean enabled = mfaService.isMfaEnabled(userId);
        return ResponseEntity.ok(new MfaStatusResponse(enabled));
    }

    @PostMapping("/setup")
    public ResponseEntity<MfaSetupResponse> setupMfa() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MfaSetupResponse response = mfaService.generateMfaSecret(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<MfaVerifyResponse> verifyAndEnableMfa(
        @Valid @RequestBody MfaCodeRequest request
    ) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean success = mfaService.verifyAndEnableMfa(userId, request.code());

        if (success) {
            return ResponseEntity.ok(new MfaVerifyResponse(true, "MFA has been enabled successfully."));
        } else {
            return ResponseEntity.badRequest().body(
                new MfaVerifyResponse(false, "Invalid verification code. Please try again.")
            );
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<MfaVerifyResponse> validateCode(
        @Valid @RequestBody MfaCodeRequest request
    ) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean valid = mfaService.verifyCode(userId, request.code());

        return ResponseEntity.ok(new MfaVerifyResponse(valid, valid ? "Code is valid." : "Invalid code."));
    }

    @DeleteMapping
    public ResponseEntity<Void> disableMfa(
        @Valid @RequestBody MfaCodeRequest request
    ) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        mfaService.disableMfa(userId, request.code());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/recovery-codes")
    public ResponseEntity<RecoveryCodesResponse> generateRecoveryCodes() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String[] codes = mfaService.generateRecoveryCodes(userId);
        return ResponseEntity.ok(new RecoveryCodesResponse(codes));
    }

    public record MfaStatusResponse(boolean enabled) {}

    public record MfaCodeRequest(
        @NotBlank @Pattern(regexp = "^\\d{6}$", message = "Code must be 6 digits") String code
    ) {}

    public record MfaVerifyResponse(boolean success, String message) {}

    public record RecoveryCodesResponse(String[] codes) {}
}
