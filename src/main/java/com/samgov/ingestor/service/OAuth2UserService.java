package com.samgov.ingestor.service;

import com.samgov.ingestor.config.JwtService;
import com.samgov.ingestor.config.OAuth2Properties;
import com.samgov.ingestor.dto.AuthenticationResponse;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.OAuthConnection;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.OAuthConnectionRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for handling OAuth2 user authentication and account linking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService {

    private final UserRepository userRepository;
    private final OAuthConnectionRepository oauthConnectionRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final OAuth2Properties oauth2Properties;

    /**
     * Process OAuth login - find or create user, link connection, generate JWT.
     *
     * @param provider OAuth provider (google, microsoft, saml)
     * @param providerUserId User ID from provider
     * @param email User's email from provider
     * @param firstName User's first name
     * @param lastName User's last name
     * @param accessToken OAuth access token
     * @param refreshToken OAuth refresh token
     * @param expiresAt Token expiration time
     * @return Authentication response with JWT tokens
     */
    @Transactional
    public AuthenticationResponse processOAuthLogin(
            String provider,
            String providerUserId,
            String email,
            String firstName,
            String lastName,
            String accessToken,
            String refreshToken,
            Instant expiresAt
    ) {
        log.info("Processing OAuth login for provider: {}, email: {}", provider, email);

        // Check if we have an existing connection for this provider user
        Optional<OAuthConnection> existingConnection = 
            oauthConnectionRepository.findByProviderAndProviderUserId(provider, providerUserId);

        User user;
        OAuthConnection connection;

        if (existingConnection.isPresent()) {
            // Existing connection - update tokens and login
            connection = existingConnection.get();
            user = connection.getUser();
            
            connection.setAccessToken(accessToken);
            connection.setRefreshToken(refreshToken);
            connection.setExpiresAt(expiresAt);
            connection.setLastLoginAt(Instant.now());
            
            oauthConnectionRepository.save(connection);
            log.info("Updated existing OAuth connection for user: {}", user.getId());
        } else {
            // No existing connection - find or create user
            Optional<User> existingUser = userRepository.findByEmail(email.toLowerCase());
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
                log.info("Found existing user by email: {}", user.getId());
            } else {
                // Create new user
                user = User.builder()
                    .email(email.toLowerCase())
                    .firstName(firstName)
                    .lastName(lastName)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(true) // OAuth emails are verified
                    .mfaEnabled(false)
                    .build();
                user = userRepository.save(user);
                log.info("Created new user from OAuth: {}", user.getId());
            }

            // Create new OAuth connection
            connection = OAuthConnection.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerUserId)
                .email(email)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresAt(expiresAt)
                .lastLoginAt(Instant.now())
                .build();
            
            oauthConnectionRepository.save(connection);
            log.info("Created new OAuth connection for user: {}", user.getId());
        }

        // Update last login
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // Generate JWT tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("oauthProvider", provider);

        String jwtAccessToken = jwtService.generateToken(claims, userDetails);
        String jwtRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthenticationResponse.of(jwtAccessToken, jwtRefreshToken, UserDto.fromEntity(user));
    }

    /**
     * Link an OAuth provider to an existing user account.
     */
    @Transactional
    public OAuthConnection linkProvider(
            UUID userId,
            String provider,
            String providerUserId,
            String email,
            String accessToken,
            String refreshToken,
            Instant expiresAt
    ) {
        log.info("Linking OAuth provider {} to user {}", provider, userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if already linked
        if (oauthConnectionRepository.existsByUserIdAndProvider(userId, provider)) {
            throw new IllegalStateException("Provider already linked to this account");
        }

        // Check if this provider account is already linked to another user
        Optional<OAuthConnection> existingConnection = 
            oauthConnectionRepository.findByProviderAndProviderUserId(provider, providerUserId);
        if (existingConnection.isPresent()) {
            throw new IllegalStateException("This " + provider + " account is already linked to another user");
        }

        OAuthConnection connection = OAuthConnection.builder()
            .user(user)
            .provider(provider)
            .providerUserId(providerUserId)
            .email(email)
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresAt(expiresAt)
            .build();

        return oauthConnectionRepository.save(connection);
    }

    /**
     * Unlink an OAuth provider from a user account.
     */
    @Transactional
    public void unlinkProvider(UUID userId, String provider) {
        log.info("Unlinking OAuth provider {} from user {}", provider, userId);

        // Ensure user has another way to login (password or other OAuth)
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<OAuthConnection> connections = oauthConnectionRepository.findByUserId(userId);
        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isEmpty();
        
        if (!hasPassword && connections.size() <= 1) {
            throw new IllegalStateException("Cannot unlink the only login method");
        }

        oauthConnectionRepository.deleteByUserIdAndProvider(userId, provider);
    }

    /**
     * Get all OAuth connections for a user.
     */
    @Transactional(readOnly = true)
    public List<OAuthConnectionDto> getUserConnections(UUID userId) {
        return oauthConnectionRepository.findByUserId(userId).stream()
            .map(this::toDto)
            .toList();
    }

    /**
     * Get enabled OAuth providers.
     */
    public List<String> getEnabledProviders() {
        List<String> providers = new java.util.ArrayList<>();
        if (oauth2Properties.isProviderEnabled(OAuthConnection.PROVIDER_GOOGLE)) {
            providers.add(OAuthConnection.PROVIDER_GOOGLE);
        }
        if (oauth2Properties.isProviderEnabled(OAuthConnection.PROVIDER_MICROSOFT)) {
            providers.add(OAuthConnection.PROVIDER_MICROSOFT);
        }
        if (oauth2Properties.isProviderEnabled(OAuthConnection.PROVIDER_SAML)) {
            providers.add(OAuthConnection.PROVIDER_SAML);
        }
        return providers;
    }

    private OAuthConnectionDto toDto(OAuthConnection connection) {
        return new OAuthConnectionDto(
            connection.getId(),
            connection.getProvider(),
            connection.getEmail(),
            connection.getCreatedAt(),
            connection.getLastLoginAt()
        );
    }

    public record OAuthConnectionDto(
        UUID id,
        String provider,
        String email,
        Instant connectedAt,
        Instant lastLoginAt
    ) {}
}
