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
 * E2E tests for NotificationController endpoints.
 */
@DisplayName("NotificationController")
class NotificationControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/notifications";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testUser = userRepository.save(User.builder()
            .email("notification-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /notifications")
    class GetNotifications {

        @Test
        @DisplayName("should return paginated notifications")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedNotifications() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /notifications/unread")
    class GetUnreadNotifications {

        @Test
        @DisplayName("should return unread notifications")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnUnreadNotifications() throws Exception {
            performGet(BASE_URL + "/unread")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /notifications/{id}/read")
    class MarkAsRead {

        @Test
        @DisplayName("should return 404 when notification not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performPost(BASE_URL + "/" + UUID.randomUUID() + "/read")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /notifications/read-all")
    class MarkAllAsRead {

        @Test
        @DisplayName("should mark all as read")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_MarkAllAsRead() throws Exception {
            performPost(BASE_URL + "/read-all")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /notifications/preferences")
    class GetPreferences {

        @Test
        @DisplayName("should return notification preferences")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPreferences() throws Exception {
            performGet(BASE_URL + "/preferences")
                .andExpect(status().isOk());
        }
    }
}
