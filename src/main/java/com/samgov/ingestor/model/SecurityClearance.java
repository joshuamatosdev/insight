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
@Table(name = "security_clearances", indexes = {
    @Index(name = "idx_clearance_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_clearance_user_id", columnList = "user_id"),
    @Index(name = "idx_clearance_level", columnList = "clearance_level"),
    @Index(name = "idx_clearance_status", columnList = "status"),
    @Index(name = "idx_clearance_expiration", columnList = "expiration_date")
})
public class SecurityClearance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // For facility clearances without a specific user
    @Column(name = "entity_name")
    private String entityName;

    @Enumerated(EnumType.STRING)
    @Column(name = "clearance_type", nullable = false)
    private ClearanceType clearanceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "clearance_level", nullable = false)
    private ClearanceLevel clearanceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ClearanceStatus status = ClearanceStatus.ACTIVE;

    // Dates
    @Column(name = "investigation_date")
    private LocalDate investigationDate;

    @Column(name = "grant_date")
    private LocalDate grantDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "reinvestigation_date")
    private LocalDate reinvestigationDate;

    // Polygraph information
    @Column(name = "polygraph_type")
    private String polygraphType;

    @Column(name = "polygraph_date")
    private LocalDate polygraphDate;

    // Sponsoring agency
    @Column(name = "sponsoring_agency")
    private String sponsoringAgency;

    @Column(name = "case_number")
    private String caseNumber;

    // Facility clearance specific
    @Column(name = "cage_code")
    private String cageCode;

    @Column(name = "facility_address")
    private String facilityAddress;

    @Column(name = "fso_name")
    private String fsoName;

    @Column(name = "fso_email")
    private String fsoEmail;

    @Column(name = "fso_phone")
    private String fsoPhone;

    // SAP/SCI access
    @Column(name = "sci_access")
    @Builder.Default
    private Boolean sciAccess = false;

    @Column(name = "sci_programs")
    private String sciPrograms;

    @Column(name = "sap_access")
    @Builder.Default
    private Boolean sapAccess = false;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

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

    public boolean needsReinvestigation(int daysThreshold) {
        if (reinvestigationDate == null) return false;
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return !reinvestigationDate.isAfter(threshold) && !reinvestigationDate.isBefore(LocalDate.now());
    }

    public enum ClearanceType {
        PERSONNEL,
        FACILITY,
        INTERIM_PERSONNEL,
        INTERIM_FACILITY
    }

    public enum ClearanceLevel {
        CONFIDENTIAL,
        SECRET,
        TOP_SECRET,
        TOP_SECRET_SCI,
        Q_CLEARANCE,    // DOE
        L_CLEARANCE     // DOE
    }

    public enum ClearanceStatus {
        PENDING,
        INTERIM,
        ACTIVE,
        EXPIRED,
        SUSPENDED,
        REVOKED,
        INACTIVE
    }
}
