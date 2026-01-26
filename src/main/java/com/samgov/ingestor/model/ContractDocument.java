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
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contract_documents", indexes = {
    @Index(name = "idx_doc_contract_id", columnList = "contract_id"),
    @Index(name = "idx_doc_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_doc_type", columnList = "document_type")
})
public class ContractDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "version")
    @Builder.Default
    private Integer version = 1;

    @Column(name = "is_current_version")
    @Builder.Default
    private Boolean isCurrentVersion = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_document_id")
    private ContractDocument parentDocument;

    // Related modification (if this document is part of a mod)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modification_id")
    private ContractModification modification;

    // Related deliverable (if this document is a deliverable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliverable_id")
    private ContractDeliverable deliverable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @Column(name = "external_url")
    private String externalUrl;

    @Column(name = "tags")
    private String tags;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_confidential")
    @Builder.Default
    private Boolean isConfidential = false;

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

    public enum DocumentType {
        // Contract documents
        ORIGINAL_CONTRACT,
        MODIFICATION,
        SOW,
        PWS,
        TERMS_AND_CONDITIONS,

        // Financial
        PRICE_SCHEDULE,
        INVOICE,
        FUNDING_DOCUMENT,

        // Technical
        TECHNICAL_PROPOSAL,
        DELIVERABLE,
        STATUS_REPORT,
        CDRL,

        // Administrative
        CORRESPONDENCE,
        NDA,
        TEAMING_AGREEMENT,
        SUBCONTRACT,

        // Compliance
        CERTIFICATION,
        SECURITY_DOCUMENT,
        INSURANCE_CERTIFICATE,

        // Performance
        PERFORMANCE_REPORT,
        CPAR,

        OTHER
    }
}
