package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.TenantRepository;
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
 * E2E tests for CompanyProfileController endpoints.
 */
@DisplayName("CompanyProfileController")
class CompanyProfileControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/company-profile";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;

    @Override
    @BeforeEach
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("profile-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("Password123!"))
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .tenantId(testTenantId)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /company-profile")
    class GetProfile {

        @Test
        @DisplayName("should return 404 when profile not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_NotFound() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /company-profile")
    class CreateOrUpdateProfile {

        @Test
        @DisplayName("should return 400 when request is invalid")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return400_When_Invalid() throws Exception {
            performPost(BASE_URL, "{}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /company-profile/lookup/uei/{uei}")
    class GetProfileByUei {

        @Test
        @DisplayName("should return 404 when UEI not found")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_Return404_When_UeiNotFound() throws Exception {
            performGet(BASE_URL + "/lookup/uei/UNKNOWN123456")
                .andExpect(status().isNotFound());
        }
    }
}
