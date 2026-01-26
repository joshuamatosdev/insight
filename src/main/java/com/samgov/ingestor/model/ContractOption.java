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
@Table(name = "contract_options", indexes = {
    @Index(name = "idx_option_contract_id", columnList = "contract_id"),
    @Index(name = "idx_option_status", columnList = "status"),
    @Index(name = "idx_option_exercise_deadline", columnList = "exercise_deadline")
})
public class ContractOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "option_number", nullable = false)
    private Integer optionNumber;

    @Column(name = "option_year")
    private Integer optionYear;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OptionStatus status = OptionStatus.PENDING;

    // Dates
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "exercise_deadline")
    private LocalDate exerciseDeadline;

    @Column(name = "exercised_date")
    private LocalDate exercisedDate;

    // Value
    @Column(name = "option_value", precision = 15, scale = 2)
    private BigDecimal optionValue;

    // Duration
    @Column(name = "duration_months")
    private Integer durationMonths;

    // Modification reference when exercised
    @Column(name = "exercise_modification_number")
    private String exerciseModificationNumber;

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

    public boolean isExerciseDeadlineApproaching(int daysThreshold) {
        if (exerciseDeadline == null || status != OptionStatus.PENDING) {
            return false;
        }
        LocalDate threshold = LocalDate.now().plusDays(daysThreshold);
        return !exerciseDeadline.isAfter(threshold) && !exerciseDeadline.isBefore(LocalDate.now());
    }

    public enum OptionStatus {
        PENDING,      // Not yet exercised
        EXERCISED,    // Option exercised
        DECLINED,     // Option not exercised
        EXPIRED       // Deadline passed
    }
}
