package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "certifications", indexes = {
    @Index(name = "idx_cert_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_cert_type", columnList = "certification_type"),
    @Index(name = "idx_cert_status", columnList = "status"),
    @Index(name = "idx_cert_expiration", columnList = "expiration_date")
})
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "certification_type", nullable = false)
    private CertificationType certificationType;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private CertificationStatus status = CertificationStatus.ACTIVE;

    // Certification details
    @Column(name = "certificate_number")
    private String certificateNumber;

    @Column(name = "issuing_agency")
    private String issuingAgency;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "renewal_date")
    private LocalDate renewalDate;

    // For size standard certifications
    @Column(name = "naics_code")
    private String naicsCode;

    @Column(name = "size_standard")
    private String sizeStandard;

    // SAM.gov specific
    @Column(name = "uei")
    private String uei;

    @Column(name = "cage_code")
    private String cageCode;

    @Column(name = "sam_registration_date")
    private LocalDate samRegistrationDate;

    @Column(name = "sam_expiration_date")
    private LocalDate samExpirationDate;

    // 8(a) specific
    @Column(name = "eight_a_entry_date")
    private LocalDate eightAEntryDate;

    @Column(name = "eight_a_graduation_date")
    private LocalDate eightAGraduationDate;

    // HUBZone specific
    @Column(name = "hubzone_certification_date")
    private LocalDate hubzoneCertificationDate;

    // Documents
    @Column(name = "document_url")
    private String documentUrl;

    // Internal tracking
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reminder_days_before")
    @Builder.Default
    private Integer reminderDaysBefore = 90;

    @Column(name = "reminder_sent")
    @Builder.Default
    private Boolean reminderSent = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isExpiringSoon(int daysThreshold) {
        if (expirationDate == null) return false;
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return !expirationDate.isAfter(threshold) && !expirationDate.isBefore(LocalDate.now());
    }

    public boolean isExpired() {
        return expirationDate != null && expirationDate.isBefore(LocalDate.now());
    }

    public Long getDaysUntilExpiration() {
        if (expirationDate == null) return null;
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expirationDate);
    }

    public enum CertificationType {
        // Federal certifications
        SAM_REGISTRATION,
        EIGHT_A,                // 8(a) Business Development
        HUBZONE,                // HUBZone
        WOSB,                   // Women-Owned Small Business
        EDWOSB,                 // Economically Disadvantaged WOSB
        SDVOSB,                 // Service-Disabled Veteran-Owned
        VOSB,                   // Veteran-Owned Small Business
        SBA_MENTOR_PROTEGE,

        // State/Local certifications
        DBE,                    // Disadvantaged Business Enterprise
        MBE,                    // Minority Business Enterprise
        WBE,                    // Women Business Enterprise
        SBE,                    // Small Business Enterprise
        STATE_CERTIFICATION,

        // Industry certifications
        ISO_9001,
        ISO_27001,
        ISO_20000,
        CMMI,
        SOC2,
        FEDRAMP,

        // Security
        FACILITY_CLEARANCE,
        CMMC,

        OTHER
    }

    public enum CertificationStatus {
        PENDING,            // Application submitted
        ACTIVE,             // Currently certified
        EXPIRING_SOON,      // Within reminder period
        EXPIRED,            // Past expiration
        RENEWAL_IN_PROGRESS,
        SUSPENDED,
        REVOKED,
        GRADUATED           // For 8(a)
    }
}
