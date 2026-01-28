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

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for UserPreferenceController endpoints.
 */
@DisplayName("UserPreferenceController")
class UserPreferenceControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/user-preferences";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testUser = userRepository.save(User.builder()
            .email("pref-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /api/v1/user-preferences")
    class GetPreferences {

        @Test
        @DisplayName("should return user preferences")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPreferences() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/user-preferences")
    class UpdatePreferences {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_Invalid() throws Exception {
            performPut(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/user-preferences/notification")
    class GetNotificationPreferences {

        @Test
        @DisplayName("should return notification preferences")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnNotificationPreferences() throws Exception {
            performGet(BASE_URL + "/notification")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/user-preferences/notification")
    class UpdateNotificationPreferences {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_Invalid() throws Exception {
            performPut(BASE_URL + "/notification", "{}")
                .andExpect(status().isBadRequest());
        }
    }
}
