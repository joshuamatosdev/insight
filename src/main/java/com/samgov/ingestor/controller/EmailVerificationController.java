package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.EmailVerificationService;
import com.samgov.ingestor.service.EmailVerificationService.VerificationResult;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Validated
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(
        @Valid @RequestBody VerifyEmailRequest request
    ) {
        log.info("Email verification attempt");

        VerificationResult result = emailVerificationService.verifyEmail(request.token());

        if (result.success()) {
            return ResponseEntity.ok(new VerifyEmailResponse(true, result.message()));
        } else {
            return ResponseEntity.badRequest().body(
                new VerifyEmailResponse(false, result.message())
            );
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ResendVerificationResponse> resendVerification(
        @Valid @RequestBody ResendVerificationRequest request
    ) {
        log.info("Resend verification requested for: {}", request.email());

        // Always return success to prevent user enumeration
        emailVerificationService.resendVerificationEmail(request.email());

        return ResponseEntity.ok(new ResendVerificationResponse(
            "If an account with that email exists and is not yet verified, a verification email has been sent."
        ));
    }

    public record VerifyEmailRequest(
        @NotBlank @Size(max = 200) String token
    ) {}

    public record VerifyEmailResponse(boolean success, String message) {}

    public record ResendVerificationRequest(
        @NotBlank @Email String email
    ) {}

    public record ResendVerificationResponse(String message) {}
}
