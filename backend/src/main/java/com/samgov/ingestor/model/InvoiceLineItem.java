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
@Table(name = "invoice_line_items", indexes = {
    @Index(name = "idx_line_item_invoice_id", columnList = "invoice_id"),
    @Index(name = "idx_line_item_clin_id", columnList = "clin_id")
})
public class InvoiceLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clin_id")
    private ContractClin clin;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "line_type", nullable = false)
    private LineType lineType;

    // For labor
    @Column(name = "labor_category")
    private String laborCategory;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "hours", precision = 10, scale = 2)
    private BigDecimal hours;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    // For materials/ODCs
    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    // Calculated amounts
    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    // Cost breakdown for cost-plus
    @Column(name = "direct_cost", precision = 15, scale = 2)
    private BigDecimal directCost;

    @Column(name = "indirect_cost", precision = 15, scale = 2)
    private BigDecimal indirectCost;

    @Column(name = "fee", precision = 15, scale = 2)
    private BigDecimal fee;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "notes")
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

    public enum LineType {
        DIRECT_LABOR,
        SUBCONTRACTOR_LABOR,
        MATERIALS,
        EQUIPMENT,
        TRAVEL,
        ODC,                    // Other Direct Cost
        FIXED_PRICE,
        MILESTONE,
        FEE,
        ADJUSTMENT,
        OTHER
    }
}
