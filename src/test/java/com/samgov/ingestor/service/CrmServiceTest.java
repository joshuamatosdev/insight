package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.*;
import com.samgov.ingestor.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for CRM Service.
 */
class CrmServiceTest extends BaseServiceTest {

    @Autowired
    private CrmService crmService;

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
    void setUp() {
        testTenant = tenantRepository.save(Tenant.builder()
            .name("CRM Service Test Tenant")
            .slug("crm-svc-test-" + UUID.randomUUID().toString().substring(0, 8))
            .build());

        testUser = userRepository.save(User.builder()
            .email("crm-svc-test-" + UUID.randomUUID() + "@example.com")
            .passwordHash("hashedpass")
            .firstName("CRM")
            .lastName("Tester")
            .tenant(testTenant)
            .status(User.UserStatus.ACTIVE)
            .build());

        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());
    }

    @Nested
    @DisplayName("Contact Operations")
    class ContactOperations {

        @Test
        @DisplayName("should create contact")
        void shouldCreateContact() {
            Contact contact = Contact.builder()
                .firstName("Test")
                .lastName("User")
                .contactType(Contact.ContactType.GOVERNMENT_CUSTOMER)
                .status(Contact.ContactStatus.ACTIVE)
                .email("test@example.com")
                .build();

            Contact saved = crmService.createContact(contact);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.getFirstName()).isEqualTo("Test");
            assertThat(saved.getTenant().getId()).isEqualTo(testTenant.getId());
        }

        @Test
        @DisplayName("should find contact by id")
        void shouldFindContactById() {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Find")
                .lastName("Me")
                .contactType(Contact.ContactType.VENDOR)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Optional<Contact> found = crmService.findContactById(contact.getId());

            assertThat(found).isPresent();
            assertThat(found.get().getFirstName()).isEqualTo("Find");
        }

        @Test
        @DisplayName("should list contacts with pagination")
        void shouldListContactsWithPagination() {
            for (int i = 0; i < 5; i++) {
                contactRepository.save(Contact.builder()
                    .firstName("Contact" + i)
                    .lastName("User")
                    .contactType(Contact.ContactType.PROSPECT)
                    .status(Contact.ContactStatus.ACTIVE)
                    .tenant(testTenant)
                    .build());
            }

            Page<Contact> page = crmService.findAllContacts(PageRequest.of(0, 3));

            assertThat(page.getContent()).hasSize(3);
            assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(5);
        }

        @Test
        @DisplayName("should update contact")
        void shouldUpdateContact() {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Original")
                .lastName("Name")
                .contactType(Contact.ContactType.INTERNAL)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            contact.setFirstName("Updated");
            Contact updated = crmService.updateContact(contact);

            assertThat(updated.getFirstName()).isEqualTo("Updated");
        }

        @Test
        @DisplayName("should delete contact")
        void shouldDeleteContact() {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("ToDelete")
                .lastName("Contact")
                .contactType(Contact.ContactType.OTHER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            crmService.deleteContact(contact.getId());

            assertThat(contactRepository.findById(contact.getId())).isEmpty();
        }

        @Test
        @DisplayName("should search contacts by keyword")
        void shouldSearchContactsByKeyword() {
            contactRepository.save(Contact.builder()
                .firstName("Unique")
                .lastName("SearchName")
                .contactType(Contact.ContactType.GOVERNMENT_CUSTOMER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Page<Contact> results = crmService.searchContacts("Unique", PageRequest.of(0, 10));

            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent().get(0).getFirstName()).isEqualTo("Unique");
        }
    }

    @Nested
    @DisplayName("Organization Operations")
    class OrganizationOperations {

        @Test
        @DisplayName("should create organization")
        void shouldCreateOrganization() {
            Organization org = Organization.builder()
                .name("New Company")
                .organizationType(Organization.OrganizationType.PRIME_CONTRACTOR)
                .status(Organization.OrganizationStatus.ACTIVE)
                .uei("TESTUEI123")
                .build();

            Organization saved = crmService.createOrganization(org);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.getName()).isEqualTo("New Company");
            assertThat(saved.getTenant().getId()).isEqualTo(testTenant.getId());
        }

        @Test
        @DisplayName("should find organization by id")
        void shouldFindOrganizationById() {
            Organization org = organizationRepository.save(Organization.builder()
                .name("Find Org")
                .organizationType(Organization.OrganizationType.VENDOR)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Optional<Organization> found = crmService.findOrganizationById(org.getId());

            assertThat(found).isPresent();
            assertThat(found.get().getName()).isEqualTo("Find Org");
        }

        @Test
        @DisplayName("should filter organizations by type")
        void shouldFilterOrganizationsByType() {
            organizationRepository.save(Organization.builder()
                .name("Gov Agency")
                .organizationType(Organization.OrganizationType.GOVERNMENT_AGENCY)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            organizationRepository.save(Organization.builder()
                .name("Private Vendor")
                .organizationType(Organization.OrganizationType.VENDOR)
                .status(Organization.OrganizationStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Page<Organization> results = crmService.findOrganizationsByType(
                Organization.OrganizationType.GOVERNMENT_AGENCY,
                PageRequest.of(0, 10)
            );

            assertThat(results.getContent()).allMatch(o -> 
                o.getOrganizationType() == Organization.OrganizationType.GOVERNMENT_AGENCY
            );
        }
    }

    @Nested
    @DisplayName("Interaction Operations")
    class InteractionOperations {

        @Test
        @DisplayName("should create interaction")
        void shouldCreateInteraction() {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Interact")
                .lastName("Contact")
                .contactType(Contact.ContactType.TECHNICAL_POC)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            Interaction interaction = Interaction.builder()
                .subject("Test Meeting")
                .interactionType(Interaction.InteractionType.MEETING_VIRTUAL)
                .interactionDate(LocalDateTime.now())
                .contact(contact)
                .build();

            Interaction saved = crmService.createInteraction(interaction);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.getSubject()).isEqualTo("Test Meeting");
            assertThat(saved.getTenant().getId()).isEqualTo(testTenant.getId());
            assertThat(saved.getLoggedBy().getId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should list interactions by contact")
        void shouldListInteractionsByContact() {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Multi")
                .lastName("Interaction")
                .contactType(Contact.ContactType.CONTRACTING_OFFICER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            for (int i = 0; i < 3; i++) {
                interactionRepository.save(Interaction.builder()
                    .subject("Interaction " + i)
                    .interactionType(Interaction.InteractionType.PHONE_CALL)
                    .interactionDate(LocalDateTime.now().minusDays(i))
                    .contact(contact)
                    .tenant(testTenant)
                    .loggedBy(testUser)
                    .build());
            }

            Page<Interaction> results = crmService.findInteractionsByContact(
                contact.getId(),
                PageRequest.of(0, 10)
            );

            assertThat(results.getContent()).hasSize(3);
        }

        @Test
        @DisplayName("should find interactions with followup required")
        void shouldFindInteractionsWithFollowupRequired() {
            Contact contact = contactRepository.save(Contact.builder()
                .firstName("Followup")
                .lastName("Contact")
                .contactType(Contact.ContactType.PROGRAM_MANAGER)
                .status(Contact.ContactStatus.ACTIVE)
                .tenant(testTenant)
                .build());

            interactionRepository.save(Interaction.builder()
                .subject("Needs Followup")
                .interactionType(Interaction.InteractionType.EMAIL)
                .interactionDate(LocalDateTime.now())
                .contact(contact)
                .tenant(testTenant)
                .loggedBy(testUser)
                .followUpRequired(true)
                .followUpCompleted(false)
                .build());

            interactionRepository.save(Interaction.builder()
                .subject("No Followup")
                .interactionType(Interaction.InteractionType.NOTE)
                .interactionDate(LocalDateTime.now())
                .contact(contact)
                .tenant(testTenant)
                .loggedBy(testUser)
                .followUpRequired(false)
                .build());

            Page<Interaction> results = crmService.findInteractionsWithPendingFollowup(
                PageRequest.of(0, 10)
            );

            assertThat(results.getContent()).allMatch(i -> 
                i.getFollowUpRequired() && !i.getFollowUpCompleted()
            );
        }
    }
}
