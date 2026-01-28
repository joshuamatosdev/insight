package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.AuthenticationRequest;
import com.samgov.ingestor.dto.AuthenticationResponse;
import com.samgov.ingestor.dto.RegisterRequest;
import com.samgov.ingestor.service.AuthenticationService;
import com.samgov.ingestor.service.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthenticationService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        log.info("Register request for: {}", request.getEmail());
        AuthenticationResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
        @Valid @RequestBody AuthenticationRequest request
    ) {
        log.info("Login request for: {}", request.getEmail());
        AuthenticationResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(
        @RequestHeader("Authorization") String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String refreshToken = authHeader.substring(7);
        AuthenticationResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request
    ) {
        log.info("Forgot password request for: {}", request.email());

        // Always return success to prevent user enumeration
        passwordResetService.requestPasswordReset(request.email());

        return ResponseEntity.ok(new ForgotPasswordResponse(
            "If an account with that email exists, a password reset link has been sent."
        ));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<ValidateTokenResponse> validateResetToken(
        @RequestParam @NotBlank @Size(max = 200) String token
    ) {
        boolean valid = passwordResetService.validateToken(token);
        return ResponseEntity.ok(new ValidateTokenResponse(valid));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request
    ) {
        log.info("Password reset attempt");

        boolean success = passwordResetService.resetPassword(request.token(), request.newPassword());

        if (success) {
            return ResponseEntity.ok(new ResetPasswordResponse(true, "Password has been reset successfully."));
        } else {
            return ResponseEntity.badRequest().body(
                new ResetPasswordResponse(false, "Invalid or expired reset token.")
            );
        }
    }

    public record ForgotPasswordRequest(
        @NotBlank @Email String email
    ) {}

    public record ForgotPasswordResponse(String message) {}

    public record ValidateTokenResponse(boolean valid) {}

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 100) String newPassword
    ) {}

    public record ResetPasswordResponse(boolean success, String message) {}
}
