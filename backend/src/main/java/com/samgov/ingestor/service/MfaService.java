package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.MfaSetupResponse;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.MfaBackupCode;
import com.samgov.ingestor.model.MfaSettings;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.MfaBackupCodeRepository;
import com.samgov.ingestor.repository.MfaSettingsRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Slf4j
@Service
@RequiredArgsConstructor
public class MfaService {

    private final UserRepository userRepository;
    private final MfaSettingsRepository mfaSettingsRepository;
    private final MfaBackupCodeRepository backupCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Value("${app.name:SAM.gov Contract Intelligence}")
    private String appName;

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a new MFA secret for a user. Does not enable MFA yet.
     */
    @Transactional
    public MfaSetupResponse generateMfaSecret(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if MFA is already enabled via settings
        Optional<MfaSettings> existingSettings = mfaSettingsRepository.findByUserId(userId);
        if (existingSettings.isPresent() && existingSettings.get().isEnabled()) {
            throw new IllegalStateException("MFA is already enabled for this user");
        }

        String secret = secretGenerator.generate();

        // Create or update MFA settings (not enabled yet)
        MfaSettings settings = existingSettings.orElse(MfaSettings.builder()
            .user(user)
            .enabled(false)
            .build());
        settings.setSecret(secret);
        mfaSettingsRepository.save(settings);

        // Also store in user for backward compatibility
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
        String provisioningUri = qrData.getUri();
        try {
            byte[] imageData = qrGenerator.generate(qrData);
            qrCodeDataUri = getDataUriForImage(imageData, qrGenerator.getImageMimeType());
        } catch (QrGenerationException e) {
            log.error("Failed to generate QR code", e);
            throw new RuntimeException("Failed to generate QR code", e);
        }

        return MfaSetupResponse.builder()
            .secret(secret)
            .qrCodeUrl(qrCodeDataUri)
            .provisioningUri(provisioningUri)
            .setupComplete(false)
            .build();
    }

    /**
     * Verify the MFA code and enable MFA for the user.
     */
    @Transactional
    public MfaSetupResponse verifyAndEnableMfa(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MfaSettings settings = mfaSettingsRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("MFA secret not generated. Please start setup first."));

        if (settings.isEnabled()) {
            throw new IllegalStateException("MFA is already enabled for this user");
        }

        if (settings.getSecret() == null) {
            throw new IllegalStateException("MFA secret not generated. Please start setup first.");
        }

        boolean isValid = codeVerifier.isValidCode(settings.getSecret(), code);

        if (isValid == false) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // Enable MFA
        settings.enable();
        settings.recordVerification();
        mfaSettingsRepository.save(settings);

        // Also update user for backward compatibility
        user.setMfaEnabled(true);
        userRepository.save(user);

        // Generate backup codes
        List<String> backupCodes = generateBackupCodes(userId);

        auditService.logAction(
            AuditAction.MFA_ENABLED,
            "User",
            userId.toString(),
            "MFA enabled for user: " + user.getEmail()
        );

        log.info("MFA enabled for user: {}", userId);

