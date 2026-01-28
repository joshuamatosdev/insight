package com.samgov.ingestor.service;

import com.samgov.ingestor.model.PasswordResetToken;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.PasswordResetTokenRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
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
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.expiration-hours:24}")
    private int expirationHours;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Request a password reset for a user by email.
     * Returns the reset token if successful, empty if user not found.
     * Note: In production, you should always return a generic message
     * to prevent user enumeration attacks.
     */
    @Transactional
    public Optional<String> requestPasswordReset(String email) {
        log.info("Password reset requested for: {}", email);

        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", email);
            // Return empty to prevent user enumeration
            return Optional.empty();
        }

        User user = userOpt.get();

        // Invalidate any existing tokens
        tokenRepository.deleteByUserId(user.getId());

        // Generate new token and hash it for storage
        String token = generateSecureToken();
        String tokenHash = hashToken(token);

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .tokenHash(tokenHash)
            .user(user)
            .expiresAt(Instant.now().plus(expirationHours, ChronoUnit.HOURS))
            .build();

        tokenRepository.save(resetToken);
        log.info("Password reset token created for user: {}", user.getId());

        return Optional.of(token);
    }

    /**
     * Reset password using a valid token.
     */
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        log.info("Attempting password reset with token");

        // Hash the provided token to look up in database
        String tokenHash = hashToken(token);
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenHash(tokenHash);
        if (tokenOpt.isEmpty()) {
            log.warn("Invalid password reset token");
            return false;
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (!resetToken.isValid()) {
            log.warn("Password reset token is expired or already used");
            return false;
        }

        User user = resetToken.getUser();

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Instant.now());

        // If user was pending (invited), activate them
        if (user.getStatus() == UserStatus.PENDING) {
            user.setStatus(UserStatus.ACTIVE);
            user.setEmailVerified(true);
            user.setEmailVerifiedAt(Instant.now());
        }

        userRepository.save(user);

        // Mark token as used
        resetToken.setUsedAt(Instant.now());
        tokenRepository.save(resetToken);

        log.info("Password successfully reset for user: {}", user.getId());
        return true;
    }

    /**
     * Validate a password reset token without using it.
     */
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        String tokenHash = hashToken(token);
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenHash(tokenHash);
        return tokenOpt.isPresent() && tokenOpt.get().isValid();
    }

    /**
     * Get the user associated with a valid token.
     */
    @Transactional(readOnly = true)
    public Optional<UUID> getUserIdFromToken(String token) {
        String tokenHash = hashToken(token);
        return tokenRepository.findByTokenHash(tokenHash)
            .filter(PasswordResetToken::isValid)
            .map(t -> t.getUser().getId());
    }

    /**
     * Clean up expired tokens. Should be called periodically.
     */
    @Transactional
    public int cleanupExpiredTokens() {
        int deleted = tokenRepository.deleteExpiredTokens(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired password reset tokens", deleted);
        }
        return deleted;
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Hash a token using SHA-256 for secure storage.
     * The plain token is only sent to the user, not stored in the database.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
