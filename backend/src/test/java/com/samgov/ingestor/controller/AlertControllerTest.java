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
 * E2E tests for AlertController endpoints.
 */
@DisplayName("AlertController")
class AlertControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/alerts";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testUser = userRepository.save(User.builder()
            .email("alert-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /alerts")
    class GetMyAlerts {

        @Test
        @DisplayName("should return paginated list of alerts")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnPaginatedAlerts() throws Exception {
            performGet(BASE_URL + "?page=0&size=20")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("should use default pagination when not specified")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_UseDefaultPagination() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /alerts/unread")
    class GetUnreadAlerts {

        @Test
        @DisplayName("should return unread alerts")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnUnreadAlerts() throws Exception {
            performGet(BASE_URL + "/unread")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("GET /alerts/count")
    class GetUnreadCount {

        @Test
        @DisplayName("should return unread count")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnUnreadCount() throws Exception {
            performGet(BASE_URL + "/count")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").isNumber());
        }
    }

    @Nested
    @DisplayName("POST /alerts/{id}/read")
    class MarkAsRead {

        @Test
        @DisplayName("should return 404 when alert not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_AlertNotFound() throws Exception {
            performPost(BASE_URL + "/" + UUID.randomUUID() + "/read")
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /alerts/read-all")
    class MarkAllAsRead {

        @Test
        @DisplayName("should mark all alerts as read")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_MarkAllAsRead() throws Exception {
            performPost(BASE_URL + "/read-all")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markedCount").isNumber());
        }
    }

    @Nested
    @DisplayName("DELETE /alerts/{id}")
    class DismissAlert {

        @Test
        @DisplayName("should return 404 when dismissing non-existent alert")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_AlertNotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
