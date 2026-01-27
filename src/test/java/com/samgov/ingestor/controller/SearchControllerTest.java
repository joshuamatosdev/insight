package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.FacetedSearchRequest;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.RoleRepository;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static com.samgov.ingestor.builder.OpportunityTestBuilder.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller integration tests for SearchController.
 * Tests HTTP endpoints for autocomplete suggestions and faceted search.
 */
class SearchControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/search";

    @Autowired
    private OpportunityRepository opportunityRepository;

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

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        opportunityRepository.deleteAll();

        // Create test tenant and user for authenticated requests
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        Role role = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test role")
            .isSystemRole(false)
            .build();
        role = roleRepository.save(role);

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
            .role(role)
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

    @Nested
    @DisplayName("GET /suggestions - Autocomplete Suggestions")
    class GetSuggestions {

        @Test
        @WithMockUser
        @DisplayName("should return suggestions for query")
        void shouldReturnSuggestionsForQuery() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Infrastructure Support").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support Services").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=cyber")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("cyber"))
                .andExpect(jsonPath("$.suggestions").isArray())
                .andExpect(jsonPath("$.suggestions", hasSize(2)));
        }

        @Test
        @WithMockUser
        @DisplayName("should return empty suggestions when no matches")
        void shouldReturnEmptySuggestionsWhenNoMatches() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support Services").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=nonexistent")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("nonexistent"))
                .andExpect(jsonPath("$.suggestions").isEmpty());
        }

        @Test
        @WithMockUser
        @DisplayName("should respect limit parameter")
        void shouldRespectLimitParameter() throws Exception {
            // Given
            for (int i = 0; i < 20; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Cloud Migration Project " + i).build());
            }

            // When/Then
            performGet(BASE_URL + "/suggestions?q=cloud&limit=5")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions", hasSize(5)));
        }

        @Test
        @WithMockUser
        @DisplayName("should use default limit when not specified")
        void shouldUseDefaultLimitWhenNotSpecified() throws Exception {
            // Given
            for (int i = 0; i < 20; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Cloud Migration Project " + i).build());
            }

            // When/Then
            performGet(BASE_URL + "/suggestions?q=cloud")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions", hasSize(10))); // Default limit is 10
        }

        @Test
        @WithMockUser
        @DisplayName("should include suggestion text and type")
        void shouldIncludeSuggestionTextAndType() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test Opportunity").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=test")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions[0].text").value("Test Opportunity"))
                .andExpect(jsonPath("$.suggestions[0].type").value("opportunity"));
        }

        @Test
        @WithMockUser
        @DisplayName("should include highlight in suggestions")
        void shouldIncludeHighlightInSuggestions() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=cyber")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions[0].highlight", containsString("<mark>")))
                .andExpect(jsonPath("$.suggestions[0].highlight", containsString("</mark>")));
        }

        @Test
        @WithMockUser
        @DisplayName("should include recent searches list")
        void shouldIncludeRecentSearchesList() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=test")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recentSearches").isArray());
        }

        @Test
        @WithMockUser
        @DisplayName("should handle case insensitive search")
        void shouldHandleCaseInsensitiveSearch() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("CYBERSECURITY Assessment").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=CYBER")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suggestions", hasSize(1)));
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when query parameter is missing")
        void shouldReturn400WhenQueryIsMissing() throws Exception {
            // When/Then
            performGet(BASE_URL + "/suggestions")
                .andExpect(status().isBadRequest());
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // When/Then
            mockMvc.perform(get(BASE_URL + "/suggestions?q=test")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /faceted - Faceted Search")
    class FacetedSearch {

        @Test
        @WithMockUser
        @DisplayName("should return paginated results")
        void shouldReturnPaginatedResults() throws Exception {
            // Given
            for (int i = 0; i < 25; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(10)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(10)))
                .andExpect(jsonPath("$.totalCount").value(25))
                .andExpect(jsonPath("$.queryTimeMs").isNumber());
        }

        @Test
        @WithMockUser
        @DisplayName("should filter by query text")
        void shouldFilterByQueryText() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cybersecurity")
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(1)))
                .andExpect(jsonPath("$.totalCount").value(1));
        }

        @Test
        @WithMockUser
        @DisplayName("should return all results when query is empty")
        void shouldReturnAllResultsWhenQueryIsEmpty() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("")
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(3)));
        }

        @Test
        @WithMockUser
        @DisplayName("should return all results when query is null")
        void shouldReturnAllResultsWhenQueryIsNull() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(2)));
        }

        @Test
        @WithMockUser
        @DisplayName("should include facets in response")
        void shouldIncludeFacetsInResponse() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.facets").exists())
                .andExpect(jsonPath("$.facets.type").isArray())
                .andExpect(jsonPath("$.facets.status").isArray());
        }

        @Test
        @WithMockUser
        @DisplayName("should include status facet with counts")
        void shouldIncludeStatusFacetWithCounts() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(anActiveOpportunity().build());
            opportunityRepository.save(aClosedOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.facets.status[?(@.key=='ACTIVE')].count").value(2))
                .andExpect(jsonPath("$.facets.status[?(@.key=='CLOSED')].count").value(1));
        }

        @Test
        @WithMockUser
        @DisplayName("should include type facet buckets")
        void shouldIncludeTypeFacetBuckets() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.facets.type[*].key",
                    hasItems("SOLICITATION", "PRESOLICITATION", "AWARD", "SOURCE_SOUGHT")));
        }

        @Test
        @WithMockUser
        @DisplayName("should sort by response deadline ascending")
        void shouldSortByResponseDeadlineAscending() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Far")
                .withResponseDeadLine(today.plusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Near")
                .withResponseDeadLine(today.plusDays(5)).build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .sortOrder("asc")
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content[0].title").value("Near"));
        }

        @Test
        @WithMockUser
        @DisplayName("should sort by specified field descending")
        void shouldSortBySpecifiedFieldDescending() throws Exception {
            // Given
            LocalDate today = LocalDate.now();
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Old")
                .withPostedDate(today.minusDays(30)).build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("New")
                .withPostedDate(today.minusDays(1)).build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .sortBy("postedDate")
                .sortOrder("desc")
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content[0].title").value("New"));
        }

        @Test
        @WithMockUser
        @DisplayName("should handle empty results gracefully")
        void shouldHandleEmptyResultsGracefully() throws Exception {
            // Given - empty database

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("nonexistent")
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content").isEmpty())
                .andExpect(jsonPath("$.totalCount").value(0));
        }

        @Test
        @WithMockUser
        @DisplayName("should record query time")
        void shouldRecordQueryTime() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.queryTimeMs").isNumber())
                .andExpect(jsonPath("$.queryTimeMs", greaterThanOrEqualTo(0)));
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            // Given
            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            mockMvc.perform(post(BASE_URL + "/faceted")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Pagination Behavior")
    class PaginationBehavior {

        @Test
        @WithMockUser
        @DisplayName("should respect page and size parameters")
        void shouldRespectPageAndSizeParameters() throws Exception {
            // Given
            for (int i = 0; i < 30; i++) {
                opportunityRepository.save(anActiveOpportunity()
                    .withTitle("Opportunity " + i).build());
            }

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(1)
                .size(10)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(10)))
                .andExpect(jsonPath("$.opportunities.number").value(1))
                .andExpect(jsonPath("$.opportunities.totalPages").value(3))
                .andExpect(jsonPath("$.opportunities.first").value(false))
                .andExpect(jsonPath("$.opportunities.last").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should return empty content for page beyond total")
        void shouldReturnEmptyContentForPageBeyondTotal() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(10)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content").isEmpty())
                .andExpect(jsonPath("$.totalCount").value(1));
        }

        @Test
        @WithMockUser
        @DisplayName("should indicate first and last page correctly")
        void shouldIndicateFirstAndLastPageCorrectly() throws Exception {
            // Given
            for (int i = 0; i < 5; i++) {
                opportunityRepository.save(anActiveOpportunity().build());
            }

            FacetedSearchRequest firstPageRequest = FacetedSearchRequest.builder()
                .page(0)
                .size(2)
                .build();

            FacetedSearchRequest lastPageRequest = FacetedSearchRequest.builder()
                .page(2)
                .size(2)
                .build();

            // When/Then - First page
            performPost(BASE_URL + "/faceted", firstPageRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.first").value(true))
                .andExpect(jsonPath("$.opportunities.last").value(false));

            // When/Then - Last page
            performPost(BASE_URL + "/faceted", lastPageRequest)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.first").value(false))
                .andExpect(jsonPath("$.opportunities.last").value(true));
        }
    }

    @Nested
    @DisplayName("Search with Filters")
    class SearchWithFilters {

        @Test
        @WithMockUser
        @DisplayName("should find opportunities matching title")
        void shouldFindOpportunitiesMatchingTitle() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cloud Infrastructure Services").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("On-premise Data Center").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cloud")
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(1)))
                .andExpect(jsonPath("$.opportunities.content[0].title", containsStringIgnoringCase("cloud")));
        }

        @Test
        @WithMockUser
        @DisplayName("should find opportunities matching description")
        void shouldFindOpportunitiesMatchingDescription() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Federal Services Contract")
                .withDescription("Comprehensive cloud migration and support").build());
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("IT Support")
                .withDescription("On-site technical support").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cloud")
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(1)));
        }

        @Test
        @WithMockUser
        @DisplayName("should handle partial word matches")
        void shouldHandlePartialWordMatches() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Cybersecurity Assessment").build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .query("cyber")
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @WithMockUser
        @DisplayName("should handle invalid JSON gracefully")
        void shouldHandleInvalidJsonGracefully() throws Exception {
            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/faceted")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ invalid json }")))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should handle missing request body")
        void shouldHandleMissingRequestBody() throws Exception {
            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/faceted")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Content Type Validation")
    class ContentTypeValidation {

        @Test
        @WithMockUser
        @DisplayName("suggestions endpoint should accept GET requests")
        void suggestionsEndpointShouldAcceptGetRequests() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=test")
                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser
        @DisplayName("faceted endpoint should accept POST requests")
        void facetedEndpointShouldAcceptPostRequests() throws Exception {
            // Given
            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser
        @DisplayName("faceted endpoint should reject GET requests")
        void facetedEndpointShouldRejectGetRequests() throws Exception {
            // When/Then
            performGet(BASE_URL + "/faceted")
                .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @WithMockUser
        @DisplayName("suggestions endpoint should reject POST requests")
        void suggestionsEndpointShouldRejectPostRequests() throws Exception {
            // When/Then
            mockMvc.perform(withTenantContext(post(BASE_URL + "/suggestions?q=test")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}")))
                .andExpect(status().isMethodNotAllowed());
        }
    }

    @Nested
    @DisplayName("Response Format")
    class ResponseFormat {

        @Test
        @WithMockUser
        @DisplayName("suggestions response should have correct structure")
        void suggestionsResponseShouldHaveCorrectStructure() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test Opportunity").build());

            // When/Then
            performGet(BASE_URL + "/suggestions?q=test")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").exists())
                .andExpect(jsonPath("$.suggestions").isArray())
                .andExpect(jsonPath("$.recentSearches").isArray());
        }

        @Test
        @WithMockUser
        @DisplayName("faceted response should have correct structure")
        void facetedResponseShouldHaveCorrectStructure() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities").exists())
                .andExpect(jsonPath("$.opportunities.content").isArray())
                .andExpect(jsonPath("$.facets").exists())
                .andExpect(jsonPath("$.totalCount").isNumber())
                .andExpect(jsonPath("$.queryTimeMs").isNumber());
        }

        @Test
        @WithMockUser
        @DisplayName("opportunity in faceted response should have required fields")
        void opportunityInFacetedResponseShouldHaveRequiredFields() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity()
                .withTitle("Test Opportunity")
                .withSolicitationNumber("SOL-12345")
                .withNaicsCode("541511")
                .withAgency("Test Agency")
                .build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.opportunities.content[0].id").exists())
                .andExpect(jsonPath("$.opportunities.content[0].title").value("Test Opportunity"))
                .andExpect(jsonPath("$.opportunities.content[0].solicitationNumber").value("SOL-12345"))
                .andExpect(jsonPath("$.opportunities.content[0].naicsCode").value("541511"))
                .andExpect(jsonPath("$.opportunities.content[0].agency").value("Test Agency"));
        }

        @Test
        @WithMockUser
        @DisplayName("facet bucket should have key, label, and count")
        void facetBucketShouldHaveKeyLabelAndCount() throws Exception {
            // Given
            opportunityRepository.save(anActiveOpportunity().build());

            FacetedSearchRequest request = FacetedSearchRequest.builder()
                .page(0)
                .size(20)
                .build();

            // When/Then
            performPost(BASE_URL + "/faceted", request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.facets.status[0].key").exists())
                .andExpect(jsonPath("$.facets.status[0].label").exists())
                .andExpect(jsonPath("$.facets.status[0].count").isNumber());
        }
    }
}
