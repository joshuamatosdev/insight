package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.JwtService;
import com.samgov.ingestor.config.OAuth2Properties;
import com.samgov.ingestor.dto.AuthenticationResponse;
import com.samgov.ingestor.model.OAuthConnection;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.OAuthConnectionRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OAuth2UserServiceTest extends BaseServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuthConnectionRepository oauthConnectionRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private OAuth2Properties oauth2Properties;

    private OAuth2UserService oauth2UserService;

    @BeforeEach
    void setUp() {
        oauth2UserService = new OAuth2UserService(
            userRepository,
            oauthConnectionRepository,
            jwtService,
            userDetailsService,
            oauth2Properties
        );
    }

    @Nested
    @DisplayName("processOAuthLogin")
    class ProcessOAuthLogin {

        @Test
        @DisplayName("should create new user and connection for new OAuth user")
        void shouldCreateNewUserForNewOAuthUser() {
            // Given
            String provider = "google";
            String providerUserId = "google-123";
            String email = "newuser@example.com";
            String firstName = "John";
            String lastName = "Doe";

            when(oauthConnectionRepository.findByProviderAndProviderUserId(provider, providerUserId))
                .thenReturn(Optional.empty());
            when(userRepository.findByEmail(email.toLowerCase()))
                .thenReturn(Optional.empty());
            
            User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email(email.toLowerCase())
                .firstName(firstName)
                .lastName(lastName)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            when(userRepository.save(any(User.class))).thenReturn(savedUser);
            
            when(oauthConnectionRepository.save(any(OAuthConnection.class)))
                .thenAnswer(inv -> inv.getArgument(0));

            UserDetails mockUserDetails = mock(UserDetails.class);
            when(userDetailsService.loadUserByUsername(email.toLowerCase()))
                .thenReturn(mockUserDetails);
            when(jwtService.generateToken(anyMap(), any(UserDetails.class)))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken(any(UserDetails.class)))
                .thenReturn("refresh-token");

            // When
            AuthenticationResponse response = oauth2UserService.processOAuthLogin(
                provider, providerUserId, email, firstName, lastName,
                "oauth-access-token", "oauth-refresh-token",
                Instant.now().plus(1, ChronoUnit.HOURS)
            );

            // Then
            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            
            verify(userRepository).save(any(User.class));
            verify(oauthConnectionRepository).save(any(OAuthConnection.class));
        }

        @Test
        @DisplayName("should link to existing user when email matches")
        void shouldLinkToExistingUserWhenEmailMatches() {
            // Given
            String provider = "microsoft";
            String providerUserId = "ms-456";
            String email = "existing@example.com";

            User existingUser = User.builder()
                .id(UUID.randomUUID())
                .email(email.toLowerCase())
                .firstName("Existing")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .build();

            when(oauthConnectionRepository.findByProviderAndProviderUserId(provider, providerUserId))
                .thenReturn(Optional.empty());
            when(userRepository.findByEmail(email.toLowerCase()))
                .thenReturn(Optional.of(existingUser));
            when(userRepository.save(any(User.class))).thenReturn(existingUser);
            when(oauthConnectionRepository.save(any(OAuthConnection.class)))
                .thenAnswer(inv -> inv.getArgument(0));

            UserDetails mockUserDetails = mock(UserDetails.class);
            when(userDetailsService.loadUserByUsername(email.toLowerCase()))
                .thenReturn(mockUserDetails);
            when(jwtService.generateToken(anyMap(), any(UserDetails.class)))
                .thenReturn("access-token");
            when(jwtService.generateRefreshToken(any(UserDetails.class)))
                .thenReturn("refresh-token");

            // When
            AuthenticationResponse response = oauth2UserService.processOAuthLogin(
                provider, providerUserId, email, "Existing", "User",
                null, null, null
            );

            // Then
            assertThat(response).isNotNull();
            verify(userRepository, never()).save(argThat(u -> 
                u.getEmail().equals(email.toLowerCase()) && u.getId() == null
            ));
            verify(oauthConnectionRepository).save(any(OAuthConnection.class));
        }

        @Test
        @DisplayName("should update tokens for existing connection")
        void shouldUpdateTokensForExistingConnection() {
            // Given
            String provider = "google";
            String providerUserId = "google-existing";
            String email = "user@example.com";

            User existingUser = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .firstName("Test")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .build();

            OAuthConnection existingConnection = OAuthConnection.builder()
                .id(UUID.randomUUID())
                .user(existingUser)
                .provider(provider)
                .providerUserId(providerUserId)
                .email(email)
                .build();

            when(oauthConnectionRepository.findByProviderAndProviderUserId(provider, providerUserId))
                .thenReturn(Optional.of(existingConnection));
            when(userRepository.save(any(User.class))).thenReturn(existingUser);
            when(oauthConnectionRepository.save(any(OAuthConnection.class)))
                .thenAnswer(inv -> inv.getArgument(0));

            UserDetails mockUserDetails = mock(UserDetails.class);
            when(userDetailsService.loadUserByUsername(email))
                .thenReturn(mockUserDetails);
            when(jwtService.generateToken(anyMap(), any(UserDetails.class)))
                .thenReturn("new-access-token");
            when(jwtService.generateRefreshToken(any(UserDetails.class)))
                .thenReturn("new-refresh-token");

            // When
            String newAccessToken = "new-oauth-token";
            AuthenticationResponse response = oauth2UserService.processOAuthLogin(
                provider, providerUserId, email, "Test", "User",
                newAccessToken, "new-refresh", Instant.now().plus(1, ChronoUnit.HOURS)
            );

            // Then
            assertThat(response).isNotNull();
            verify(oauthConnectionRepository).save(argThat(conn -> 
                conn.getAccessToken().equals(newAccessToken)
            ));
        }
    }

    @Nested
    @DisplayName("unlinkProvider")
    class UnlinkProvider {

        @Test
        @DisplayName("should unlink provider when user has password")
        void shouldUnlinkProviderWhenUserHasPassword() {
            // Given
            UUID userId = UUID.randomUUID();
            String provider = "google";

            User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .passwordHash("hashed-password")
                .build();

            OAuthConnection connection = OAuthConnection.builder()
                .id(UUID.randomUUID())
                .user(user)
                .provider(provider)
                .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(oauthConnectionRepository.findByUserId(userId))
                .thenReturn(List.of(connection));

            // When
            oauth2UserService.unlinkProvider(userId, provider);

            // Then
            verify(oauthConnectionRepository).deleteByUserIdAndProvider(userId, provider);
        }

        @Test
        @DisplayName("should throw when unlinking only login method")
        void shouldThrowWhenUnlinkingOnlyLoginMethod() {
            // Given
            UUID userId = UUID.randomUUID();
            String provider = "google";

            User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .passwordHash(null) // No password
                .build();

            OAuthConnection connection = OAuthConnection.builder()
                .id(UUID.randomUUID())
                .user(user)
                .provider(provider)
                .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(oauthConnectionRepository.findByUserId(userId))
                .thenReturn(List.of(connection)); // Only one connection

            // When/Then
            assertThatThrownBy(() -> oauth2UserService.unlinkProvider(userId, provider))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot unlink the only login method");
        }
    }

    @Nested
    @DisplayName("getEnabledProviders")
    class GetEnabledProviders {

        @Test
        @DisplayName("should return only enabled providers")
        void shouldReturnOnlyEnabledProviders() {
            // Given
            when(oauth2Properties.isProviderEnabled("google")).thenReturn(true);
            when(oauth2Properties.isProviderEnabled("microsoft")).thenReturn(false);
            when(oauth2Properties.isProviderEnabled("saml")).thenReturn(true);

            // When
            List<String> providers = oauth2UserService.getEnabledProviders();

            // Then
            assertThat(providers).containsExactly("google", "saml");
        }
    }
}
