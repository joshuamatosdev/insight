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
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contract_clins", indexes = {
    @Index(name = "idx_clin_contract_id", columnList = "contract_id"),
    @Index(name = "idx_clin_number", columnList = "clin_number")
})
public class ContractClin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "clin_number", nullable = false)
    private String clinNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "clin_type", nullable = false)
    private ClinType clinType;

    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type")
    private PricingType pricingType;

    @Column(name = "unit_of_issue")
    private String unitOfIssue;

    @Column(name = "quantity")
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "funded_amount", precision = 15, scale = 2)
    private BigDecimal fundedAmount;

    @Column(name = "obligated_amount", precision = 15, scale = 2)
    private BigDecimal obligatedAmount;

    @Column(name = "invoiced_amount", precision = 15, scale = 2)
    private BigDecimal invoicedAmount;

    @Column(name = "naics_code")
    private String naicsCode;

    @Column(name = "psc_code")
    private String pscCode;

    @Column(name = "is_option")
    @Builder.Default
    private Boolean isOption = false;

    @Column(name = "option_period")
    private Integer optionPeriod;

    @Column(name = "sort_order")
    private Integer sortOrder;

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

    public BigDecimal getRemainingFunds() {
        if (fundedAmount == null || invoicedAmount == null) {
            return fundedAmount;
        }
        return fundedAmount.subtract(invoicedAmount);
    }

    public enum ClinType {
        BASE,
        OPTION,
        DATA,
        SERVICES,
        SUPPLIES,
        OTHER
    }

    public enum PricingType {
        FIRM_FIXED_PRICE,
        TIME_AND_MATERIALS,
        LABOR_HOUR,
        COST_PLUS_FIXED_FEE,
        COST_PLUS_INCENTIVE_FEE,
        COST_REIMBURSEMENT
    }
}
