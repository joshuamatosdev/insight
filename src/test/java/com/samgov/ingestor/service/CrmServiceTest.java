package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.model.Contact;
import com.samgov.ingestor.model.Contact.ContactStatus;
import com.samgov.ingestor.model.Contact.ContactType;
import com.samgov.ingestor.model.Organization;
import com.samgov.ingestor.model.Organization.OrganizationType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.repository.ContactRepository;
import com.samgov.ingestor.repository.OrganizationRepository;
import com.samgov.ingestor.service.CrmService.CreateContactRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Behavioral tests for CrmService.
 *
 * Tests focus on business behavior, not implementation details.
 * Uses BaseServiceTest for proper multi-tenant setup via TenantMembership.
 */
@DisplayName("CrmService")
class CrmServiceTest extends BaseServiceTest {

    @Autowired
    private CrmService crmService;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    // testTenant, testUser, testMembership are provided by BaseServiceTest

    private Organization testOrganization;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();  // Sets up testTenant, testUser, testMembership, TenantContext
        testOrganization = createTestOrganization();
    }

    @Nested
    @DisplayName("Contact Operations")
    class ContactOperations {

        @Test
        @DisplayName("should create contact with valid request")
        void shouldCreateContact() {
            // Given - CreateContactRequest has 21 fields
            CreateContactRequest request = new CreateContactRequest(
                null,                           // organizationId
                "John",                         // firstName
                "Doe",                          // lastName
                null,                           // middleName
                null,                           // prefix
                null,                           // suffix
                ContactType.GOVERNMENT_CUSTOMER,// contactType
                "Contracting Officer",          // jobTitle
                "Procurement",                  // department
                "john.doe@agency.gov",          // email
                "202-555-0100",                 // phoneWork
                null,                           // phoneMobile
                "123 Federal Plaza",            // addressLine1
                "Washington",                   // city
                "DC",                           // state
                "20001",                        // postalCode
                "USA",                          // country
                null,                           // linkedinUrl
                null,                           // tags
                null,                           // notes
                null                            // ownerId
            );

            // When
            Contact created = crmService.createContact(
                testTenant.getId(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(created.getId()).isNotNull();
            assertThat(created.getFirstName()).isEqualTo("John");
            assertThat(created.getLastName()).isEqualTo("Doe");
            assertThat(created.getContactType()).isEqualTo(ContactType.GOVERNMENT_CUSTOMER);
            assertThat(created.getTenant().getId()).isEqualTo(testTenant.getId());
        }

        @Test
        @DisplayName("should create contact associated with organization")
        void shouldCreateContactWithOrganization() {
            // Given - contact associated with an organization
            CreateContactRequest request = new CreateContactRequest(
                testOrganization.getId(),       // organizationId
                "Jane",                         // firstName
                "Smith",                        // lastName
                null,                           // middleName
                null,                           // prefix
                null,                           // suffix
                ContactType.CONTRACTING_OFFICER,// contactType
                "Senior Contracting Officer",   // jobTitle
                "Acquisitions",                 // department
                "jane.smith@agency.gov",        // email
                "202-555-0200",                 // phoneWork
                "202-555-0201",                 // phoneMobile
                "456 Government Way",           // addressLine1
                "Washington",                   // city
                "DC",                           // state
                "20002",                        // postalCode
                "USA",                          // country
                "https://linkedin.com/in/janesmith", // linkedinUrl
                "key-contact,priority",         // tags
                "Important contact",            // notes
                testUser.getId()                // ownerId
            );

            // When
            Contact created = crmService.createContact(
                testTenant.getId(),
                testUser.getId(),
                request
            );

            // Then
            assertThat(created.getId()).isNotNull();
            assertThat(created.getOrganization()).isNotNull();
            assertThat(created.getOrganization().getId()).isEqualTo(testOrganization.getId());
            assertThat(created.getOrganization().getName()).isEqualTo("Test Government Agency");
            assertThat(created.getOwner()).isNotNull();
            assertThat(created.getOwner().getId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should list contacts by tenant")
        void shouldListContactsByTenant() {
            // Given - create some contacts
            createTestContact("Alice", "Smith");
            createTestContact("Bob", "Jones");

            // When - use listContacts (not getContacts)
            Page<Contact> contacts = crmService.listContacts(
                testTenant.getId(),
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(contacts.getContent()).hasSize(2);
            assertThat(contacts.getContent())
                .extracting(Contact::getFirstName)
                .containsExactlyInAnyOrder("Alice", "Bob");
        }

        @Test
        @DisplayName("should search contacts by keyword")
        void shouldSearchContactsByKeyword() {
            // Given
            createTestContact("Unique", "SearchName");
            createTestContact("Other", "Person");

            // When
            Page<Contact> results = crmService.searchContacts(
                testTenant.getId(),
                "Unique",
                PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent()).hasSize(1);
            assertThat(results.getContent().get(0).getFirstName()).isEqualTo("Unique");
        }

        @Test
        @DisplayName("should isolate contacts by tenant")
        void shouldIsolateContactsByTenant() {
            // Given - create contact in test tenant
            createTestContact("TenantA", "Contact");

            // Create another tenant with its own contact using builder
            Tenant otherTenant = createOtherTenant();
            Contact otherContact = Contact.builder()
                .tenant(otherTenant)
                .firstName("TenantB")
                .lastName("Contact")
                .contactType(ContactType.VENDOR)
                .status(ContactStatus.ACTIVE)
                .build();
            contactRepository.save(otherContact);

            // When - query test tenant's contacts
            Page<Contact> contacts = crmService.listContacts(
                testTenant.getId(),
                PageRequest.of(0, 10)
            );

            // Then - should only see test tenant's contact
            assertThat(contacts.getContent()).hasSize(1);
            assertThat(contacts.getContent().get(0).getFirstName()).isEqualTo("TenantA");
        }

        @Test
        @DisplayName("should get contacts by organization (list)")
        void shouldGetContactsByOrganization() {
            // Given - create contacts for the test organization
            Contact contact1 = Contact.builder()
                .tenant(testTenant)
                .organization(testOrganization)
                .firstName("Org")
                .lastName("Contact1")
                .contactType(ContactType.PROGRAM_MANAGER)
                .status(ContactStatus.ACTIVE)
                .build();
            contactRepository.save(contact1);

            Contact contact2 = Contact.builder()
                .tenant(testTenant)
                .organization(testOrganization)
                .firstName("Org")
                .lastName("Contact2")
                .contactType(ContactType.TECHNICAL_POC)
                .status(ContactStatus.ACTIVE)
                .build();
            contactRepository.save(contact2);

            // Create a contact without organization
            createTestContact("NoOrg", "Contact");

            // When - get contacts by organization (returns List)
            java.util.List<Contact> orgContacts = crmService.getContactsByOrganization(
                testTenant.getId(),
                testOrganization.getId()
            );

            // Then - should only see organization's contacts
            assertThat(orgContacts).hasSize(2);
            assertThat(orgContacts)
                .extracting(Contact::getLastName)
                .containsExactlyInAnyOrder("Contact1", "Contact2");
        }

        @Test
        @DisplayName("should list contacts by organization with pagination")
        void shouldListContactsByOrganizationWithPagination() {
            // Given - create contacts for the test organization
            Contact contact1 = Contact.builder()
                .tenant(testTenant)
                .organization(testOrganization)
                .firstName("Org")
                .lastName("Contact1")
                .contactType(ContactType.PROGRAM_MANAGER)
                .status(ContactStatus.ACTIVE)
                .build();
            contactRepository.save(contact1);

            Contact contact2 = Contact.builder()
                .tenant(testTenant)
                .organization(testOrganization)
                .firstName("Org")
                .lastName("Contact2")
                .contactType(ContactType.TECHNICAL_POC)
                .status(ContactStatus.ACTIVE)
                .build();
            contactRepository.save(contact2);

            // Create a contact without organization
            createTestContact("NoOrg", "Contact");

            // When - list contacts by organization with pagination
            Page<Contact> orgContacts = crmService.listContactsByOrganization(
                testTenant.getId(),
                testOrganization.getId(),
                PageRequest.of(0, 10)
            );

            // Then - should only see organization's contacts with pagination metadata
            assertThat(orgContacts.getContent()).hasSize(2);
            assertThat(orgContacts.getTotalElements()).isEqualTo(2);
            assertThat(orgContacts.getContent())
                .extracting(Contact::getLastName)
                .containsExactlyInAnyOrder("Contact1", "Contact2");
        }
    }

    // Helper methods

    private Organization createTestOrganization() {
        Organization org = Organization.builder()
            .tenant(testTenant)
            .name("Test Government Agency")
            .organizationType(OrganizationType.GOVERNMENT_AGENCY)
            .agencyCode("TEST-001")
            .city("Washington")
            .state("DC")
            .country("USA")
            .build();
        return organizationRepository.save(org);
    }

    private Contact createTestContact(String firstName, String lastName) {
        CreateContactRequest request = new CreateContactRequest(
            null,                           // organizationId
            firstName,                      // firstName
            lastName,                       // lastName
            null,                           // middleName
            null,                           // prefix
            null,                           // suffix
            ContactType.GOVERNMENT_CUSTOMER,// contactType
            null,                           // jobTitle
            null,                           // department
            firstName.toLowerCase() + "." + lastName.toLowerCase() + "@test.com",
            null,                           // phoneWork
            null,                           // phoneMobile
            null,                           // addressLine1
            null,                           // city
            null,                           // state
            null,                           // postalCode
            null,                           // country
            null,                           // linkedinUrl
            null,                           // tags
            null,                           // notes
            null                            // ownerId
        );
        return crmService.createContact(testTenant.getId(), testUser.getId(), request);
    }

    private Tenant createOtherTenant() {
        Tenant tenant = Tenant.builder()
            .name("Other Tenant")
            .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        return tenantRepository.save(tenant);
    }
}
