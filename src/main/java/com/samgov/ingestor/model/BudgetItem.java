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
@Table(name = "budget_items", indexes = {
    @Index(name = "idx_budget_contract_id", columnList = "contract_id"),
    @Index(name = "idx_budget_clin_id", columnList = "clin_id"),
    @Index(name = "idx_budget_category", columnList = "category")
})
public class BudgetItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clin_id")
    private ContractClin clin;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private BudgetCategory category;

    // Budget amounts
    @Column(name = "budgeted_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal budgetedAmount;

    @Column(name = "actual_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal actualAmount = BigDecimal.ZERO;

    @Column(name = "committed_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal committedAmount = BigDecimal.ZERO;

    @Column(name = "forecast_amount", precision = 15, scale = 2)
    private BigDecimal forecastAmount;

    // Period
    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "fiscal_year")
    private Integer fiscalYear;

    @Column(name = "fiscal_period")
    private Integer fiscalPeriod;

    // Tracking
    @Column(name = "last_updated_date")
    private LocalDate lastUpdatedDate;

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

    public BigDecimal getVariance() {
        return budgetedAmount.subtract(actualAmount != null ? actualAmount : BigDecimal.ZERO);
    }

    public BigDecimal getVariancePercentage() {
        if (budgetedAmount.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return getVariance().divide(budgetedAmount, 4, java.math.RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal getRemainingBudget() {
        BigDecimal spent = actualAmount != null ? actualAmount : BigDecimal.ZERO;
        BigDecimal committed = committedAmount != null ? committedAmount : BigDecimal.ZERO;
        return budgetedAmount.subtract(spent).subtract(committed);
    }

    public boolean isOverBudget() {
        return getVariance().compareTo(BigDecimal.ZERO) < 0;
    }

    public enum BudgetCategory {
        DIRECT_LABOR,
        SUBCONTRACTOR,
        MATERIALS,
        EQUIPMENT,
        TRAVEL,
        ODC,
        INDIRECT,
        FEE,
        CONTINGENCY,
        OTHER
    }
}
