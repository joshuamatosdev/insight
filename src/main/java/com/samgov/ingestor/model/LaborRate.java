package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "labor_rates", indexes = {
    @Index(name = "idx_labor_rate_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_labor_rate_contract_id", columnList = "contract_id"),
    @Index(name = "idx_labor_rate_category", columnList = "labor_category")
})
public class LaborRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(name = "labor_category", nullable = false)
    private String laborCategory;

    @Column(name = "labor_category_description")
    private String laborCategoryDescription;

    // Years of experience requirements
    @Column(name = "min_years_experience")
    private Integer minYearsExperience;

    @Column(name = "max_years_experience")
    private Integer maxYearsExperience;

    // Education requirements
    @Column(name = "education_requirement")
    private String educationRequirement;

    // Rates
    @Column(name = "base_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal baseRate;

    @Column(name = "fringe_rate", precision = 8, scale = 4)
    private BigDecimal fringeRate;

    @Column(name = "overhead_rate", precision = 8, scale = 4)
    private BigDecimal overheadRate;

    @Column(name = "ga_rate", precision = 8, scale = 4)
    private BigDecimal gaRate;

    @Column(name = "fee_rate", precision = 8, scale = 4)
    private BigDecimal feeRate;

    @Column(name = "fully_burdened_rate", precision = 10, scale = 2)
    private BigDecimal fullyBurdenedRate;

    // Government billing rate
    @Column(name = "billing_rate", precision = 10, scale = 2)
    private BigDecimal billingRate;

    // Rate type
    @Column(name = "rate_type")
    private String rateType;  // Hourly, Daily, Monthly

    // Effective dates
    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "fiscal_year")
    private Integer fiscalYear;

    // SCA information
    @Column(name = "sca_code")
    private String scaCode;

    @Column(name = "sca_wage_determination")
    private String scaWageDetermination;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        calculateFullyBurdenedRate();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        calculateFullyBurdenedRate();
    }

    public void calculateFullyBurdenedRate() {
        if (baseRate == null) return;

        BigDecimal rate = baseRate;

        if (fringeRate != null) {
            rate = rate.multiply(BigDecimal.ONE.add(fringeRate));
        }
        if (overheadRate != null) {
            rate = rate.multiply(BigDecimal.ONE.add(overheadRate));
        }
        if (gaRate != null) {
            rate = rate.multiply(BigDecimal.ONE.add(gaRate));
        }
        if (feeRate != null) {
            rate = rate.multiply(BigDecimal.ONE.add(feeRate));
        }

        this.fullyBurdenedRate = rate.setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
