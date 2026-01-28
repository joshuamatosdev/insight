package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for InvitationController endpoints.
 */
@DisplayName("InvitationController")
class InvitationControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/invitations";

    @Autowired
    private TenantRepository tenantRepository;

    private Tenant testTenant;

    @Override
    @BeforeEach
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("Test Tenant " + UUID.randomUUID())
            .slug("test-tenant-" + UUID.randomUUID())
            .build());
        testTenantId = testTenant.getId();
    }

    @Nested
    @DisplayName("GET /invitations")
    class GetInvitations {

        @Test
        @DisplayName("should return paginated invitations")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_ReturnPaginatedInvitations() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
        }
    }

    @Nested
    @DisplayName("POST /invitations")
    class CreateInvitation {

        @Test
        @DisplayName("should return 400 when email is invalid")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return400_When_EmailInvalid() throws Exception {
            performPost(BASE_URL, "{\"email\": \"invalid\"}")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /invitations/validate")
    class ValidateInvitation {

        @Test
        @DisplayName("should return 400 when token is invalid")
        void should_Return400_When_TokenInvalid() throws Exception {
            mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(BASE_URL + "/validate")
                    .param("token", "invalid-token")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
            )
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /invitations/{id}")
    class CancelInvitation {

        @Test
        @DisplayName("should return 404 when invitation not found")
        @WithMockUser(username = "admin", roles = {"TENANT_ADMIN"})
        void should_Return404_When_NotFound() throws Exception {
            performDelete(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }
}
