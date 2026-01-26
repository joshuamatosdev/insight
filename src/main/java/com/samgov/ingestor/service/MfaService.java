package com.samgov.ingestor.service;

import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.UserRepository;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Slf4j
@Service
@RequiredArgsConstructor
public class MfaService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    @Value("${app.name:SAM.gov Contract Intelligence}")
    private String appName;

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();

    /**
     * Generate a new MFA secret for a user. Does not enable MFA yet.
     */
    @Transactional
    public MfaSetupResponse generateMfaSecret(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getMfaEnabled()) {
            throw new IllegalStateException("MFA is already enabled for this user");
        }

        String secret = secretGenerator.generate();

        // Store secret temporarily (will be saved permanently when MFA is verified)
        user.setMfaSecret(secret);
        userRepository.save(user);

        // Generate QR code
        QrData qrData = new QrData.Builder()
            .label(user.getEmail())
            .secret(secret)
            .issuer(appName)
            .algorithm(HashingAlgorithm.SHA1)
            .digits(6)
            .period(30)
            .build();

        String qrCodeDataUri;
        try {
            byte[] imageData = qrGenerator.generate(qrData);
            qrCodeDataUri = getDataUriForImage(imageData, qrGenerator.getImageMimeType());
        } catch (QrGenerationException e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("Failed to generate QR code", e);
        }

        return new MfaSetupResponse(secret, qrCodeDataUri);
    }

    /**
     * Verify the MFA code and enable MFA for the user.
     */
    @Transactional
    public boolean verifyAndEnableMfa(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getMfaEnabled()) {
            throw new IllegalStateException("MFA is already enabled for this user");
        }

        if (user.getMfaSecret() == null) {
            throw new IllegalStateException("MFA secret not generated. Please start setup first.");
        }

        boolean isValid = codeVerifier.isValidCode(user.getMfaSecret(), code);

        if (isValid) {
            user.setMfaEnabled(true);
            userRepository.save(user);

            auditService.logAction(
                AuditAction.MFA_ENABLED,
                "User",
                userId.toString(),
                "MFA enabled for user: " + user.getEmail()
            );

            log.info("MFA enabled for user: {}", userId);
        }

        return isValid;
    }

    /**
     * Verify an MFA code for an authenticated user.
     */
    @Transactional(readOnly = true)
    public boolean verifyCode(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getMfaEnabled() || user.getMfaSecret() == null) {
            throw new IllegalStateException("MFA is not enabled for this user");
        }

        return codeVerifier.isValidCode(user.getMfaSecret(), code);
    }

    /**
     * Disable MFA for a user.
     */
    @Transactional
    public void disableMfa(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getMfaEnabled()) {
            throw new IllegalStateException("MFA is not enabled for this user");
        }

        // Verify the current MFA code before disabling
        if (!codeVerifier.isValidCode(user.getMfaSecret(), code)) {
            throw new IllegalArgumentException("Invalid MFA code");
        }

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);

        auditService.logAction(
            AuditAction.MFA_DISABLED,
            "User",
            userId.toString(),
            "MFA disabled for user: " + user.getEmail()
        );

        log.info("MFA disabled for user: {}", userId);
    }

    /**
     * Check if MFA is enabled for a user.
     */
    @Transactional(readOnly = true)
    public boolean isMfaEnabled(UUID userId) {
        return userRepository.findById(userId)
            .map(User::getMfaEnabled)
            .orElse(false);
    }

    /**
     * Generate recovery codes for a user (for account recovery if MFA device is lost).
     * This is a simplified implementation - in production, you'd want to store these securely.
     */
    @Transactional
    public String[] generateRecoveryCodes(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getMfaEnabled()) {
            throw new IllegalStateException("MFA must be enabled to generate recovery codes");
        }

        // Generate 10 recovery codes
        String[] codes = new String[10];
        for (int i = 0; i < 10; i++) {
            codes[i] = secretGenerator.generate().substring(0, 8).toUpperCase();
        }

        // In production, you'd hash and store these codes
        log.info("Recovery codes generated for user: {}", userId);

        return codes;
    }

    public record MfaSetupResponse(String secret, String qrCodeDataUri) {}
}
