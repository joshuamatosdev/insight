package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for CRM Controller endpoints.
 */
class CrmControllerTest extends BaseControllerTest {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    private Tenant testTenant;
    private User testUser;

    @BeforeEach
    @Override
    protected void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("CRM Test Tenant")
            .slug("crm-test-" + UUID.randomUUID().toString().substring(0, 8))
            .build());
        testTenantId = testTenant.getId();

        testUser = userRepository.save(User.builder()
            .email("crm-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("CRM")
            .lastName("Tester")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());
        testUserId = testUser.getId();
    }

    @Nested
    @DisplayName("GET /api/crm/contacts")
    class ListContacts {

        @Test
        @DisplayName("should return paginated contacts for tenant")
        void shouldReturnPaginatedContacts() throws Exception {
            // Given
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("John")
                .lastName("Doe")
                .contactType(Contact.ContactType.GOVERNMENT_CUSTOMER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .email("john.doe@example.com")
                .build());

            // When/Then
            performGet("/api/crm/contacts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].firstName").value("John"));
        }

        @Test
        @DisplayName("should filter contacts by type")
        void shouldFilterContactsByType() throws Exception {
            // Given
            contactRepository.save(Contact.builder()
                .firstName("Alice")
                .lastName("Smith")
                .contactType(Contact.ContactType.CONTRACTING_OFFICER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            contactRepository.save(Contact.builder()
                .firstName("Bob")
                .lastName("Jones")
                .contactType(Contact.ContactType.VENDOR)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            // When/Then
            performGet("/api/crm/contacts?contactType=CONTRACTING_OFFICER")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].contactType", everyItem(equalTo("CONTRACTING_OFFICER"))));
        }
    }

    @Nested
    @DisplayName("POST /api/crm/contacts")
    class CreateContact {

        @Test
        @DisplayName("should create a new contact")
        void shouldCreateNewContact() throws Exception {
            Map<String, Object> request = Map.of(
                "firstName", "Jane",
                "lastName", "Smith",
                "contactType", "GOVERNMENT_CUSTOMER",
                "email", "jane.smith@example.com"
            );

            performPost("/api/crm/contacts", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.id").isNotEmpty());
        }

        @Test
        @DisplayName("should reject contact with missing required fields")
        void shouldRejectContactWithMissingFields() throws Exception {
            Map<String, Object> request = Map.of(
                "firstName", "Jane"
                // Missing lastName and contactType
            );

            performPost("/api/crm/contacts", request)
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/organizations")
    class ListOrganizations {

        @Test
        @DisplayName("should return paginated organizations for tenant")
        void shouldReturnPaginatedOrganizations() throws Exception {
            // Given
            organizationRepository.save(Organization.builder()
                .name("Acme Corp")
                .organizationType(Organization.OrganizationType.PRIME_CONTRACTOR)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            // When/Then
            performGet("/api/crm/organizations")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Acme Corp"));
        }

        @Test
        @DisplayName("should filter organizations by type")
        void shouldFilterOrganizationsByType() throws Exception {
            // Given
            organizationRepository.save(Organization.builder()
                .name("Defense Agency")
                .organizationType(Organization.OrganizationType.GOVERNMENT_AGENCY)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            organizationRepository.save(Organization.builder()
                .name("Tech Vendor")
                .organizationType(Organization.OrganizationType.VENDOR)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            // When/Then
            performGet("/api/crm/organizations?organizationType=GOVERNMENT_AGENCY")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].organizationType", everyItem(equalTo("GOVERNMENT_AGENCY"))));
        }
    }

    @Nested
    @DisplayName("POST /api/crm/organizations")
    class CreateOrganization {

        @Test
        @DisplayName("should create a new organization")
        void shouldCreateNewOrganization() throws Exception {
            Map<String, Object> request = Map.of(
                "name", "New Tech LLC",
                "organizationType", "VENDOR",
                "uei", "TESTUEI123456"
            );

            performPost("/api/crm/organizations", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Tech LLC"))
                .andExpect(jsonPath("$.organizationType").value("VENDOR"))
                .andExpect(jsonPath("$.id").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("GET /api/crm/interactions")
    class ListInteractions {

        @Test
        @DisplayName("should return paginated interactions for tenant")
        void shouldReturnPaginatedInteractions() throws Exception {
            // Given
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Test")
                .lastName("Contact")
                .contactType(Contact.ContactType.GOVERNMENT_CUSTOMER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            interactionRepository.save(Interaction.builder()
                .subject("Initial Meeting")
                .interactionType(Interaction.InteractionType.MEETING_IN_PERSON)
                .interactionDate(LocalDateTime.now())
                .tenant(testTenant)
                .contact(contact)
                .loggedBy(testUser)
                .build());

            // When/Then
            performGet("/api/crm/interactions")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].subject").value("Initial Meeting"));
        }
    }

    @Nested
    @DisplayName("POST /api/crm/interactions")
    class CreateInteraction {

        @Test
        @DisplayName("should create a new interaction")
        void shouldCreateNewInteraction() throws Exception {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Test")
                .lastName("Contact")
                .contactType(Contact.ContactType.GOVERNMENT_CUSTOMER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Map<String, Object> request = Map.of(
                "subject", "Phone Call Discussion",
                "interactionType", "PHONE_CALL",
                "interactionDate", LocalDateTime.now().toString(),
                "contactId", contact.getId().toString()
            );

            performPost("/api/crm/interactions", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.subject").value("Phone Call Discussion"))
                .andExpect(jsonPath("$.interactionType").value("PHONE_CALL"))
                .andExpect(jsonPath("$.id").isNotEmpty());
        }
    }

    @Nested
    @DisplayName("Contact-Organization Relationships")
    class ContactOrganizationRelationships {

        @Test
        @DisplayName("should link contact to organization")
        void shouldLinkContactToOrganization() throws Exception {
            Organization org = organizationRepository.save(Organization.builder()
                .name("Parent Org")
                .organizationType(Organization.OrganizationType.PRIME_CONTRACTOR)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Map<String, Object> request = Map.of(
                "firstName", "Linked",
                "lastName", "Contact",
                "contactType", "PROGRAM_MANAGER",
                "organizationId", org.getId().toString()
            );

            performPost("/api/crm/contacts", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.organizationId").value(org.getId().toString()));
        }

        @Test
        @DisplayName("should get contacts by organization")
        void shouldGetContactsByOrganization() throws Exception {
            Organization org = organizationRepository.save(Organization.builder()
                .name("Test Org")
                .organizationType(Organization.OrganizationType.CUSTOMER)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            contactRepository.save(Contact.builder()
                .firstName("Org")
                .lastName("Contact")
                .contactType(Contact.ContactType.TECHNICAL_POC)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .organization(org)
                .build());

            performGet("/api/crm/organizations/" + org.getId() + "/contacts")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].firstName").value("Org"));
        }
    }
}
