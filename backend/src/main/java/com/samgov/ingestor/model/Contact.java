package com.samgov.ingestor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Contact entity used in both Face One (Contract Intelligence) and Face Two (Portal).
 *
 * <p><strong>Face One (Contract Intelligence):</strong> Tracks contacts at government agencies,
 * competitor companies, teaming partners, and prospects. Used by DoctrineOne Labs for business
 * development and capture management.</p>
 *
 * <p><strong>Face Two (Portal):</strong> Tracks contacts at client organizations for contract
 * execution and communication.</p>
 *
 * <p>Multi-tenant: tenant_id isolates contacts between different client organizations.</p>
 *
 * @see ContactType for which types belong to which system
 */
@Entity
@Table(name = "contacts", indexes = {
    @Index(name = "idx_contact_tenant", columnList = "tenant_id"),
    @Index(name = "idx_contact_organization", columnList = "organization_id"),
    @Index(name = "idx_contact_type", columnList = "contact_type"),
    @Index(name = "idx_contact_email", columnList = "email"),
    @Index(name = "idx_contact_name", columnList = "last_name, first_name")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contact {

    /**
     * Contact types used across both systems.
     *
     * <p><strong>Face One (Contract Intelligence):</strong>
     * <ul>
     *   <li>GOVERNMENT_CUSTOMER - Agency contacts for BD/capture</li>
     *   <li>CONTRACTING_OFFICER - Government COs</li>
     *   <li>CONTRACTING_SPECIALIST - Government contracting specialists</li>
     *   <li>PROGRAM_MANAGER - Government PMs</li>
     *   <li>TECHNICAL_POC - Government technical points of contact</li>
     *   <li>COR - Contracting Officer's Representative</li>
     *   <li>TEAMING_PARTNER - Partners for teaming on bids</li>
     *   <li>CONSULTANT - External consultants</li>
     *   <li>PROSPECT - Potential customers</li>
     *   <li>INTERNAL - DoctrineOne Labs internal staff</li>
     * </ul>
     *
     * <p><strong>Face Two (Portal):</strong>
     * <ul>
     *   <li>GOVERNMENT_CUSTOMER - Client agency contacts</li>
     *   <li>PRIME_CONTRACTOR - Prime contractor on client's contract</li>
     *   <li>SUBCONTRACTOR - Subcontractors on client's contract</li>
     *   <li>VENDOR - Vendors for client projects</li>
     * </ul>
     *
     * <p><strong>Shared:</strong> INTERNAL (DoctrineOne Labs staff in both systems)</p>
     */
    public enum ContactType {
        GOVERNMENT_CUSTOMER,
        CONTRACTING_OFFICER,
        CONTRACTING_SPECIALIST,
        PROGRAM_MANAGER,
        TECHNICAL_POC,
        COR,
        PRIME_CONTRACTOR,
        SUBCONTRACTOR,
        TEAMING_PARTNER,
        VENDOR,
        CONSULTANT,
        PROSPECT,
        INTERNAL,
        OTHER
    }

    public enum ContactStatus {
        ACTIVE,
        INACTIVE,
        DO_NOT_CONTACT,
        ARCHIVED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    // Name
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "prefix")
    private String prefix;

    @Column(name = "suffix")
    private String suffix;

    @Column(name = "nickname")
    private String nickname;

    // Type and status
    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false)
    private ContactType contactType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ContactStatus status = ContactStatus.ACTIVE;

    // Job information
    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "department")
    private String department;

    @Column(name = "role_description", length = 500)
    private String roleDescription;

    // Contact information
    @Column
    private String email;

    @Column(name = "email_secondary")
    private String emailSecondary;

    @Column(name = "phone_work")
    private String phoneWork;

    @Column(name = "phone_mobile")
    private String phoneMobile;

    @Column(name = "phone_fax")
    private String phoneFax;

    // Address
    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column
    private String city;

    @Column
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column
    private String country;

    // Social/Online
    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "website")
    private String website;

    // Related entities
    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Interaction> interactions = new ArrayList<>();

    // Preferences
    @Column(name = "preferred_contact_method")
    private String preferredContactMethod;

    @Column(name = "best_time_to_contact")
    private String bestTimeToContact;

    @Column(name = "timezone")
    private String timezone;

    // Metadata
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Relationship tracking
    @Column(name = "relationship_score")
    private Integer relationshipScore;

    @Column(name = "last_contact_date")
    private LocalDate lastContactDate;

    @Column(name = "next_followup_date")
    private LocalDate nextFollowupDate;

    @Column(name = "followup_notes", length = 1000)
    private String followupNotes;

    // Source
    @Column(name = "source")
    private String source;

    @Column(name = "referral_source")
    private String referralSource;

    // Assigned owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    // Photo
    @Column(name = "photo_url")
    private String photoUrl;

    // Audit fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Helper methods
    public String getFullName() {
        StringBuilder name = new StringBuilder();
        if (prefix != null) name.append(prefix).append(" ");
        name.append(firstName);
        if (middleName != null) name.append(" ").append(middleName);
        name.append(" ").append(lastName);
        if (suffix != null) name.append(" ").append(suffix);
        return name.toString().trim();
    }

    public void addInteraction(Interaction interaction) {
        interactions.add(interaction);
        interaction.setContact(this);
    }
}
