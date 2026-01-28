package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.builder.OpportunityTestBuilder;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.SavedOpportunity;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.SavedOpportunityRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.util.UUID;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller integration tests for SavedOpportunityController.
 * Tests save/unsave behavior and user-specific operations.
 */
class SavedOpportunityControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/saved-opportunities";

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private SavedOpportunityRepository savedOpportunityRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository tenantMembershipRepository;

    private Tenant testTenant;
    private User testUser;
    private Role testRole;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        savedOpportunityRepository.deleteAll();
        opportunityRepository.deleteAll();

        // Create test tenant and user for authenticated requests
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test role")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        testUser = User.builder()
            .email("test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        tenantMembershipRepository.save(membership);

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

    private Opportunity createAndSaveOpportunity() {
        Opportunity opportunity = anActiveOpportunity().build();
        return opportunityRepository.save(opportunity);
    }

    private SavedOpportunity saveOpportunityForUser(Opportunity opportunity, User user) {
        SavedOpportunity saved = SavedOpportunity.builder()
            .user(user)
            .tenant(testTenant)
            .opportunity(opportunity)
            .notes("Test notes")
            .tags("test,opportunity")
            .build();
        return savedOpportunityRepository.save(saved);
    }

    @Nested
    @DisplayName("POST / - Save Opportunity")
    class SaveOpportunity {

        @Test
        @WithMockUser
        @DisplayName("should save opportunity successfully")
        void shouldSaveOpportunity() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();

            SaveOpportunityRequest request = new SaveOpportunityRequest(
                opportunity.getId(),
                "Important opportunity for Q2",
                "defense,software"
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.opportunity.id").value(opportunity.getId()))
                .andExpect(jsonPath("$.notes").value("Important opportunity for Q2"))
                .andExpect(jsonPath("$.tags").value("defense,software"))
                .andExpect(jsonPath("$.savedAt").exists());
        }

        @Test
        @WithMockUser
        @DisplayName("should save opportunity without notes and tags")
        void shouldSaveWithoutNotesAndTags() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();

            SaveOpportunityRequest request = new SaveOpportunityRequest(
                opportunity.getId(),
                null,
                null
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.opportunity.id").value(opportunity.getId()))
                .andExpect(jsonPath("$.notes").doesNotExist())
                .andExpect(jsonPath("$.tags").doesNotExist());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when opportunity already saved")
        void shouldReturn400WhenAlreadySaved() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();
            saveOpportunityForUser(opportunity, testUser);

            SaveOpportunityRequest request = new SaveOpportunityRequest(
                opportunity.getId(),
                "Notes",
                "tags"
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when opportunity not found")
        void shouldReturn400WhenOpportunityNotFound() throws Exception {
            // Given
            SaveOpportunityRequest request = new SaveOpportunityRequest(
                "nonexistent-id",
                "Notes",
                "tags"
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();

            SaveOpportunityRequest request = new SaveOpportunityRequest(
                opportunity.getId(),
                "Notes",
                "tags"
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("DELETE /{opportunityId} - Unsave Opportunity")
    class UnsaveOpportunity {

        @Test
        @WithMockUser
        @DisplayName("should unsave opportunity successfully")
        void shouldUnsaveOpportunity() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();
            saveOpportunityForUser(opportunity, testUser);

            // When/Then
            performDelete(BASE_URL + "/" + opportunity.getId())
                .andExpect(status().isNoContent());

            // Verify it's deleted
            performGet(BASE_URL + "/check/" + opportunity.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSaved").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should succeed even if opportunity was not saved (idempotent)")
        void shouldSucceedIfNotSaved() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();

            // When/Then - Should not throw error even if not saved
            performDelete(BASE_URL + "/" + opportunity.getId())
                .andExpect(status().isNoContent());
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // When/Then
            performDelete(BASE_URL + "/some-id")
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /{opportunityId} - Update Notes")
    class UpdateNotes {

        @Test
        @WithMockUser
        @DisplayName("should update notes and tags")
        void shouldUpdateNotesAndTags() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();
            saveOpportunityForUser(opportunity, testUser);

            UpdateNotesRequest request = new UpdateNotesRequest(
                "Updated notes",
                "new,tags"
            );

            // When/Then
            performPut(BASE_URL + "/" + opportunity.getId(), request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Updated notes"))
                .andExpect(jsonPath("$.tags").value("new,tags"));
        }

        @Test
        @WithMockUser
        @DisplayName("should update only notes")
        void shouldUpdateOnlyNotes() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();
            SavedOpportunity saved = saveOpportunityForUser(opportunity, testUser);

            UpdateNotesRequest request = new UpdateNotesRequest(
                "Updated notes only",
                null
            );

            // When/Then
            performPut(BASE_URL + "/" + opportunity.getId(), request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Updated notes only"))
                .andExpect(jsonPath("$.tags").value(saved.getTags())); // Unchanged
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when saved opportunity not found")
        void shouldReturn400WhenNotFound() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();
            // Not saving it for user

            UpdateNotesRequest request = new UpdateNotesRequest("Notes", "tags");

            // When/Then
            performPut(BASE_URL + "/" + opportunity.getId(), request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET / - Get My Saved Opportunities")
    class GetMySavedOpportunities {

        @Test
        @WithMockUser
        @DisplayName("should return user's saved opportunities")
        void shouldReturnUserSavedOpportunities() throws Exception {
            // Given
            Opportunity opp1 = createAndSaveOpportunity();
            Opportunity opp2 = createAndSaveOpportunity();
            saveOpportunityForUser(opp1, testUser);
            saveOpportunityForUser(opp2, testUser);

            // When/Then
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2));
        }

        @Test
        @WithMockUser
        @DisplayName("should return empty when no saved opportunities")
        void shouldReturnEmptyWhenNone() throws Exception {
            // When/Then
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(0));
        }

        @Test
        @WithMockUser
        @DisplayName("should paginate saved opportunities")
        void shouldPaginateSavedOpportunities() throws Exception {
            // Given - Create 15 saved opportunities
            for (int i = 0; i < 15; i++) {
                Opportunity opp = createAndSaveOpportunity();
                saveOpportunityForUser(opp, testUser);
            }

            // When/Then
            performGet(BASE_URL + "?page=0&size=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.first").value(true));

            performGet(BASE_URL + "?page=2&size=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.last").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("should only return current user's saved opportunities")
        void shouldOnlyReturnCurrentUserOpportunities() throws Exception {
            // Given
            Opportunity opp1 = createAndSaveOpportunity();
            saveOpportunityForUser(opp1, testUser);

            // Create another user and save an opportunity for them
            User otherUser = User.builder()
                .email("other-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("Other")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            otherUser = userRepository.save(otherUser);

            TenantMembership otherMembership = TenantMembership.builder()
                .user(otherUser)
                .tenant(testTenant)
                .role(testRole)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(otherMembership);

            Opportunity opp2 = createAndSaveOpportunity();
            saveOpportunityForUser(opp2, otherUser);

            // When/Then - Should only see testUser's saved opportunity
            performGet(BASE_URL)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].opportunity.id").value(opp1.getId()));
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // When/Then
            performGet(BASE_URL)
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /check/{opportunityId} - Check If Saved")
    class CheckIfSaved {

        @Test
        @WithMockUser
        @DisplayName("should return true when opportunity is saved")
        void shouldReturnTrueWhenSaved() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();
            saveOpportunityForUser(opportunity, testUser);

            // When/Then
            performGet(BASE_URL + "/check/" + opportunity.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSaved").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("should return false when opportunity is not saved")
        void shouldReturnFalseWhenNotSaved() throws Exception {
            // Given
            Opportunity opportunity = createAndSaveOpportunity();

            // When/Then
            performGet(BASE_URL + "/check/" + opportunity.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSaved").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should return false for nonexistent opportunity")
        void shouldReturnFalseForNonexistent() throws Exception {
            // When/Then
            performGet(BASE_URL + "/check/nonexistent-id")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSaved").value(false));
        }
    }

    @Nested
    @DisplayName("GET /ids - Get Saved Opportunity IDs")
    class GetSavedIds {

        @Test
        @WithMockUser
        @DisplayName("should return set of saved opportunity IDs")
        void shouldReturnSavedIds() throws Exception {
            // Given
            Opportunity opp1 = createAndSaveOpportunity();
            Opportunity opp2 = createAndSaveOpportunity();
            saveOpportunityForUser(opp1, testUser);
            saveOpportunityForUser(opp2, testUser);

            // When/Then
            performGet(BASE_URL + "/ids")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$", containsInAnyOrder(opp1.getId(), opp2.getId())));
        }

        @Test
        @WithMockUser
        @DisplayName("should return empty set when no saved opportunities")
        void shouldReturnEmptySetWhenNone() throws Exception {
            // When/Then
            performGet(BASE_URL + "/ids")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /count - Get Saved Count")
    class GetSavedCount {

        @Test
        @WithMockUser
        @DisplayName("should return count of saved opportunities")
        void shouldReturnSavedCount() throws Exception {
            // Given
            for (int i = 0; i < 5; i++) {
                Opportunity opp = createAndSaveOpportunity();
                saveOpportunityForUser(opp, testUser);
            }

            // When/Then
            performGet(BASE_URL + "/count")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
        }

        @Test
        @WithMockUser
        @DisplayName("should return zero when no saved opportunities")
        void shouldReturnZeroWhenNone() throws Exception {
            // When/Then
            performGet(BASE_URL + "/count")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
        }
    }

    // Request DTOs for tests
    record SaveOpportunityRequest(String opportunityId, String notes, String tags) {}
    record UpdateNotesRequest(String notes, String tags) {}
}
