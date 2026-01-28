package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for SessionController endpoints.
 */
@DisplayName("SessionController")
class SessionControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/sessions";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testUser = userRepository.save(User.builder()
            .email("session-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /sessions")
    class GetSessions {

        @Test
        @DisplayName("should return user sessions")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnSessions() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /sessions/current")
    class GetCurrentSession {

        @Test
        @DisplayName("should return current session")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnCurrentSession() throws Exception {
            performGet(BASE_URL + "/current")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("DELETE /sessions/{id}")
    class RevokeSession {

        @Test
        @DisplayName("should return 404 when session not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /sessions/all")
    class RevokeAllSessions {

        @Test
        @DisplayName("should revoke all sessions")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_RevokeAllSessions() throws Exception {
            performDelete(BASE_URL + "/all")
                .andExpect(status().isOk());
        }
    }
}
