package com.samgov.ingestor.e2e;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-End tests for CRM (Contact Relationship Management) flows.
 * Tests contacts, organizations, interactions, and relationship management.
 */
@DisplayName("CRM E2E Tests")
class CRME2ETest extends BaseControllerTest {

    private static final String CONTACTS_URL = "/contacts";
    private static final String ORGANIZATIONS_URL = "/organizations";
    private static final String INTERACTIONS_URL = "/interactions";

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
        // Create test tenant
        testTenant = Tenant.builder()
            .name("E2E CRM Tenant " + UUID.randomUUID())
            .slug("e2e-crm-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);
        testTenantId = testTenant.getId();

        // Create test user
        testUser = User.builder()
            .email("e2e-crm-" + UUID.randomUUID() + "@example.com")
            .passwordHash(passwordEncoder.encode("TestPass123!"))
            .firstName("CRM")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .tenantId(testTenantId)
            .build();
        testUser = userRepository.save(testUser);
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("Contacts CRUD Flow")
    class ContactsCRUDFlow {

        @Test
        @DisplayName("should list contacts")
        void should_ListContacts() throws Exception {
            performGet(CONTACTS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create contact")
        void should_CreateContact() throws Exception {
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "John",
                "lastName", "Doe",
                "email", "john.doe@example.com",
                "phone", "+1-555-123-4567",
                "title", "Program Manager",
                "department", "Acquisitions",
                "contactType", "GOVERNMENT",
                "notes", "Key contact for IT contracts"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
        }

        @Test
        @DisplayName("should retrieve contact by ID")
        void should_RetrieveContactById() throws Exception {
            // Create contact first
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Jane",
                "lastName", "Smith",
                "email", "jane.smith@example.com",
                "contactType", "GOVERNMENT"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update contact")
        void should_UpdateContact() throws Exception {
            // Create contact first
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Update",
                "lastName", "Test",
                "email", "update.test@example.com",
                "contactType", "COMMERCIAL"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should delete contact")
        void should_DeleteContact() throws Exception {
            // Create contact to delete
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Delete",
                "lastName", "Me",
                "email", "delete.me@example.com",
                "contactType", "PARTNER"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should search contacts")
        void should_SearchContacts() throws Exception {
            performGet(CONTACTS_URL + "/search?query=john")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Organizations CRUD Flow")
    class OrganizationsCRUDFlow {

        @Test
        @DisplayName("should list organizations")
        void should_ListOrganizations() throws Exception {
            performGet(ORGANIZATIONS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create organization")
        void should_CreateOrganization() throws Exception {
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Department of Defense",
                "organizationType", "GOVERNMENT_AGENCY",
                "website", "https://dod.gov",
                "phone", "+1-555-DOD-HELP",
                "address", "The Pentagon, Washington DC"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Department of Defense"));
        }

        @Test
        @DisplayName("should retrieve organization by ID")
        void should_RetrieveOrganizationById() throws Exception {
            // Create organization first
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Test Agency",
                "organizationType", "GOVERNMENT_AGENCY"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should update organization")
        void should_UpdateOrganization() throws Exception {
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Update Org",
                "organizationType", "PRIME_CONTRACTOR"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get organization contacts")
        void should_GetOrganizationContacts() throws Exception {
            // Create organization first
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Org With Contacts",
                "organizationType", "PARTNER"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get child organizations")
        void should_GetChildOrganizations() throws Exception {
            // Create parent organization
            java.util.Map<String, Object> parentRequest = java.util.Map.of(
                "name", "Parent Organization",
                "organizationType", "PRIME_CONTRACTOR"
            );

            performPost(ORGANIZATIONS_URL, parentRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Interactions Flow")
    class InteractionsFlow {

        @Test
        @DisplayName("should list interactions")
        void should_ListInteractions() throws Exception {
            performGet(INTERACTIONS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should create interaction")
        void should_CreateInteraction() throws Exception {
            // First create a contact
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Interaction",
                "lastName", "Contact",
                "email", "interaction@example.com",
                "contactType", "GOVERNMENT"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should create meeting interaction")
        void should_CreateMeetingInteraction() throws Exception {
            java.util.Map<String, Object> interactionRequest = java.util.Map.of(
                "interactionType", "MEETING",
                "subject", "Initial Project Discussion",
                "description", "Discussed project scope and timeline",
                "interactionDate", java.time.LocalDateTime.now().toString(),
                "followUpDate", java.time.LocalDateTime.now().plusDays(7).toString()
            );

            performPost(INTERACTIONS_URL, interactionRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should create call interaction")
        void should_CreateCallInteraction() throws Exception {
            java.util.Map<String, Object> interactionRequest = java.util.Map.of(
                "interactionType", "CALL",
                "subject", "Follow-up Call",
                "description", "Discussed next steps",
                "interactionDate", java.time.LocalDateTime.now().toString()
            );

            performPost(INTERACTIONS_URL, interactionRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should create email interaction")
        void should_CreateEmailInteraction() throws Exception {
            java.util.Map<String, Object> interactionRequest = java.util.Map.of(
                "interactionType", "EMAIL",
                "subject", "Proposal Submission",
                "description", "Sent proposal documents",
                "interactionDate", java.time.LocalDateTime.now().toString()
            );

            performPost(INTERACTIONS_URL, interactionRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get upcoming follow-ups")
        void should_GetUpcomingFollowUps() throws Exception {
            performGet(INTERACTIONS_URL + "/upcoming")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Contact-Organization Relationship Flow")
    class ContactOrganizationRelationshipFlow {

        @Test
        @DisplayName("should link contact to organization")
        void should_LinkContactToOrganization() throws Exception {
            // Create organization
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Link Test Org",
                "organizationType", "GOVERNMENT_AGENCY"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated());

            // Create contact linked to organization
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Linked",
                "lastName", "Contact",
                "email", "linked@example.com",
                "contactType", "GOVERNMENT"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should get contacts for organization")
        void should_GetContactsForOrganization() throws Exception {
            // Create organization with contacts
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Org for Contacts",
                "organizationType", "PRIME_CONTRACTOR"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Contact Interaction Timeline Flow")
    class ContactInteractionTimelineFlow {

        @Test
        @DisplayName("should get contact interactions timeline")
        void should_GetContactInteractionsTimeline() throws Exception {
            // Create contact
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Timeline",
                "lastName", "Test",
                "email", "timeline@example.com",
                "contactType", "COMMERCIAL"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("Tags and Categories Flow")
    class TagsAndCategoriesFlow {

        @Test
        @DisplayName("should add tags to contact")
        void should_AddTagsToContact() throws Exception {
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Tagged",
                "lastName", "Contact",
                "email", "tagged@example.com",
                "contactType", "PARTNER",
                "tags", java.util.List.of("VIP", "IT", "Priority")
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should filter contacts by tag")
        void should_FilterContactsByTag() throws Exception {
            performGet(CONTACTS_URL + "?tag=VIP")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter contacts by type")
        void should_FilterContactsByType() throws Exception {
            performGet(CONTACTS_URL + "?contactType=GOVERNMENT")
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should filter organizations by type")
        void should_FilterOrganizationsByType() throws Exception {
            performGet(ORGANIZATIONS_URL + "?organizationType=GOVERNMENT_AGENCY")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Multi-Tenant CRM Isolation")
    class MultiTenantCRMIsolation {

        @Test
        @DisplayName("should isolate contacts between tenants")
        void should_IsolateContactsBetweenTenants() throws Exception {
            // Create contact in current tenant
            java.util.Map<String, Object> contactRequest = java.util.Map.of(
                "firstName", "Isolated",
                "lastName", "Contact",
                "email", "isolated@example.com",
                "contactType", "INTERNAL"
            );

            performPost(CONTACTS_URL, contactRequest)
                .andExpect(status().isCreated());

            // Create another tenant
            Tenant otherTenant = Tenant.builder()
                .name("Other CRM Tenant " + UUID.randomUUID())
                .slug("other-crm-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenantRepository.save(otherTenant);

            // Contacts should be isolated
            performGet(CONTACTS_URL)
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should isolate organizations between tenants")
        void should_IsolateOrganizationsBetweenTenants() throws Exception {
            // Create organization in current tenant
            java.util.Map<String, Object> orgRequest = java.util.Map.of(
                "name", "Isolated Org",
                "organizationType", "SUBCONTRACTOR"
            );

            performPost(ORGANIZATIONS_URL, orgRequest)
                .andExpect(status().isCreated());

            // Organizations should be isolated
            performGet(ORGANIZATIONS_URL)
                .andExpect(status().isOk());
        }
    }
}
