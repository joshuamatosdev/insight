package com.samgov.ingestor.service;

import com.samgov.ingestor.config.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for JwtService.
 * Tests JWT generation, validation, and claim extraction behavior.
 *
 * Note: These are unit tests that do not require Spring context or database.
 */
@DisplayName("JwtService")
class JwtServiceTest {

    // Base64-encoded 256-bit key for testing
    private static final String TEST_SECRET = "dGVzdC1qd3Qtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTMyLWNoYXJzLWxvbmctZm9yLXRlc3Rpbmc=";
    private static final long TEST_EXPIRATION = 3600000L; // 1 hour
    private static final long TEST_REFRESH_EXPIRATION = 86400000L; // 24 hours

    private JwtService jwtService;
    private UserDetails testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", TEST_EXPIRATION);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", TEST_REFRESH_EXPIRATION);

        testUser = new User(
            "test@example.com",
            "password",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Nested
    @DisplayName("generateToken")
    class GenerateToken {

        @Test
        @DisplayName("should generate valid JWT token")
        void should_GenerateValidToken() {
            // Act
            String token = jwtService.generateToken(testUser);

            // Assert
            assertThat(token).isNotBlank();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
        }

        @Test
        @DisplayName("should include username as subject in token")
        void should_IncludeUsernameAsSubject() {
            // Act
            String token = jwtService.generateToken(testUser);
            String extractedUsername = jwtService.extractUsername(token);

            // Assert
            assertThat(extractedUsername).isEqualTo(testUser.getUsername());
        }

        @Test
        @DisplayName("should include custom claims in token")
        void should_IncludeCustomClaims() {
            // Arrange
            Map<String, Object> claims = new HashMap<>();
            String userId = UUID.randomUUID().toString();
            claims.put("userId", userId);
            claims.put("customField", "customValue");

            // Act
            String token = jwtService.generateToken(claims, testUser);

            // Assert
            String extractedUserId = jwtService.extractClaim(token, c -> c.get("userId", String.class));
            String extractedCustom = jwtService.extractClaim(token, c -> c.get("customField", String.class));

            assertThat(extractedUserId).isEqualTo(userId);
            assertThat(extractedCustom).isEqualTo("customValue");
        }

        @Test
        @DisplayName("should generate different tokens for same user at different times")
        void should_GenerateDifferentTokens_WhenCalledMultipleTimes() throws InterruptedException {
            // Act
            String token1 = jwtService.generateToken(testUser);
            Thread.sleep(1000); // Wait to ensure different iat
            String token2 = jwtService.generateToken(testUser);

            // Assert
            assertThat(token1).isNotEqualTo(token2);
        }
    }

    @Nested
    @DisplayName("generateRefreshToken")
    class GenerateRefreshToken {

        @Test
        @DisplayName("should generate valid refresh token")
        void should_GenerateValidRefreshToken() {
            // Act
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // Assert
            assertThat(refreshToken).isNotBlank();
            assertThat(refreshToken.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("should include username in refresh token")
        void should_IncludeUsernameInRefreshToken() {
            // Act
            String refreshToken = jwtService.generateRefreshToken(testUser);
            String extractedUsername = jwtService.extractUsername(refreshToken);

            // Assert
            assertThat(extractedUsername).isEqualTo(testUser.getUsername());
        }

        @Test
        @DisplayName("should generate different refresh token than access token")
        void should_GenerateDifferentRefreshToken() {
            // Act
            String accessToken = jwtService.generateToken(testUser);
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // Assert: Different tokens even for same user
            assertThat(accessToken).isNotEqualTo(refreshToken);
        }
    }

    @Nested
    @DisplayName("isTokenValid")
    class IsTokenValid {

        @Test
        @DisplayName("should return true for valid token")
        void should_ReturnTrue_When_TokenValid() {
            // Arrange
            String token = jwtService.generateToken(testUser);

            // Act
            boolean isValid = jwtService.isTokenValid(token, testUser);

            // Assert
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("should return false for token with different username")
        void should_ReturnFalse_When_UsernameMismatch() {
            // Arrange
            String token = jwtService.generateToken(testUser);
            UserDetails differentUser = new User(
                "different@example.com",
                "password",
                Collections.emptyList()
            );

            // Act
            boolean isValid = jwtService.isTokenValid(token, differentUser);

            // Assert
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should throw exception for malformed token")
        void should_ThrowException_When_TokenMalformed() {
            // Arrange
            String malformedToken = "not.a.valid.jwt";

            // Act & Assert
            assertThatThrownBy(() -> jwtService.isTokenValid(malformedToken, testUser))
                .isInstanceOf(MalformedJwtException.class);
        }

        @Test
        @DisplayName("should throw exception for token with invalid signature")
        void should_ThrowException_When_SignatureInvalid() {
            // Arrange: Create a token with different secret
            JwtService otherService = new JwtService();
            // Use different Base64-encoded key
            String differentSecret = "ZGlmZmVyZW50LXNlY3JldC1rZXktdGhhdC1pcy1hdC1sZWFzdC0zMi1jaGFycy1sb25nLWZvci10ZXN0aW5n";
            ReflectionTestUtils.setField(otherService, "secretKey", differentSecret);
            ReflectionTestUtils.setField(otherService, "jwtExpiration", TEST_EXPIRATION);

            String tokenFromOtherService = otherService.generateToken(testUser);

            // Act & Assert
            assertThatThrownBy(() -> jwtService.isTokenValid(tokenFromOtherService, testUser))
                .isInstanceOf(SignatureException.class);
        }
    }

    @Nested
    @DisplayName("extractUsername")
    class ExtractUsername {

        @Test
        @DisplayName("should extract username from valid token")
        void should_ExtractUsername_When_TokenValid() {
            // Arrange
            String token = jwtService.generateToken(testUser);

            // Act
            String username = jwtService.extractUsername(token);

            // Assert
            assertThat(username).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("should throw exception for malformed token")
        void should_ThrowException_When_TokenMalformed() {
            // Arrange
            String malformedToken = "invalid-token";

            // Act & Assert
            assertThatThrownBy(() -> jwtService.extractUsername(malformedToken))
                .isInstanceOf(MalformedJwtException.class);
        }
    }

    @Nested
    @DisplayName("extractUserId")
    class ExtractUserId {

        @Test
        @DisplayName("should extract userId from token with userId claim")
        void should_ExtractUserId_When_ClaimExists() {
            // Arrange
            Map<String, Object> claims = new HashMap<>();
            UUID userId = UUID.randomUUID();
            claims.put("userId", userId.toString());

            String token = jwtService.generateToken(claims, testUser);

            // Act
            UUID extractedUserId = jwtService.extractUserId(token);

            // Assert
            assertThat(extractedUserId).isEqualTo(userId);
        }

        @Test
        @DisplayName("should return null when userId claim is not present")
        void should_ReturnNull_When_UserIdClaimMissing() {
            // Arrange: Token without userId claim
            String token = jwtService.generateToken(testUser);

            // Act
            UUID extractedUserId = jwtService.extractUserId(token);

            // Assert
            assertThat(extractedUserId).isNull();
        }
    }

    @Nested
    @DisplayName("Token Expiration")
    class TokenExpiration {

        @Test
        @DisplayName("should detect expired token")
        void should_DetectExpiredToken() {
            // Arrange: Create service with very short expiration
            JwtService shortExpirationService = new JwtService();
            ReflectionTestUtils.setField(shortExpirationService, "secretKey", TEST_SECRET);
            ReflectionTestUtils.setField(shortExpirationService, "jwtExpiration", 1L); // 1ms
            ReflectionTestUtils.setField(shortExpirationService, "refreshExpiration", 1L);

            String token = shortExpirationService.generateToken(testUser);

            // Wait for token to expire
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // Act & Assert
            assertThatThrownBy(() -> shortExpirationService.isTokenValid(token, testUser))
                .isInstanceOf(ExpiredJwtException.class);
        }

        @Test
        @DisplayName("should not be expired immediately after generation")
        void should_NotBeExpired_WhenJustGenerated() {
            // Arrange
            String token = jwtService.generateToken(testUser);

            // Act
            boolean isValid = jwtService.isTokenValid(token, testUser);

            // Assert
            assertThat(isValid).isTrue();
        }
    }

    @Nested
    @DisplayName("extractClaim")
    class ExtractClaim {

        @Test
        @DisplayName("should extract standard claims")
        void should_ExtractStandardClaims() {
            // Arrange
            String token = jwtService.generateToken(testUser);

            // Act
            String subject = jwtService.extractClaim(token, claims -> claims.getSubject());
            java.util.Date expiration = jwtService.extractClaim(token, claims -> claims.getExpiration());
            java.util.Date issuedAt = jwtService.extractClaim(token, claims -> claims.getIssuedAt());

            // Assert
            assertThat(subject).isEqualTo(testUser.getUsername());
            assertThat(expiration).isNotNull();
            assertThat(issuedAt).isNotNull();
            assertThat(expiration.after(issuedAt)).isTrue();
        }

        @Test
        @DisplayName("should extract custom claims")
        void should_ExtractCustomClaims() {
            // Arrange
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", "ADMIN");
            claims.put("tenantId", "tenant-123");

            String token = jwtService.generateToken(claims, testUser);

            // Act
            String role = jwtService.extractClaim(token, c -> c.get("role", String.class));
            String tenantId = jwtService.extractClaim(token, c -> c.get("tenantId", String.class));

            // Assert
            assertThat(role).isEqualTo("ADMIN");
            assertThat(tenantId).isEqualTo("tenant-123");
        }

        @Test
        @DisplayName("should return null for non-existent claim")
        void should_ReturnNull_When_ClaimNotExists() {
            // Arrange
            String token = jwtService.generateToken(testUser);

            // Act
            String nonExistent = jwtService.extractClaim(token, c -> c.get("nonExistent", String.class));

            // Assert
            assertThat(nonExistent).isNull();
        }
    }
}
