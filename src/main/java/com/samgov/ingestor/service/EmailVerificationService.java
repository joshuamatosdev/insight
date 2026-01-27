package com.samgov.ingestor.service;

import com.samgov.ingestor.model.EmailVerificationToken;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.EmailVerificationTokenRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.email-verification.expiration-hours:24}")
    private int expirationHours;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Create and send verification email for a new user.
     */
    @Transactional
    public void sendVerificationEmail(User user) {
        log.info("Creating email verification token for user: {}", user.getId());

        // Invalidate any existing tokens
        tokenRepository.deleteByUserId(user.getId());

        // Generate new token
        String token = generateSecureToken();
        String tokenHash = hashToken(token);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
            .tokenHash(tokenHash)
            .user(user)
            .expiresAt(Instant.now().plus(expirationHours, ChronoUnit.HOURS))
            .build();

        tokenRepository.save(verificationToken);

        // Build verification URL
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;

        // Send email
        emailService.sendEmailVerification(user.getEmail(), verificationUrl);

        log.info("Verification email sent to: {}", user.getEmail());
    }

    /**
     * Resend verification email for a user who hasn't verified yet.
     */
    @Transactional
    public boolean resendVerificationEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());

        if (userOpt.isEmpty()) {
            log.warn("Resend verification requested for unknown email: {}", email);
            return false;
        }

        User user = userOpt.get();

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            log.info("User {} already verified", user.getId());
            return false;
        }

        sendVerificationEmail(user);
        return true;
    }

    /**
     * Verify email using the provided token.
     */
    @Transactional
    public VerificationResult verifyEmail(String token) {
        log.info("Attempting email verification");

        String tokenHash = hashToken(token);
        Optional<EmailVerificationToken> tokenOpt = tokenRepository.findByTokenHash(tokenHash);

        if (tokenOpt.isEmpty()) {
            log.warn("Invalid verification token");
            return VerificationResult.invalid("Invalid verification token");
        }

        EmailVerificationToken verificationToken = tokenOpt.get();

        if (!verificationToken.isValid()) {
            log.warn("Verification token expired or already used");
            return VerificationResult.invalid("Verification token has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();

        // Mark email as verified
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());

        // Activate user if they were pending
        if (user.getStatus() == UserStatus.PENDING) {
            user.setStatus(UserStatus.ACTIVE);
        }

        userRepository.save(user);

        // Mark token as used
        verificationToken.setUsedAt(Instant.now());
        tokenRepository.save(verificationToken);

        log.info("Email verified successfully for user: {}", user.getId());
        return VerificationResult.success(user.getId());
    }

    /**
     * Clean up expired tokens. Should be called periodically.
     */
    @Transactional
    public int cleanupExpiredTokens() {
        int deleted = tokenRepository.deleteExpiredTokens(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired email verification tokens", deleted);
        }
        return deleted;
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    public record VerificationResult(boolean success, String message, UUID userId) {
        public static VerificationResult success(UUID userId) {
            return new VerificationResult(true, "Email verified successfully", userId);
        }

        public static VerificationResult invalid(String message) {
            return new VerificationResult(false, message, null);
        }
    }
}
