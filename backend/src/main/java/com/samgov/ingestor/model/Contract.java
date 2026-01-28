package com.samgov.ingestor.model;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contracts", indexes = {
    @Index(name = "idx_contract_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_contract_number", columnList = "contract_number"),
    @Index(name = "idx_contract_status", columnList = "status"),
    @Index(name = "idx_contract_type", columnList = "contract_type"),
    @Index(name = "idx_contract_agency", columnList = "agency")
})
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "contract_number", nullable = false)
    private String contractNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Contract type
    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false)
    private ContractType contractType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ContractStatus status = ContractStatus.ACTIVE;

    // Hierarchy - for task orders under IDIQs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_contract_id")
    private Contract parentContract;

    @OneToMany(mappedBy = "parentContract")
    @Builder.Default
    private List<Contract> childContracts = new ArrayList<>();

    // Related opportunity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    // Agency information
    @Column(name = "agency")
    private String agency;

    @Column(name = "agency_code")
    private String agencyCode;

    @Column(name = "sub_agency")
    private String subAgency;

    @Column(name = "office")
    private String office;

    // Period of performance
    @Column(name = "pop_start_date")
    private LocalDate popStartDate;

    @Column(name = "pop_end_date")
    private LocalDate popEndDate;

    @Column(name = "base_period_end_date")
    private LocalDate basePeriodEndDate;

    @Column(name = "final_option_end_date")
    private LocalDate finalOptionEndDate;

    // Value
    @Column(name = "base_value", precision = 15, scale = 2)
    private BigDecimal baseValue;

    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "ceiling_value", precision = 15, scale = 2)
    private BigDecimal ceilingValue;

    @Column(name = "funded_value", precision = 15, scale = 2)
    private BigDecimal fundedValue;

    // NAICS and PSC
    @Column(name = "naics_code")
    private String naicsCode;

    @Column(name = "psc_code")
    private String pscCode;

    // Place of performance
    @Column(name = "pop_city")
    private String placeOfPerformanceCity;

    @Column(name = "pop_state")
    private String placeOfPerformanceState;

    @Column(name = "pop_country")
    private String placeOfPerformanceCountry;

    // Contract officer information
    @Column(name = "contracting_officer_name")
    private String contractingOfficerName;

    @Column(name = "contracting_officer_email")
    private String contractingOfficerEmail;

    @Column(name = "contracting_officer_phone")
    private String contractingOfficerPhone;

    @Column(name = "cor_name")
    private String corName;

    @Column(name = "cor_email")
    private String corEmail;

    @Column(name = "cor_phone")
    private String corPhone;

    // Prime contractor (if we're a sub)
    @Column(name = "prime_contractor")
    private String primeContractor;

    @Column(name = "is_subcontract")
    @Builder.Default
    private Boolean isSubcontract = false;

    // Contract vehicle
    @Column(name = "contract_vehicle")
    private String contractVehicle;

    // Set-aside
    @Column(name = "set_aside_type")
    private String setAsideType;

    // Small business goals
    @Column(name = "small_business_goal_percentage")
    private BigDecimal smallBusinessGoalPercentage;

    // Security
    @Column(name = "requires_clearance")
    @Builder.Default
    private Boolean requiresClearance = false;

    @Column(name = "clearance_level")
    private String clearanceLevel;

    // Internal tracking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_manager_id")
    private User programManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_manager_id")
    private User contractManager;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // Child entities
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContractClin> clins = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContractModification> modifications = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContractOption> options = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContractDeliverable> deliverables = new ArrayList<>();

    // Timestamps
    @Column(name = "award_date")
    private LocalDate awardDate;

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

    public void addClin(ContractClin clin) {
        clins.add(clin);
        clin.setContract(this);
    }

    public void addModification(ContractModification mod) {
        modifications.add(mod);
        mod.setContract(this);
    }

    public void addOption(ContractOption option) {
        options.add(option);
        option.setContract(this);
    }

    public void addDeliverable(ContractDeliverable deliverable) {
        deliverables.add(deliverable);
        deliverable.setContract(this);
    }

    public boolean isExpiringSoon(int daysThreshold) {
        if (popEndDate == null) {
            return false;
        }
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return !popEndDate.isAfter(threshold);
    }

    public boolean hasUnexercisedOptions() {
        return options.stream().anyMatch(o -> o.getStatus() == ContractOption.OptionStatus.PENDING);
    }

    public enum ContractType {
        FIRM_FIXED_PRICE,           // FFP
        TIME_AND_MATERIALS,         // T&M
        COST_PLUS_FIXED_FEE,        // CPFF
        COST_PLUS_INCENTIVE_FEE,    // CPIF
        COST_PLUS_AWARD_FEE,        // CPAF
        COST_REIMBURSEMENT,         // CR
        INDEFINITE_DELIVERY,        // IDIQ
        BLANKET_PURCHASE_AGREEMENT, // BPA
        BASIC_ORDERING_AGREEMENT,   // BOA
        TASK_ORDER,
        DELIVERY_ORDER,
        GRANT,
        COOPERATIVE_AGREEMENT,
        OTHER
    }

    public enum ContractStatus {
        DRAFT,
        AWARDED,
        PENDING_SIGNATURE,
        ACTIVE,
        ON_HOLD,
        COMPLETED,
        TERMINATED,
        CANCELLED,
        CLOSED
    }
}