        return MfaSetupResponse.builder()
            .setupComplete(true)
            .backupCodes(backupCodes)
            .build();
    }

    /**
     * Verify an MFA code (TOTP or backup code) for an authenticated user.
     */
    @Transactional
    public boolean verifyCode(UUID userId, String code, boolean isBackupCode) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MfaSettings settings = mfaSettingsRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("MFA is not configured for this user"));

        if (settings.isEnabled() == false) {
            throw new IllegalStateException("MFA is not enabled for this user");
        }

        if (isBackupCode) {
            return verifyBackupCode(userId, code);
        }

        boolean isValid = codeVerifier.isValidCode(settings.getSecret(), code);
        if (isValid) {
            settings.recordVerification();
            mfaSettingsRepository.save(settings);
        }
        return isValid;
    }

    /**
     * Verify a backup code (one-time use)
     */
    @Transactional
    public boolean verifyBackupCode(UUID userId, String code) {
        List<MfaBackupCode> unusedCodes = backupCodeRepository.findByUserIdAndUsedFalse(userId);
        
        String normalizedCode = normalizeBackupCode(code);
        
        for (MfaBackupCode backupCode : unusedCodes) {
            if (passwordEncoder.matches(normalizedCode, backupCode.getCodeHash())) {
                backupCode.markUsed();
                backupCodeRepository.save(backupCode);
                
                log.info("Backup code used for user: {}, remaining: {}", 
                    userId, unusedCodes.size() - 1);
                
                auditService.logAction(
                    AuditAction.LOGIN,
                    "User",
                    userId.toString(),
                    "MFA verified using backup code"
                );
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * Disable MFA for a user.
     */
    @Transactional
    public void disableMfa(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MfaSettings settings = mfaSettingsRepository.findByUserId(userId)
            .orElseThrow(() -> new IllegalStateException("MFA is not configured for this user"));

        if (settings.isEnabled() == false) {
            throw new IllegalStateException("MFA is not enabled for this user");
        }

        // Verify the current MFA code before disabling
        if (codeVerifier.isValidCode(settings.getSecret(), code) == false) {
            throw new IllegalArgumentException("Invalid MFA code");
        }

        // Disable MFA
        settings.disable();
        mfaSettingsRepository.save(settings);

        // Delete all backup codes
        backupCodeRepository.deleteByUserId(userId);

        // Also update user for backward compatibility
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
        return mfaSettingsRepository.existsByUserIdAndEnabledTrue(userId);
    }

    /**
     * Get MFA status for a user.
     */
    @Transactional(readOnly = true)
    public MfaStatus getMfaStatus(UUID userId) {
        Optional<MfaSettings> settings = mfaSettingsRepository.findByUserId(userId);
        
        if (settings.isEmpty()) {
            return new MfaStatus(false, 0, null);
        }
        
        MfaSettings s = settings.get();
        long remainingCodes = backupCodeRepository.countByUserIdAndUsedFalse(userId);
        
        return new MfaStatus(s.isEnabled(), remainingCodes, s.getLastVerifiedAt());
    }

    /**
     * Generate new backup codes for a user.
     */
    @Transactional
    public List<String> generateBackupCodes(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Delete existing backup codes
        backupCodeRepository.deleteByUserId(userId);

        List<String> plainCodes = new ArrayList<>();
        
        for (int i = 0; i < MfaBackupCode.BACKUP_CODES_COUNT; i++) {
            String code = generateRandomCode();
            plainCodes.add(formatBackupCode(code));
            
            MfaBackupCode backupCode = MfaBackupCode.builder()
                .user(user)
                .codeHash(passwordEncoder.encode(code))
                .used(false)
                .build();
            
            backupCodeRepository.save(backupCode);
        }

        log.info("Generated {} backup codes for user: {}", MfaBackupCode.BACKUP_CODES_COUNT, userId);

        return plainCodes;
    }

    /**
     * Get count of remaining backup codes.
     */
    @Transactional(readOnly = true)
    public long getRemainingBackupCodesCount(UUID userId) {
        return backupCodeRepository.countByUserIdAndUsedFalse(userId);
    }

    private String generateRandomCode() {
        // Generate 8-character alphanumeric code
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes I, O, 0, 1 for readability
        StringBuilder code = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return code.toString();
    }

    private String formatBackupCode(String code) {
        // Format as XXXX-XXXX for readability
        return code.substring(0, 4) + "-" + code.substring(4);
    }

    private String normalizeBackupCode(String code) {
        // Remove dashes and convert to uppercase
        return code.replace("-", "").replace(" ", "").toUpperCase();
    }

    public record MfaStatus(boolean enabled, long remainingBackupCodes, java.time.Instant lastVerifiedAt) {}
}
