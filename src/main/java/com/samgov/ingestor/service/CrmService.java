package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Contact.ContactStatus;
import com.samgov.ingestor.model.Contact.ContactType;
import com.samgov.ingestor.model.Interaction.InteractionOutcome;
import com.samgov.ingestor.model.Interaction.InteractionType;
import com.samgov.ingestor.model.Organization.OrganizationStatus;
import com.samgov.ingestor.model.Organization.OrganizationType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CrmService {

    private final ContactRepository contactRepository;
    private final OrganizationRepository organizationRepository;
    private final InteractionRepository interactionRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final OpportunityRepository opportunityRepository;
    private final ContractRepository contractRepository;
    private final AuditService auditService;

    public CrmService(
            ContactRepository contactRepository,
            OrganizationRepository organizationRepository,
            InteractionRepository interactionRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository,
            OpportunityRepository opportunityRepository,
            ContractRepository contractRepository,
            AuditService auditService) {
        this.contactRepository = contactRepository;
        this.organizationRepository = organizationRepository;
        this.interactionRepository = interactionRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.opportunityRepository = opportunityRepository;
        this.contractRepository = contractRepository;
        this.auditService = auditService;
    }

    // ==================== DTOs ====================

    public record CreateContactRequest(
        UUID organizationId,
        String firstName,
        String lastName,
        String middleName,
        String prefix,
        String suffix,
        ContactType contactType,
        String jobTitle,
        String department,
        String email,
        String phoneWork,
        String phoneMobile,
        String addressLine1,
        String city,
        String state,
        String postalCode,
        String country,
        String linkedinUrl,
        String tags,
        String notes,
        UUID ownerId
    ) {}

    public record UpdateContactRequest(
        UUID organizationId,
        String firstName,
        String lastName,
        String jobTitle,
        String department,
        String email,
        String phoneWork,
        String phoneMobile,
        String addressLine1,
        String city,
        String state,
        String postalCode,
        String linkedinUrl,
        String preferredContactMethod,
        String tags,
        String notes,
        LocalDate nextFollowupDate,
        String followupNotes,
        UUID ownerId
    ) {}

    public record CreateOrganizationRequest(
        String name,
        String legalName,
        OrganizationType organizationType,
        String uei,
        String cageCode,
        String naicsCodes,
        String pscCodes,
        String phone,
        String email,
        String website,
        String addressLine1,
        String city,
        String state,
        String postalCode,
        String country,
        String capabilities,
        String coreCompetencies,
        String certifications,
        String contractVehicles,
        String relationshipTier,
        Integer employeeCount,
        String tags,
        String notes,
        UUID ownerId,
        UUID parentOrganizationId
    ) {}

    public record UpdateOrganizationRequest(
        String name,
        String legalName,
        String uei,
        String cageCode,
        String naicsCodes,
        String phone,
        String email,
        String website,
        String addressLine1,
        String city,
        String state,
        String postalCode,
        String capabilities,
        String coreCompetencies,
        String certifications,
        String contractVehicles,
        String relationshipTier,
        Integer relationshipScore,
        Integer employeeCount,
        String tags,
        String notes,
        UUID ownerId
    ) {}

    public record CreateInteractionRequest(
        UUID contactId,
        UUID organizationId,
        String opportunityId,
        UUID contractId,
        InteractionType interactionType,
        String subject,
        String description,
        LocalDateTime interactionDate,
        Integer durationMinutes,
        InteractionOutcome outcome,
        String outcomeNotes,
        String location,
        String attendees,
        Boolean followUpRequired,
        LocalDate followUpDate,
        String followUpNotes,
        String tags
    ) {}

    public record UpdateInteractionRequest(
        String subject,
        String description,
        InteractionOutcome outcome,
        String outcomeNotes,
        Boolean followUpRequired,
        LocalDate followUpDate,
        String followUpNotes,
        Boolean followUpCompleted,
        String tags
    ) {}

    public record CrmSummaryDto(
        long totalContacts,
        long totalOrganizations,
        long recentInteractions,
        long pendingFollowups,
        long overdueFollowups
    ) {}

    // ==================== Contact Operations ====================

    public Page<Contact> listContacts(UUID tenantId, Pageable pageable) {
        return contactRepository.findByTenantIdAndStatusNot(tenantId, ContactStatus.ARCHIVED, pageable);
    }

    public Optional<Contact> getContact(UUID tenantId, UUID contactId) {
        return contactRepository.findByTenantIdAndId(tenantId, contactId);
    }

    public Contact createContact(UUID tenantId, UUID userId, CreateContactRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Contact contact = new Contact();
        contact.setTenant(tenant);
        contact.setFirstName(request.firstName());
        contact.setLastName(request.lastName());
        contact.setMiddleName(request.middleName());
        contact.setPrefix(request.prefix());
        contact.setSuffix(request.suffix());
        contact.setContactType(request.contactType());
        contact.setJobTitle(request.jobTitle());
        contact.setDepartment(request.department());
        contact.setEmail(request.email());
        contact.setPhoneWork(request.phoneWork());
        contact.setPhoneMobile(request.phoneMobile());
        contact.setAddressLine1(request.addressLine1());
        contact.setCity(request.city());
        contact.setState(request.state());
        contact.setPostalCode(request.postalCode());
        contact.setCountry(request.country());
        contact.setLinkedinUrl(request.linkedinUrl());
        contact.setTags(request.tags());
        contact.setNotes(request.notes());
        contact.setStatus(ContactStatus.ACTIVE);

        if (request.organizationId() != null) {
            organizationRepository.findById(request.organizationId()).ifPresent(contact::setOrganization);
        }

        if (request.ownerId() != null) {
            userRepository.findById(request.ownerId()).ifPresent(contact::setOwner);
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(contact::setCreatedBy);
        }

        Contact saved = contactRepository.save(contact);
        auditService.logAction(AuditAction.USER_CREATED, "Contact", saved.getId().toString(),
                "Created contact: " + saved.getFullName());
        return saved;
    }

    public Optional<Contact> updateContact(UUID tenantId, UUID contactId, UpdateContactRequest request) {
        return contactRepository.findByTenantIdAndId(tenantId, contactId)
                .map(contact -> {
                    if (request.organizationId() != null) {
                        organizationRepository.findById(request.organizationId()).ifPresent(contact::setOrganization);
                    }
                    if (request.firstName() != null) contact.setFirstName(request.firstName());
                    if (request.lastName() != null) contact.setLastName(request.lastName());
                    if (request.jobTitle() != null) contact.setJobTitle(request.jobTitle());
                    if (request.department() != null) contact.setDepartment(request.department());
                    if (request.email() != null) contact.setEmail(request.email());
                    if (request.phoneWork() != null) contact.setPhoneWork(request.phoneWork());
                    if (request.phoneMobile() != null) contact.setPhoneMobile(request.phoneMobile());
                    if (request.addressLine1() != null) contact.setAddressLine1(request.addressLine1());
                    if (request.city() != null) contact.setCity(request.city());
                    if (request.state() != null) contact.setState(request.state());
                    if (request.postalCode() != null) contact.setPostalCode(request.postalCode());
                    if (request.linkedinUrl() != null) contact.setLinkedinUrl(request.linkedinUrl());
                    if (request.preferredContactMethod() != null) contact.setPreferredContactMethod(request.preferredContactMethod());
                    if (request.tags() != null) contact.setTags(request.tags());
                    if (request.notes() != null) contact.setNotes(request.notes());
                    if (request.nextFollowupDate() != null) contact.setNextFollowupDate(request.nextFollowupDate());
                    if (request.followupNotes() != null) contact.setFollowupNotes(request.followupNotes());
                    if (request.ownerId() != null) {
                        userRepository.findById(request.ownerId()).ifPresent(contact::setOwner);
                    }
                    return contactRepository.save(contact);
                });
    }

    public boolean deleteContact(UUID tenantId, UUID contactId) {
        return contactRepository.findByTenantIdAndId(tenantId, contactId)
                .map(contact -> {
                    contact.setStatus(ContactStatus.ARCHIVED);
                    contactRepository.save(contact);
                    return true;
                })
                .orElse(false);
    }

    public Page<Contact> searchContacts(UUID tenantId, String keyword, Pageable pageable) {
        return contactRepository.searchContacts(tenantId, keyword, pageable);
    }

    public List<Contact> getContactsByOrganization(UUID organizationId) {
        return contactRepository.findByOrganizationIdAndStatusNot(organizationId, ContactStatus.ARCHIVED);
    }

    public Page<Contact> getContactsByType(UUID tenantId, ContactType type, Pageable pageable) {
        return contactRepository.findByTenantIdAndContactTypeAndStatusNot(tenantId, type, ContactStatus.ARCHIVED, pageable);
    }

    public List<Contact> getContactsNeedingFollowup(UUID tenantId) {
        return contactRepository.findContactsNeedingFollowup(tenantId, LocalDate.now());
    }

    public Page<Contact> getGovernmentContacts(UUID tenantId, Pageable pageable) {
        return contactRepository.findGovernmentContacts(tenantId, pageable);
    }

    public Page<Contact> getPartnerContacts(UUID tenantId, Pageable pageable) {
        return contactRepository.findPartnerContacts(tenantId, pageable);
    }

    public void updateLastContactDate(UUID contactId, LocalDate date) {
        contactRepository.findById(contactId).ifPresent(contact -> {
            contact.setLastContactDate(date);
            contactRepository.save(contact);
        });
    }

    // ==================== Organization Operations ====================

    public Page<Organization> listOrganizations(UUID tenantId, Pageable pageable) {
        return organizationRepository.findByTenantIdAndStatusNot(tenantId, OrganizationStatus.ARCHIVED, pageable);
    }

    public Optional<Organization> getOrganization(UUID tenantId, UUID organizationId) {
        return organizationRepository.findByTenantIdAndId(tenantId, organizationId);
    }

    public Organization createOrganization(UUID tenantId, UUID userId, CreateOrganizationRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Organization org = new Organization();
        org.setTenant(tenant);
        org.setName(request.name());
        org.setLegalName(request.legalName());
        org.setOrganizationType(request.organizationType());
        org.setUei(request.uei());
        org.setCageCode(request.cageCode());
        org.setNaicsCodes(request.naicsCodes());
        org.setPscCodes(request.pscCodes());
        org.setPhone(request.phone());
        org.setEmail(request.email());
        org.setWebsite(request.website());
        org.setAddressLine1(request.addressLine1());
        org.setCity(request.city());
        org.setState(request.state());
        org.setPostalCode(request.postalCode());
        org.setCountry(request.country());
        org.setCapabilities(request.capabilities());
        org.setCoreCompetencies(request.coreCompetencies());
        org.setCertifications(request.certifications());
        org.setContractVehicles(request.contractVehicles());
        org.setRelationshipTier(request.relationshipTier());
        org.setEmployeeCount(request.employeeCount());
        org.setTags(request.tags());
        org.setNotes(request.notes());
        org.setStatus(OrganizationStatus.ACTIVE);

        if (request.ownerId() != null) {
            userRepository.findById(request.ownerId()).ifPresent(org::setOwner);
        }

        if (request.parentOrganizationId() != null) {
            organizationRepository.findById(request.parentOrganizationId()).ifPresent(org::setParentOrganization);
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(org::setCreatedBy);
        }

        Organization saved = organizationRepository.save(org);
        auditService.logAction(AuditAction.TENANT_CREATED, "Organization", saved.getId().toString(),
                "Created organization: " + saved.getName());
        return saved;
    }

    public Optional<Organization> updateOrganization(UUID tenantId, UUID organizationId, UpdateOrganizationRequest request) {
        return organizationRepository.findByTenantIdAndId(tenantId, organizationId)
                .map(org -> {
                    if (request.name() != null) org.setName(request.name());
                    if (request.legalName() != null) org.setLegalName(request.legalName());
                    if (request.uei() != null) org.setUei(request.uei());
                    if (request.cageCode() != null) org.setCageCode(request.cageCode());
                    if (request.naicsCodes() != null) org.setNaicsCodes(request.naicsCodes());
                    if (request.phone() != null) org.setPhone(request.phone());
                    if (request.email() != null) org.setEmail(request.email());
                    if (request.website() != null) org.setWebsite(request.website());
                    if (request.addressLine1() != null) org.setAddressLine1(request.addressLine1());
                    if (request.city() != null) org.setCity(request.city());
                    if (request.state() != null) org.setState(request.state());
                    if (request.postalCode() != null) org.setPostalCode(request.postalCode());
                    if (request.capabilities() != null) org.setCapabilities(request.capabilities());
                    if (request.coreCompetencies() != null) org.setCoreCompetencies(request.coreCompetencies());
                    if (request.certifications() != null) org.setCertifications(request.certifications());
                    if (request.contractVehicles() != null) org.setContractVehicles(request.contractVehicles());
                    if (request.relationshipTier() != null) org.setRelationshipTier(request.relationshipTier());
                    if (request.relationshipScore() != null) org.setRelationshipScore(request.relationshipScore());
                    if (request.employeeCount() != null) org.setEmployeeCount(request.employeeCount());
                    if (request.tags() != null) org.setTags(request.tags());
                    if (request.notes() != null) org.setNotes(request.notes());
                    if (request.ownerId() != null) {
                        userRepository.findById(request.ownerId()).ifPresent(org::setOwner);
                    }
                    return organizationRepository.save(org);
                });
    }

    public boolean deleteOrganization(UUID tenantId, UUID organizationId) {
        return organizationRepository.findByTenantIdAndId(tenantId, organizationId)
                .map(org -> {
                    org.setStatus(OrganizationStatus.ARCHIVED);
                    organizationRepository.save(org);
                    return true;
                })
                .orElse(false);
    }

    public Page<Organization> searchOrganizations(UUID tenantId, String keyword, Pageable pageable) {
        return organizationRepository.searchOrganizations(tenantId, keyword, pageable);
    }

    public Page<Organization> getOrganizationsByType(UUID tenantId, OrganizationType type, Pageable pageable) {
        return organizationRepository.findByTenantIdAndOrganizationTypeAndStatusNot(
                tenantId, type, OrganizationStatus.ARCHIVED, pageable);
    }

    public Page<Organization> getGovernmentAgencies(UUID tenantId, Pageable pageable) {
        return organizationRepository.findGovernmentAgencies(tenantId, pageable);
    }

    public List<Organization> getTeamingPartners(UUID tenantId) {
        return organizationRepository.findTeamingPartners(tenantId);
    }

    public Page<Organization> getCompetitors(UUID tenantId, Pageable pageable) {
        return organizationRepository.findCompetitors(tenantId, pageable);
    }

    public List<Organization> findPartnersWithCapability(UUID tenantId, String capability) {
        return organizationRepository.findPartnersWithCapability(tenantId, capability);
    }

    // ==================== Interaction Operations ====================

    public Page<Interaction> listInteractions(UUID tenantId, Pageable pageable) {
        return interactionRepository.findByTenantIdOrderByInteractionDateDesc(tenantId, pageable);
    }

    public Optional<Interaction> getInteraction(UUID tenantId, UUID interactionId) {
        return interactionRepository.findByTenantIdAndId(tenantId, interactionId);
    }

    public Interaction createInteraction(UUID tenantId, UUID userId, CreateInteractionRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Interaction interaction = new Interaction();
        interaction.setTenant(tenant);
        interaction.setLoggedBy(user);
        interaction.setInteractionType(request.interactionType());
        interaction.setSubject(request.subject());
        interaction.setDescription(request.description());
        interaction.setInteractionDate(request.interactionDate() != null ? request.interactionDate() : LocalDateTime.now());
        interaction.setDurationMinutes(request.durationMinutes());
        interaction.setOutcome(request.outcome());
        interaction.setOutcomeNotes(request.outcomeNotes());
        interaction.setLocation(request.location());
        interaction.setAttendees(request.attendees());
        interaction.setFollowUpRequired(request.followUpRequired() != null ? request.followUpRequired() : false);
        interaction.setFollowUpDate(request.followUpDate());
        interaction.setFollowUpNotes(request.followUpNotes());
        interaction.setTags(request.tags());

        if (request.contactId() != null) {
            contactRepository.findById(request.contactId()).ifPresent(contact -> {
                interaction.setContact(contact);
                contact.setLastContactDate(interaction.getInteractionDate().toLocalDate());
                contactRepository.save(contact);
            });
        }

        if (request.organizationId() != null) {
            organizationRepository.findById(request.organizationId()).ifPresent(interaction::setOrganization);
        }

        if (request.opportunityId() != null) {
            opportunityRepository.findById(request.opportunityId()).ifPresent(interaction::setOpportunity);
        }

        if (request.contractId() != null) {
            contractRepository.findById(request.contractId()).ifPresent(interaction::setContract);
        }

        return interactionRepository.save(interaction);
    }

    public Optional<Interaction> updateInteraction(UUID tenantId, UUID interactionId, UpdateInteractionRequest request) {
        return interactionRepository.findByTenantIdAndId(tenantId, interactionId)
                .map(interaction -> {
                    if (request.subject() != null) interaction.setSubject(request.subject());
                    if (request.description() != null) interaction.setDescription(request.description());
                    if (request.outcome() != null) interaction.setOutcome(request.outcome());
                    if (request.outcomeNotes() != null) interaction.setOutcomeNotes(request.outcomeNotes());
                    if (request.followUpRequired() != null) interaction.setFollowUpRequired(request.followUpRequired());
                    if (request.followUpDate() != null) interaction.setFollowUpDate(request.followUpDate());
                    if (request.followUpNotes() != null) interaction.setFollowUpNotes(request.followUpNotes());
                    if (request.followUpCompleted() != null) interaction.setFollowUpCompleted(request.followUpCompleted());
                    if (request.tags() != null) interaction.setTags(request.tags());
                    return interactionRepository.save(interaction);
                });
    }

    public boolean deleteInteraction(UUID tenantId, UUID interactionId) {
        return interactionRepository.findByTenantIdAndId(tenantId, interactionId)
                .map(interaction -> {
                    interactionRepository.delete(interaction);
                    return true;
                })
                .orElse(false);
    }

    public Page<Interaction> getInteractionsByContact(UUID contactId, Pageable pageable) {
        return interactionRepository.findByContactIdOrderByInteractionDateDesc(contactId, pageable);
    }

    public Page<Interaction> getInteractionsByOrganization(UUID organizationId, Pageable pageable) {
        return interactionRepository.findByOrganizationIdOrderByInteractionDateDesc(organizationId, pageable);
    }

    public List<Interaction> getInteractionsByOpportunity(String opportunityId) {
        return interactionRepository.findByOpportunityIdOrderByInteractionDateDesc(opportunityId);
    }

    public List<Interaction> getPendingFollowups(UUID tenantId) {
        return interactionRepository.findPendingFollowups(tenantId, LocalDate.now().plusDays(7));
    }

    public List<Interaction> getOverdueFollowups(UUID tenantId) {
        return interactionRepository.findOverdueFollowups(tenantId, LocalDate.now());
    }

    public Page<Interaction> searchInteractions(UUID tenantId, String keyword, Pageable pageable) {
        return interactionRepository.searchInteractions(tenantId, keyword, pageable);
    }

    public Page<Interaction> getActivityFeed(UUID tenantId, Pageable pageable) {
        return interactionRepository.findActivityFeed(tenantId, pageable);
    }

    public void completeFollowup(UUID tenantId, UUID interactionId) {
        interactionRepository.findByTenantIdAndId(tenantId, interactionId)
                .ifPresent(interaction -> {
                    interaction.setFollowUpCompleted(true);
                    interactionRepository.save(interaction);
                });
    }

    // ==================== Summary ====================

    public CrmSummaryDto getCrmSummary(UUID tenantId) {
        long totalContacts = contactRepository.countByTenantIdAndContactType(tenantId, null);
        long totalOrganizations = organizationRepository.countByTenantIdAndOrganizationType(tenantId, null);

        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentInteractions = interactionRepository.countByDateRange(tenantId, weekAgo, LocalDateTime.now());

        List<Interaction> pending = interactionRepository.findPendingFollowups(tenantId, LocalDate.now().plusDays(7));
        List<Interaction> overdue = interactionRepository.findOverdueFollowups(tenantId, LocalDate.now());

        return new CrmSummaryDto(
            totalContacts,
            totalOrganizations,
            recentInteractions,
            pending.size(),
            overdue.size()
        );
    }
}
