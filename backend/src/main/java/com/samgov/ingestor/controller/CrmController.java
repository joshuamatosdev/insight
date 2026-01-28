package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.Contact;
import com.samgov.ingestor.model.Contact.ContactType;
import com.samgov.ingestor.model.Interaction;
import com.samgov.ingestor.model.Organization;
import com.samgov.ingestor.model.Organization.OrganizationType;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.service.CrmService;
import com.samgov.ingestor.service.CrmService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/crm")
public class CrmController {

    private final CrmService crmService;

    public CrmController(CrmService crmService) {
        this.crmService = crmService;
    }

    // ==================== Contact Endpoints ====================

    @GetMapping("/contacts")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Contact>> listContacts(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.listContacts(tenantId, pageable));
    }

    @GetMapping("/contacts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Contact> getContact(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return crmService.getContact(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/contacts")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Contact> createContact(
            @Valid @RequestBody CreateContactRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        Contact contact = crmService.createContact(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contact);
    }

    @PutMapping("/contacts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Contact> updateContact(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateContactRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return crmService.updateContact(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/contacts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER')")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = crmService.deleteContact(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/contacts/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Contact>> searchContacts(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.searchContacts(tenantId, keyword, pageable));
    }

    @GetMapping("/contacts/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Contact>> getContactsByType(
            @PathVariable ContactType type,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getContactsByType(tenantId, type, pageable));
    }

    @GetMapping("/contacts/organization/{organizationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<Contact>> getContactsByOrganization(@PathVariable UUID organizationId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getContactsByOrganization(tenantId, organizationId));
    }

    @GetMapping("/contacts/organization/{organizationId}/page")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Contact>> listContactsByOrganization(
            @PathVariable UUID organizationId,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.listContactsByOrganization(tenantId, organizationId, pageable));
    }

    @GetMapping("/contacts/government")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Contact>> getGovernmentContacts(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getGovernmentContacts(tenantId, pageable));
    }

    @GetMapping("/contacts/partners")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Contact>> getPartnerContacts(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getPartnerContacts(tenantId, pageable));
    }

    @GetMapping("/contacts/followup-needed")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<Contact>> getContactsNeedingFollowup() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getContactsNeedingFollowup(tenantId));
    }

    // ==================== Organization Endpoints ====================

    @GetMapping("/organizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Organization>> listOrganizations(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.listOrganizations(tenantId, pageable));
    }

    @GetMapping("/organizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Organization> getOrganization(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return crmService.getOrganization(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/organizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Organization> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        Organization org = crmService.createOrganization(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(org);
    }

    @PutMapping("/organizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Organization> updateOrganization(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrganizationRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return crmService.updateOrganization(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/organizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER')")
    public ResponseEntity<Void> deleteOrganization(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = crmService.deleteOrganization(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/organizations/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Organization>> searchOrganizations(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.searchOrganizations(tenantId, keyword, pageable));
    }

    @GetMapping("/organizations/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Organization>> getOrganizationsByType(
            @PathVariable OrganizationType type,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getOrganizationsByType(tenantId, type, pageable));
    }

    @GetMapping("/organizations/agencies")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Organization>> getGovernmentAgencies(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getGovernmentAgencies(tenantId, pageable));
    }

    @GetMapping("/organizations/partners")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<Organization>> getTeamingPartners() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getTeamingPartners(tenantId));
    }

    @GetMapping("/organizations/competitors")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Organization>> getCompetitors(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getCompetitors(tenantId, pageable));
    }

    @GetMapping("/organizations/partners/capability")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<Organization>> findPartnersWithCapability(
            @RequestParam String capability) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.findPartnersWithCapability(tenantId, capability));
    }

    // ==================== Interaction Endpoints ====================

    @GetMapping("/interactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Interaction>> listInteractions(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.listInteractions(tenantId, pageable));
    }

    @GetMapping("/interactions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Interaction> getInteraction(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return crmService.getInteraction(tenantId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/interactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Interaction> createInteraction(
            @Valid @RequestBody CreateInteractionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = getUserId(userDetails);
        Interaction interaction = crmService.createInteraction(tenantId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(interaction);
    }

    @PutMapping("/interactions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Interaction> updateInteraction(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInteractionRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return crmService.updateInteraction(tenantId, id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/interactions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<Void> deleteInteraction(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        boolean deleted = crmService.deleteInteraction(tenantId, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/interactions/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Interaction>> searchInteractions(
            @RequestParam String keyword,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.searchInteractions(tenantId, keyword, pageable));
    }

    @GetMapping("/interactions/contact/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Interaction>> getInteractionsByContact(
            @PathVariable UUID contactId,
            Pageable pageable) {
        return ResponseEntity.ok(crmService.getInteractionsByContact(contactId, pageable));
    }

    @GetMapping("/interactions/organization/{organizationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Interaction>> getInteractionsByOrganization(
            @PathVariable UUID organizationId,
            Pageable pageable) {
        return ResponseEntity.ok(crmService.getInteractionsByOrganization(organizationId, pageable));
    }

    @GetMapping("/interactions/opportunity/{opportunityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<List<Interaction>> getInteractionsByOpportunity(@PathVariable String opportunityId) {
        return ResponseEntity.ok(crmService.getInteractionsByOpportunity(opportunityId));
    }

    @GetMapping("/interactions/followups/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<Interaction>> getPendingFollowups() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getPendingFollowups(tenantId));
    }

    @GetMapping("/interactions/followups/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<List<Interaction>> getOverdueFollowups() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getOverdueFollowups(tenantId));
    }

    @PostMapping("/interactions/{id}/complete-followup")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Void> completeFollowup(@PathVariable UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        crmService.completeFollowup(tenantId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/interactions/activity-feed")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER', 'USER')")
    public ResponseEntity<Page<Interaction>> getActivityFeed(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getActivityFeed(tenantId, pageable));
    }

    // ==================== Summary Endpoint ====================

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'BD_MANAGER', 'CONTRACT_MANAGER')")
    public ResponseEntity<CrmSummaryDto> getCrmSummary() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(crmService.getCrmSummary(tenantId));
    }

    // Helper method
    private UUID getUserId(UserDetails userDetails) {
        if (userDetails instanceof com.samgov.ingestor.model.User user) {
            return user.getId();
        }
        return null;
    }
}
