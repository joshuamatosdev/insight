package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestPriority;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestStatus;
import com.samgov.ingestor.service.FeatureRequestService.CreateFeatureRequestRequest;
import com.samgov.ingestor.service.FeatureRequestService.UpdateFeatureRequestRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for FeatureRequestController REST API.
 *
 * Tests focus on HTTP behavior:
 * - Request/response formats
 * - HTTP status codes
 * - Voting endpoints
 * - Status update authorization
 * - Tenant isolation
 */
@DisplayName("FeatureRequestController")
class FeatureRequestControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/feature-requests";
    private static final String CONTRACTS_URL = "/contracts";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private User adminUser;
    private Role testRole;
    private Role adminRole;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("FEATURE_REQUEST_CREATE,FEATURE_REQUEST_READ,FEATURE_REQUEST_UPDATE,FEATURE_REQUEST_DELETE,FEATURE_REQUEST_VOTE")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create admin role
        adminRole = Role.builder()
            .tenant(testTenant)
            .name(Role.TENANT_ADMIN)
            .description("Admin role")
            .permissions("FEATURE_REQUEST_CREATE,FEATURE_REQUEST_READ,FEATURE_REQUEST_UPDATE,FEATURE_REQUEST_DELETE,FEATURE_REQUEST_VOTE,FEATURE_REQUEST_STATUS_UPDATE")
            .isSystemRole(false)
            .build();
        adminRole = roleRepository.save(adminRole);

        // Create test user
        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        // Create admin user
        adminUser = User.builder()
            .email("admin-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Admin")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        adminUser = userRepository.save(adminUser);

        // Create tenant memberships
        TenantMembership userMembership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(userMembership);

        TenantMembership adminMembership = TenantMembership.builder()
            .user(adminUser)
            .tenant(testTenant)
            .role(adminRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(adminMembership);

        // Create test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("CTRL-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Test Contract")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private CreateFeatureRequestRequest createRequest(String title) {
        return new CreateFeatureRequestRequest(
            testContract.getId(),
            title,
            "Description for " + title,
            FeatureRequestPriority.MEDIUM,
            null
        );
    }

    @Nested
    @DisplayName("POST /feature-requests")
    @WithMockUser(roles = "USER")
    class CreateFeatureRequest {

        @Test
        @DisplayName("should create feature request and return 201 CREATED")
        void shouldCreateFeatureRequestSuccessfully() throws Exception {
            // Given
            CreateFeatureRequestRequest request = createRequest("Add dark mode");

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Add dark mode")))
                .andExpect(jsonPath("$.description", is("Description for Add dark mode")))
                .andExpect(jsonPath("$.priority", is("MEDIUM")))
                .andExpect(jsonPath("$.status", is("SUBMITTED")))
                .andExpect(jsonPath("$.voteCount", is(0)))
                .andExpect(jsonPath("$.contractId", is(testContract.getId().toString())));
        }

        @Test
        @DisplayName("should return 400 BAD REQUEST for missing title")
        void shouldReturn400ForMissingTitle() throws Exception {
            // Given
            CreateFeatureRequestRequest request = new CreateFeatureRequestRequest(
                testContract.getId(),
                null, // missing title
                "Description",
                FeatureRequestPriority.MEDIUM,
                null
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 404 NOT FOUND for non-existent contract")
        void shouldReturn404ForNonExistentContract() throws Exception {
            // Given
            CreateFeatureRequestRequest request = new CreateFeatureRequestRequest(
                UUID.randomUUID(), // non-existent contract
                "Feature",
                "Description",
                FeatureRequestPriority.MEDIUM,
                null
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /feature-requests/{id}")
    @WithMockUser(roles = "USER")
    class GetFeatureRequest {

        @Test
        @DisplayName("should return feature request by ID")
        void shouldReturnFeatureRequestById() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("Test Feature"))
                .andExpect(status().isCreated())
                .andReturn();

            String featureId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performGet(BASE_URL + "/" + featureId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(featureId)))
                .andExpect(jsonPath("$.title", is("Test Feature")));
        }

        @Test
        @DisplayName("should return 404 for non-existent feature request")
        void shouldReturn404ForNonExistent() throws Exception {
            // When/Then
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /contracts/{contractId}/feature-requests")
    @WithMockUser(roles = "USER")
    class GetFeatureRequestsForContract {

        @Test
        @DisplayName("should return paginated feature requests for contract")
        void shouldReturnPaginatedFeatureRequests() throws Exception {
            // Given
            for (int i = 0; i < 5; i++) {
                performPost(BASE_URL, createRequest("Feature " + i))
                    .andExpect(status().isCreated());
            }

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/feature-requests")
                    .param("page", "0")
                    .param("size", "3")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", is(5)));
        }

        @Test
        @DisplayName("should filter feature requests by status")
        void shouldFilterByStatus() throws Exception {
            // Given - create features and update statuses
            MvcResult result = performPost(BASE_URL, createRequest("Submitted Feature"))
                .andExpect(status().isCreated())
                .andReturn();

            MvcResult approved = performPost(BASE_URL, createRequest("Approved Feature"))
                .andExpect(status().isCreated())
                .andReturn();

            String approvedId = objectMapper.readTree(approved.getResponse().getContentAsString())
                .get("id").asText();

            // Update as admin
            testUserId = adminUser.getId();
            TenantContext.setCurrentUserId(adminUser.getId());

            mockMvc.perform(patch(BASE_URL + "/" + approvedId + "/status")
                    .param("status", "APPROVED")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", adminUser.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Reset to regular user
            testUserId = testUser.getId();
            TenantContext.setCurrentUserId(testUser.getId());

            // When/Then - filter by SUBMITTED
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/feature-requests")
                    .param("status", "SUBMITTED")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title", is("Submitted Feature")));
        }
    }

    @Nested
    @DisplayName("GET /contracts/{contractId}/feature-requests/top-voted")
    @WithMockUser(roles = "USER")
    class GetTopVotedFeatureRequests {

        @Test
        @DisplayName("should return top voted feature requests")
        void shouldReturnTopVoted() throws Exception {
            // Given - create features and vote
            MvcResult lowVotes = performPost(BASE_URL, createRequest("Low votes"))
                .andExpect(status().isCreated())
                .andReturn();

            MvcResult highVotes = performPost(BASE_URL, createRequest("High votes"))
                .andExpect(status().isCreated())
                .andReturn();

            String highVotesId = objectMapper.readTree(highVotes.getResponse().getContentAsString())
                .get("id").asText();

            // Vote for high votes feature
            performPost(BASE_URL + "/" + highVotesId + "/vote")
                .andExpect(status().isOk());

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/feature-requests/top-voted")
                    .param("limit", "10")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title", is("High votes")))
                .andExpect(jsonPath("$[0].voteCount", is(1)));
        }
    }

    @Nested
    @DisplayName("PUT /feature-requests/{id}")
    @WithMockUser(roles = "USER")
    class UpdateFeatureRequest {

        @Test
        @DisplayName("should update feature request")
        void shouldUpdateFeatureRequest() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("Original Title"))
                .andExpect(status().isCreated())
                .andReturn();

            String featureId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            UpdateFeatureRequestRequest updateRequest = new UpdateFeatureRequestRequest(
                "Updated Title",
                "Updated description",
                FeatureRequestPriority.HIGH,
                "UI/UX"
            );

            // When/Then
            performPut(BASE_URL + "/" + featureId, updateRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.description", is("Updated description")))
                .andExpect(jsonPath("$.priority", is("HIGH")))
                .andExpect(jsonPath("$.category", is("UI/UX")));
        }
    }

    @Nested
    @DisplayName("DELETE /feature-requests/{id}")
    @WithMockUser(roles = "USER")
    class DeleteFeatureRequest {

        @Test
        @DisplayName("should delete feature request")
        void shouldDeleteFeatureRequest() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createRequest("Feature to Delete"))
                .andExpect(status().isCreated())
                .andReturn();

            String featureId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performDelete(BASE_URL + "/" + featureId)
                .andExpect(status().isNoContent());

            // Verify deletion
            performGet(BASE_URL + "/" + featureId)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Vote Endpoints")
    @WithMockUser(roles = "USER")
    class VoteEndpoints {

        private String featureId;

        @BeforeEach
        void createFeatureRequest() throws Exception {
            MvcResult createResult = performPost(BASE_URL, createRequest("Feature to Vote"))
                .andExpect(status().isCreated())
                .andReturn();

            featureId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();
        }

        @Test
        @DisplayName("POST /feature-requests/{id}/vote - should add vote")
        void shouldAddVote() throws Exception {
            // When/Then
            performPost(BASE_URL + "/" + featureId + "/vote")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteCount", is(1)))
                .andExpect(jsonPath("$.hasVoted", is(true)));
        }

        @Test
        @DisplayName("DELETE /feature-requests/{id}/vote - should remove vote")
        void shouldRemoveVote() throws Exception {
            // Given - vote first
            performPost(BASE_URL + "/" + featureId + "/vote")
                .andExpect(status().isOk());

            // When/Then
            performDelete(BASE_URL + "/" + featureId + "/vote")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteCount", is(0)))
                .andExpect(jsonPath("$.hasVoted", is(false)));
        }

        @Test
        @DisplayName("should return 400 when voting twice")
        void shouldReturn400WhenVotingTwice() throws Exception {
            // Given - vote once
            performPost(BASE_URL + "/" + featureId + "/vote")
                .andExpect(status().isOk());

            // When/Then - try to vote again
            performPost(BASE_URL + "/" + featureId + "/vote")
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when unvoting without prior vote")
        void shouldReturn400WhenUnvotingWithoutVote() throws Exception {
            // When/Then
            performDelete(BASE_URL + "/" + featureId + "/vote")
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Status Update Authorization")
    class StatusUpdateAuthorization {

        private String featureId;

        @BeforeEach
        void createFeatureRequest() throws Exception {
            MvcResult createResult = performPost(BASE_URL, createRequest("Feature for Status"))
                .andExpect(status().isCreated())
                .andReturn();

            featureId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();
        }

        @Test
        @DisplayName("PATCH /feature-requests/{id}/status - should update status when admin")
        @WithMockUser(roles = "ADMIN")
        void shouldUpdateStatusWhenAdmin() throws Exception {
            // Set admin user context
            testUserId = adminUser.getId();
            TenantContext.setCurrentUserId(adminUser.getId());

            // When/Then
            mockMvc.perform(patch(BASE_URL + "/" + featureId + "/status")
                    .param("status", "APPROVED")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", adminUser.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));
        }

        @Test
        @DisplayName("should return 403 FORBIDDEN when non-admin updates status")
        void shouldReturn403WhenNonAdminUpdatesStatus() throws Exception {
            // When/Then - regular user tries to update status
            mockMvc.perform(patch(BASE_URL + "/" + featureId + "/status")
                    .param("status", "APPROVED")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should allow status transitions through lifecycle")
        @WithMockUser(roles = "ADMIN")
        void shouldAllowStatusTransitions() throws Exception {
            // Set admin context
            testUserId = adminUser.getId();
            TenantContext.setCurrentUserId(adminUser.getId());

            // SUBMITTED -> UNDER_REVIEW
            mockMvc.perform(patch(BASE_URL + "/" + featureId + "/status")
                    .param("status", "UNDER_REVIEW")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", adminUser.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UNDER_REVIEW")));

            // UNDER_REVIEW -> APPROVED
            mockMvc.perform(patch(BASE_URL + "/" + featureId + "/status")
                    .param("status", "APPROVED")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", adminUser.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));

            // APPROVED -> IMPLEMENTED
            mockMvc.perform(patch(BASE_URL + "/" + featureId + "/status")
                    .param("status", "IMPLEMENTED")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", adminUser.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IMPLEMENTED")));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "USER")
    class TenantIsolation {

        @Test
        @DisplayName("should return 404 when accessing other tenant's feature request")
        void shouldReturn404ForOtherTenantFeatureRequest() throws Exception {
            // Given - create feature request
            MvcResult createResult = performPost(BASE_URL, createRequest("Tenant 1 Feature"))
                .andExpect(status().isCreated())
                .andReturn();

            String featureId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            User user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("User")
                .lastName("Two")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Switch tenant context
            testTenantId = tenant2.getId();
            testUserId = user2.getId();
            TenantContext.setCurrentTenantId(tenant2.getId());
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then - should not be able to access tenant 1's feature request
            performGet(BASE_URL + "/" + featureId)
                .andExpect(status().isNotFound());
        }
    }
}
