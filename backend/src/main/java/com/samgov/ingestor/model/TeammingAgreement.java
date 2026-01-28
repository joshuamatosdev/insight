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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "teaming_agreements", indexes = {
    @Index(name = "idx_teaming_agreement_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_teaming_agreement_partner_id", columnList = "partner_id"),
    @Index(name = "idx_teaming_agreement_opportunity_id", columnList = "opportunity_id"),
    @Index(name = "idx_teaming_agreement_status", columnList = "status")
})
public class TeammingAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private TeammingPartner partner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id")
    private Proposal proposal;

    @Column(name = "agreement_number")
    private String agreementNumber;

    @Column(name = "title")
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_type", nullable = false)
    @Builder.Default
    private AgreementType agreementType = AgreementType.TEAMING;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AgreementStatus status = AgreementStatus.DRAFT;

    // Partner role in this agreement
    @Enumerated(EnumType.STRING)
    @Column(name = "partner_role")
    @Builder.Default
    private PartnerRole partnerRole = PartnerRole.SUBCONTRACTOR;

    // Workshare
    @Column(name = "workshare_percentage", precision = 5, scale = 2)
    private BigDecimal worksharePercentage;

    @Column(name = "estimated_value", precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    // Scope of work
    @Column(name = "scope_of_work", columnDefinition = "TEXT")
    private String scopeOfWork;

    @Column(name = "deliverables", columnDefinition = "TEXT")
    private String deliverables;

    // Dates
    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "signed_date")
    private LocalDate signedDate;

    // Terms
    @Column(name = "exclusivity")
    @Builder.Default
    private Boolean exclusivity = false;

    @Column(name = "nda_required")
    @Builder.Default
    private Boolean ndaRequired = true;

    @Column(name = "nda_signed")
    @Builder.Default
    private Boolean ndaSigned = false;

    // Document references
    @Column(name = "document_url")
    private String documentUrl;

    @Column(name = "nda_document_url")
    private String ndaDocumentUrl;

    // Notes
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "termination_reason", columnDefinition = "TEXT")
    private String terminationReason;

    // Audit fields
    @Column(name = "created_by")
    private String createdBy;

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

    public boolean isActive() {
        return status == AgreementStatus.ACTIVE
            && (expirationDate == null || !LocalDate.now().isAfter(expirationDate));
    }

    public boolean isExpiringSoon(int daysThreshold) {
        if (expirationDate == null) {
            return false;
        }
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return status == AgreementStatus.ACTIVE
            && !expirationDate.isAfter(threshold)
            && !expirationDate.isBefore(LocalDate.now());
    }

    public enum AgreementType {
        TEAMING,
        SUBCONTRACT,
        JOINT_VENTURE,
        MENTOR_PROTEGE,
        CONSULTANT,
        NDA_ONLY,
        MOU
    }

    public enum AgreementStatus {
        DRAFT,
        PENDING_REVIEW,
        PENDING_SIGNATURE,
        ACTIVE,
        EXPIRED,
        TERMINATED,
        SUPERSEDED
    }

    public enum PartnerRole {
        PRIME,
        SUBCONTRACTOR,
        MAJOR_SUBCONTRACTOR,
        MINOR_SUBCONTRACTOR,
        CONSULTANT,
        SUPPLIER,
        MENTOR,
        PROTEGE
    }
}
