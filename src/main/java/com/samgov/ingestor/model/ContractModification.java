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
@Table(name = "contract_modifications", indexes = {
    @Index(name = "idx_mod_contract_id", columnList = "contract_id"),
    @Index(name = "idx_mod_number", columnList = "modification_number"),
    @Index(name = "idx_mod_effective_date", columnList = "effective_date")
})
public class ContractModification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "modification_number", nullable = false)
    private String modificationNumber;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "modification_type", nullable = false)
    private ModificationType modificationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ModificationStatus status = ModificationStatus.PENDING;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "executed_date")
    private LocalDate executedDate;

    // Value changes
    @Column(name = "value_change", precision = 15, scale = 2)
    private BigDecimal valueChange;

    @Column(name = "funding_change", precision = 15, scale = 2)
    private BigDecimal fundingChange;

    @Column(name = "new_total_value", precision = 15, scale = 2)
    private BigDecimal newTotalValue;

    // Period of performance changes
    @Column(name = "pop_extension_days")
    private Integer popExtensionDays;

    @Column(name = "new_pop_end_date")
    private LocalDate newPopEndDate;

    // Scope changes
    @Column(name = "scope_change_summary", columnDefinition = "TEXT")
    private String scopeChangeSummary;

    // Administrative info
    @Column(name = "requesting_office")
    private String requestingOffice;

    @Column(name = "contracting_officer_name")
    private String contractingOfficerName;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

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

    public enum ModificationType {
        ADMINISTRATIVE,      // No cost/scope changes
        BILATERAL,           // Both parties agree
        UNILATERAL,          // Government changes
        SUPPLEMENTAL,        // Additional funding
        INCREMENTAL_FUNDING, // IF mod
        NO_COST_EXTENSION,   // NCE
        OPTION_EXERCISE,     // Exercise option
        TERMINATION,         // Partial or full termination
        SCOPE_CHANGE,        // Change in work
        OTHER
    }

    public enum ModificationStatus {
        DRAFT,
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        EXECUTED,
        REJECTED,
        CANCELLED
    }
}
